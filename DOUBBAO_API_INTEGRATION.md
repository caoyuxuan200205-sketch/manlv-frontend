# 豆包大模型 API 集成指南

## 📌 集成完成状态

✅ **已完成** - 豆包大模型 API 已集成到 LearnPage 的 AI 模拟面试功能中

## 🚀 快速开始

### 1. 环境配置

项目已在 `.env.local` 文件中配置了 API Key：

```env
REACT_APP_ARK_API_KEY=8422fd18-aa8a-4e85-9e2a-b8c3a6dc37a6
```

**重要提示：** 
- `.env.local` 文件包含敏感信息，不要提交到 Git
- 如需更改 API Key，修改 `.env.local` 文件即可
- 开发环境中 API Key 直接在代码中使用（`dangerouslyAllowBrowser: true`）

### 2. 集成架构

```
LearnPage (面试练习标签)
    ↓
MockInterviewService (面试服务层)
    ↓
OpenAI SDK (兼容豆包 API)
    ↓
豆包大模型 (火山方舟)
    ├─ 接入点 ID: ep-20260328093917-kzmnx
    ├─ API 地址: https://ark.cn-beijing.volces.com/api/v3
    └─ 模型: 豆包大模型
```

## 📝 核心功能

### 初始化面试 (initializeInterview)

用户：
1. 上传简历或输入简历文本
2. 选择即将参加的面试（学校、专业、类型）
3. 点击"启动AI面试"

系统流程：
1. 构建系统提示词（包含目标学校、专业、简历等信息）
2. 调用豆包 API 生成欢迎语和第一个问题
3. 创建会话 ID，保存对话历史
4. 导航到聊天页面，开始面试

**API 调用示例：**
```javascript
const response = await client.messages.create({
  model: 'ep-20260328093917-kzmnx',
  max_tokens: 500,
  messages: [
    {
      role: 'user',
      content: '开始面试。请生成一个热情但专业的欢迎语和第一个问题。'
    }
  ],
  system: '你是一位专业的校园面试官...'
});
```

### 提交回答 (submitAnswer)

1. 用户输入回答内容
2. 保存到本地会话历史
3. 调用豆包 API，带上完整的对话上下文
4. 返回 AI 的评价和下一个问题

**关键特性：**
- 维护完整的对话历史（用 `conversationHistory` Map）
- 每次调用都包含整个会话历史（便于 AI 理解上下文）
- 自动评分（0-100 分）

### 结束面试 (finishInterview)

1. 用户结束面试
2. 发送最后的消息给豆包 API，要求生成总结
3. 解析 JSON 格式的评分数据
4. 显示各项能力评分（知识、表达、热情、准备程度）
5. 清理会话历史

**评分结构：**
```json
{
  "total_score": 82,
  "breakdown": {
    "knowledge": 85,
    "communication": 80,
    "passion": 82,
    "preparation": 78
  },
  "feedback": "总体表现不错...",
  "equivalent_level": "很好"
}
```

## 🔄 降级机制

如豆包 API 出现问题（网络错误、配额限制等），系统会自动降级到**模拟数据**：
- `initializeInterview` → `mockInitializeInterview`
- `submitAnswer` → `mockSubmitAnswer`
- `finishInterview` → `mockFinishInterview`

这确保了应用的稳定性和可用性。

## 🛠️ 技术细节

### 使用的 SDK

```bash
npm install openai
```

### MockInterviewService 关键成员

| 成员 | 说明 |
|------|------|
| `ARK_API_KEY` | 豆包 API Key |
| `ARK_BASE_URL` | 豆包 API 地址 |
| `ARK_MODEL_ID` | 豆包模型接入点 ID |
| `client` | OpenAI 客户端实例（配置为豆包 API） |
| `conversationHistory` | 会话历史存储（Map 结构） |

### 系统提示词 (System Prompt)

```
你是一位专业的校园面试官，正在进行保研（推荐免试攻读研究生）面试。
- 考生目标院校：[学校名称]
- 目标专业：[专业名称]
- 面试类型：夏令营/笔试面试
- 难度等级：初级/中级/高级

请根据以下简历信息进行个性化提问：
[用户简历内容]

你的面试风格：
1. 专业并友好
2. 先从自我介绍开始
3. 逐步深入专业知识、项目经验、研究兴趣
4. 给予及时反馈和鼓励
5. 最后询问考生对学校的了解和提问

会话模式：
- 用中文进行面试
- 每次回应包括对考生回答的评价（简短）和下一个问题
- 全程保持专业态度
```

## 🔐 安全性考虑

### 当前阶段（开发环境）

- API Key 存储在 `.env.local`（本地开发）
- 浏览器中直接调用 API（`dangerouslyAllowBrowser: true`）
- **警告：** 不要将 `.env.local` 提交到版本控制

### 生产环境建议

1. **创建后端代理**
   - 前端调用自己的后端 API
   - 后端代理请求到豆包 API
   - API Key 存储在后端环境变量

2. **示例后端代码（Node.js）**
   ```javascript
   // routes/interview.js
   const OpenAI = require('openai');
   
   const client = new OpenAI({
     apiKey: process.env.ARK_API_KEY,
     baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
   });
   
   app.post('/api/interview/initialize', async (req, res) => {
     const { resumeText, schoolName, majorName } = req.body;
     
     const response = await client.messages.create({
       model: 'ep-20260328093917-kzmnx',
       messages: [{ role: 'user', content: resumeText }]
     });
     
     res.json(response);
   });
   ```

## 📊 使用配额和成本

- **API 调用频率：** 每次面试 5-10 次 API 调用
- **单次 tokens 使用：** ~200-800 tokens（取决于回答长度）
- **成本参考：** 详见豆包官网定价

## 🔨 调试和排查

### 常见问题

#### 1. "API Key 无效"

**解决方案：**
```bash
# 检查 .env.local 文件是否正确
cat .env.local

# 确保 API Key 没有多余空格
# 如果更新了 Key，需要重启开发服务器
npm start
```

#### 2. "请求超时"

**解决方案：**
- 检查网络连接
- 验证火山方舟官网是否可访问
- 检查浏览器控制台的详细错误信息

#### 3. "会话不存在"

**解决方案：**
- 确保先初始化面试再提交回答
- 检查会话 ID 是否被正确保存
- 查看浏览器 DevTools → Network 选项卡验证 API 响应

### 启用调试日志

在 `MockInterviewService.js` 中添加：

```javascript
static async initializeInterview(config) {
  console.log('🎤 初始化面试：', config);
  // ...
}

static async submitAnswer(sessionId, answer) {
  console.log('💬 提交回答：', { sessionId, answer });
  // ...
}
```

## 📚 相关资源

- **豆包官网：** https://www.doubao.com
- **火山方舟文档：** https://www.volcengine.com/docs
- **OpenAI SDK 文档：** https://github.com/openai/node-sdk
- **API Key 管理：** https://console.volcengine.com/ark

## 📋 检查清单

- [x] 安装 OpenAI SDK
- [x] 配置 API Key 和基础 URL
- [x] 修改 MockInterviewService 集成豆包 API
- [x] 实现会话历史管理
- [x] 添加降级机制
- [x] 创建 .env.local 配置文件
- [ ] 测试面试流程（建议手动测试）
- [ ] 配置后端代理（生产环境必需）
- [ ] 添加错误上报系统
- [ ] 监控 API 使用配额

## 🎯 下一步

1. **测试面试功能**
   - 打开应用导航到"漫学" → "面试练习"
   - 上传简历或输入示例简历
   - 选择一个面试开始
   - 验证 AI 问题和回复

2. **优化提示词**
   - 根据实际测试结果调整系统提示词
   - 改进面试流程和问题质量

3. **生产部署**
   - 搭建后端代理
   - 移除 `dangerouslyAllowBrowser: true` 标志
   - 配置环境变量安全管理

4. **功能扩展**
   - 添加面试历史记录存储
   - 实现评分对比和进度追踪
   - 添加口语教练功能

## 📞 支持

如有问题或需要调整集成方案，请参考：
- 豆包官方文档
- OpenAI SDK 使用指南
- 项目代码注释
