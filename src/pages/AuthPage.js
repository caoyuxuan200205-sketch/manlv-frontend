import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhoneIcon, LockIcon, EyeIcon, EyeOffIcon, ProfileIcon, HashIcon } from '../components/Icons';
import API_BASE_URL from '../config/api';
import { Wechat, TencentQq, Alipay } from '@icon-park/react';

function AuthPage({ onLogin }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login', 'register', 'forgot'
  const [showPassword, setShowPassword] = useState({});
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  // 手机号实时状态
  const [registerPhone, setRegisterPhone] = useState('');
  const [forgotPhone, setForgotPhone] = useState('');

  // 注册表单实时状态
  const [registerCode, setRegisterCode] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirm, setRegisterConfirm] = useState('');

  // 重置密码表单密码实时状态
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirm, setResetConfirm] = useState('');

  // 手机号格式校验
  const isValidPhone = (phone) => /^1[3-9]\d{9}$/.test(phone);
  const navigate = useNavigate();

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2800);
  };

  const togglePassword = (field) => {
    setShowPassword({ ...showPassword, [field]: !showPassword[field] });
  };

  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 6)  score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const map = [
      { label: '极弱', color: '#ff4d4f' },
      { label: '弱',   color: '#ffa940' },
      { label: '一般', color: '#ffd666' },
      { label: '强',   color: '#000000' },
      { label: '很强', color: '#000000' },
    ];
    return { score, ...map[Math.min(score - 1, 4)] };
  };

  const getPasswordRules = (password) => [
    { pass: password.length >= 6,                                        text: '至少 6 位字符' },
    { pass: /[A-Za-z]/.test(password) && /[0-9]/.test(password),        text: '包含字母和数字' },
    { pass: /[A-Z]/.test(password) && /[a-z]/.test(password),           text: '同时含大小写字母' },
    { pass: /[^A-Za-z0-9]/.test(password),                              text: '包含特殊符号（可选）' },
  ];

  const sendVerificationCode = (type = 'register') => {
    const phoneId = type === 'forgot' ? 'forgot-phone' : 'register-phone';
    const phone = document.getElementById(phoneId)?.value;
    if (!phone || phone.length !== 11) {
      showToast('请输入正确的手机号');
      return;
    }
    
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    showToast('验证码已发送至 ' + phone);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const account = e.target.elements.account.value;
    const password = e.target.elements.password.value;

    if (!account || !password) {
      showToast('请填写完整的登录信息');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: account, password })
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.error === 'Invalid credentials' ? '用户名或密码错误' : (data.error || '登录失败，请重试');
        showToast(errorMsg);
        return;
      }

      localStorage.setItem('manlv_token', data.token);
      onLogin();
      showToast(`欢迎回来，${data.user.name || '你'}！ 🎉`);
      navigate('/home');
    } catch (error) {
      console.error(error);
      showToast('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const phone = e.target.elements.phone.value;
    const code = e.target.elements.code.value;
    const name = e.target.elements.name.value;
    const password = e.target.elements.password.value;
    const confirm = e.target.elements['password-confirm'].value;
    const agree = e.target.elements['agree-terms'].checked;

    if (!phone || !code || !name || !password || !confirm) {
      showToast('请填写完整的注册信息');
      return;
    }

    if (password !== confirm) {
      showToast('两次输入的密码不一致');
      return;
    }

    if (!agree) {
      showToast('请先同意用户协议和隐私政策');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: phone, password, name })
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || '注册失败，请重试');
        return;
      }

      showToast('注册成功！欢迎加入漫旅 🎉');
      navigate('/home');
      onLogin();
    } catch (error) {
      console.error(error);
      showToast('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const phone = e.target.elements.phone.value;
    const code = e.target.elements.code.value;
    const password = e.target.elements.password.value;
    const confirm = e.target.elements['password-confirm'].value;

    if (!phone || !code || !password || !confirm) {
      showToast('请填写完整的重置信息');
      return;
    }

    if (password !== confirm) {
      showToast('两次输入的密码不一致');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: phone, code, newPassword: password })
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || '重置失败，请重试');
        return;
      }

      showToast('密码重置成功！请重新登录');
      setActiveTab('login');
    } catch (error) {
      console.error(error);
      showToast('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const socialLogin = (platform) => {
    const names = {
      'wechat': '微信',
      'qq': 'QQ',
      'alipay': '支付宝'
    };
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
      showToast(`${names[platform]}登录成功！欢迎回来 🎉`);
      navigate('/home');
    }, 1000);
  };

  return (
    <div className="page">
      <div className="auth-page">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <img src="/ai-avatar-monkey.png" alt="漫旅" className="auth-logo-img" />
            </div>
            <div className="auth-logo-zh">漫旅</div>
            <div className="auth-logo-en">ManLv · Wandering Scholar</div>
          </div>
          <div className="auth-welcome">
            保研路上的智能伙伴<br/>让每一次出发都充满期待
          </div>
        </div>

        <div className="auth-form-container">
          <div className="auth-tabs">
            <button 
              className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => setActiveTab('login')}
            >
              登录
            </button>
            <button 
              className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => setActiveTab('register')}
            >
              注册
            </button>
          </div>

          {activeTab === 'login' ? (
            <form className="auth-form" onSubmit={handleLogin}>
              <div className="input-group">
                <label className="input-label">手机号 / 邮箱</label>
                <div className="input-wrapper">
                  <span className="input-icon" style={{ left: '16px' }}><PhoneIcon size={16} /></span>
                  <input 
                    type="text" 
                    className="auth-input" 
                    name="account"
                    placeholder="请输入手机号或邮箱" 
                    style={{ paddingLeft: '48px' }}
                    required 
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">密码</label>
                <div className="input-wrapper">
                  <span className="input-icon" style={{ left: '16px' }}><LockIcon size={16} /></span>
                  <input 
                    type={showPassword['login-password'] ? 'text' : 'password'} 
                    className="auth-input" 
                    name="password"
                    placeholder="请输入密码" 
                    required 
                    style={{ paddingLeft: '48px', paddingRight: '44px' }}
                  />
                  <button 
                    type="button" 
                    className="password-toggle" 
                    onClick={() => togglePassword('login-password')}
                  >
                    {showPassword['login-password'] ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                  </button>
                </div>
              </div>

              <div className="auth-options">
                <label className="remember-me">
                  <input type="checkbox" name="remember" />
                  <span>记住我</span>
                </label>
                <button 
                  type="button" 
                  className="forgot-password" 
                  onClick={() => setActiveTab('forgot')}
                >
                  忘记密码？
                </button>
              </div>

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? '登录中...' : '登录'}
              </button>

              <div className="divider">
                <span className="divider-text">其他登录方式</span>
              </div>

              <div className="social-login">
                <button 
                  type="button" 
                  className="social-btn" 
                  onClick={() => socialLogin('wechat')} 
                  title="微信登录"
                >
                  <Wechat theme="outline" size="24" fill="#333" />
                </button>
                <button 
                  type="button" 
                  className="social-btn" 
                  onClick={() => socialLogin('qq')} 
                  title="QQ登录"
                >
                  <TencentQq theme="outline" size="24" fill="#333" />
                </button>
                <button 
                  type="button" 
                  className="social-btn" 
                  onClick={() => socialLogin('alipay')} 
                  title="支付宝登录"
                >
                  <Alipay theme="outline" size="24" fill="#333" />
                </button>
              </div>
            </form>
          ) : activeTab === 'register' ? (
            <form className="auth-form" onSubmit={handleRegister}>
              <div className="input-group">
                <label className="input-label">手机号</label>
                <div className="input-wrapper">
                  <span className="input-icon" style={{ left: '16px' }}><PhoneIcon size={16} /></span>
                  <input 
                    type="tel" 
                    className={`auth-input ${
                      registerPhone
                        ? (isValidPhone(registerPhone) ? 'input-valid' : 'input-error')
                        : ''
                    }`}
                    id="register-phone"
                    name="phone"
                    placeholder="请输入11位手机号" 
                    style={{ paddingLeft: '48px' }}
                    maxLength="11"
                    value={registerPhone}
                    onChange={e => setRegisterPhone(e.target.value.replace(/\D/g, ''))}
                    required 
                  />
                </div>
                {registerPhone && !isValidPhone(registerPhone) && (
                  <div className="input-hint hint-error">
                    {registerPhone.length < 11 ? '手机号位数不足' : '请输入正确的手机号'}
                  </div>
                )}
              </div>

              <div className="input-group">
                <label className="input-label">验证码</label>
                <div className="verification-code">
                  <div className="input-wrapper" style={{ flex: 1 }}>
                    <span className="input-icon" style={{ left: '16px' }}><HashIcon size={16} /></span>
                    <input 
                      type="text" 
                      className={`auth-input ${registerCode.length === 6 ? 'input-valid' : ''}`}
                      name="code"
                      placeholder="请输入验证码" 
                      style={{ paddingLeft: '48px' }}
                      maxLength="6" 
                      required 
                      value={registerCode}
                      onChange={e => setRegisterCode(e.target.value)}
                    />
                  </div>
                  <button 
                    type="button" 
                    className="send-code-btn" 
                    disabled={countdown > 0}
                    onClick={() => sendVerificationCode('register')}
                  >
                    {countdown > 0 ? `${countdown}s` : '获取验证码'}
                  </button>
                </div>
                {registerCode && registerCode.length !== 6 && (
                  <div className="input-hint hint-error">
                    请输入6位验证码
                  </div>
                )}
              </div>

              <div className="input-group">
                <label className="input-label">姓名</label>
                <div className="input-wrapper">
                  <span className="input-icon" style={{ left: '16px' }}><ProfileIcon size={16} /></span>
                  <input 
                    type="text" 
                    className={`auth-input ${registerName.length >= 2 ? 'input-valid' : ''}`}
                    name="name"
                    placeholder="请输入真实姓名" 
                    style={{ paddingLeft: '48px' }}
                    required 
                    value={registerName}
                    onChange={e => setRegisterName(e.target.value)}
                  />
                </div>
                {registerName && registerName.length < 2 && (
                  <div className="input-hint hint-error">
                    姓名至少需要2个字符
                  </div>
                )}
              </div>

              <div className="input-group">
                <label className="input-label">设置密码</label>
                <div className="input-wrapper">
                  <span className="input-icon" style={{ left: '16px' }}><LockIcon size={16} /></span>
                  <input 
                    type={showPassword['register-password'] ? 'text' : 'password'} 
                    className={`auth-input ${registerPassword && (() => {
                      const { score } = getPasswordStrength(registerPassword);
                      return score >= 3 ? 'input-valid' : '';
                    })() || ''}`}
                    name="password"
                    placeholder="6-20位，需包含字母和数字" 
                    required 
                    style={{ paddingLeft: '48px', paddingRight: '44px' }}
                    value={registerPassword}
                    onChange={e => setRegisterPassword(e.target.value)}
                  />
                  <button 
                    type="button" 
                    className="password-toggle" 
                    onClick={() => togglePassword('register-password')}
                  >
                    {showPassword['register-password'] ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                  </button>
                </div>

                {/* 实时密码强度 */}
                {registerPassword && (() => {
                  const { score, label, color } = getPasswordStrength(registerPassword);
                  const rules = getPasswordRules(registerPassword);
                  return (
                    <div className="password-feedback-modern">
                      <div className="strength-header">
                        <div className="strength-bar-modern">
                          <div 
                            className="strength-fill"
                            style={{
                              width: `${(score / 5) * 100}%`,
                              background: color
                            }}
                          />
                        </div>
                        <span className="strength-text" style={{ color }}>{label}</span>
                      </div>
                      <div className="password-checklist">
                        {rules.map((r, i) => (
                          <div key={i} className={`check-item ${r.pass ? 'checked' : ''}`}>
                            <span className="check-dot" />
                            <span className="check-text">{r.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="input-group">
                <label className="input-label">确认密码</label>
                <div className="input-wrapper">
                  <span className="input-icon" style={{ left: '16px' }}><LockIcon size={16} /></span>
                  <input 
                    type={showPassword['register-password-confirm'] ? 'text' : 'password'} 
                    className={`auth-input ${
                      registerConfirm
                        ? (registerConfirm === registerPassword ? 'input-valid' : 'input-error')
                        : ''
                    }`}
                    name="password-confirm"
                    placeholder="请再次输入密码" 
                    required 
                    style={{ paddingLeft: '48px', paddingRight: '44px' }}
                    value={registerConfirm}
                    onChange={e => setRegisterConfirm(e.target.value)}
                  />
                  <button 
                    type="button" 
                    className="password-toggle" 
                    onClick={() => togglePassword('register-password-confirm')}
                  >
                    {showPassword['register-password-confirm'] ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                  </button>
                </div>
                {registerConfirm && registerConfirm !== registerPassword && (
                  <div className="input-hint hint-error">
                    两次密码不一致
                  </div>
                )}
              </div>

              <div className="terms-checkbox">
                <input type="checkbox" name="agree-terms" />
                <span>
                  我已阅读并同意{' '}
                  <button 
                    type="button" 
                    style={{ color: 'var(--gold)', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                    onClick={() => showToast('用户协议即将上线')}
                  >
                    《用户协议》
                  </button>{' '}
                  和{' '}
                  <button 
                    type="button" 
                    style={{ color: 'var(--gold)', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                    onClick={() => showToast('隐私政策即将上线')}
                  >
                    《隐私政策》
                  </button>
                </span>
              </div>

              <button type="submit" className="auth-btn" style={{ marginTop: '16px' }} disabled={loading}>
                {loading ? '注册中...' : '注册'}
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleResetPassword}>
              <div className="input-group">
                <label className="input-label">手机号</label>
                <div className="input-wrapper">
                  <span className="input-icon" style={{ left: '16px' }}><PhoneIcon size={16} /></span>
                  <input 
                    type="tel" 
                    className={`auth-input ${
                      forgotPhone
                        ? (isValidPhone(forgotPhone) ? 'input-valid' : 'input-error')
                        : ''
                    }`}
                    id="forgot-phone"
                    name="phone"
                    placeholder="请输入注册手机号" 
                    style={{ paddingLeft: '48px' }}
                    maxLength="11"
                    value={forgotPhone}
                    onChange={e => setForgotPhone(e.target.value.replace(/\D/g, ''))}
                    required 
                  />
                </div>
                {forgotPhone && !isValidPhone(forgotPhone) && (
                  <div className="input-hint hint-error">
                    {forgotPhone.length < 11 ? '手机号位数不足' : '请输入正确的手机号'}
                  </div>
                )}
              </div>

              <div className="input-group">
                <label className="input-label">验证码</label>
                <div className="verification-code">
                  <div className="input-wrapper" style={{ flex: 1 }}>
                    <span className="input-icon" style={{ left: '16px' }}><HashIcon size={16} /></span>
                    <input 
                      type="text" 
                      className="auth-input" 
                      name="code"
                      placeholder="请输入验证码" 
                      style={{ paddingLeft: '48px' }}
                      maxLength="6" 
                      required 
                    />
                  </div>
                  <button 
                    type="button" 
                    className="send-code-btn" 
                    disabled={countdown > 0}
                    onClick={() => sendVerificationCode('forgot')}
                  >
                    {countdown > 0 ? `${countdown}s` : '获取验证码'}
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">新密码</label>
                <div className="input-wrapper">
                  <span className="input-icon" style={{ left: '16px' }}><LockIcon size={16} /></span>
                  <input 
                    type={showPassword['reset-password'] ? 'text' : 'password'} 
                    className="auth-input" 
                    name="password"
                    placeholder="请输入新密码" 
                    required 
                    style={{ paddingLeft: '48px', paddingRight: '44px' }}
                    value={resetPassword}
                    onChange={e => setResetPassword(e.target.value)}
                  />
                  <button 
                    type="button" 
                    className="password-toggle" 
                    onClick={() => togglePassword('reset-password')}
                  >
                    {showPassword['reset-password'] ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                  </button>
                </div>

                {resetPassword && (() => {
                  const { score, label, color } = getPasswordStrength(resetPassword);
                  const rules = getPasswordRules(resetPassword);
                  return (
                    <div className="password-feedback-modern">
                      <div className="strength-header">
                        <div className="strength-bar-modern">
                          <div 
                            className="strength-fill"
                            style={{
                              width: `${(score / 5) * 100}%`,
                              background: color
                            }}
                          />
                        </div>
                        <span className="strength-text" style={{ color }}>{label}</span>
                      </div>
                      <div className="password-checklist">
                        {rules.map((r, i) => (
                          <div key={i} className={`check-item ${r.pass ? 'checked' : ''}`}>
                            <span className="check-dot" />
                            <span className="check-text">{r.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="input-group">
                <label className="input-label">确认新密码</label>
                <div className="input-wrapper">
                  <span className="input-icon" style={{ left: '16px' }}><LockIcon size={16} /></span>
                  <input 
                    type={showPassword['reset-password-confirm'] ? 'text' : 'password'} 
                    className={`auth-input ${
                      resetConfirm
                        ? (resetConfirm === resetPassword ? 'input-valid' : 'input-error')
                        : ''
                    }`}
                    name="password-confirm"
                    placeholder="请再次确认新密码" 
                    required 
                    style={{ paddingLeft: '48px', paddingRight: '44px' }}
                    value={resetConfirm}
                    onChange={e => setResetConfirm(e.target.value)}
                  />
                  <button 
                    type="button" 
                    className="password-toggle" 
                    onClick={() => togglePassword('reset-password-confirm')}
                  >
                    {showPassword['reset-password-confirm'] ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                  </button>
                </div>
                {resetConfirm && resetConfirm !== resetPassword && (
                  <div className="input-hint hint-error">
                    两次密码不一致
                  </div>
                )}
              </div>

              <button type="submit" className="auth-btn" style={{ marginTop: '16px' }} disabled={loading}>
                {loading ? '提交重置' : '重置密码'}
              </button>
              
              <button 
                type="button" 
                className="forgot-password" 
                style={{ marginTop: '16px', display: 'block', textAlign: 'center', width: '100%' }}
                onClick={() => setActiveTab('login')}
              >
                返回登录
              </button>
            </form>
          )}
        </div>

        <div className="auth-footer">
          <div className="auth-footer-text">
            © 2026 漫旅 ManLv · 让保研之旅更从容
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="loading show">
          <div className="loading-inner">
            <div className="loading-spinner"></div>
            <div className="loading-text">处理中...</div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className="toast show">{toast}</div>}
    </div>
  );
}

export default AuthPage;
