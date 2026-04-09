/**
 * 邮件回复生成服务 - 生成规范的邮件回复
 */

class EmailReplyGenerator {
  /**
   * 生成邮件回复
   * @param {object} emailData - 解析后的邮件数据
   * @param {string} action - 操作类型：'confirm', 'decline', 'ask', 'postpone'
   * @param {object} userInfo - 用户信息
   * @returns {object} 邮件回复对象
   */
  static generateReply(emailData, action, userInfo = {}) {
    const templates = {
      confirm: this.generateConfirmReply,
      decline: this.generateDeclineReply,
      postpone: this.generatePostponeReply,
      ask: this.generateAskReply,
    };

    const generator = templates[action] || this.generateConfirmReply;
    return generator.call(this, emailData, userInfo);
  }

  /**
   * 生成确认参加的回复
   */
  static generateConfirmReply(emailData, userInfo) {
    const eventName = emailData.eventName || '活动';
    const school = emailData.school || '贵院校';
    const startDate = emailData.dates?.startDate || '指定时间';

    const subject = `RE: ${emailData.eventName} - 参加确认`;
    const body = `尊敬的${school}招生老师，

感谢您的邀请！我对${eventName}充满兴趣，特此确认我将按时参加。

个人信息如下：
- 姓名：${userInfo.name || '[请填写姓名]'}
- 学校：${userInfo.university || '[请填写学校]'}
- 专业：${userInfo.major || '[请填写专业]'}
- 学号：${userInfo.studentId || '[请填写学号]'}
- 联系电话：${userInfo.phone || '[请填写电话]'}
- 邮箱：${userInfo.email || '[请填写邮箱]'}

期待在${startDate}与各位老师和同学交流。如有任何需要提前准备的事项，请随时告知。

此致
敬礼

${userInfo.name || '申请者'}
${new Date().toLocaleDateString('zh-CN')}`;

    return { subject, body, type: 'confirm', needsReview: true };
  }

  /**
   * 生成委婉拒绝的回复
   */
  static generateDeclineReply(emailData, userInfo) {
    const schoolName = emailData.school || '贵院校';
    const eventName = emailData.eventName || '活动';

    const subject = `RE: ${eventName} - 感谢邀请`;
    const body = `尊敬的${schoolName}招生老师，

感谢您的邀请和信任！非常荣幸能获得参加${eventName}的机会。

经过认真考虑，由于以下原因，我遗憾地无法按时参加此次活动，特此表示诚挚的歉意：
- 时间冲突：已有其他学术活动或面试安排
- 其他重要事务安排

希望能有其他机会参与贵院校的相关活动。如后续还有合适的机会，期待能够参与。

感谢您的理解！

此致
敬礼

${userInfo.name || '申请者'}
${new Date().toLocaleDateString('zh-CN')}`;

    return { subject, body, type: 'decline', needsReview: true };
  }

  /**
   * 生成时间冲突协商的回复
   */
  static generatePostponeReply(emailData, userInfo) {
    const eventName = emailData.eventName || '活动';
    const schoolName = emailData.school || '贵院校';

    const subject = `RE: ${eventName} - 时间调整咨询`;
    const body = `尊敬的${schoolName}招生老师，

感谢您对我的邀请！我非常感兴趣参加${eventName}，但遗憾的是原定时间与我的另一重要事项冲突。

是否可能：
1. 提供该项目的具体日程安排，我会努力调整时间参与
2. 是否存在备选的参加时间或在线参与的选项
3. 若时间实在无法协调，是否还有其他参与该项目的方式

感谢您的考虑和帮助！

此致
敬礼

${userInfo.name || '申请者'}
${new Date().toLocaleDateString('zh-CN')}`;

    return { subject, body, type: 'postpone', needsReview: true };
  }

  /**
   * 生成咨询问题的回复
   */
  static generateAskReply(emailData, userInfo) {
    const eventName = emailData.eventName || '活动';
    const schoolName = emailData.school || '贵院校';

    const subject = `RE: ${eventName} - 咨询相关信息`;
    const body = `尊敬的${schoolName}招生老师，

感谢您的邀请！对于${eventName}，我有以下问题需要咨询：

1. **参加形式**：该活动采取线下还是线上形式参与？

2. **住宿安排**：若为线下活动，是否提供住宿或住宿补助？

3. **准备材料**：参加时需要提交哪些材料（如简历、作品集等）？

4. **日程详情**：能否提供详细的日程安排，以便我提前准备？

期待您的回复。一旦获得相关信息，我会尽快确认参加。

此致
敬礼

${userInfo.name || '申请者'}
${new Date().toLocaleDateString('zh-CN')}`;

    return { subject, body, type: 'ask', needsReview: true };
  }

  /**
   * 获取建议的回复类型
   */
  static suggestReplyType(emailData, userSchedule) {
    const eventType = emailData.eventType;
    const priority = emailData.priority;
    const hasConflict = this.hasScheduleConflict(emailData, userSchedule);

    // 高优先级的邮件优先确认
    if (priority === 'urgent' || priority === 'high') {
      if (hasConflict) {
        return 'postpone'; // 优先尝试协商
      }
      return 'confirm';
    }

    // 根据活动类型建议
    if (eventType === 'interview' || eventType === 'promotion') {
      return hasConflict ? 'postpone' : 'confirm';
    }

    if (eventType === 'camp') {
      return hasConflict ? 'ask' : 'confirm';
    }

    return 'ask'; // 默认提问
  }

  /**
   * 检查是否与日程冲突
   */
  static hasScheduleConflict(emailData, userSchedule) {
    if (!userSchedule || userSchedule.length === 0) return false;
    if (!emailData.dates?.startDate) return false;

    // 简单的日期冲突检查
    const eventDate = emailData.dates.startDate;
    return userSchedule.some(item => item.date === eventDate);
  }

  /**
   * 验证邮件回复
   */
  static validateReply(reply) {
    const issues = [];

    if (!reply.subject || reply.subject.trim().length === 0) {
      issues.push('邮件主题不能为空');
    }

    if (!reply.body || reply.body.trim().length < 20) {
      issues.push('邮件内容过短');
    }

    // 检查是否包含[请填写]占位符
    if (reply.body.includes('[请填写')) {
      issues.push('邮件中包含未填写的信息，请完善');
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }
}

export default EmailReplyGenerator;
