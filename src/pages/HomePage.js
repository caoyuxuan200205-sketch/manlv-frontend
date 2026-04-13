import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import {
  CalendarIcon, LocationIcon, ClockIcon, BotIcon, PlaneIcon, HotelIcon, WarningIcon
} from '../components/Icons';

function HomePage() {
  const [countdown, setCountdown] = useState({ days: 3, hours: 14, mins: 27 });
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [toast, setToast] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
    const timer = setInterval(() => {}, 30000);
    return () => clearInterval(timer);
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem('manlv_token');
    if (!token) return;

    try {
      const res = await fetch('http://localhost:3001/api/user', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch (error) {
      console.error('Fetch user error:', error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.name || '同学';
    if (hour < 6) return `凌晨好，${name}`;
    if (hour < 9) return `早安，${name}`;
    if (hour < 12) return `上午好，${name}`;
    if (hour < 14) return `午安，${name}`;
    if (hour < 17) return `下午好，${name}`;
    if (hour < 19) return `傍晚好，${name}`;
    return `晚安，${name}`;
  };

  const tasks = [
    { label: '购买北京高铁票', done: false, urgent: true },
    { label: '准备自我介绍稿', done: false, urgent: false },
    { label: '确认清华报到要求', done: true, urgent: false },
    { label: '打印成绩单备份', done: false, urgent: false },
  ];

  const trips = [
    { id: 1, school: '清华大学 建筑学院', city: '北京', date: '7月18–22日', type: 'camp', status: 'upcoming', progress: 65, daysLeft: 3 },
    { id: 2, school: '同济大学 建筑与城规学院', city: '上海', date: '7月20日', type: 'interview', status: 'confirmed', progress: 40, conflict: true },
    { id: 3, school: '东南大学 建筑学院', city: '南京', date: '7月25–28日', type: 'camp', status: 'pending', progress: 15 },
  ];

  const emotions = [
    { imageSrc: '/emotion-anxious-monkey.png', fallbackEmoji: '😰', label: '焦虑' },
    { imageSrc: '/emotion-nothing-monkey.png', fallbackEmoji: '😌', label: '平静' },
    { imageSrc: '/emotion-fulling-monkey.png', fallbackEmoji: '💪', label: '充实' },
    { imageSrc: '/emotion-tired-monkey.png', fallbackEmoji: '😴', label: '疲惫' },
    { imageSrc: '/emotion-willing-monkey.png', fallbackEmoji: '🌟', label: '期待' },
  ];

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2800);
  };

  const selectEmotion = (emotion) => {
    setSelectedEmotion(emotion);
    const responses = {
      '焦虑': '已记录 · 漫旅帮你一起扛！',
      '平静': '很棒 · 保持这个状态备考！',
      '充实': '太好了 · 继续保持！',
      '疲惫': '已记录 · 适当休息也是备考的一部分',
      '期待': '很好 · 带着期待出发！'
    };
    showToast(responses[emotion] || '已记录');
  };

  return (
    <div className="page">
      <div className="app-header-modern">
        <div className="header-left">
          <div className="logo-mark-modern">
            <img src="/ai-avatar-monkey.png" alt="漫旅" className="logo-icon" />
            <div className="logo-text">
              <span className="logo-zh-modern">漫旅</span>
              <span className="logo-en-modern">ManLv</span>
            </div>
          </div>
        </div>
        <div className="header-right">
          <div className="season-badge">保研季 2026</div>
          <Link to="/profile" className="header-avatar">
            <img 
              src={user?.avatar || '/ai-avatar-monkey.png'} 
              alt={user?.name || '用户'} 
              className="header-avatar-img" 
            />
          </Link>
        </div>
      </div>

      <div className="scroll-area">
        <div className="hero-section">
          <div className="greeting">{getGreeting()}</div>
          <div className="hero-title-wrap">
            <div className="hero-title">你的保研之旅<br />正在进行中</div>
            <div className="hero-journey-vfx">
              <div className="journey-path"></div>
              <div className="journey-pointer"></div>
              <div className="journey-glow"></div>
            </div>
          </div>
          <div className="hero-sub">已收到 4 所院校邀请 · 3 城市待出发</div>
        </div>

        {/* countdown */}
        <div className="countdown-card">
          <div className="countdown-label">最近行程倒计时</div>
          <div className="countdown-school">清华大学 建筑学院夏令营</div>
          <div className="countdown-row">
            <div className="countdown-unit">
              <div className="countdown-num">{String(countdown.days).padStart(2, '0')}</div>
              <div className="countdown-unit-label">天</div>
            </div>
            <div className="countdown-sep">:</div>
            <div className="countdown-unit">
              <div className="countdown-num">{String(countdown.hours).padStart(2, '0')}</div>
              <div className="countdown-unit-label">时</div>
            </div>
            <div className="countdown-sep">:</div>
            <div className="countdown-unit">
              <div className="countdown-num">{String(countdown.mins).padStart(2, '0')}</div>
              <div className="countdown-unit-label">分</div>
            </div>
            <div className="countdown-city">
              <div className="city-badge"><LocationIcon size={11} /> 北京</div>
              <div style={{ fontSize: '10px', color: 'rgba(245,240,232,0.4)', marginTop: '4px', textAlign: 'right' }}>7月18–22日</div>
            </div>
          </div>
        </div>

        {/* today tasks */}
        <div className="section-title">今日任务</div>
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {tasks.map((task, i) => (
            <div className={`task-item ${task.done ? 'task-done' : ''} ${task.urgent && !task.done ? 'task-urgent' : ''}`} key={i}>
              <div className={`task-check ${task.done ? 'checked' : ''}`}>
                {task.done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
              </div>
              <span className="task-label">{task.label}</span>
              {task.urgent && !task.done && <span className="task-urgency"><WarningIcon size={12} /></span>}
            </div>
          ))}
        </div>

        {/* quick actions */}
        <div className="section-title-modern">
          <span className="section-icon">⚡</span>
          快捷操作
        </div>
        <div className="quick-grid-modern">
          <Link to="/trip" className="quick-card glass">
            <div className="quick-card-icon-wrapper">
              <CalendarIcon size={22} />
            </div>
            <span className="quick-card-label">行程表</span>
            <span className="quick-card-desc">查看全部行程</span>
          </Link>
          <Link to="/chat" state={{ prefill: '行程冲突怎么处理？我7月20日清华和同济都有面试' }} className="quick-card glass primary">
            <div className="quick-card-icon-wrapper">
              <BotIcon size={22} />
            </div>
            <span className="quick-card-label">AI助手</span>
            <span className="quick-card-desc">智能问答</span>
          </Link>
          <button className="quick-card glass" onClick={() => showToast('机票模块即将上线')}>
            <div className="quick-card-icon-wrapper">
              <PlaneIcon size={22} />
            </div>
            <span className="quick-card-label">订机票</span>
            <span className="quick-card-desc">即将上线</span>
          </button>
          <button className="quick-card glass" onClick={() => showToast('酒店推荐模块即将上线')}>
            <div className="quick-card-icon-wrapper">
              <HotelIcon size={22} />
            </div>
            <span className="quick-card-label">订酒店</span>
            <span className="quick-card-desc">即将上线</span>
          </button>
        </div>

        {/* AI Assistant Card - Modern */}
        <div className="ai-card-modern">
          <div className="ai-card-glow"></div>
          <div className="ai-card-content-modern">
            <div className="ai-card-header-modern">
              <div className="ai-avatar-pulse">
                <img src="/ai-avatar-monkey.png" alt="AI智能助手" className="ai-avatar-modern-img" />
                <div className="ai-status-ring"></div>
              </div>
              <div className="ai-header-text">
                <div className="ai-title-row">
                  <span className="ai-title-modern">AI智能助手</span>
                  <span className="ai-badge">在线</span>
                </div>
                <div className="ai-subtitle-modern">保研路上的智能伙伴 · 随时为你解答</div>
              </div>
            </div>
            <div className="ai-chips-modern">
              <Link to="/chat" state={{ prefill: '保研面试有哪些常见问题？如何准备?' }} className="ai-chip">
                <span className="ai-chip-icon">🎯</span>
                <span className="ai-chip-text">面试准备</span>
              </Link>
              <Link to="/chat" state={{ prefill: '我应该如何制定暑期行程计划?' }} className="ai-chip">
                <span className="ai-chip-icon">📅</span>
                <span className="ai-chip-text">行程规划</span>
              </Link>
              <Link to="/chat" state={{ prefill: '不同高校对保研生有什么差异？' }} className="ai-chip">
                <span className="ai-chip-icon">🏫</span>
                <span className="ai-chip-text">院校分析</span>
              </Link>
              <Link to="/chat" state={{ prefill: '我现在压力很大，怎样调整心态？' }} className="ai-chip">
                <span className="ai-chip-icon">💆</span>
                <span className="ai-chip-text">情绪疏导</span>
              </Link>
            </div>
            <Link to="/chat" className="ai-cta-button">
              <BotIcon size={18} />
              <span>开始对话</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>
        </div>

        {/* emotion check-in - Modern */}
        <div className="section-title-modern">
          <span className="section-icon">💭</span>
          今日状态
        </div>
        <div className="emotion-widget-modern">
          <div className="emotion-header">
            <span className="emotion-question">今天感觉怎么样？</span>
            {selectedEmotion && (
              <span className="emotion-selected-text">已选择：{selectedEmotion}</span>
            )}
          </div>
          <div className="emotion-options-modern">
            {emotions.map((emotion) => (
              <button
                key={emotion.label}
                className={`emotion-card ${selectedEmotion === emotion.label ? 'selected' : ''}`}
                onClick={() => selectEmotion(emotion.label)}
              >
                <div className="emotion-visual">
                  {emotion.imageSrc ? (
                    <img
                      src={emotion.imageSrc}
                      alt={emotion.label}
                      className="emotion-image"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <span 
                    className="emotion-fallback"
                    style={{ display: emotion.imageSrc ? 'none' : 'flex' }}
                  >
                    {emotion.imageSrc ? emotion.fallbackEmoji : emotion.emoji}
                  </span>
                </div>
                <span className="emotion-name">{emotion.label}</span>
                {selectedEmotion === emotion.label && (
                  <div className="emotion-indicator">
                    <div className="indicator-dot"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* trip list - Modern */}
        <div className="section-title-modern">
          <span className="section-icon">🎯</span>
          我的行程
        </div>
        <div className="trip-list-modern">
          {trips.map((trip) => (
            <Link key={trip.id} to={`/trip/${trip.school}`} className={`trip-card-modern ${trip.status}`}>
              <div className="trip-status-indicator">
                <div className={`status-dot status-${trip.status}`}></div>
                {trip.conflict && <div className="status-conflict">!</div>}
              </div>
              <div className="trip-content">
                <div className="trip-main">
                  <div className="trip-school-modern">{trip.school}</div>
                  <div className={`trip-badge-modern badge-${trip.type}`}>
                    {trip.type === 'camp' ? '夏令营' : trip.type === 'interview' ? '面试' : '待确认'}
                  </div>
                </div>
                <div className="trip-details">
                  <span className="trip-detail">
                    <LocationIcon size={12} />
                    {trip.city}
                  </span>
                  <span className="trip-detail">
                    <CalendarIcon size={12} />
                    {trip.date}
                  </span>
                  {trip.daysLeft && (
                    <span className={`trip-countdown ${trip.daysLeft <= 3 ? 'urgent' : ''}`}>
                      {trip.daysLeft}天后
                    </span>
                  )}
                </div>
                <div className="trip-progress-modern">
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${trip.progress}%` }} />
                  </div>
                  <span className="progress-text">{trip.progress}%</span>
                </div>
              </div>
              <div className="trip-arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
              </div>
            </Link>
          ))}
        </div>

        <div className="pb-safe" style={{ height: '80px' }} />
      </div>

      <BottomNav />

      {toast && <div className="toast show">{toast}</div>}
    </div>
  );
}

export default HomePage;
