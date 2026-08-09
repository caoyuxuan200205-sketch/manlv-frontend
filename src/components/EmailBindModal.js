import React, { useState } from 'react';
import API_BASE_URL from '../config/api';
import '../styles/EmailBindModal.css';

function EmailBindModal({ isOpen, onClose, onSuccess }) {
  const [provider, setProvider] = useState('qq'); // 'qq' | '163'
  const [email, setEmail] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showGuide, setShowGuide] = useState(true);

  if (!isOpen) return null;

  const handleBind = async (e) => {
    e.preventDefault();
    if (!email.trim() || !authCode.trim()) {
      setErrorMsg('请填写完整的邮箱地址和授权码');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const token = localStorage.getItem('manlv_token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/email-accounts/bind`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          provider,
          email: email.trim(),
          authCode: authCode.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '绑定失败，请检查授权码');
      }

      if (onSuccess) {
        onSuccess(data.account);
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || '绑定失败，请稍后重发');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bind-modal-overlay" onClick={onClose}>
      <div className="bind-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="bind-modal-header">
          <div className="bind-modal-title">
            <span className="bind-modal-icon">✉️</span> 绑定个人接收邮箱
          </div>
          <button className="bind-modal-close" onClick={onClose}>×</button>
        </div>

        {/* 邮箱提供商选择 */}
        <div className="bind-provider-tabs">
          <button
            type="button"
            className={`bind-provider-btn ${provider === 'qq' ? 'active' : ''}`}
            onClick={() => {
              setProvider('qq');
              setErrorMsg('');
            }}
          >
            QQ 邮箱 (@qq.com)
          </button>
          <button
            type="button"
            className={`bind-provider-btn ${provider === '163' ? 'active' : ''}`}
            onClick={() => {
              setProvider('163');
              setErrorMsg('');
            }}
          >
            网易 163 (@163.com)
          </button>
        </div>

        {/* 授权码获取指引 */}
        <div className="bind-guide-box">
          <div className="bind-guide-title" onClick={() => setShowGuide(!showGuide)}>
            <span>💡 如何获取{provider === 'qq' ? 'QQ邮箱' : '163邮箱'}“授权码”？</span>
            <span className="guide-toggle">{showGuide ? '收起' : '展开指南'}</span>
          </div>

          {showGuide && provider === 'qq' && (
            <ol className="bind-guide-steps">
              <li>电脑浏览器登录 <strong>mail.qq.com</strong>；</li>
              <li>点击顶部 <strong>设置</strong> -&gt; <strong>账户</strong> 页签；</li>
              <li>向下滚动找到 <strong>POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务</strong>；</li>
              <li>开启 <strong>POP3/IMAP服务</strong>，按提示发送短信即可得到 16 位<strong>授权码</strong>（非QQ密码）。</li>
            </ol>
          )}

          {showGuide && provider === '163' && (
            <ol className="bind-guide-steps">
              <li>电脑浏览器登录 <strong>mail.163.com</strong>；</li>
              <li>点击顶部 <strong>设置</strong> -&gt; <strong>POP3/SMTP/IMAP</strong>；</li>
              <li>在左侧开启 <strong>POP3/IMAP服务</strong>；</li>
              <li>点击 <strong>新增授权密码</strong>，短信验证后复制生成的授权码。</li>
            </ol>
          )}
        </div>

        {errorMsg && <div className="bind-error-alert">⚠️ {errorMsg}</div>}

        <form onSubmit={handleBind} className="bind-form">
          <div className="bind-form-group">
            <label>邮箱账号</label>
            <input
              type="email"
              placeholder={provider === 'qq' ? '例如: 12345678@qq.com' : '例如: yourname@163.com'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="bind-form-group">
            <label>IMAP 授权码</label>
            <input
              type="password"
              placeholder="请输入生成的 16 位授权码"
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
              required
            />
          </div>

          <div className="bind-actions">
            <button type="button" className="bind-btn-cancel" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="bind-btn-submit" disabled={loading}>
              {loading ? '正在验证连接...' : '验证并绑定'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EmailBindModal;
