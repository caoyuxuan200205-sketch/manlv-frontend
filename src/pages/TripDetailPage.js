import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BackIcon, LocationIcon, CalendarIcon, BotIcon, CheckIcon, WarningIcon } from '../components/Icons';
import { getTripDetailData } from '../config/sampleData';
import '../styles/TripDetailPage.css';

function TripDetailPage() {
  const { school } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('timeline');

  const { city, date, type, timeline, studyCards, cityCards, majorCtx } = getTripDetailData(school || '');

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
              <LocationIcon size={12} /> {city}
            </div>
            <div className="detail-city-badge">
              <CalendarIcon size={12} /> {date}
            </div>
            <div className="detail-city-badge gold">
              {type}
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
            {timeline.map((item, index) => (
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
              {city}是你这次保研之旅的其中一站。以下是与{majorCtx}专业最相关的游学路线。
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
                  <button className="ask-ai-btn" onClick={() => openChat(`帮我制定一个在${city}备考期间的1天${majorCtx}游学路线`)}>
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
