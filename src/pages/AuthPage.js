import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhoneIcon, LockIcon, EyeIcon, EyeOffIcon, ProfileIcon, HashIcon } from '../components/Icons';
import API_BASE_URL from '../config/api';
import majorListData from '../config/major_list.json';
import '../styles/AuthPage.css';
import { Wechat, TencentQq, Alipay } from '@icon-park/react';

const undergraduateCategories = majorListData.undergraduate || [];

const POLICY_CONTENT = {
  terms: {
    modalTitle: '用户协议',
    fullTitle: '一、漫旅保研AI助手 用户服务协议',
    effectiveDate: '版本生效日期：2026年4月29日',
    intro: '本协议适用于「漫旅」保研AI助手所有版本（Web端/移动端），为demo演示项目，仅供非商业学习交流使用。',
    sections: [
      {
        title: '1. 协议主体与适用范围',
        paragraphs: [
          '1.1 本协议是您（以下简称"用户"）与「漫旅」项目开发团队（以下简称"我们"）之间关于使用本系统所订立的协议。',
          '1.2 您在注册、登录或使用本系统前，应当仔细阅读并同意本协议全部条款，您的使用行为即视为对本协议全部条款的接受。'
        ]
      },
      {
        title: '2. 服务内容',
        paragraphs: [
          '2.1 我们为保研学生提供以下核心服务：',
          '2.2 本系统支持微信授权登录、飞书授权登录两种方式，您可以自主选择授权方式。',
          '2.3 本系统为免费开放的演示项目，所有服务均不收取任何费用。'
        ],
        bullets: [
          '智能行程规划服务：面试行程录入、冲突检测、跨城市通勤方案推荐、天气/酒店配套信息查询',
          '个性化模拟面试服务：简历解析、动态出题、能力评估、备考建议',
          '升学信息检索服务：院校政策查询、导师信息检索、入营邮件信息提取'
        ]
      },
      {
        title: '3. 用户权利与义务',
        paragraphs: [
          '3.1 您有权免费使用本系统提供的所有功能，有权随时查询、更正、删除您的个人信息。',
          '3.2 您应当如实提供相关个人信息（如行程信息、简历信息等），因您提供虚假信息导致的服务异常或损失由您自行承担。',
          '3.3 您不得利用本系统从事以下行为：',
          '3.4 特别提示：本系统为AI辅助工具，所有AI生成的内容、行程规划方案、面试建议等仅供参考，不作为您保研决策的唯一依据，我们不对您的升学结果承担任何责任。'
        ],
        bullets: [
          '上传、发布含有违法违规、侵权、低俗内容的信息',
          '盗用他人账号、冒用他人身份使用本系统',
          '对本系统进行反向工程、破解、篡改等破坏行为',
          '利用本系统从事任何商业性活动'
        ]
      },
      {
        title: '4. 知识产权',
        paragraphs: [
          '4.1 本系统的所有知识产权（包括但不限于代码、UI设计、算法模型、Prompt工程逻辑等）归开发团队所有，您仅享有非商业性的使用权。',
          '4.2 您上传的个人简历、行程信息、面试记录等个人数据的所有权归您所有，我们不会未经您允许向任何第三方披露。'
        ]
      },
      {
        title: '5. 免责声明',
        paragraphs: [
          '5.1 本系统为黑客松演示项目，我们不保证服务100%不中断、不出现错误，因系统维护、网络故障等不可抗力导致的服务中断，我们不承担责任。',
          '5.2 系统提供的院校政策、导师信息、招生通知等内容均来自公开渠道，我们不对信息的准确性、完整性、时效性做任何保证，您应当自行通过官方渠道核实。',
          '5.3 飞书相关功能仅在您主动授权后使用，我们仅访问您授权范围内的飞书资源，不会访问您未授权的任何飞书内容。'
        ]
      },
      {
        title: '6. 协议变更与终止',
        paragraphs: [
          '6.1 我们有权根据项目迭代情况更新本协议，更新后的协议将在系统内公示，您继续使用即视为接受更新后的协议。',
          '6.2 您有权随时停止使用本系统，或申请注销您的账号，账号注销后我们将删除您的所有个人数据。',
          '6.3 如果您违反本协议约定，我们有权终止为您提供服务。'
        ]
      },
      {
        title: '7. 联系方式',
        paragraphs: [
          '如有任何问题，您可以通过邮箱联系我们：2420330767@qq.com'
        ]
      }
    ]
  },
  privacy: {
    modalTitle: '隐私政策',
    fullTitle: '二、漫旅保研AI助手 隐私政策',
    effectiveDate: '版本生效日期：2026年4月29日',
    intro: '我们严格遵守《中华人民共和国个人信息保护法》《网络安全法》等相关法律法规，保护您的个人信息安全。',
    sections: [
      {
        title: '1. 信息收集范围',
        paragraphs: [
          '我们遵循"最小必要"原则，仅收集为您提供服务所必需的信息：'
        ],
        subSections: [
          {
            title: '1.1 必要信息',
            bullets: [
              '账号信息：您通过微信/飞书授权登录时，我们仅获取您的公开信息（昵称、头像、唯一标识OpenID），不会获取您的微信/飞书好友、聊天记录、未授权的云文档等敏感信息',
              '服务必需信息：您主动录入的面试行程信息、上传的简历信息、面试记录、目标院校/专业信息'
            ]
          },
          {
            title: '1.2 可选信息',
            paragraphs: [
              '您可以自愿补充提供的信息：专业排名、英语成绩、科研经历等升学相关信息，用于提供更个性化的服务。'
            ]
          },
          {
            title: '1.3 我们不会收集的信息',
            paragraphs: [
              '我们不会收集您的身份证号、银行卡号、家庭住址、通讯记录等与服务无关的敏感个人信息。'
            ]
          }
        ]
      },
      {
        title: '2. 信息使用用途',
        paragraphs: [
          '我们收集的信息仅用于以下用途：'
        ],
        bullets: [
          '为您提供核心服务：行程规划、个性化模拟面试、信息检索等',
          '优化系统功能：分析用户使用习惯，改进AI模型效果，提升服务质量',
          '安全保障：防范账号盗用、恶意攻击等安全风险',
          '我们不会将您的个人信息用于任何与提供服务无关的用途。'
        ]
      },
      {
        title: '3. 信息共享与披露',
        paragraphs: [
          '3.1 我们不会向任何第三方出售、出租、出借您的个人信息，除非符合以下情形：',
          '3.2 我们的第三方服务提供商（如地图服务API、大模型服务提供商）仅会在提供服务所必需的范围内获取必要信息，且我们会要求其严格遵守隐私保护要求。'
        ],
        bullets: [
          '获得您的明确同意',
          '应司法机关、行政机关等有权部门的法定要求提供',
          '为了保护我们的合法权益所必需'
        ]
      },
      {
        title: '4. 信息存储与安全',
        paragraphs: [
          '4.1 您的所有个人信息均存储在中国境内的服务器中，不会出境传输。',
          '4.2 我们采取加密存储、访问控制、定期备份等安全技术措施保护您的信息安全，防止信息泄露、篡改、丢失。',
          '4.3 演示项目特别说明：本项目为黑客松演示版本，演示结束后1个月内我们将永久删除所有用户数据，不会留存任何个人信息。'
        ]
      },
      {
        title: '5. 您的权利',
        paragraphs: [
          '您对您的个人信息享有以下权利：'
        ],
        bullets: [
          '知情权：有权了解我们收集、使用您个人信息的情况',
          '更正权：有权更正您的个人信息中的错误内容',
          '删除权：有权要求我们删除您的所有个人信息',
          '注销权：有权随时注销您的账号，注销后我们将删除您的全部数据',
          '撤回授权权：有权随时撤回您对微信/飞书的授权'
        ]
      },
      {
        title: '6. 政策更新',
        paragraphs: [
          '我们有权根据项目迭代情况更新本隐私政策，更新后的政策将在系统内公示，您继续使用即视为接受更新后的政策。'
        ]
      },
      {
        title: '7. 联系方式',
        paragraphs: [
          '如有任何隐私相关问题，您可以通过邮箱联系我们：2420330767@qq.com'
        ]
      }
    ]
  }
};

function AuthPage({ onLogin }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login', 'register', 'forgot'
  const [showPassword, setShowPassword] = useState({});
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [activePolicy, setActivePolicy] = useState(null);

  // 手机号实时状态
  const [registerPhone, setRegisterPhone] = useState('');
  const [forgotPhone, setForgotPhone] = useState('');

  // 注册表单实时状态
  const [registerCode, setRegisterCode] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerMajorSelection, setRegisterMajorSelection] = useState({
    category: '',
    major: ''
  });
  const [isRegisterMajorPickerOpen, setIsRegisterMajorPickerOpen] = useState(false);
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirm, setRegisterConfirm] = useState('');

  // 重置密码表单密码实时状态
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirm, setResetConfirm] = useState('');

  // 手机号格式校验
  const isValidPhone = (phone) => /^1[3-9]\d{9}$/.test(phone);
  const navigate = useNavigate();
  const currentPolicy = activePolicy ? POLICY_CONTENT[activePolicy] : null;
  const registerCategories = undergraduateCategories;
  const registerSelectedCategory = registerCategories.find(
    (item) => item.category === registerMajorSelection.category
  );
  const registerMajorTypes = registerSelectedCategory?.major_type || [];
  const registerMajors = registerSelectedCategory?.majors || [];
  const registerMajorDisplay = registerMajorSelection.major
    ? `${registerMajorSelection.category} / ${registerMajorSelection.major}`
    : '';

  useEffect(() => {
    if (!activePolicy && !isRegisterMajorPickerOpen) return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [activePolicy, isRegisterMajorPickerOpen]);

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
    const major = registerMajorSelection.major;
    const password = e.target.elements.password.value;
    const confirm = e.target.elements['password-confirm'].value;
    const agree = e.target.elements['agree-terms'].checked;

    if (!phone || !code || !name || !major || !password || !confirm) {
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
        body: JSON.stringify({ email: phone, password, name, major })
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

  const openRegisterMajorPicker = () => {
    const fallbackCategory = registerMajorSelection.category || registerCategories[0]?.category || '';

    setRegisterMajorSelection((prev) => ({
      ...prev,
      category: prev.category || fallbackCategory
    }));
    setIsRegisterMajorPickerOpen(true);
  };

  const handleRegisterCategorySelect = (category) => {
    setRegisterMajorSelection({
      category,
      major: ''
    });
  };

  const handleRegisterMajorSelect = (major) => {
    setRegisterMajorSelection((prev) => ({
      ...prev,
      major
    }));
    setIsRegisterMajorPickerOpen(false);
  };

  const renderPolicySection = (section, keyPrefix) => (
    <section key={keyPrefix} className="policy-section">
      <h4 className="policy-section-title">{section.title}</h4>
      {section.paragraphs?.map((paragraph, index) => (
        <p key={`${keyPrefix}-p-${index}`} className="policy-paragraph">
          {paragraph}
        </p>
      ))}
      {section.bullets?.length > 0 && (
        <ul className="policy-list">
          {section.bullets.map((item, index) => (
            <li key={`${keyPrefix}-li-${index}`}>{item}</li>
          ))}
        </ul>
      )}
      {section.subSections?.map((subSection, index) => (
        <div key={`${keyPrefix}-sub-${index}`} className="policy-subsection">
          <h5 className="policy-subsection-title">{subSection.title}</h5>
          {subSection.paragraphs?.map((paragraph, paragraphIndex) => (
            <p key={`${keyPrefix}-sub-p-${paragraphIndex}`} className="policy-paragraph">
              {paragraph}
            </p>
          ))}
          {subSection.bullets?.length > 0 && (
            <ul className="policy-list">
              {subSection.bullets.map((item, itemIndex) => (
                <li key={`${keyPrefix}-sub-li-${itemIndex}`}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </section>
  );

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
                <label className="input-label">专业</label>
                <div className="auth-major-selection">
                  <button
                    type="button"
                    className={`auth-major-trigger ${registerMajorSelection.major ? 'selected' : ''}`}
                    onClick={openRegisterMajorPicker}
                  >
                    <div className="auth-major-trigger-label">专业方向</div>
                    <div className="auth-major-trigger-value">
                      {registerMajorDisplay || '请选择你的专业方向'}
                    </div>
                    <div className="auth-major-trigger-meta">
                      {registerMajorSelection.major ? '点击可重新选择' : '学科门类 / 具体专业'}
                    </div>
                  </button>
                </div>
                {!registerMajorSelection.major && (
                  <div className="input-hint">
                    选择专业后，系统会立即生成更匹配的面试与漫学内容
                  </div>
                )}
              </div>

              <div className="input-group">
                <label className="input-label">设置密码</label>
                <div className="input-wrapper">
                  <span className="input-icon" style={{ left: '16px' }}><LockIcon size={16} /></span>
                  <input 
                    type={showPassword['register-password'] ? 'text' : 'password'} 
                    className={`auth-input ${
                      registerPassword
                        ? (getPasswordStrength(registerPassword).score >= 3 ? 'input-valid' : '')
                        : ''
                    }`}
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
                    className="policy-link-btn"
                    onClick={() => setActivePolicy('terms')}
                  >
                    《用户协议》
                  </button>{' '}
                  和{' '}
                  <button 
                    type="button" 
                    className="policy-link-btn"
                    onClick={() => setActivePolicy('privacy')}
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

      {isRegisterMajorPickerOpen && (
        <div
          className="major-picker-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="register-major-picker-title"
          onClick={() => setIsRegisterMajorPickerOpen(false)}
        >
          <div className="major-picker-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="major-picker-handle" aria-hidden="true" />
            <div className="major-picker-header">
              <div>
                <div className="major-picker-tag">专业选择</div>
                <h3 id="register-major-picker-title" className="major-picker-title">
                  选择你的专业
                </h3>
                <p className="major-picker-subtitle">
                  左侧先选学科门类，右侧直接选择具体专业
                </p>
              </div>
              <button
                type="button"
                className="major-picker-close-btn"
                onClick={() => setIsRegisterMajorPickerOpen(false)}
                aria-label="关闭专业选择"
              >
                ×
              </button>
            </div>

            <div className="major-picker-body">
              <div className="major-picker-layout">
                <div className="major-picker-category-list">
                  {registerCategories.map((option) => (
                    <button
                      key={option.category}
                      type="button"
                      className={`major-picker-category-btn ${
                        registerMajorSelection.category === option.category ? 'active' : ''
                      }`}
                      onClick={() => handleRegisterCategorySelect(option.category)}
                    >
                      {option.category}
                    </button>
                  ))}
                </div>

                <div className="major-picker-major-panel">
                  {registerMajorTypes.length > 0 && (
                    <div className="major-picker-type-tags">
                      {registerMajorTypes.map((item) => (
                        <span key={item} className="major-picker-type-tag">{item}</span>
                      ))}
                    </div>
                  )}

                  <div className="major-picker-major-list">
                    {registerMajors.map((major) => (
                      <button
                        key={major}
                        type="button"
                        className={`major-picker-major-btn ${
                          registerMajorSelection.major === major ? 'selected' : ''
                        }`}
                        onClick={() => handleRegisterMajorSelect(major)}
                      >
                        <span>{major}</span>
                        {registerMajorSelection.major === major && <span>已选</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentPolicy && (
        <div
          className="policy-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="policy-modal-title"
          onClick={() => setActivePolicy(null)}
        >
          <div className="policy-modal" onClick={(e) => e.stopPropagation()}>
            <div className="policy-drawer-handle" aria-hidden="true" />
            <div className="policy-modal-header">
              <div>
                <div className="policy-modal-tag">{currentPolicy.modalTitle}</div>
                <h3 id="policy-modal-title" className="policy-modal-title">
                  {currentPolicy.fullTitle}
                </h3>
                <p className="policy-effective-date">{currentPolicy.effectiveDate}</p>
              </div>
              <button
                type="button"
                className="policy-close-btn"
                onClick={() => setActivePolicy(null)}
                aria-label="关闭弹窗"
              >
                ×
              </button>
            </div>

            <div className="policy-modal-body">
              <p className="policy-intro">{currentPolicy.intro}</p>
              {currentPolicy.sections.map((section, index) =>
                renderPolicySection(section, `${activePolicy}-${index}`)
              )}
            </div>

            <div className="policy-modal-footer">
              <button
                type="button"
                className="policy-confirm-btn"
                onClick={() => setActivePolicy(null)}
              >
                我已知晓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuthPage;
