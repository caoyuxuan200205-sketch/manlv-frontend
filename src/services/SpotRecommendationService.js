/**
 * AI 推荐地点服务
 * 基于用户的专业和所在城市，调用豆包大模型生成个性化的学习/备考地点推荐
 */

class SpotRecommendationService {
  // 豆包 API 配置
  static ARK_API_KEY = '8422fd18-aa8a-4e85-9e2a-b8c3a6dc37a6';
  static ARK_BASE_URL = 'https://ark.cn-beijing.volces.com/api/v3';
  static ARK_MODEL_ID = 'ep-20260328093917-kzmnx';

  /**
   * 获取个性化地点推荐
   * @param {string} major 用户专业
   * @param {string} city 目标城市
   * @returns {Promise<Array>} 推荐地点列表
   */
  static async getRecommendations(major, city) {
    try {
      const systemPrompt = `你是【漫旅APP】的智能向导。你的任务是为一名准备参加保研面试的学生推荐在 ${city} 适合其专业（${major}）的「漫学」地点。

【推荐规则】
1. **专业相关性**：推荐的地点必须与用户的专业（${major}）强相关。
   - 建筑/规划：推荐经典建筑、城市更新案例、著名规划馆、设计院附近等。
   - 人文/哲学：推荐古籍图书馆、博物馆、历史遗迹、安静的书店等。
   - 理工/交互：推荐科技馆、创新园区、实验室开放区、黑科技咖啡馆等。
2. **场景适用性**：地点应适合「备考、放松、专业考察」三种场景之一。
3. **输出格式**：必须严格按照以下 JSON 数组格式返回，不要包含任何多余文字：
[
  { "name": "地点名称", "type": "地点类型(如：学术/专业/文化)", "desc": "推荐理由(包含该地点对${major}专业的价值)", "tag": "标签(如：推荐/必看/安静)" }
]`;

      const response = await fetch(`${this.ARK_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.ARK_API_KEY}`
        },
        body: JSON.stringify({
          model: this.ARK_MODEL_ID,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `请为我在 ${city} 推荐 4 个适合 ${major} 专业的地点。` }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) throw new Error('API 请求失败');

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '[]';
      
      // 提取 JSON
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return [];
    } catch (error) {
      console.error('获取推荐失败:', error);
      return this.getMockRecommendations(major, city);
    }
  }

  /**
   * 兜底模拟数据
   */
  static getMockRecommendations(major, city) {
    const mocks = {
      '建筑学': [
        { name: `${city}城市规划馆`, type: '专业', desc: '深度了解该城市空间演变逻辑与未来宏图', tag: '必看' },
        { name: `${city}当代艺术中心`, type: '设计', desc: '清水混凝土与光影的极致结合，激发设计灵感', tag: '推荐' }
      ]
    };
    return mocks[major] || [
      { name: `${city}图书馆`, type: '学术', desc: '环境安静，馆藏丰富，适合面试前的最后冲刺', tag: '备考' },
      { name: `${city}博物馆`, type: '文化', desc: '了解城市底蕴，为面试中的城市文化题积累素材', tag: '推荐' }
    ];
  }
}

export default SpotRecommendationService;
