import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { ProfileIcon, TrendIcon, StarIcon, SettingsIcon, ChevronRightIcon, BackIcon, CheckIcon } from '../components/Icons';
import API_BASE_URL from '../config/api';
import majorListData from '../config/major_list.json';
import '../styles/ProfilePage.css';

const emotionData = [
  { day: '周一', val: 45, label: '备考·沉稳', color: '#a4b0be' },
  { day: '周二', val: 30, label: '面试·焦虑', color: '#c9a66b' },
  { day: '周三', val: 90, label: '入营·狂喜', color: '#cc8181' },
  { day: '周四', val: 65, label: '旅学·平静', color: '#8aad8a' },
  { day: '周五', val: 55, label: '新城·期待', color: '#7a99c2' },
  { day: '周六', val: 80, label: '调研·充实', color: '#95a5a6' },
  { day: '今天', val: 70, label: '整理·反思', color: '#b0997a' },
];

const achievements = [
  { title: '行程先锋', desc: '完成第一次院校行程规划', unlocked: true },
  { title: '备考达人', desc: '连续备考3天', unlocked: true },
  { title: '多城旅者', desc: '规划3个城市行程', unlocked: false },
  { title: '论文猎手', desc: '收藏10篇导师论文', unlocked: false },
];

const undergraduateCategories = majorListData.undergraduate || [];

const findMajorPath = (majorName) => {
  if (!majorName) return null;

  const matchedCategory = undergraduateCategories.find((item) =>
    item.majors.includes(majorName)
  );

  if (matchedCategory) {
    return {
      category: matchedCategory.category,
      major: majorName,
      majorTypes: matchedCategory.major_type || []
    };
  }

  return null;
};

function ProfilePage({ onLogout }) {
  const [activeTab, setActiveTab] = useState('emotion');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState(null); // 'name', 'email', 'password', 'major', 'notification'
  const [editValue, setEditValue] = useState('');
  const [majorSelection, setMajorSelection] = useState({
    category: '',
    major: ''
  });
  const [isMajorPickerOpen, setIsMajorPickerOpen] = useState(false);
  const [toast, setToast] = useState('');
  
  // 模拟通知设置的 state
  const [notifSettings, setNotifSettings] = useState({
    email: true,
    schedule: true,
    system: false
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (editingField !== 'major') {
      setIsMajorPickerOpen(false);
      return;
    }

    const matched = findMajorPath(user?.major);
    if (matched) {
      setMajorSelection({
        category: matched.category,
        major: matched.major
      });
      return;
    }

    setMajorSelection({
      category: '',
      major: ''
    });
  }, [editingField, user?.major]);

  useEffect(() => {
    if (!isMajorPickerOpen) return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isMajorPickerOpen]);

  const fetchUserData = async () => {
    const token = localStorage.getItem('manlv_token');
    if (!token) {
      navigate('/');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/user`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Fetch user error:', error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleUpdateProfile = async (customValue) => {
    const token = localStorage.getItem('manlv_token');
    const body = {};
    const finalValue = customValue || editValue;

    if (editingField === 'name') body.name = finalValue;
    if (editingField === 'email') body.email = finalValue;
    if (editingField === 'password') body.password = finalValue;
    if (editingField === 'major') body.major = finalValue;
    if (editingField === 'notification') {
      showToast('通知设置已保存');
      setEditingField(null);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/user`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        showToast('修改成功');
        setEditingField(null);
      } else {
        showToast(data.error || '修改失败');
      }
    } catch (error) {
      showToast('网络错误');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('manlv_token');
    if (onLogout) onLogout();
    navigate('/');
  };

  const openMajorPicker = () => {
    const fallbackCategory = majorSelection.category || findMajorPath(user?.major)?.category || undergraduateCategories[0]?.category || '';

    setMajorSelection((prev) => ({
      ...prev,
      category: prev.category || fallbackCategory
    }));
    setIsMajorPickerOpen(true);
  };

  const handleMajorCategorySelect = (category) => {
    setMajorSelection({
      category,
      major: ''
    });
  };

  const handleMajorSelect = (major) => {
    setMajorSelection((prev) => ({
      ...prev,
      major
    }));
    setIsMajorPickerOpen(false);
  };

  if (loading) return <div className="page" style={{ justifyContent: 'center', alignItems: 'center' }}>加载中...</div>;

  // 编辑模态层
  if (editingField) {
    const titles = { name: '修改姓名', email: '修改手机号', password: '修改密码', major: '设置专业方向', notification: '通知提醒设置' };
    const icons = { 
      name: <ProfileIcon size={18} />, 
      email: <SettingsIcon size={18} />, 
      password: <SettingsIcon size={18} />,
      major: <StarIcon size={18} />,
      notification: <SettingsIcon size={18} />
    };
    const majorCategories = undergraduateCategories;
    const selectedMajorCategory = majorCategories.find((item) => item.category === majorSelection.category);
    const majorTypes = selectedMajorCategory?.major_type || [];
    const majorOptions = selectedMajorCategory?.majors || [];
    const majorDisplay = majorSelection.major ? `${majorSelection.category} / ${majorSelection.major}` : '';
    const canSubmit = editingField === 'major' ? Boolean(majorSelection.major) : Boolean(editValue.trim());
    
    return (
      <div className="page edit-page">
        <div className="page-header edit-header">
          <button className="back-btn-circle" onClick={() => setEditingField(null)}>
            <BackIcon size={18} />
          </button>
          <div className="page-title">{titles[editingField]}</div>
          <div style={{ width: '40px' }}></div>
        </div>

        <div className="edit-content">
          <div className="edit-card">
            <div className="edit-card-icon">
              {icons[editingField]}
            </div>
            
            {editingField === 'major' ? (
              <div className="major-selector">
                <label className="input-label">请选择你的专业</label>
                <button
                  type="button"
                  className={`profile-major-trigger ${majorSelection.major ? 'selected' : ''}`}
                  onClick={openMajorPicker}
                >
                  <div className="profile-major-trigger-label">专业方向</div>
                  <div className="profile-major-trigger-value">
                    {majorDisplay || '请选择你的专业方向'}
                  </div>
                  <div className="profile-major-trigger-meta">
                    {majorSelection.major ? '点击可重新选择' : '学科门类 / 具体专业'}
                  </div>
                </button>
              </div>
            ) : editingField === 'notification' ? (
              <div className="notification-settings" style={{ marginTop: '8px' }}>
                <div className="notif-row">
                  <div className="notif-label-wrap">
                    <div className="notif-title">邮件解析提醒</div>
                    <div className="notif-desc">新行程和截止日期识别</div>
                  </div>
                  <div 
                    className={`toggle-switch ${notifSettings.email ? 'active' : ''}`}
                    onClick={() => setNotifSettings(prev => ({...prev, email: !prev.email}))}
                  ></div>
                </div>
                <div className="notif-row">
                  <div className="notif-label-wrap">
                    <div className="notif-title">行程变动提醒</div>
                    <div className="notif-desc">面试临近或地点变更</div>
                  </div>
                  <div 
                    className={`toggle-switch ${notifSettings.schedule ? 'active' : ''}`}
                    onClick={() => setNotifSettings(prev => ({...prev, schedule: !prev.schedule}))}
                  ></div>
                </div>
                <div className="notif-row">
                  <div className="notif-label-wrap">
                    <div className="notif-title">系统公告</div>
                    <div className="notif-desc">新功能上线及版本更新</div>
                  </div>
                  <div 
                    className={`toggle-switch ${notifSettings.system ? 'active' : ''}`}
                    onClick={() => setNotifSettings(prev => ({...prev, system: !prev.system}))}
                  ></div>
                </div>
                <div className="input-hint" style={{ marginTop: '24px', lineHeight: '1.5' }}>
                  关闭提醒后，你可能会错过重要的院校通知和行程安排。
                </div>
              </div>
            ) : (
              <div className="input-group">
                <label className="input-label">新的{titles[editingField].slice(2)}</label>
                <div className="input-wrapper">
                  <input 
                    type={editingField === 'password' ? 'password' : 'text'}
                    className="auth-input edit-input" 
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder={`请输入${titles[editingField].slice(2)}`}
                    autoFocus
                  />
                </div>
                <div className="input-hint">
                  {editingField === 'name' && '使用真实姓名方便导师核对身份'}
                  {editingField === 'email' && '用于接收面试通知和行程提醒'}
                  {editingField === 'password' && '请确保密码包含字母和数字'}
                </div>
              </div>
            )}
          </div>

          {editingField !== 'notification' && (
            <div className="edit-actions">
              <button 
                className={`save-action-btn ${!canSubmit ? 'disabled' : ''}`} 
                onClick={() => handleUpdateProfile(editingField === 'major' ? majorSelection.major : undefined)}
                disabled={!canSubmit}
              >
                <div className="btn-content">
                  <CheckIcon size={20} />
                  <span>{editingField === 'major' ? '保存专业' : '确认修改'}</span>
                </div>
                <div className="btn-glow"></div>
              </button>
              <button className="cancel-action-btn" onClick={() => setEditingField(null)}>
                取消
              </button>
            </div>
          )}
        </div>

        {editingField === 'major' && isMajorPickerOpen && (
          <div
            className="major-picker-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-major-picker-title"
            onClick={() => setIsMajorPickerOpen(false)}
          >
            <div className="major-picker-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="major-picker-handle" aria-hidden="true" />
              <div className="major-picker-header">
                <div>
                  <div className="major-picker-tag">专业选择</div>
                  <h3 id="profile-major-picker-title" className="major-picker-title">
                    设置你的专业
                  </h3>
                  <p className="major-picker-subtitle">
                    左侧选择学科门类，右侧直接选择具体专业
                  </p>
                </div>
                <button
                  type="button"
                  className="major-picker-close-btn"
                  onClick={() => setIsMajorPickerOpen(false)}
                  aria-label="关闭专业选择"
                >
                  ×
                </button>
              </div>

              <div className="major-picker-body">
                <div className="major-picker-layout">
                  <div className="major-picker-category-list">
                    {majorCategories.map((option) => (
                      <button
                        key={option.category}
                        type="button"
                        className={`major-picker-category-btn ${
                          majorSelection.category === option.category ? 'active' : ''
                        }`}
                        onClick={() => handleMajorCategorySelect(option.category)}
                      >
                        {option.category}
                      </button>
                    ))}
                  </div>

                  <div className="major-picker-major-panel">
                    {majorTypes.length > 0 && (
                      <div className="major-picker-type-tags">
                        {majorTypes.map((item) => (
                          <span key={item} className="major-picker-type-tag">{item}</span>
                        ))}
                      </div>
                    )}

                    <div className="major-picker-major-list">
                      {majorOptions.map((major) => (
                        <button
                          key={major}
                          type="button"
                          className={`major-picker-major-btn ${
                            majorSelection.major === major ? 'selected' : ''
                          }`}
                          onClick={() => handleMajorSelect(major)}
                        >
                          <span>{major}</span>
                          {majorSelection.major === major && <span>已选</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {toast && <div className="toast show">{toast}</div>}
      </div>
    );
  }

  const maxVal = Math.max(...emotionData.map(d => d.val));

  const settingsItems = [
    { label: '修改姓名', note: user?.name, field: 'name' },
    { label: '专业方向', note: user?.major || '未设置', field: 'major' },
    { label: '手机号/邮箱', note: user?.email, field: 'email' },
    { label: '修改密码', note: '********', field: 'password' },
    { label: '通知提醒', note: (notifSettings.email || notifSettings.schedule || notifSettings.system) ? '已开启' : '已关闭', field: 'notification' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title-row">
          <span className="page-title-icon"><ProfileIcon size={18} /></span>
          <div>
            <div className="page-title">我的</div>
            <div className="page-subtitle">{user?.name} · {user?.major || '建筑学'} 2026</div>
          </div>
        </div>
      </div>

      {/* user card */}
      <div className="profile-card">
        <div className="profile-avatar">{user?.name?.charAt(0) || '林'}</div>
        <div className="profile-info">
          <div className="profile-name">{user?.name}</div>
          <div className="profile-meta">{user?.major || '建筑学'} · 本科 · 大四在读</div>
          <div className="profile-stats">
            <span><strong>3</strong> 城市</span>
            <span><strong>6</strong> 院校</span>
            <span><strong>12</strong> 天旅学</span>
          </div>
        </div>
      </div>

      <div className="seg-tabs">
        <button className={`seg-tab ${activeTab === 'emotion' ? 'active' : ''}`} onClick={() => setActiveTab('emotion')}>
          情绪曲线
        </button>
        <button className={`seg-tab ${activeTab === 'achievements' ? 'active' : ''}`} onClick={() => setActiveTab('achievements')}>
          旅学成就
        </button>
        <button className={`seg-tab ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
          设置
        </button>
      </div>

      <div className="scroll-area">
        {activeTab === 'emotion' && (
          <div style={{ padding: '16px 20px' }}>
            <div className="section-label"><TrendIcon size={13} /> 近7天情绪</div>
            <div className="emotion-chart">
              {emotionData.map((d, i) => (
                <div className="emotion-bar-col" key={i}>
                  <div className="emotion-bar-wrap">
                    <div
                      className="emotion-bar-fill"
                      style={{ 
                        height: `${(d.val / 100) * 100}%`,
                        background: d.color || 'var(--gold)'
                      }}
                    />
                  </div>
                  <div className="emotion-bar-day">{d.day}</div>
                </div>
              ))}
            </div>
            <div className="emotion-legend">
              {emotionData.map((d, i) => (
                <div className="emotion-legend-item" key={i}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: d.color }} />
                    <span className="emotion-legend-day">{d.day}</span>
                  </div>
                  <span className="emotion-legend-val" style={{ color: d.color }}>{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {achievements.map((a, i) => (
              <div className={`achievement-card ${a.unlocked ? 'unlocked' : 'locked'}`} key={i}>
                <div className="achievement-icon">
                  <StarIcon size={18} />
                </div>
                <div className="achievement-info">
                  <div className="achievement-title">{a.title}</div>
                  <div className="achievement-desc">{a.desc}</div>
                </div>
                <div className="achievement-status">{a.unlocked ? '已获得' : '未解锁'}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'settings' && (
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {settingsItems.map((item, i) => (
              <div 
                className="settings-row" 
                key={i} 
                onClick={() => {
                  if (item.field) {
                    setEditingField(item.field);
                    setEditValue(item.field === 'password' ? '' : item.note);
                  }
                }}
                style={{ cursor: item.field ? 'pointer' : 'default' }}
              >
                <div className="settings-row-left">
                  <SettingsIcon size={15} />
                  <span className="settings-label">{item.label}</span>
                </div>
                <div className="settings-row-right">
                  <span className="settings-note">{item.note}</span>
                  <ChevronRightIcon size={14} />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pb-safe" style={{ height: '80px' }} />

        {activeTab === 'settings' && (
          <div className="profile-logout-row">
            <button className="logout-btn" onClick={handleLogout}>
              退出登录
            </button>
          </div>
        )}
      </div>

      {toast && <div className="toast show">{toast}</div>}
      <BottomNav />
    </div>
  );
}

export default ProfilePage;
