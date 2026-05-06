/**
 * API 配置
 * 统一管理后端 API 地址
 *
 * 开发环境默认走本地后端，生产环境默认走当前站点同源地址。
 * 如果前后端分域部署，可通过 REACT_APP_API_BASE_URL 显式覆盖。
 */
const getDefaultApiBaseUrl = () => {
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }

  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
    return window.location.origin;
  }

  return 'http://localhost:3001';
};

const API_BASE_URL = getDefaultApiBaseUrl();

export default API_BASE_URL;
