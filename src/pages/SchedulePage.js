import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { CalendarIcon, LocationIcon, ClockIcon, HotelIcon, BotIcon, PlaneIcon, WarningIcon, ChevronRightIcon, CheckIcon, SearchIcon } from '../components/Icons';

function SchedulePage() {
  const [selectedDay, setSelectedDay] = useState(17);
  const [viewMode, setViewMode] = useState('calendar'); 
  const [isPlanning, setIsPlanning] = useState(false);
  const [plannedTrips, setPlannedTrips] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newInterview, setNewInterview] = useState({
    school: '', major: '', date: '2026-07-18', city: '', type: '夏令营'
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchInterviews();
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem('manlv_token');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:3001/api/user', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const userData = await res.json();
        setNewInterview(prev => ({ ...prev, major: userData.major || '' }));
      }
    } catch (error) {
      console.error('Fetch user error:', error);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const fetchInterviews = async () => {
    const token = localStorage.getItem('manlv_token');
    try {
      const res = await fetch('http://localhost:3001/api/interviews', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInterviews(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInterview = async (e) => {
    if (e) e.preventDefault();
    const token = localStorage.getItem('manlv_token');
    
    // 简单校验
    if (!newInterview.school || !newInterview.city) {
      showToast('请填写完整信息');
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/api/interviews', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(newInterview)
      });
      if (res.ok) {
        showToast('添加面试安排成功');
        setShowAddModal(false);
        setNewInterview({ school: '', major: '', date: '2026-07-18', city: '', type: '夏令营' });
        fetchInterviews();
      } else {
        const err = await res.json();
        showToast(err.error || '添加失败');
      }
    } catch (e) {
      showToast('网络错误');
    }
  };

  const handleDeleteInterview = async (id) => {
    if (!window.confirm('确定要删除这场面试吗？')) return;
    const token = localStorage.getItem('manlv_token');
    
    // 打印调试信息，确保 ID 正确
    console.log('[Delete Interview] Attempting to delete ID:', id);

    try {
      const res = await fetch(`http://localhost:3001/api/interviews/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.ok) {
        showToast('删除成功');
        fetchInterviews();
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error('[Delete Interview] Failed:', res.status, errorData);
        showToast(`删除失败: ${errorData.error || '服务器错误'}`);
      }
    } catch (e) {
      console.error('[Delete Interview] Network Error:', e);
      showToast('网络错误，请检查连接');
    }
  };

  const handleGeneratePlan = async () => {
    if (interviews.length === 0) {
      showToast('请先录入面试安排');
      return;
    }

    setIsPlanning(true);
    const token = localStorage.getItem('manlv_token');
    try {
      const res = await fetch('http://localhost:3001/api/trips/generate', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPlannedTrips(data);
        showToast('AI 已生成最新规划方案');
      }
    } catch (e) {
      showToast('规划请求失败');
    } finally {
      setIsPlanning(false);
    }
  };

  const handleApplyPlan = async (plan) => {
    const token = localStorage.getItem('manlv_token');
    try {
      const res = await fetch('http://localhost:3001/api/trips/save', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(plan)
      });
      if (res.ok) {
        showToast('方案已应用并同步至日历');
        setViewMode('calendar');
      }
    } catch (e) {
      showToast('应用失败');
    }
  };

  const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
  const days = [15, 16, 17, 18, 19, 20, 21, 22, 23, 24];

  // 将后端面试数据转换为日历展示格式 (T2 视觉增强版)
  const getDynamicScheduleData = () => {
    const data = {
      18: [
        { time: '07:18', title: '高铁 广州南→北京西', sub: 'G70 · 约9小时', Icon: PlaneIcon, type: 'transport', duration: '9h' },
        { time: '17:00', title: '可用自由时间', sub: '可用于复习面试资料', type: 'free', duration: '1.5h' },
        { time: '18:30', title: '入住酒店 · 学院路附近', sub: '海淀区 · 步行至清华15分钟', Icon: HotelIcon, type: 'hotel' },
      ],
      19: [
        { time: '09:00', title: '清华大学 - 夏令营开营', sub: '建筑学院报告厅', Icon: CalendarIcon, type: 'event', duration: '3h' },
        { time: '12:00', title: '午休 / 自由时间', sub: '校内食堂用餐', type: 'free', duration: '2h' },
        { time: '14:00', title: '校园参观 & 导师见面', sub: '学院路校区', Icon: LocationIcon, type: 'event', duration: '4h' },
      ]
    };

    interviews.forEach(iv => {
      const date = new Date(iv.date);
      const day = date.getDate();
      if (!data[day]) data[day] = [];
      
      // 避免重复添加后端数据
      const exists = data[day].some(item => item.isBackend && item.id === iv.id);
      if (!exists) {
        data[day].push({
          id: iv.id,
          time: '全天',
          title: `${iv.school} - ${iv.type}`,
          sub: `${iv.city} · ${iv.major}`,
          Icon: CalendarIcon,
          type: 'event',
          isBackend: true
        });
      }
    });

    return data;
  };

  const scheduleData = getDynamicScheduleData();

  return (
    <div className="page">
      {/* 头部导航 */}
      <div className="schedule-header">
        <div className="header-tabs">
          <button 
            className={`header-tab ${viewMode === 'calendar' ? 'active' : ''}`} 
            onClick={() => setViewMode('calendar')}
          >
            日历视图
          </button>
          <button 
            className={`header-tab ${viewMode === 'planner' ? 'active' : ''}`} 
            onClick={() => setViewMode('planner')}
          >
            智能规划
          </button>
        </div>

        {viewMode === 'calendar' ? (
          <div className="week-strip">
            {days.map((d) => {
              const isToday = d === 17;
              const hasEvent = scheduleData[d] !== undefined;
              const dateObj = new Date(2026, 6, d);
              return (
                <div
                  key={d}
                  className={`week-day ${isToday ? 'today' : ''} ${hasEvent ? 'has-event' : ''} ${selectedDay === d ? 'selected' : ''}`}
                  onClick={() => setSelectedDay(d)}
                >
                  <span className="wday-label">{dayNames[dateObj.getDay()]}</span>
                  <span className="wday-num">{d}</span>
                  {hasEvent && <span className="wday-dot" />}
                </div>
              );
            })}
          </div>
        ) : (
           <div className="planner-summary">
             <div className="summary-count">已录入 <span>{interviews.length}</span> 场面试</div>
             <button className="add-interview-btn" onClick={(e) => { e.stopPropagation(); setShowAddModal(true); }}>+ 增加</button>
           </div>
         )}
      </div>

      <div className="scroll-area">
        {viewMode === 'calendar' ? (
          <div className="schedule-list">
            {scheduleData[selectedDay] ? (
              scheduleData[selectedDay].map((item, index) => (
                <div key={index} className={`sched-item ${item.warn ? 'sched-item-warn' : ''}`}>
                  <div className="sched-time-box">
                    <div className="sched-time">{item.time}</div>
                    <div className="sched-line"></div>
                  </div>
                  <div className={`sched-card type-${item.type}`}>
                    <div className="sched-card-icon">
                      {item.Icon ? <item.Icon size={16} /> : <ClockIcon size={16} />}
                    </div>
                    <div className="sched-info">
                      <div className="sched-title">{item.title}</div>
                      <div className="sched-sub">{item.sub}</div>
                    </div>
                    {item.duration && <div className="sched-duration">{item.duration}</div>}
                    {item.warn && <WarningIcon size={16} fill="var(--error)" />}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <ClockIcon size={40} />
                <p>今日暂无行程，适合安静备考</p>
              </div>
            )}
          </div>
        ) : (
          <div className="planner-container">
            {/* 面试列表卡片 */}
            <div className="planner-section">
              <div className="section-title">面试安排</div>
              <div className="interview-chips">
                {interviews.map(item => (
                  <div key={item.id} className="interview-chip">
                    <div className="chip-city">{item.city}</div>
                    <div className="chip-info">
                      <div className="chip-school">{item.school}</div>
                      <div className="chip-date">{new Date(item.date).toLocaleDateString()}</div>
                    </div>
                    <button className="chip-delete-btn" onClick={() => handleDeleteInterview(item.id)}>×</button>
                  </div>
                ))}
              </div>
              
              <button 
                className={`generate-btn ${isPlanning ? 'is-loading' : ''}`} 
                onClick={handleGeneratePlan}
                disabled={isPlanning}
              >
                {isPlanning ? (
                  <div className="loading-spinner"></div>
                ) : (
                  <>
                    <BotIcon size={18} />
                    <span>AI 自动规划最优行程</span>
                  </>
                )}
              </button>
            </div>

            {/* 规划结果 */}
            {plannedTrips.length > 0 && (
              <div className="planner-section">
                <div className="section-title">AI 推荐方案 (TRIP-PLAN)</div>
                <div className="trip-plans">
                  {plannedTrips.map(plan => (
                    <div key={plan.id} className={`trip-plan-card ${plan.recommend ? 'recommend' : ''}`}>
                      {plan.recommend && <div className="recommend-badge">推荐</div>}
                      <div className="plan-header">
                        <div className="plan-route">{plan.route}</div>
                        <div className="plan-score">评分 <span>{plan.score}</span></div>
                      </div>
                      <div className="plan-stats">
                        <div className="plan-stat">
                          <span className="stat-label">总费用</span>
                          <span className="stat-val">{plan.cost}</span>
                        </div>
                        <div className="plan-stat">
                          <span className="stat-label">总周期</span>
                          <span className="stat-val">{plan.duration}</span>
                        </div>
                        <div className="plan-stat">
                          <span className="stat-label">疲劳度</span>
                          <span className={`stat-val fatigue-${plan.fatigue}`}>{plan.fatigue}</span>
                        </div>
                      </div>
                      <p className="plan-desc">{plan.desc}</p>
                      <button className="apply-plan-btn" onClick={() => handleApplyPlan(plan)}>应用此方案</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="planner-hint">
              <BotIcon size={14} />
              <span>基于 T1-T3 需求：综合考量交通、成本与体力消耗</span>
            </div>
          </div>
        )}
        <div className="pb-safe" style={{ height: '80px' }} />
      </div>

      {toast && <div className="toast show">{toast}</div>}
      
      {/* 添加面试弹窗 */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>录入面试安排</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddInterview}>
              <div className="modal-body">
                <div className="input-group">
                  <label>学校名称</label>
                  <input 
                    type="text" 
                    placeholder="如：清华大学" 
                    value={newInterview.school}
                    onChange={e => setNewInterview({...newInterview, school: e.target.value})}
                    required 
                  />
                </div>
                <div className="input-group">
                  <label>申请专业</label>
                  <input 
                    type="text" 
                    placeholder="如：建筑学" 
                    value={newInterview.major}
                    onChange={e => setNewInterview({...newInterview, major: e.target.value})}
                    required 
                  />
                </div>
                <div className="input-row">
                  <div className="input-group">
                    <label>城市</label>
                    <input 
                      type="text" 
                      placeholder="北京" 
                      value={newInterview.city}
                      onChange={e => setNewInterview({...newInterview, city: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="input-group">
                    <label>类型</label>
                    <select 
                      value={newInterview.type}
                      onChange={e => setNewInterview({...newInterview, type: e.target.value})}
                    >
                      <option value="夏令营">夏令营</option>
                      <option value="预推免">预推免</option>
                      <option value="笔面试">笔面试</option>
                    </select>
                  </div>
                </div>
                <div className="input-group">
                  <label>面试日期</label>
                  <input 
                    type="date" 
                    value={newInterview.date}
                    onChange={e => setNewInterview({...newInterview, date: e.target.value})}
                    required 
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>取消</button>
                <button 
                  type="button" 
                  className="submit-btn" 
                  onClick={handleAddInterview}
                  style={{ opacity: (!newInterview.school || !newInterview.city) ? 0.5 : 1 }}
                >
                  确认添加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  );
}

export default SchedulePage;
