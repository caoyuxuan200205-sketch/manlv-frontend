/**
 * 邮件解析服务 - 智能提取邮件中的结构化信息
 */

class EmailParser {
  /**
   * 从邮件内容中提取关键信息
   * @param {string} subject - 邮件主题
   * @param {string} content - 邮件内容
   * @returns {object} 结构化邮件信息
   */
  static parseEmail(subject, content) {
    return {
      school: this.extractSchool(subject, content),
      eventType: this.extractEventType(subject, content),
      eventName: this.extractEventName(subject, content),
      dates: this.extractDates(subject, content),
      deadline: this.extractDeadline(subject, content),
      location: this.extractLocation(content),
      applyLink: this.extractLink(content),
      description: this.extractDescription(content),
      priority: this.calculatePriority(subject, content),
      suggestedAction: this.suggestAction(subject, content),
    };
  }

  /**
   * 提取学校/机构名称
   */
  static extractSchool(subject, content) {
    const universities = [
      '清华', '北大', '复旦', '上交', '浙大', '中科院',
      '同济', '华中科技', '东南', '哈工大', '北航', '南京大学',
      '厦门', '中山', '武汉', '四川', '吉林', '山东'
    ];

    for (const uni of universities) {
      if (subject.includes(uni) || content.includes(uni)) {
        return uni;
      }
    }
    return '未知院校';
  }

  /**
   * 提取活动类型（夏令营、面试、推免等）
   */
  static extractEventType(subject, content) {
    const types = {
      'camp': ['夏令营', '暑期', '冬令营'],
      'interview': ['面试', '复试', '笔试'],
      'promotion': ['推免', '直博', '预推免'],
      'seminar': ['讲座', '学术报告', '研讨会'],
      'other': []
    };

    const combined = `${subject}${content}`;
    for (const [type, keywords] of Object.entries(types)) {
      for (const keyword of keywords) {
        if (combined.includes(keyword)) {
          return type;
        }
      }
    }
    return 'unknown';
  }

  /**
   * 提取活动名称
   */
  static extractEventName(subject, content) {
    // 主题中通常包含活动名称
    const match = subject.match(/【(.+?)】|「(.+?)」|《(.+?)》/);
    if (match) {
      return match[1] || match[2] || match[3];
    }
    return subject.split('|')[0].trim();
  }

  /**
   * 提取事件日期范围
   */
  static extractDates(subject, content) {
    const dateRegex = /(\d{1,2})月(\d{1,2})日?[~-](\d{1,2})月?(\d{1,2})日?|(\d{4}年)?(\d{1,2})月(\d{1,2})日/g;
    const matches = [...content.matchAll(dateRegex)];
    
    if (matches.length > 0) {
      return {
        startDate: this.formatDate(matches[0]),
        endDate: matches.length > 1 ? this.formatDate(matches[matches.length - 1]) : this.formatDate(matches[0])
      };
    }
    return { startDate: null, endDate: null };
  }

  /**
   * 提取报名截止日期
   */
  static extractDeadline(subject, content) {
    const deadlineKeywords = ['截止', '报名截至', '截至日期', '最后期限', ' before '];
    const lines = content.split('\n');
    
    for (const line of lines) {
      for (const keyword of deadlineKeywords) {
        if (line.includes(keyword)) {
          const dateMatch = line.match(/(\d{1,4}年)?(\d{1,2})月(\d{1,2})日?/);
          if (dateMatch) {
            return dateMatch[0];
          }
        }
      }
    }
    return null;
  }

  /**
   * 提取地点信息
   */
  static extractLocation(content) {
    const locationKeywords = ['地点', '地址', '地址:', 'Location', '会议地点', '举办地'];
    const lines = content.split('\n');
    
    for (const line of lines) {
      for (const keyword of locationKeywords) {
        if (line.includes(keyword)) {
          const location = line.replace(keyword, '').trim();
          return location.substring(0, 100);
        }
      }
    }
    return '未指定';
  }

  /**
   * 提取报名链接
   */
  static extractLink(content) {
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
    const matches = content.match(urlRegex);
    
    if (matches) {
      // 优先返回表单链接
      for (const url of matches) {
        if (url.includes('form') || url.includes('survey') || url.includes('signin')) {
          return url;
        }
      }
      return matches[0];
    }
    return null;
  }

  /**
   * 提取邮件描述摘要
   */
  static extractDescription(content) {
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    // 返回前3行或最多200字的摘要
    const summary = lines.slice(0, 3).join('\n');
    return summary.substring(0, 200);
  }

  /**
   * 计算优先级
   */
  static calculatePriority(subject, content) {
    let priority = 'normal';
    
    // 检查紧急标签
    if (subject.includes('紧急') || subject.includes('立即')) {
      return 'urgent';
    }
    
    // 检查目标学校
    const topUniversities = ['清华', '北大', '复旦', '上交'];
    if (topUniversities.some(uni => subject.includes(uni) || content.includes(uni))) {
      priority = 'high';
    }
    
    // 检查截止日期是否接近
    const deadlineLines = content.split('\n').filter(line => 
      line.includes('截止') || line.includes('截至')
    );
    
    if (deadlineLines.length > 0) {
      priority = priority === 'high' ? 'high' : 'urgent';
    }
    
    return priority;
  }

  /**
   * 建议操作
   */
  static suggestAction(subject, content) {
    const eventType = this.extractEventType(subject, content);
    
    const suggestions = {
      'camp': '夏令营通常需要准备简历和作品集，建议立即申请',
      'interview': '这是面试邀请！需要提前准备并确认参加时间',
      'promotion': '预推免邮件很重要，请仔细阅读要求并准备材料',
      'seminar': '学术讲座，可根据你的兴趣决定是否参加',
      'unknown': '请仔细阅读邮件内容，确认是否需要采取行动'
    };
    
    return suggestions[eventType] || suggestions['unknown'];
  }

  /**
   * 格式化日期
   */
  static formatDate(match) {
    if (!match) return null;
    // 处理第一种格式：MM月DD日~MM月DD日
    if (match[1] && match[2]) {
      return `${match[1]}月${match[2]}日`;
    }
    // 处理第二种格式：YYYY年MM月DD日
    if (match[6] && match[7]) {
      return `${match[6]}月${match[7]}日`;
    }
    return null;
  }
}

export default EmailParser;
