<div align="center">

# 漫旅 ManLv

**The Wandering Scholar · 保研全程智能伴旅助手**

*让每一段保研面试旅途，都成为一次与城市对话的学习之旅*

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![AI](https://img.shields.io/badge/AI-Qwen%20%2F%20DashScope-FF6A00?style=flat-square)](https://dashscope.aliyuncs.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[前端仓库](https://github.com/caoyuxuan200205-sketch/manlv-frontend) · [后端仓库](https://github.com/caoyuxuan200205-sketch/manlv-backend)

</div>

---

## 🎯 产品简介

**漫旅（ManLv）** 是一款面向保研生的 AI 驱动一站式行程伴旅助手。

保研季，学生平均需要申请 5–10 所高校的夏令营或预推免，在 6–9 月间频繁跨城市差旅，面临邮件轰炸、行程冲突、备考压力、心理焦虑等多重挑战。漫旅致力于将「多城市面试调度 × 专业备考 × 情绪支持」整合为一套主动式 AI 助手，帮助用户在旅途中建立掌控感与意义感。

> 「漫」取漫游之意，谐音「慢」，传递放松节奏；「旅」直指面试旅途场景。**漫旅 = 有意义的慢行。**

---

## ✨ 核心功能

### 🤖 AI 智能助手
- **真实 AI 对话**：接入 Qwen 大模型（DashScope），支持流式输出，回复逐字实时显示
- **工具调用可视化**：AI 调用工具时展示「🔍 正在查询...」思考过程
- **Markdown 渲染**：支持标题、加粗、列表、表格等富文本格式

### 📅 行程管理
- 面试安排录入与管理（学校、专业、城市、日期、类型）
- 同日行程冲突智能检测与分析
- AI 自动生成最优解决方案

### 📬 邮件智能感知（MAIL-SENSE）
- 自动识别入营通知、预推免邀请等关键邮件
- 结构化提取院校名称、面试时间、报名截止日等信息
- 截止日三级提醒推送（72h / 24h / 2h）

### 🗺️ 情景学习引擎（LEARN-ENGINE）
- 基于「专业方向 × 目的地城市」矩阵匹配个性化学习内容
- LBS 触发现场情景导读卡，知识点与面试关联提示
- 高铁阅读包：长途交通时推送轻量备考内容

### 🎙️ AI 模拟面试
- 选择目标院校和专业，开启专项模拟面试
- 实时 AI 提问与反馈，面试结束后生成评分报告
- 多维度评估：知识掌握 / 表达能力 / 学习热情 / 准备程度

### 💚 情绪支持（MOOD-CARE）
- 每日旅学成就报告，量化正向反馈
- 情绪曲线追踪，动态调整推送强度
- 鼓励型语言风格，赋能而非依赖

---

## 🛠️ 技术栈

| 层次 | 技术方案 |
|------|----------|
| 前端 | React 18 · React Router DOM 6 · react-markdown · remark-gfm |
| 后端 | Node.js · Express · Prisma ORM |
| 数据库 | PostgreSQL |
| AI | Qwen-Plus / Qwen-Max（DashScope，兼容 OpenAI 格式）|
| 认证 | JWT · bcryptjs |
| 地图 | 高德地图 JS API |
| 图标 | @icon-park/react |

---

## 🚀 快速开始

### 环境要求

- Node.js ≥ 18
- PostgreSQL 数据库
- DashScope API Key（[申请地址](https://dashscope.aliyuncs.com)）

### 前端启动

```bash
# 克隆前端仓库
git clone https://github.com/caoyuxuan200205-sketch/manlv-frontend.git
cd manlv-frontend

# 安装依赖
npm install

# 启动开发服务器
npm start
# 访问 http://localhost:3000
```

### 后端启动

```bash
# 克隆后端仓库
git clone https://github.com/caoyuxuan200205-sketch/manlv-backend.git
cd manlv-backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入以下配置
```

### 环境变量配置（`.env`）

```env
# 数据库
DATABASE_URL="postgresql://用户名:密码@localhost:5432/manlv"

# JWT 密钥
JWT_SECRET=your_jwt_secret_here

# AI 配置（DashScope）
AI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
AI_API_KEY=sk-xxxxxxxxxxxxxxxx
AI_MODEL=qwen-plus
AI_MAX_STEPS=6

# 服务端口
PORT=3001
```

```bash
# 初始化数据库
npx prisma migrate dev

# 启动后端服务
node src/server.js
```

---

## 📁 项目结构

```
manlv-frontend/
├── public/
└── src/
    ├── components/        # 公共组件（图标、浮窗等）
    ├── pages/             # 页面组件
    │   ├── AuthPage.js    # 登录 / 注册
    │   ├── HomePage.js    # 首页
    │   ├── SchedulePage.js   # 行程管理
    │   ├── TripDetailPage.js # 行程详情
    │   ├── LearnPage.js   # 情景学习
    │   ├── InboxPage.js   # 邮件收件箱
    │   ├── ProfilePage.js # 个人中心
    │   └── ChatPage.js    # AI 聊天（核心）
    ├── services/          # 服务层（模拟面试等）
    ├── App.js
    └── App.css

manlv-backend/
└── src/
    ├── server.js          # 主服务（API + AI Agent）
    └── generated/         # Prisma 生成文件
```

---

## 🔌 API 接口概览

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 用户注册 |
| POST | `/api/auth/login` | 用户登录 |
| GET | `/api/user` | 获取用户信息 |
| PUT | `/api/user` | 更新用户资料 |
| GET | `/api/interviews` | 获取面试列表 |
| POST | `/api/interviews` | 新增面试安排 |
| POST | `/api/ai/chat` | AI 对话（SSE 流式输出）|

### AI 对话接口（SSE）

`POST /api/ai/chat` 返回 `text/event-stream`，支持以下事件类型：

```json
{ "type": "thinking", "tool": "analyze_schedule_conflicts" }  // 工具调用中
{ "type": "text", "content": "..." }                          // 流式文字输出
{ "type": "done", "usedTools": [...] }                        // 完成
{ "type": "error", "message": "..." }                         // 错误
```

### AI 内置工具

| 工具名 | 说明 |
|--------|------|
| `get_user_profile` | 获取用户基础资料 |
| `list_interviews` | 查询面试安排列表 |
| `create_interview` | 创建新面试记录 |
| `analyze_schedule_conflicts` | 分析行程冲突 |

---

## 🗺️ 页面路由

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | AuthPage | 登录 / 注册 |
| `/home` | HomePage | 主页（今日任务 + 行程概览）|
| `/trip` | SchedulePage | 多城市行程日历 |
| `/trip/:school` | TripDetailPage | 行程详情（行程规划 / 备考要点 / 城市导览）|
| `/learn` | LearnPage | 情景学习（城市地图 / 模拟面试）|
| `/inbox` | InboxPage | 邮件解析中心 |
| `/profile` | ProfilePage | 个人中心（情绪曲线 / 旅学成就）|
| `/chat` | ChatPage | AI 智能助手 |

---

## 🛣️ 产品路线图

| 版本 | 阶段 | 核心目标 |
|------|------|----------|
| V1.0 | MVP（当前）| AI 对话 · 行程管理 · 冲突分析 · 模拟面试 |
| V1.x | 优化期 | 多轮对话记忆 · 天气查询 · 消息持久化 |
| V2.0 | 成长期 | 票务酒店预订 · 导师知识图谱 · 情绪支持系统 |
| V3.0 | 扩展期 | 往届经验社区 · 院校资源数据库 · 考研场景延伸 |

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 License

MIT © 2026 漫旅 ManLv
