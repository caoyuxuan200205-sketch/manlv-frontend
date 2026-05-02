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

## � API 文档

前端通过以下 API 与后端交互：

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/reset-password` - 重置密码

### 用户管理
- `GET /api/user` - 获取用户信息
- `PUT /api/user` - 更新用户信息
- `GET /api/user/memory` - 获取用户记忆
- `PUT /api/user/memory` - 更新用户记忆

### 邮件管理
- `GET /api/emails` - 获取用户邮件列表
- `POST /api/emails` - 创建邮件
- `PUT /api/emails/:id` - 更新邮件
- `DELETE /api/emails/:id` - 删除邮件

### 面试管理
- `GET /api/interviews` - 获取面试列表
- `POST /api/interviews` - 添加面试安排
- `DELETE /api/interviews/:id` - 删除面试

### AI 功能
- `POST /api/ai/chat` - AI 对话接口

### 文件处理
- `POST /api/parse-resume` - 简历文件解析

---

## �🚀 快速开始

### 环境要求

- Node.js ≥ 18
- PostgreSQL 数据库
- DashScope API Key（[申请地址](https://dashscope.aliyuncs.com)）

### 前端启动

如果您已经克隆了项目到本地：

```bash
cd ManLv
npm install
npm start
# 访问 http://localhost:3000
```

如果需要从 GitHub 克隆：

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
| `get_weather` | 查询指定城市的天气信息 |
| `search_hotels` | 搜索目的地周边酒店 |
| `web_search` | 联网搜索最新保研资讯与动态 |
| `bazi_reading` | 传统文化命理排盘与陪伴 |
| `lark_auth_*` | 飞书 OAuth 账号绑定与状态检查 |
| `lark_docs_*` | 通过飞书 OpenAPI 搜索/读取/创建文档 |
| `lark_calendar_*` | 通过飞书 OpenAPI 查询/创建日程安排 |
| `lark_drive_*` | 通过飞书 OpenAPI 读取云盘文件 |

---

## 🚀 部署说明

### 开发环境部署

1. **安装依赖**
```bash
npm install
```

2. **启动开发服务器**
```bash
npm start
```

3. **构建生产版本**
```bash
npm run build
```

### 生产环境部署

1. **构建优化版本**
```bash
npm run build
```

2. **部署到服务器**
   - 将 `build/` 目录下的文件部署到 Web 服务器
   - 配置反向代理指向后端 API

3. **Nginx 配置示例**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 代理 API 请求到后端
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Docker 部署

```dockerfile
FROM nginx:alpine

COPY build/ /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

---

## 📝 更新日志

- **v1.0.0** (2024-04-27)
  - 初始版本发布
  - 支持用户认证、行程管理、邮件处理
  - 集成 AI 对话和模拟面试功能
  - 支持情景学习和情绪支持

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
