import React, { useState, useEffect } from 'react';
import BottomNav from '../components/BottomNav';
import { MailIcon, CheckIcon, WarningIcon, ChevronRightIcon, InboxIcon, SendIcon, CloseIcon, BotIcon } from '../components/Icons';
import EmailParser from '../services/EmailParser';
import EmailReplyGenerator from '../services/EmailReplyGenerator';
import API_BASE_URL from '../config/api';
import '../styles/InboxPage.css';

const emailSamples = [
  {
    id: 1,
    school: '清华大学',
    subject: '【建筑学院】2026年夏令营入营通知',
    from: 'admission@tsinghua.edu.cn',
    time: '2天前',
    content: '尊敬的同学：\n\n恭喜！经审核，你已被我院2026年夏令营录取。\n\n夏令营时间：2026年7月15-20日\n地点：清华大学建筑学院\n\n请于7月1日前填写报名表：https://form.tsinghua.edu.cn/camp2026',
    parsed: true,
    status: '已入营',
    statusType: 'confirmed'
  },
  {
    id: 2,
    school: '同济大学',
    subject: '【建筑与城规】预推免面试邀请函',
    from: 'arch@tongji.edu.cn',
    time: '3天前',
    content: '各位考生：\n\n同济大学建筑与城市规划学院诚邀你参加预推免面试。\n\n面试时间：2026年6月15日\n面试地点：同济大学四平路校区\n\n请点击链接确认参加：https://interview.tongji.edu.cn/register',
    parsed: true,
    status: '待确认',
    statusType: 'pending'
  },
  {
    id: 3,
    school: '东南大学',
    subject: '2026年研究生夏令营招生通知',
    from: 'rgs@seu.edu.cn',
    time: '5天前',
    content: '各位学生：\n\n东南大学建筑学院将举办2026年研究生学术营。\n\n时间：2026年7月22-25日\n报名截止：2026年6月20日\n\n报名链接：https://zs.seu.edu.cn/2026camp',
    parsed: true,
    status: '已申请',
    statusType: 'confirmed'
  },
  {
    id: 4,
    school: '哈尔滨工业大学',
    subject: '关于举办2026年暑期学术营通知',
    from: 'grad@hit.edu.cn',
    time: '1周前',
    content: '各位申请人：\n\n哈工大土木工程学院邀请你参加暑期学术营。活动以学术交流和科研体验为主。\n\n学术营时间：待定\n地点：哈尔滨工业大学（深圳）\n\n请尽快回复确认你的参加意向。',
    parsed: false,
    status: '待解析',
    statusType: 'wait'
  }
];

const funnelSteps = [
  { label: '已申请', count: 6, pct: 100, color: 'rgba(42,122,106,0.2)' },
  { label: '收到邀请', count: 4, pct: 67, color: 'rgba(42,122,106,0.45)' },
  { label: '待面试', count: 3, pct: 50, color: 'rgba(42,122,106,0.75)' },
  { label: '录取', count: 0, pct: 0, color: 'rgba(42,122,106,1)' },
];

function InboxPage() {
  const [activeTab, setActiveTab] = useState('emails');
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [generatedReply, setGeneratedReply] = useState(null);
  const [replyType, setReplyType] = useState('confirm');
  const [isParsingEmails, setIsParsingEmails] = useState(false);
  const [parseProgress, setParseProgress] = useState({ current: 0, total: emailSamples.length });
  const [lastParseTime, setLastParseTime] = useState(new Date());
  const [isSending, setIsSending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState('');
  const [showRawEmail, setShowRawEmail] = useState(false);
  const [user, setUser] = useState(null);
  const [expandedFunnelKey, setExpandedFunnelKey] = useState(null);
  // 当前使用静态邮件数据
  const emails = emailSamples;
  const funnelKeyByIndex = ['applied', 'invited', 'pendingInterview', 'admitted'];

  const uniqueSchools = Array.from(new Set(emails.map((item) => item.school).filter(Boolean)));
  const invitedSchools = Array.from(new Set(
    emails
      .filter((item) => item.parsed || item.statusType === 'pending' || item.statusType === 'confirmed')
      .map((item) => item.school)
      .filter(Boolean)
  ));
  const pendingInterviewSchools = Array.from(new Set(
    emails
      .filter((item) => item.statusType === 'pending')
      .map((item) => item.school)
      .filter(Boolean)
  ));
  const admittedSchools = Array.from(new Set(
    emails
      .filter((item) => item.statusType === 'confirmed' && /录取|入营/.test(String(item.status || '')))
      .map((item) => item.school)
      .filter(Boolean)
  ));

  const funnelSchoolMap = {
    applied: uniqueSchools,
    invited: invitedSchools,
    pendingInterview: pendingInterviewSchools,
    admitted: admittedSchools
  };

  const baseCount = uniqueSchools.length;
  const calcPct = (count) => {
    if (baseCount <= 0) return 0;
    return Math.max(0, Math.min(100, Math.round((count / baseCount) * 100)));
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem('manlv_token');
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/user`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setUser(await res.json());
    } catch (error) {
      console.error('Fetch user error:', error);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  // 解析邮件
  const handleParseEmail = (email) => {
    const parsed = EmailParser.parseEmail(email.subject, email.content);
    setParsedData(parsed);
    setSelectedEmail(email);
    setGeneratedReply(null);
    setShowRawEmail(false);
    setActiveTab('emails');
  };

  // 生成回复
  const handleGenerateReply = (type) => {
    if (!parsedData) return;
    setReplyType(type);
    setIsGenerating(true); 
    setGeneratedReply(null);

    const userInfo = {
      name: user?.name || '曹宇轩',
      university: '东南大学',
      major: user?.major || '建筑学',
      studentId: '1234567',
      phone: user?.email || '17375792820',
      email: user?.email || 'cao@seu.edu.cn'
    };

    // 模拟 2.5 秒的 AI 工作时间
    setTimeout(() => {
      const reply = EmailReplyGenerator.generateReply(parsedData, type, userInfo);
      setGeneratedReply(reply);
      setIsGenerating(false);
    }, 2500);
  };

  // 发送邮件模拟
  const handleSendEmail = async () => {
    setIsSending(true);
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSending(false);
    showToast('邮件发送成功！');
    // 延迟关闭详情
    setTimeout(() => {
      closeDetail();
    }, 1000);
  };

  // 关闭详情面板
  const closeDetail = () => {
    setSelectedEmail(null);
    setParsedData(null);
    setGeneratedReply(null);
    setShowRawEmail(false);
  };

  // 模拟邮件解析过程
  const handleRefreshEmails = async () => {
    setIsParsingEmails(true);
    setParseProgress({ current: 0, total: emailSamples.length });

    // 模拟解析过程：逐封邮件解析
    for (let i = 0; i < emailSamples.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600)); // 每封邮件耗时600ms
      setParseProgress({ current: i + 1, total: emailSamples.length });
    }

    setLastParseTime(new Date());
    setIsParsingEmails(false);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title-row">
          <span className="page-title-icon"><InboxIcon size={18} /></span>
          <div>
            <div className="page-title">通知</div>
            <div className="page-subtitle">邮件解析 · 状态追踪</div>
          </div>
        </div>
        <div className="header-badge">{emails.length}封</div>
      </div>

      {!selectedEmail && (
        <div className="seg-tabs">
          <button className={`seg-tab ${activeTab === 'emails' ? 'active' : ''}`} onClick={() => setActiveTab('emails')}>
            邮件解析
          </button>
          <button className={`seg-tab ${activeTab === 'funnel' ? 'active' : ''}`} onClick={() => setActiveTab('funnel')}>
            状态漏斗
          </button>
        </div>
      )}

      <div className="scroll-area">
        {activeTab === 'emails' && !selectedEmail && (
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* 解析状态容器 */}
            <div className={`email-parse-status-card ${isParsingEmails ? 'parsing-active' : ''}`}>
              <div className="parse-status-header">
                <div className="parse-status-title-wrapper">
                  <div className="parse-pulse-indicator"></div>
                  <div>
                    <div className="parse-status-title">
                      📨 邮件实时追踪中
                    </div>
                    <div className="parse-status-subtitle">
                      {isParsingEmails ? '正在解析邮件，更新中...' : '本轮解析完成，持续实时监测'}
                    </div>
                  </div>
                </div>
                <button 
                  className="parse-refresh-btn"
                  onClick={handleRefreshEmails}
                  disabled={isParsingEmails}
                  title={isParsingEmails ? "正在解析中..." : "点击重新解析所有邮件"}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={isParsingEmails ? 'spinning' : ''}>
                    <path d="M14 2L12 4M12 4H16V0M2 14L4 12M4 12H0V16M14.5 8C14.5 11.59 11.59 14.5 8 14.5C4.41 14.5 1.5 11.59 1.5 8C1.5 4.41 4.41 1.5 8 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {isParsingEmails ? '解析中...' : '更新'}
                </button>
              </div>

              {isParsingEmails ? (
                <div className="parse-progress-container">
                  <div className="parse-progress-info">
                    <div className="parse-progress-text">
                      <span className="parse-progress-label">正在解析邮件...</span> <span className="parse-count">{parseProgress.current}/{parseProgress.total}</span>
                    </div>
                    <div className="parse-progress-desc">
                      漫旅AI正在逐封解析你的邮件，提取关键信息
                    </div>
                  </div>
                  <div className="parse-progress-bar">
                    <div 
                      className="parse-progress-fill" 
                      style={{ width: `${(parseProgress.current / parseProgress.total) * 100}%` }}
                    >
                      <div className="parse-progress-shimmer"></div>
                    </div>
                  </div>
                  <div className="parse-status-dots">
                    {[...Array(parseProgress.total)].map((_, i) => (
                      <div 
                        key={i}
                        className={`parse-dot ${i < parseProgress.current ? 'done' : i === parseProgress.current ? 'active' : 'pending'}`}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="parse-complete-container">
                  <div className="parse-complete-icon">✓</div>
                  <div className="parse-complete-info">
                    <div className="parse-complete-text">本轮解析完成</div>
                    <div className="parse-complete-time">
                      最后更新：{lastParseTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 邮件列表 */}
            <div className="inbox-tip">
              {isParsingEmails ? '正在智能解析中，请稍候...' : '漫旅已自动解析你邮箱中的院校通知邮件，点击邮件查看详情和生成回复'}
            </div>
            {emails.map((email, i) => (
              <div
                className="email-card"
                key={i}
                onClick={() => !isParsingEmails && handleParseEmail(email)}
                style={{ cursor: isParsingEmails ? 'not-allowed' : 'pointer', opacity: isParsingEmails ? 0.6 : 1 }}
              >
                <div className="email-card-top">
                  <div className="email-icon-wrap">
                    {email.parsed
                      ? <span style={{ color: 'var(--teal)' }}><CheckIcon size={14} /></span>
                      : <span style={{ color: 'var(--gold)' }}><WarningIcon size={14} /></span>
                    }
                  </div>
                  <div className="email-card-info">
                    <div className="email-school">{email.school}</div>
                    <div className="email-subject">{email.subject}</div>
                  </div>
                  <span className={`email-status email-status-${email.statusType}`}>{email.status}</span>
                </div>
                <div className="email-card-bottom">
                  <span className="email-time"><MailIcon size={11} /> {email.time}</span>
                  <span className="email-arrow"><ChevronRightIcon size={13} /></span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'emails' && selectedEmail && (
          <div className="email-detail-panel">
            <div className="email-detail-header">
              <div>
                <div className="email-detail-title">{selectedEmail.school}</div>
                <div className="email-detail-subject">{selectedEmail.subject}</div>
              </div>
              <button className="detail-close-btn" onClick={closeDetail}>
                <CloseIcon size={16} />
              </button>
            </div>

            {/* 解析结果 */}
            {parsedData && (
              <div className="parsed-info">
                <div className="parsed-section">
                  <div className="parsed-label">活动类型</div>
                  <div className="parsed-value">{parsedData.eventType || '未识别'}</div>
                </div>
                <div className="parsed-section">
                  <div className="parsed-label">活动名称</div>
                  <div className="parsed-value">{parsedData.eventName || '未识别'}</div>
                </div>
                {parsedData.dates?.startDate && (
                  <div className="parsed-section">
                    <div className="parsed-label">活动时间</div>
                    <div className="parsed-value">{parsedData.dates.startDate} {parsedData.dates.endDate ? `- ${parsedData.dates.endDate}` : ''}</div>
                  </div>
                )}
                {parsedData.deadline && (
                  <div className="parsed-section">
                    <div className="parsed-label">报名截止</div>
                    <div className="parsed-value">{parsedData.deadline}</div>
                  </div>
                )}
                {parsedData.location && (
                  <div className="parsed-section">
                    <div className="parsed-label">地点</div>
                    <div className="parsed-value">{parsedData.location}</div>
                  </div>
                )}
                {parsedData.priority && (
                  <div className="parsed-section">
                    <div className="parsed-label">优先级</div>
                    <div className="parsed-value" style={{
                      color: parsedData.priority === 'urgent' ? 'var(--red)' : parsedData.priority === 'high' ? 'var(--gold)' : 'var(--teal)'
                    }}>
                      {parsedData.priority === 'urgent' ? '🔴 紧急' : parsedData.priority === 'high' ? '🟡 高' : '🟢 普通'}
                    </div>
                  </div>
                )}
                <div className="parsed-section">
                  <div className="parsed-label">建议操作</div>
                  <div className="parsed-value">{parsedData.suggestedAction}</div>
                </div>
              </div>
            )}

            {/* 查看原邮件按钮 */}
            <button
              className="raw-email-toggle-btn"
              onClick={() => setShowRawEmail(v => !v)}
            >
              <span className="raw-email-toggle-icon">
                {showRawEmail ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="3 7 12 13 21 7"/></svg>
                )}
              </span>
              {showRawEmail ? '收起原邮件' : '查看原邮件'}
            </button>

            {/* 原邮件全文面板 */}
            {showRawEmail && (
              <div className="raw-email-panel">
                <div className="raw-email-meta">
                  <div className="raw-email-meta-row">
                    <span className="raw-meta-label">发件人</span>
                    <span className="raw-meta-value">{selectedEmail.from}</span>
                  </div>
                  <div className="raw-email-meta-row">
                    <span className="raw-meta-label">时　间</span>
                    <span className="raw-meta-value">{selectedEmail.time}</span>
                  </div>
                  <div className="raw-email-meta-row">
                    <span className="raw-meta-label">主　题</span>
                    <span className="raw-meta-value">{selectedEmail.subject}</span>
                  </div>
                </div>
                <div className="raw-email-divider" />
                <div className="raw-email-body">
                  {selectedEmail.content.split('\n').map((line, i, arr) => (
                    <React.Fragment key={i}>
                      {line || '\u00a0'}
                      {i < arr.length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            {/* 回复生成面板 */}
            {!generatedReply && !isSending && (
              <div className="reply-generator">
                <div className="generator-label">快速生成回复</div>
                <div className="reply-buttons">
                  <button
                    className="reply-btn reply-btn-confirm"
                    onClick={() => handleGenerateReply('confirm')}
                  >
                    ✓ 确认参加
                  </button>
                  <button
                    className="reply-btn reply-btn-decline"
                    onClick={() => handleGenerateReply('decline')}
                  >
                    ✕ 委婉拒绝
                  </button>
                </div>
              </div>
            )}

            {/* 生成的回复预览 */}
            {isGenerating && (
              <div className="reply-loading-card">
                <div className="reply-loading-content">
                  <div className="reply-loading-icon">
                    <div className="loading-orbit" />
                    <BotIcon size={24} />
                  </div>
                  <div className="reply-loading-text">
                    <span>漫旅 AI 正在为你撰写邮件...</span>
                    <div className="reply-loading-dots">
                      <span /> <span /> <span />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {generatedReply && !isGenerating && (
              <div className="generated-reply">
                <div className="reply-header">
                  <div className="reply-type-badge" style={{
                    background: replyType === 'confirm' ? 'var(--teal)' : 'var(--red)'
                  }}>
                    {replyType === 'confirm' ? '确认参加' : '委婉拒绝'}
                  </div>
                  <button className="reply-edit-btn" onClick={() => setGeneratedReply(null)}>
                    重新生成
                  </button>
                </div>
                <div className="reply-subject">
                  <strong>主题：</strong> {generatedReply.subject}
                </div>
                <div className="reply-body">
                  <strong>内容：</strong>
                  <textarea 
                    className="reply-text-editable" 
                    value={generatedReply.body}
                    onChange={(e) => {
                      setGeneratedReply({
                        ...generatedReply,
                        body: e.target.value
                      });
                    }}
                    rows={8}
                  />
                </div>
                <div className="reply-actions">
                  <button 
                    className={`reply-send-btn ${isSending ? 'is-sending' : ''}`}
                    onClick={handleSendEmail}
                    disabled={isSending}
                  >
                    {isSending ? (
                      <div className="loading-spinner small"></div>
                    ) : (
                      <>
                        <SendIcon size={14} /> 发送邮件
                      </>
                    )}
                  </button>
                  <button className="reply-copy-btn" onClick={() => {
                    navigator.clipboard.writeText(generatedReply.body);
                    showToast('内容已复制到剪贴板');
                  }}>
                    复制到剪贴板
                  </button>
                </div>
              </div>
            )}

            <div style={{ height: '40px' }} />
          </div>
        )}

        {activeTab === 'funnel' && (
          <div style={{ padding: '16px 20px' }}>
            <div className="section-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>院校申请进度</span>
              <span className="season-badge" style={{ fontSize: '10px', padding: '4px 8px' }}>2026秋季申请</span>
            </div>
            <div className="funnel-container">
              {funnelSteps.map((step, i) => {
                const stepKey = funnelKeyByIndex[i] || `step_${i}`;
                const schools = funnelSchoolMap[stepKey] || [];
                const count = schools.length;
                const pct = calcPct(count);
                const isExpanded = expandedFunnelKey === stepKey;

                let conversionRateNode = null;
                if (i > 0) {
                  const prevKey = funnelKeyByIndex[i - 1];
                  const prevCount = (funnelSchoolMap[prevKey] || []).length;
                  const rate = prevCount > 0 ? Math.round((count / prevCount) * 100) : 0;
                  conversionRateNode = (
                    <div className="funnel-conversion">
                      <span className="funnel-conversion-badge">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
                        转化率 {rate}%
                      </span>
                    </div>
                  );
                }

                return (
                  <div key={stepKey} className={`funnel-item ${isExpanded ? 'expanded' : ''} ${count === 0 ? 'empty-step' : ''}`}>
                    {conversionRateNode}
                    <div className="funnel-row" onClick={() => setExpandedFunnelKey(isExpanded ? null : stepKey)} style={{ cursor: 'pointer' }}>
                      <div className="funnel-label-wrap">
                        <div className="funnel-label">{step.label}</div>
                        <div className="funnel-pct">{pct}%</div>
                      </div>
                      <div className="funnel-bar-wrap">
                        <div
                          className="funnel-bar"
                          style={{
                            width: `${pct}%`,
                            background: step.color
                          }}
                        />
                      </div>
                      <div className="funnel-right">
                        <div className="funnel-count">{count}</div>
                        <span className={`funnel-expand-arrow ${isExpanded ? 'open' : ''}`}>
                          <ChevronRightIcon size={14} />
                        </span>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="funnel-school-list">
                        {schools.length > 0 ? (
                          schools.map((school) => {
                            const relatedEmail = emails.find(e => e.school === school);
                            const needsAction = relatedEmail && (relatedEmail.statusType === 'pending' || relatedEmail.statusType === 'wait');
                            
                            return (
                              <span 
                                key={`${stepKey}-${school}`} 
                                className={`funnel-school-pill ${needsAction ? 'actionable' : ''}`}
                                onClick={(e) => {
                                  if (needsAction && !isParsingEmails) {
                                    e.stopPropagation();
                                    handleParseEmail(relatedEmail);
                                  }
                                }}
                                style={{ cursor: needsAction ? 'pointer' : 'default' }}
                              >
                                {school}
                                {needsAction && (
                                  <span className="funnel-pill-cta" style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '4px', color: 'var(--gold)', fontWeight: 600 }}>
                                    去处理 <ChevronRightIcon size={10} />
                                  </span>
                                )}
                              </span>
                            );
                          })
                        ) : (
                          <span className="funnel-empty-tip">暂无院校</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="section-label" style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>各校状态 {expandedFunnelKey ? `· ${funnelSteps[funnelKeyByIndex.indexOf(expandedFunnelKey)].label}` : ''}</span>
              {expandedFunnelKey && (
                <button 
                  onClick={() => setExpandedFunnelKey(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                >
                  清除筛选
                </button>
              )}
            </div>
            {emails
              .filter(e => {
                if (!expandedFunnelKey) return true;
                const targetSchools = funnelSchoolMap[expandedFunnelKey] || [];
                return targetSchools.includes(e.school);
              })
              .map((e, i) => (
              <div className="school-status-row" key={i}>
                <div className="school-status-name">{e.school}</div>
                <div className={`school-status-tag school-tag-${e.statusType}`}>{e.status}</div>
              </div>
            ))}
          </div>
        )}

        <div className="pb-safe" style={{ height: '80px' }} />
      </div>

      <BottomNav />

      {toast && <div className="toast show">{toast}</div>}
    </div>
  );
}

export default InboxPage;
