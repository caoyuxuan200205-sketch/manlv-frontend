import React, { useState, useEffect } from 'react';
import '../styles/HomePage.css';
import { Link } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { CalendarIcon, LocationIcon, BotIcon, WarningIcon } from '../components/Icons';
import API_BASE_URL from '../config/api';
import { getDynamicData } from '../config/sampleData';

function HomePage() {
  const [countdown, setCountdown] = useState({ days: 3, hours: 14, mins: 27 });
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [toast, setToast] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUserData();
    // Tick countdown every minute
    const timer = setInterval(() => {
      setCountdown(prev => {
        let { days, hours, mins } = prev;
        if (mins > 0) return { days, hours, mins: mins - 1 };
        if (hours > 0) return { days, hours: hours - 1, mins: 59 };
        if (days > 0) return { days: days - 1, hours: 23, mins: 59 };
        return prev;
      });
    }, 60000);
    return () => clearInterval(timer);
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

  const dynamicData = getDynamicData(user?.major);
  const tasks = dynamicData.tasks;
  const trips = dynamicData.trips;
  const urgentTask = tasks.find(t => t.urgent && !t.done);

  const nextTrip = trips.find(t => t.daysLeft);

  const emotions = [
    { imageSrc: '/emotion-anxious-monkey.png', fallbackEmoji: '😰', label: '焦虑' },
    { imageSrc: '/emotion-nothing-monkey.png', fallbackEmoji: '😌', label: '平静' },
    { imageSrc: '/emotion-fulling-monkey.png', fallbackEmoji: '💪', label: '充实' },
    { imageSrc: '/emotion-tired-monkey.png', fallbackEmoji: '😴', label: '疲惫' },
    { imageSrc: '/emotion-willing-monkey.png', fallbackEmoji: '🌟', label: '期待' },
  ];

  const aiChips = [
    { icon: '🎯', text: '面试准备', prefill: '保研面试有哪些常见问题？如何准备？' },
    { icon: '📅', text: '行程规划', prefill: '我应该如何制定暑期行程计划？' },
    { icon: '🏫', text: '院校分析', prefill: '不同高校对保研生有什么差异？' },
    { icon: '💆', text: '情绪疏导', prefill: '我现在压力很大，怎样调整心态？' },
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
      {/* ── Header ── */}
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
        </div>
      </div>

      <div className="scroll-area">

        {/* ── Hero Section (Original) ── */}
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

        {/* ── AI Hub ── */}
        <div className="ai-hub-section" style={{ paddingTop: '0' }}>
          <Link to="/chat" className="ai-hub-input-bar">
            <div className="ai-hub-input-icon">
              <BotIcon size={18} />
            </div>
            <span className="ai-hub-placeholder">问我任何保研问题…</span>
            <div className="ai-hub-send">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <div className="ai-hub-chips">
            {aiChips.map(chip => (
              <Link
                key={chip.text}
                to="/chat"
                state={{ prefill: chip.prefill }}
                className="ai-hub-chip"
              >
                <span>{chip.icon}</span>
                <span>{chip.text}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Up Next 聚合卡片 ── */}
        {nextTrip && (
          <div className="up-next-card">
            <div className="up-next-header">
              <span className="up-next-label">Up Next</span>
              <span className="up-next-badge">
                <LocationIcon size={10} /> {nextTrip.city}
              </span>
            </div>

            <div className="up-next-school">{nextTrip.school}</div>
            <div className="up-next-date">{nextTrip.date}</div>

            <div className="up-next-countdown">
              <div className="up-next-time-block">
                <span className="up-next-num">{String(countdown.days).padStart(2, '0')}</span>
                <span className="up-next-unit">天</span>
              </div>
              <span className="up-next-colon">:</span>
              <div className="up-next-time-block">
                <span className="up-next-num">{String(countdown.hours).padStart(2, '0')}</span>
                <span className="up-next-unit">时</span>
              </div>
              <span className="up-next-colon">:</span>
              <div className="up-next-time-block">
                <span className="up-next-num">{String(countdown.mins).padStart(2, '0')}</span>
                <span className="up-next-unit">分</span>
              </div>
            </div>

            {urgentTask && (
              <div className="up-next-task-row">
                <div className="up-next-task-dot">⚡</div>
                <span className="up-next-task-text">{urgentTask.label}</span>
                <span className="up-next-task-tag">紧急</span>
              </div>
            )}

            <div className="up-next-actions">
              <Link to="/trip" className="up-next-btn outline">查看行程</Link>
              <Link
                to="/chat"
                state={{ prefill: `我${nextTrip.date}有${nextTrip.school}夏令营，帮我规划备考和出行` }}
                className="up-next-btn primary"
              >
                <BotIcon size={14} />
                问AI助手
              </Link>
            </div>
          </div>
        )}

        {/* ── 今日待办 ── */}
        <div className="section-title-modern">
          <span className="section-icon">✅</span>
          今日待办
          <span className="section-badge">{tasks.filter(t => !t.done).length} 项</span>
        </div>
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

        {/* ── 今日状态 ── */}
        <div className="section-title-modern">
          <span className="section-icon">💭</span>
          今日状态
        </div>
        <div className="emotion-widget-modern">
          <div className="emotion-header">
            <span className="emotion-question">今天感觉怎么样？</span>
            {selectedEmotion && (
              <span className="emotion-selected-text">已选：{selectedEmotion}</span>
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
                    {emotion.fallbackEmoji}
                  </span>
                </div>
                <span className="emotion-name">{emotion.label}</span>
                {selectedEmotion === emotion.label && (
                  <div className="emotion-indicator"><div className="indicator-dot" /></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── 我的行程 ── */}
        <div className="section-title-modern">
          <span className="section-icon">🗺️</span>
          我的行程
          <Link to="/trip" className="section-see-all">全部 →</Link>
        </div>
        <div className="trip-list-modern">
          {trips.map((trip) => (
            <Link key={trip.id} to={`/trip/${trip.school}`} className={`trip-card-modern ${trip.conflict ? 'has-conflict' : 'is-normal'}`}>
              <div className="trip-status-indicator">
                <div className={`status-dot ${trip.conflict ? 'conflict' : 'normal'}`} />
              </div>
              <div className="trip-content">
                <div className="trip-main">
                  <div className="trip-school-modern">{trip.school}</div>
                  <div className="trip-main-right">
                    {trip.conflict && (
                      <div className="trip-conflict-tag">
                        <WarningIcon size={12} />
                        <span>冲突</span>
                      </div>
                    )}
                    <div className={`trip-badge-modern badge-${trip.type}`}>
                      {trip.type === 'camp' ? '夏令营' : trip.type === 'interview' ? '面试' : '待确认'}
                    </div>
                  </div>
                </div>
                <div className="trip-details">
                  <span className="trip-detail"><LocationIcon size={12} />{trip.city}</span>
                  <span className="trip-detail"><CalendarIcon size={12} />{trip.date}</span>
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
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
