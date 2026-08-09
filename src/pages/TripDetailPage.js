import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BackIcon, LocationIcon, CalendarIcon, BotIcon, CheckIcon, WarningIcon } from '../components/Icons';
import { getTripDetailData } from '../config/sampleData';
import API_BASE_URL from '../config/api';
import '../styles/TripDetailPage.css';

function generateAlignedTimeline(startDateStr, endDateStr, schoolName, cityName) {
  const match = (startDateStr || '').match(/(?:(\d{4})年)?(\d{1,2})月(\d{1,2})日/);
  if (!match) return null;
  const month = parseInt(match[2]);
  const startDay = parseInt(match[3]);

  const endMatch = (endDateStr || '').match(/(?:(\d{4})年)?(\d{1,2})月(\d{1,2})日/);
  const endDay = endMatch ? parseInt(endMatch[3]) : startDay + 1;

  return [
    { time: `${month}月${Math.max(1, startDay - 3)}日 已完成`, title: '收到入营通知邮件', sub: '漫旅自动从邮箱读取，已解析截止日期和报到要求', status: 'done', tag: '邮件已解析' },
    { time: `${month}月${Math.max(1, startDay - 2)}日 已完成`, title: '资料确认 · 完成材料清单', sub: '成绩单、简历、相关证明材料 PDF 已上传备用', status: 'done', tag: '已准备完毕' },
    { time: `${month}月${Math.max(1, startDay - 1)}日 进行中`, title: '备考专业知识 · AI陪练', sub: `复习${schoolName}核心理论、导师研究方向与往年面试真题`, status: 'active', tag: 'AI陪练中', tagType: 'gold' },
    { time: `${month}月${startDay}日 待开展`, title: `${schoolName} 夏令营/面试开营`, sub: `${cityName} · 准时参加考核与报到`, status: 'todo' },
    { time: `${month}月${endDay}日 待开展`, title: `综合面试与学术考核`, sub: `${schoolName} 考核答辩`, status: 'todo' }
  ];
}

function TripDetailPage() {
  const { school } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('timeline');
  const [realInterview, setRealInterview] = useState(null);

  useEffect(() => {
    fetchInterviewData();
  }, [school]);

  const fetchInterviewData = async () => {
    const token = localStorage.getItem('manlv_token');
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/interviews`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const list = await res.json();
        const cleanSchool = (school || '').replace(/建筑与城市规划学院|计算机科学与技术学院|交叉信息研究院/g, '').trim();
        const found = list.find(item => 
          item.school && (item.school.includes(cleanSchool) || cleanSchool.includes(item.school))
        );
        if (found) {
          setRealInterview(found);
        }
      }
    } catch (e) {
      console.error('Fetch interview error:', e);
    }
  };

  const sampleDetail = getTripDetailData(school || '');
  const { studyCards, cityCards, majorCtx } = sampleDetail;

  // 优先对齐数据库中真实邮件解析的日期
  let displayDate = sampleDetail.date;
  let displayTimeline = sampleDetail.timeline;
  let displayCity = realInterview?.city || sampleDetail.city;
  let displayType = realInterview?.type || sampleDetail.type;

  if (realInterview) {
    const d = new Date(realInterview.date);
    const m = d.getMonth() + 1;
    const day = d.getDate();
    displayDate = `${m}月${day}日 - ${m}月${day + 1}日`;

    const aligned = generateAlignedTimeline(`${m}月${day}日`, `${m}月${day + 1}日`, school, displayCity);
    if (aligned) {
      displayTimeline = aligned;
    }
  }

  const openChat = (msg) => navigate('/chat', { state: { prefill: msg } });

  const getTlIcon = (status) => {
    if (status === 'done') return <CheckIcon size={12} />;
    // Option 1: Minimalist dots, active is just a smaller bot icon or just a dot
    if (status === 'active') return <div className="tl-active-dot" />;
    return null; // For todo, just the empty dot
  };

  return (
    <div className="page" style={{ background: 'var(--paper)' }}>
      <div className="trip-detail-header">
        <div className="trip-header-visual" />
        <div className="trip-header-content">
          <button className="detail-back" onClick={() => navigate(-1)}>
            <BackIcon size={14} /> 返回
          </button>
          <div className="detail-school">{school}</div>
          <div className="detail-city-row">
            <div className="detail-city-badge">
              <LocationIcon size={12} /> {displayCity}
            </div>
            <div className="detail-city-badge">
              <CalendarIcon size={12} /> {displayDate}
            </div>
            <div className="detail-city-badge gold">
              {displayType}
            </div>
          </div>
        </div>
      </div>

      <div className="detail-tabs">
        {[
          { id: 'timeline', label: '行程规划' },
          { id: 'study', label: '备考要点' },
          { id: 'city', label: '城市导览' }
        ].map((tab) => (
          <button 
            key={tab.id} 
            className={`detail-tab ${activeTab === tab.id ? 'active' : ''}`} 
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="detail-content scroll-area">
        {activeTab === 'timeline' && (
          <div className="timeline">
            {displayTimeline.map((item, index) => (
              <div key={index} className="tl-item">
                <div className={`tl-dot ${item.status}`}>{getTlIcon(item.status)}</div>
                <div className="tl-content">
                  <div className="tl-time">{item.time}</div>
                  <div className="tl-title">{item.title}</div>
                  <div className="tl-sub">{item.sub}</div>
                  {item.tag && (
                    <span className={`tl-tag ${item.tagType === 'warn' ? 'warn' : item.tagType === 'gold' ? 'gold' : ''}`}>
                      {item.tag}
                    </span>
                  )}
                  {item.status === 'active' && (
                    <button className="ask-ai-btn" onClick={() => openChat(`帮我整理${school}的核心导师方向和近年研究热点`)}>
                      <BotIcon size={14} /> 让AI帮我备考
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}


        {activeTab === 'study' && (
          <>
            <div className="detail-intro-text">
              以下备考要点由 AI 根据{school}历年面试风格生成，已标注优先级。
            </div>
            {studyCards.map((card, index) => (
              <div key={index} className="study-card">
                <div className="study-card-header">
                  <div className="study-card-title">{card.title}</div>
                  <div className={`study-priority ${card.priority === '必考' || card.priority === '高频' ? 'priority-high' : 'priority-mid'}`}>{card.priority}</div>
                </div>
                <div className="study-points">
                  {card.points.map((point, i) => <div key={i} className="study-point">{point}</div>)}
                </div>
                <button className="ask-ai-btn" onClick={() => openChat(`帮我深度讲解${card.title}的相关内容`)}>
                  <BotIcon size={14} /> 深度问AI
                </button>
              </div>
            ))}
          </>
        )}

        {activeTab === 'city' && (
          <>
            <div className="detail-intro-text">
              {displayCity}是你这次保研之旅的其中一站。以下是与{majorCtx}专业最相关的游学路线。
            </div>
            {cityCards.map((card, index) => (
              <div key={index} className="study-card">
                <div className="study-card-header">
                  <div className="study-card-title">{card.title}</div>
                  <div className={`study-priority ${card.priority === '学术' ? 'priority-high' : 'priority-mid'}`}>{card.priority}</div>
                </div>
                <div className="study-points">
                  {card.points.map((point, i) => <div key={i} className="study-point">{point}</div>)}
                </div>
                {index === 0 && (
                  <button className="ask-ai-btn" onClick={() => openChat(`帮我制定一个在${displayCity}备考期间的1天${majorCtx}游学路线`)}>
                    <BotIcon size={14} /> 规划游学路线
                  </button>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default TripDetailPage;
