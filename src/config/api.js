/**
 * API 配置
 * 统一管理后端 API 地址
 * 
 * 本地开发时默认使用 http://localhost:3001
 * 部署到 Vercel 时，在环境变量中设置 REACT_APP_API_BASE_URL 为后端真实地址
 * 例如: https://manlv-backend-production.up.railway.app
 */
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

export default API_BASE_URL;
