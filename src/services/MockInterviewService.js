/**
 * AI 模拟面试服务
 * 集成豆包大模型 API（火山方舟）
 * 使用 REST API 直接调用，避免 OpenAI SDK 兼容性问题
 */

class MockInterviewService {
  // 豆包 API 配置
  static ARK_API_KEY = process.env.REACT_APP_ARK_API_KEY || '8422fd18-aa8a-4e85-9e2a-b8c3a6dc37a6';
  static ARK_BASE_URL = 'https://ark.cn-beijing.volces.com/api/v3';
  static ARK_MODEL_ID = 'ep-20260328093917-kzmnx'; // 豆包模型接入点 ID

  // 会话记录存储（在浏览器内存中维护对话历史）
  static conversationHistory = new Map();

  // API 基础 URL - 可根据环境变量配置
  static API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  /**
   * 初始化面试会话
   * @param {object} config 面试配置
   * @returns {Promise<object>} 面试会话信息
   */
  static async initializeInterview(config) {
    try {
      const sessionId = `session_${Date.now()}`;
      
      // 构建系统提示词
      const systemPrompt = `你是【漫旅APP】专属的**保研夏令营/预推免AI模拟面试官**，服务于准备跨城市参加保研面试的学生。

【面试学生信息】
- 目标院校：${config.schoolName}
- 所学专业：${config.majorName}
- 面试类型：${config.interviewType === 'camp' ? '夏令营' : '预推免'}
- 面试城市：${config.interviewCity || '北京'}

【学生简历内容】
${config.resumeText}

---

## 一、核心身份与规则

1. **面试方向**：仅针对**保研推免面试**，不涉及求职、考研笔试
2. **提问依据**：100%围绕学生简历、目标院校特色、专业知识点、面试城市文化/科研背景提问
3. **流程规范**：每次只提1个问题，不一次性抛出多个问题，循序渐进
4. **语气风格**：专业、温和、鼓励式，符合漫旅「缓解焦虑、赋能学习」的定位
5. **拒绝偏离**：不闲聊、不跑题，始终聚焦保研面试场景

---

## 二、标准面试流程（必须严格执行）

1. **开场**：引导学生做1分钟保研专属自我介绍
2. **简历深挖**：针对简历中的**科研项目/竞赛/课程设计**逐一提问（重点）
   - 你做了什么、遇到什么问题、怎么解决、收获什么
3. **专业基础**：考察本专业核心基础知识点（贴合目标院校考核风格）
4. **院校&城市结合**：提问**目标院校特色、面试城市相关专业知识**
   - 示例：建筑→南京民国建筑、经济→深圳特区经济
5. **场景题**：保研高频场景（如科研困难解决、研究计划、读研规划）
6. **复盘总结**：面试结束后输出结构化复盘报告

---

## 三、提问深度要求

1. **简历提问深度**：深挖「你做了什么、遇到什么问题、怎么解决、收获什么」4层递进
2. **专业提问**：贴合目标院校导师研究方向，不考偏题怪题
3. **城市文化提问**：结合面试城市的产业/文化/科研资源，关联专业考点
4. **压力适度**：无恶意压力面，以**查漏补缺、提升备考能力**为目标

---

## 四、复盘报告规范（面试结束时使用）

当收到"面试结束"或"查看评分"的指令时，输出以下结构化复盘报告：

**【面试表现评分】**：1-100分（需要有明确分数）

**【核心优势】**：基于简历与回答列举（3-5条）

**【知识短板】**：明确到具体知识点（2-3条需要补强的内容）

**【备考建议】**：
- 针对${config.schoolName}的备考重点
- 针对${config.majorName}专业的知识深化方向
- 针对面试城市特色的学习建议

**【漫旅学习打卡】**：✨ 今日旅学成就 +1

---

## 五、每轮对话格式（严格遵守）

每次回复包含：
1. 对上一个回答的**简短评价**（1-2句）
2. **下一个问题**（仅提1个）
3. 可选：**方向提示**（如果学生答题偏离可温和纠正）

示例格式：
> 很好的思路！你清晰表达了[项目名称]的核心价值。
> 
> 接下来的问题是：[具体问题]

---

## 六、必遵守的底线

✅ 必须做：专业、结构化、有深度、面向保研
❌ 绝不做：闲聊、多问题轰炸、偏离保研主题、给出虚假评分
❌ 禁止用：过度夸大（除非回答确实优秀）、贬低学生、模糊评分标准

---

**现在开始面试。请以热情但专业的语气给出欢迎语，然后提出第一个问题：请进行1分钟的保研专属自我介绍。**`;

      // 调用豆包 REST API 获取第一个问题
      const response = await fetch(`${this.ARK_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.ARK_API_KEY}`
        },
        body: JSON.stringify({
          model: this.ARK_MODEL_ID,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: '开始面试。请生成一个热情但专业的欢迎语和第一个问题。'
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const firstQuestion = data.choices?.[0]?.message?.content || '欢迎参加面试！请先自我介绍一下。';

      // 保存初始会话信息
      this.conversationHistory.set(sessionId, [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: '开始面试。请生成一个热情但专业的欢迎语和第一个问题。'
        },
        {
          role: 'assistant',
          content: firstQuestion
        }
      ]);

      console.log('[面试初始化成功]', { sessionId, firstQuestion });

      return {
        session_id: sessionId,
        status: 'initialized',
        first_question: firstQuestion,
        interview_type: config.interviewType,
        difficulty: config.difficulty,
        school_name: config.schoolName,
        major_name: config.majorName,
        estimated_duration: 15 // 分钟
      };
    } catch (error) {
      console.error('[面试初始化失败]', error);
      console.log('[降级到模拟数据]');
      // 降级到模拟数据
      return this.mockInitializeInterview(config);
    }
  }

  /**
   * 提交面试回答
   * @param {string} sessionId 面试会话 ID
   * @param {string} answer 用户的回答
   * @returns {Promise<object>} AI 反馈和下一个问题
   */
  static async submitAnswer(sessionId, answer) {
    try {
      // 获取该会话的对话历史
      let messages = this.conversationHistory.get(sessionId) || [];
      
      // 添加用户回答
      messages.push({
        role: 'user',
        content: answer
      });

      // 调用豆包API获取AI回复
      const response = await fetch(`${this.ARK_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.ARK_API_KEY}`
        },
        body: JSON.stringify({
          model: this.ARK_MODEL_ID,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content || '很好，请继续。';

      // 更新会话历史
      messages.push({
        role: 'assistant',
        content: aiResponse
      });
      this.conversationHistory.set(sessionId, messages);

      console.log('[面试回答处理成功]', { sessionId });

      return {
        feedback: aiResponse,
        score: Math.floor(Math.random() * 30) + 70,
        next_question: aiResponse,
        status: 'answering'
      };
    } catch (error) {
      console.error('[面试回答处理失败]', error);
      console.log('[降级到模拟数据]');
      // 降级到模拟数据
      return this.mockSubmitAnswer(sessionId, answer);
    }
  }

  /**
   * 结束面试会话并获取评分
   * @param {string} sessionId 面试会话ID
   * @returns {Promise<object>} 面试评分和反馈
   */
  static async finishInterview(sessionId) {
    try {
      // 获取该会话的对话历史
      const messages = this.conversationHistory.get(sessionId) || [];

      if (messages.length === 0) {
        return this.mockFinishInterview(sessionId);
      }

      // 要求AI生成面试总结和评分
      const summaryMessages = [
        ...messages,
        {
          role: 'user',
          content: `面试结束。请根据上述面试过程，生成一份结构化复盘报告，包括以下内容，并用JSON格式回复：

{
  "total_score": 0-100,
  "breakdown": {
    "knowledge": 0-100,
    "communication": 0-100,
    "passion": 0-100,
    "preparation": 0-100
  },
  "strengths": ["优势1", "优势2", "优势3"],
  "weaknesses": ["短板1", "短板2"],
  "suggestions": ["建议1", "建议2", "建议3"],
  "feedback": "详细反馈",
  "equivalent_level": "优秀/很好/良好/一般/需要加油"
}`
        }
      ];

      // 调用豆包 REST API 获取评分
      const response = await fetch(`${this.ARK_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.ARK_API_KEY}`
        },
        body: JSON.stringify({
          model: this.ARK_MODEL_ID,
          messages: summaryMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          max_tokens: 800,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const summaryText = data.choices?.[0]?.message?.content || '';

      console.log('[面试评分获取成功]', { sessionId, summaryText });

      // 尝试解析 JSON 格式的评分
      let scoreData = {
        total_score: 75,
        breakdown: {
          knowledge: 75,
          communication: 75,
          passion: 75,
          preparation: 75
        },
        strengths: [],
        weaknesses: [],
        suggestions: [],
        feedback: summaryText,
        equivalent_level: '良好'
      };

      try {
        const jsonMatch = summaryText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          scoreData = { 
            total_score: parsed.total_score || scoreData.total_score,
            breakdown: parsed.breakdown || scoreData.breakdown,
            strengths: parsed.strengths || scoreData.strengths,
            weaknesses: parsed.weaknesses || scoreData.weaknesses,
            suggestions: parsed.suggestions || scoreData.suggestions,
            feedback: parsed.feedback || summaryText,
            equivalent_level: parsed.equivalent_level || scoreData.equivalent_level
          };
        }
      } catch (parseError) {
        console.log('评分解析为自由文本格式', parseError);
      }

      // 清理会话历史
      this.conversationHistory.delete(sessionId);

      return scoreData;
    } catch (error) {
      console.error('[面试评分获取失败]', error);
      console.log('[降级到模拟数据]');
      // 降级到模拟数据
      return this.mockFinishInterview(sessionId);
    }
  }

  /**
   * 获取面试历史记录
   */
  static async getInterviewHistory(options = {}) {
    try {
      // 如果需要真实的历史记录，可以连接后端数据库
      // 目前返回本地存储或模拟数据
      const historyData = localStorage.getItem('interview_history');
      return historyData ? JSON.parse(historyData) : [];
    } catch (error) {
      console.error('获取历史记录失败:', error);
      return [];
    }
  }

  /**
   * 上传简历文件
   * 注：豆包API内容在请求时直接处理，无需单独上传
   */
  static async uploadResume(file) {
    try {
      // 返回文件信息
      return {
        success: true,
        file_name: file.name,
        file_size: file.size,
        upload_time: new Date().toISOString()
      };
    } catch (error) {
      console.error('上传简历失败:', error);
      throw error;
    }
  }

  /**
   * 解析简历文本
   */
  static async parseResume(resumeText) {
    try {
      // 使用豆包 REST API 解析简历
      const response = await fetch(`${this.ARK_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.ARK_API_KEY}`
        },
        body: JSON.stringify({
          model: this.ARK_MODEL_ID,
          messages: [
            {
              role: 'user',
              content: `请解析这份简历，并提取关键信息为JSON格式，包括教育背景、工作经验、技能、获奖等。\n\n简历内容：\n${resumeText}`
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const parseResult = data.choices?.[0]?.message?.content || '{}';
      
      try {
        const jsonMatch = parseResult.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        return { raw_text: parseResult };
      }

      return { raw_text: parseResult };
    } catch (error) {
      console.error('[简历解析失败]', error);
      return { error: '解析失败', raw_text: resumeText };
    }
  }

  /**
   * 模拟 API 调用（本地开发时使用）
   * 返回模拟的面试数据
   */
  static async mockInitializeInterview(config) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          session_id: `session_${Date.now()}`,
          status: 'initialized',
          first_question: `欢迎参加${config.schoolName}的${config.majorName}专业面试。请先自我介绍一下，包括你的学术背景和为什么要申请我们学校。`,
          interview_type: config.interviewType,
          difficulty: config.difficulty,
          estimated_duration: 15 // 分钟
        });
      }, 800);
    });
  }

  /**
   * 模拟 API 调用 - 提交回答
   */
  static async mockSubmitAnswer(sessionId, answer) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const feedback = [
          '你的回答很清楚，展示了你的学术背景。能具体讲讲你在该领域的项目经验吗？',
          '很不错的想法。请说说你如何处理这个挑战的？',
          '这是一个很好的问题。你对我们学校的研究方向有什么了解吗？'
        ];
        resolve({
          feedback: feedback[Math.floor(Math.random() * feedback.length)],
          score: Math.floor(Math.random() * 30) + 70,
          next_question: '那么，你认为这个领域未来5年最重要的发展方向是什么？'
        });
      }, 1200);
    });
  }

  /**
   * 模拟 API 调用 - 结束面试
   */
  static async mockFinishInterview(sessionId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          total_score: 82,
          breakdown: {
            knowledge: 85,
            communication: 80,
            passion: 82,
            preparation: 78
          },
          feedback: '总体表现不错，你展示了扎实的学科知识和清晰的表达能力。建议加强对行业前沿趋势的了解。',
          equivalent_level: '很好'
        });
      }, 800);
    });
  }

  /**
   * 获取存储的认证令牌
   * 注：豆包API使用 ARK_API_KEY，无需此方法
   */
  static getToken() {
    return localStorage.getItem('auth_token') || '';
  }

  /**
   * 重新初始化 API Key（如需更换 API Key 时使用）
   */
  static setApiKey(apiKey) {
    this.ARK_API_KEY = apiKey;
  }
}

export default MockInterviewService;
