# 漫旅 ManLv 前端

漫旅（ManLv）是一个面向保研场景的行程与备考助手前端项目，聚焦夏令营/面试全流程管理、信息整理与 AI 交互体验。

## 项目状态

- 前端仓库：`manlv-frontend`
- 运行方式：`create-react-app`（React 18）
- 当前默认路由：未登录进入 `/`，登录后进入 `/home`

## 技术栈

- React 18
- React Router DOM 6
- React Scripts 5
- @icon-park/react
- @amap/amap-jsapi-loader

## 核心能力

- 认证入口：登录/注册页面与登录态路由守卫
- 行程管理：行程列表、详情页、时间线与城市信息
- 学习备考：学习页、收件箱页、个人中心页
- AI 交互：全局浮窗助手 + 聊天页面
- 邮件能力：邮件解析与邮件回复生成服务模块

## 页面与路由

- `/`：登录注册页 `AuthPage`
- `/home`：主页 `HomePage`
- `/trip`：行程页 `SchedulePage`
- `/trip/:school`：行程详情页 `TripDetailPage`
- `/learn`：学习页 `LearnPage`
- `/inbox`：收件箱页 `InboxPage`
- `/profile`：个人中心页 `ProfilePage`
- `/chat`：AI 聊天页 `ChatPage`
- `/schedule`：兼容旧路由，重定向到 `/trip`

## 目录结构

```text
ManLv/
├─ public/
├─ src/
│  ├─ components/
│  ├─ pages/
│  ├─ services/
│  ├─ App.js
│  └─ index.js
├─ package.json
└─ README.md
```

## 本地开发

1) 安装依赖

```bash
npm install
```

2) 启动开发环境

```bash
npm start
```

默认访问 `http://localhost:3000`

3) 打包构建

```bash
npm run build
```

4) 运行测试

```bash
npm test
```

## NPM Scripts

- `npm start`：启动开发服务器
- `npm run build`：构建生产包
- `npm test`：运行测试
- `npm run eject`：弹出 CRA 配置（不可逆）

## 相关仓库

- 前端：`https://github.com/caoyuxuan200205-sketch/manlv-frontend`
- 后端：`https://github.com/caoyuxuan200205-sketch/manlv-backend`
