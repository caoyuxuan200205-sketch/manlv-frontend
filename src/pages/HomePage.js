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
    { emoji: '😰', label: '焦虑' },
    { emoji: '😌', label: '平静' },
    { emoji: '💪', label: '充实' },
    { emoji: '😴', label: '疲惫' },
    { emoji: '🌟', label: '期待' },
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
    if (emotion === '焦虑' || emotion === '疲惫') {
      setTimeout(() => {
        navigate('/chat', { state: { prefill: `我现在感到${emotion}，帮我分析原因并给出减压建议` } });
      }, 1200);
    }
  };

  return (
    <div className="page">
      <div className="app-header">
        <div className="logo-mark">
          <span className="logo-zh">漫旅</span>
          <span className="logo-en">ManLv · Wandering Scholar</span>
        </div>
        <div className="header-badge">保研季 2026</div>
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
        <div className="section-title">快捷操作</div>
        <div className="quick-grid">
          <Link to="/trip" className="quick-btn">
            <span className="quick-btn-icon"><CalendarIcon size={20} /></span>
            <span className="label">行程表</span>
          </Link>
          <Link to="/chat" state={{ prefill: '行程冲突怎么处理？我7月20日清华和同济都有面试' }} className="quick-btn">
            <span className="quick-btn-icon"><BotIcon size={20} /></span>
            <span className="label">AI助手</span>
          </Link>
          <button className="quick-btn" onClick={() => showToast('机票模块即将上线')}>
            <span className="quick-btn-icon"><PlaneIcon size={20} /></span>
            <span className="label">订机票</span>
          </button>
          <button className="quick-btn" onClick={() => showToast('酒店推荐模块即将上线')}>
            <span className="quick-btn-icon"><HotelIcon size={20} /></span>
            <span className="label">订酒店</span>
          </button>
        </div>

        {/* AI Assistant Card */}
        <div className="ai-card">
          <div className="ai-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="ai-card-avatar">
                <BotIcon size={24} />
              </div>
              <div>
                <div className="ai-card-title">AI智能助手</div>
                <div className="ai-card-subtitle">有任何困惑？我来帮你分析</div>
              </div>
            </div>
          </div>
          <div className="ai-card-content">
            <div className="ai-questions">
              <Link to="/chat" state={{ prefill: '保研面试有哪些常见问题？如何准备?' }} className="ai-quick-q">
                📋 保研面试准备
              </Link>
              <Link to="/chat" state={{ prefill: '我应该如何制定暑期行程计划?' }} className="ai-quick-q">
                📅 行程规划建议
              </Link>
              <Link to="/chat" state={{ prefill: '不同高校对保研生有什么差异？' }} className="ai-quick-q">
                🏫 院校对比分析
              </Link>
              <Link to="/chat" state={{ prefill: '我现在压力很大，怎样调整心态？' }} className="ai-quick-q">
                💭 情绪疏导建议
              </Link>
            </div>
          </div>
        </div>

        {/* emotion check-in */}
        <div className="section-title">今日状态</div>
        <div className="emotion-widget">
          <div className="emotion-title">今天感觉怎么样？</div>
          <div className="emotion-options">
            {emotions.map((emotion) => (
              <button
                key={emotion.label}
                className={`emotion-opt ${selectedEmotion === emotion.label ? 'selected' : ''}`}
                onClick={() => selectEmotion(emotion.label)}
              >
                <span className="emotion-emoji">{emotion.emoji}</span>
                <span className="emotion-label">{emotion.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* trip list */}
        <div className="section-title">我的行程</div>
        <div className="trip-list">
          {trips.map((trip) => (
            <Link key={trip.id} to={`/trip/${trip.school}`} className={`trip-card ${trip.status}`}>
              <div className="trip-header">
                <div className="trip-school">{trip.school}</div>
                <div className={`trip-type-badge badge-${trip.type}`}>
                  {trip.type === 'camp' ? '夏令营' : trip.type === 'interview' ? '预推免面试' : '待确认'}
                </div>
              </div>
              <div className="trip-meta">
                <span><LocationIcon size={11} /> {trip.city}</span>
                <span><CalendarIcon size={11} /> {trip.date}</span>
                {trip.daysLeft && <span><ClockIcon size={11} /> {trip.daysLeft}天后</span>}
                {trip.conflict && <span className="trip-conflict"><WarningIcon size={11} /> 冲突</span>}
              </div>
              <div className="trip-progress">
                <div className="trip-progress-bar" style={{ width: `${trip.progress}%` }} />
              </div>
              <div className="trip-progress-label">备考进度 {trip.progress}%</div>
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
