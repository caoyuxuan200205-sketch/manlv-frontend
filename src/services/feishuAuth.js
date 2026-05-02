import API_BASE_URL from '../config/api';

const DEFAULT_RESULT_PATH = '/oauth/feishu/result';
const PENDING_CHAT_INTENT_KEY = 'manlv_feishu_pending_chat_intent';

const getStoredToken = () => localStorage.getItem('manlv_token');

export const getDefaultFeishuRedirectUri = (scene = 'chat', next = '/chat') => {
  if (typeof window === 'undefined') return '';

  const url = new URL(DEFAULT_RESULT_PATH, window.location.origin);
  url.searchParams.set('scene', scene);
  url.searchParams.set('next', next);
  return url.toString();
};

export const fetchFeishuStatus = async (token = getStoredToken()) => {
  if (!token) {
    throw new Error('当前登录状态已失效，请重新登录后再试');
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/feishu/status`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || '获取飞书绑定状态失败');
  }

  return data;
};

export const startFeishuAuth = async ({
  redirectUri,
  token = getStoredToken()
} = {}) => {
  if (!token) {
    throw new Error('当前登录状态已失效，请重新登录后再试');
  }

  const url = new URL(`${API_BASE_URL}/api/auth/feishu/start`);
  if (redirectUri) {
    url.searchParams.set('redirect_uri', redirectUri);
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || '生成飞书授权链接失败');
  }

  if (!data.authorizeUrl) {
    throw new Error('飞书授权链接为空，请稍后重试');
  }

  return data;
};

export const unbindFeishu = async (token = getStoredToken()) => {
  if (!token) {
    throw new Error('当前登录状态已失效，请重新登录后再试');
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/feishu/unbind`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || '解除飞书绑定失败');
  }

  return data;
};

export const savePendingFeishuChatIntent = (intent) => {
  if (typeof window === 'undefined') return;

  const text = String(intent?.text || '').trim();
  if (!text) return;

  window.sessionStorage.setItem(PENDING_CHAT_INTENT_KEY, JSON.stringify({
    text,
    appendUser: Boolean(intent?.appendUser)
  }));
};

export const consumePendingFeishuChatIntent = () => {
  if (typeof window === 'undefined') return null;

  const raw = window.sessionStorage.getItem(PENDING_CHAT_INTENT_KEY);
  if (!raw) return null;
  window.sessionStorage.removeItem(PENDING_CHAT_INTENT_KEY);

  try {
    const parsed = JSON.parse(raw);
    return {
      text: String(parsed?.text || '').trim(),
      appendUser: Boolean(parsed?.appendUser)
    };
  } catch (error) {
    return null;
  }
};
