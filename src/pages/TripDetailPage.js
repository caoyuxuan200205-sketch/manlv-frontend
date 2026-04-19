import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BackIcon, LocationIcon, CalendarIcon, BotIcon, CheckIcon, WarningIcon } from '../components/Icons';

function TripDetailPage() {
  const { school } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('timeline');

  const timeline = [
    { time: '7月15日 已完成', title: '收到入营通知邮件', sub: '漫旅自动从邮箱读取，已解析截止日期和报到要求', tag: '邮件已解析', status: 'done' },
    { time: '7月16日 已完成', title: '资料确认 · 完成材料清单', sub: '成绩单、简历、作品集 PDF 已上传备用', tag: '已准备完毕', status: 'done' },
    { time: '今天 进行中', title: '备考专业知识 · AI陪练', sub: '建筑历史、城市规划理论、清华导师研究方向', tag: '进行中', status: 'active', tagType: 'gold' },
    { time: '7月17日 待完成', title: '购买北京高铁票', sub: '推荐：广州南→北京西 G70 07:18出发，约9小时', tag: '票量紧张', status: 'todo', tagType: 'warn' },
    { time: '7月18日', title: '抵京 · 入住酒店', sub: '推荐：学院路周边，步行15分钟至清华东门', status: 'todo' },
    { time: '7月19–21日', title: '夏令营正式开始', sub: '学术报告、工作坊、导师面谈、参观实验室', status: 'todo' },
    { time: '7月22日', title: '面试 · 个人展示', sub: '预计下午14:00，5分钟自我介绍 + 15分钟问答', tag: '关键节点', status: 'todo', tagType: 'warn' }
  ];

  const studyCards = [
    {
      title: '建筑历史与理论', priority: '必考',
      points: ['梁思成与中国建筑史研究——清华建筑学院创始人，常被提及', '现代主义运动：柯布西耶、密斯、格罗皮乌斯的思想脉络', '北京城市历史格局：中轴线、胡同肌理与当代更新矛盾']
    },
    {
      title: '城市规划前沿', priority: '高频',
      points: ['城市更新 vs 大拆大建：北京存量改造案例（南锣鼓巷、首钢园）', '碳中和与绿色建筑：LEED、BREEAM 评价标准认知', '数字孪生与BIM在城市规划中的应用']
    },
    {
      title: '导师研究热点', priority: '重要',
      points: ['朱文一教授：建筑空间类型学研究', '庄惟敏院士：建筑策划理论与方法', '王贵祥教授：中国古建筑测绘与数字化']
    }
  ];

  const cityCards = [
    {
      title: '专业必打卡', priority: '学术',
      points: ['故宫 / 紫禁城——明清宫廷建筑集大成', '天安门广场——人民英雄纪念碑（梁思成设计参与）', '798艺术区——包豪斯工业建筑的中国转型案例', '清华校园——日新院、礼堂等民国折衷主义建筑群']
    },
    {
      title: '放松充能推荐', priority: '减压',
      points: ['南锣鼓巷附近咖啡馆——适合面试前安静备考', '五道口「宇宙中心」——学生聚集，氛围轻松', '清华东门豆腐脑——面试当天早餐，性价比高']
    }
  ];

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
              <LocationIcon size={12} /> 北京
            </div>
            <div className="detail-city-badge">
              <CalendarIcon size={12} /> 7月18–22日
            </div>
            <div className="detail-city-badge gold">
              夏令营
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
                    <button className="ask-ai-btn" onClick={() => openChat('帮我整理清华建筑学院的核心导师方向和近年研究热点')}>
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
              以下备考要点由 AI 根据清华建筑学院历年面试风格生成，已标注优先级。
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
              北京是你这次保研之旅的第一站。以下是与建筑专业最相关的游学路线。
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
                  <button className="ask-ai-btn" onClick={() => openChat('帮我制定一个在北京备考期间的1天建筑游学路线')}>
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
