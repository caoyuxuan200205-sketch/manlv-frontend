import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { MapIcon, BookmarkIcon, LocationIcon, SearchIcon, ChevronRightIcon, BotIcon, WarningIcon } from '../components/Icons';
import MockInterviewService from '../services/MockInterviewService';
import AMapLoader from '@amap/amap-jsapi-loader';
import SpotRecommendationService from '../services/SpotRecommendationService';


// 安全密钥和 Key 配置
const AMAP_KEY = '837693865f10c7e203276ffd079230d7'; // 替换为你的真实 Key
const AMAP_SECURITY_CODE = '1b649ed11bc0ce194956c6f08a2fd2f4'; // 替换为你的真实安全密钥

// 仅在 Key 有效时设置安全密钥
if (AMAP_SECURITY_CODE !== '00000000000000000000000000000000') {
  window._AMapSecurityConfig = {
    securityJsCode: AMAP_SECURITY_CODE,
  };
}

const savedItems = [
  { title: '中国建筑史百年脉络', category: '建筑历史', date: '3天前' },
  { title: '城市双碳目标与绿色建筑', category: '城市规划前沿', date: '5天前' },
  { title: '梁思成：从古迹保护到城市规划', category: '导师背景', date: '1周前' },
];

// 城市坐标映射表
const cityCoords = {
  '北京': [116.3267, 39.9930],
  '上海': [121.5033, 31.2828],
  '南京': [118.7900, 32.0570],
  '广州': [113.2644, 23.1291],
  '深圳': [114.0579, 22.5431],
  '杭州': [120.1535, 30.2874],
  '成都': [104.0657, 30.6594],
  '西安': [108.9401, 34.3415],
  '武汉': [114.3055, 30.5928],
};

const schoolLogos = {
  '东南大学': '/logos/southeast-university.jpeg',
  '清华大学': '/logos/tsinghua-university.png',
  '南京大学': '/logos/nanjing-university.jpeg',
};

function LearnPage() {
  const [activeSection, setActiveSection] = useState('map');
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [mapStatus, setMapStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [interviews, setInterviews] = useState([]);
  const [user, setUser] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isGeneratingSpots, setIsGeneratingSpots] = useState(false);
  const [isParsingDoc, setIsParsingDoc] = useState(false);

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const navigate = useNavigate();

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2800);
  };

  const getSchoolLogo = (schoolName) => {
    const matchedKey = Object.keys(schoolLogos).find((key) => schoolName?.includes(key));
    return matchedKey ? schoolLogos[matchedKey] : null;
  };

  useEffect(() => {
    fetchInitialData();
    // 从本地缓存加载推荐
    const cachedSpots = localStorage.getItem('ai_spot_recommendations');
    if (cachedSpots) {
      setRecommendations(JSON.parse(cachedSpots));
    }
  }, []);

  const fetchInitialData = async () => {
    const token = localStorage.getItem('manlv_token');
    if (!token) return;

    try {
      // 1. 获取用户信息
      const userRes = await fetch('http://localhost:3001/api/user', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
      }

      // 2. 获取面试列表
      const ivRes = await fetch('http://localhost:3001/api/interviews', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (ivRes.ok) {
        const ivData = await ivRes.json();
        setInterviews(ivData);
      }
    } catch (e) {
      console.error('Fetch initial data error:', e);
    }
  };

  // 监听面试或专业变化，仅在没有推荐时自动生成（第一次）
  useEffect(() => {
    if (user?.major && interviews.length > 0 && recommendations.length === 0) {
      generateAIRecommendations();
    }
  }, [user, interviews, recommendations.length]);

  const generateAIRecommendations = async () => {
    if (isGeneratingSpots) return;
    setIsGeneratingSpots(true);
    const uniqueCities = [...new Set(interviews.map(iv => iv.city))];
    const allSpots = [];

    try {
      // 遍历所有城市获取推荐
      for (const city of uniqueCities) {
        const spots = await SpotRecommendationService.getRecommendations(user.major, city);
        const spotsWithCity = spots.map(s => ({ ...s, city }));
        allSpots.push(...spotsWithCity);
      }
      setRecommendations(allSpots);
      // 存入缓存
      localStorage.setItem('ai_spot_recommendations', JSON.stringify(allSpots));
      showToast('AI 推荐已更新 ✨');
    } catch (error) {
      console.error('AI 推荐生成失败:', error);
      showToast('更新失败，请稍后重试');
    } finally {
      setIsGeneratingSpots(false);
    }
  };

  useEffect(() => {
    let timer;
    if (activeSection === 'map') {
      setMapStatus('loading');
      initMap();
      // 如果 10 秒还没加载出来，判定为加载失败
      timer = setTimeout(() => {
        if (mapStatus === 'loading' && !mapInstance.current) {
          setMapStatus('error');
        }
      }, 10000);
    }
    return () => {
      clearTimeout(timer);
      if (mapInstance.current) {
        mapInstance.current.destroy();
        mapInstance.current = null;
      }
    };
  }, [activeSection, interviews]); // 当 interviews 变化时也重新初始化地图

  const initMap = () => {
    if (AMAP_KEY === '00000000000000000000000000000000') {
      setMapStatus('no-key');
      return;
    }

    // 防御性检查：确保 DOM 节点已存在
    if (!mapRef.current) {
      setTimeout(initMap, 100);
      return;
    }

    AMapLoader.load({
      key: AMAP_KEY,
      version: '2.0',
      plugins: ['AMap.Marker', 'AMap.LabelMarker'],
    })
      .then((AMap) => {
        if (!mapRef.current) return;

        const map = new AMap.Map(mapRef.current, {
          viewMode: '3D',
          zoom: 5,
          center: [116.397428, 39.90923],
          mapStyle: 'amap://styles/whitesmoke',
        });

        mapInstance.current = map;
        setMapStatus('success');

        // 使用后端真实的面试数据渲染点位
        interviews.forEach((iv) => {
          const coords = cityCoords[iv.city] || [116.397428, 39.90923];
          
          const marker = new AMap.Marker({
            position: coords,
            offset: new AMap.Pixel(-10, -10),
          });

          const content = `
            <div class="custom-map-marker">
              <div class="marker-pulse"></div>
              <div class="marker-label">${iv.city}</div>
            </div>
          `;
          marker.setContent(content);
          marker.setMap(map);
          
          marker.on('click', () => {
            showToast(`即将前往：${iv.city} - ${iv.school}`);
          });
        });

        if (interviews.length > 0) {
          map.setFitView();
        }
      })
      .catch((e) => {
        console.error('地图加载失败:', e);
        setMapStatus('error');
      });
  };

  const handleResumeFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件格式
    const isTextFile = file.type === 'text/plain' || 
                       file.name.endsWith('.txt') || 
                       file.name.endsWith('.md');
    const isDocFile = file.name.endsWith('.doc') || file.name.endsWith('.docx');
    
    if (!isTextFile && !isDocFile) {
      showToast('请上传文本文件(.txt/.md)或 Word 文档(.doc/.docx)');
      return;
    }

    setResumeFile(file);
    showToast(`已选择文件: ${file.name}`);

    // 文本文件直接读取
    if (isTextFile) {
      try {
        const text = await file.text();
        setResumeText(text);
        showToast(`文件读取成功！共 ${text.length} 字符`);
      } catch (error) {
        console.error('[文件读取失败]', error);
        showToast('文件读取失败: ' + (error.message || '请稍后重试'));
      }
      return;
    }

    // Word 文档上传到后端解析
    if (isDocFile) {
      const token = localStorage.getItem('manlv_token');
      if (!token) {
        showToast('请先登录');
        return;
      }

      setIsParsingDoc(true);
      showToast('正在解析 Word 文档，请稍候...');

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('http://localhost:3001/api/parse-resume', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || '文档解析失败');
        }

        const result = await response.json();
        
        if (result.data?.text) {
          setResumeText(result.data.text);
          showToast(`文档解析成功！共 ${result.data.text.length} 字符`);
        } else {
          showToast('未能提取文档内容，请手动粘贴');
        }
      } catch (error) {
        console.error('[Word 解析失败]', error);
        showToast('Word 解析失败: ' + (error.message || '请稍后重试，或手动粘贴内容'));
      } finally {
        setIsParsingDoc(false);
      }
    }
  };

  const handleStartInterview = async (interview) => {
    if (!resumeFile && !resumeText) {
      showToast('请先上传简历或输入简历内容');
      return;
    }

    // 检查是否有简历文本内容
    const finalResumeText = resumeText.trim();
    if (!finalResumeText) {
      showToast('简历内容为空，请重新上传或手动输入');
      return;
    }

    setSelectedInterview(interview);
    setIsLoading(true);
    try {
      console.log('[启动面试]', {
        school: interview.school,
        major: interview.major,
        resumeTextLength: finalResumeText.length,
        hasResumeFile: !!resumeFile
      });

      // 调用真实的豆包 AI API 初始化面试
      const result = await MockInterviewService.initializeInterview({
        resumeText: finalResumeText,
        resumeFile: resumeFile?.name,
        schoolName: interview.school,
        majorName: interview.major,
        interviewCity: interview.city,
        interviewType: interview.type,
        difficulty: 'medium'
      });

      // 成功初始化后导航到面试页面
      navigate('/chat', {
        state: {
          prefill: `开始AI模拟面试：${interview.school} ${interview.major}\n\n${result.first_question}`,
          interviewMode: true,
          sessionId: result.session_id,
          schoolName: interview.school,
          majorName: interview.major,
          interviewCity: interview.city
        }
      });
      showToast('面试已启动！');
    } catch (error) {
      console.error('启动面试失败:', error);
      showToast('启动面试失败，请重试');
    } finally {
      setIsLoading(false);
      setSelectedInterview(null);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title-row">
          <span className="page-title-icon"><MapIcon size={18} /></span>
          <div>
            <div className="page-title">漫学</div>
            <div className="page-subtitle">城市·知识·收藏</div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="toast-message" style={{ position: 'fixed', top: '60px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}>
          {toast}
        </div>
      )}

      <div className="seg-tabs">
        <button className={`seg-tab ${activeSection === 'map' ? 'active' : ''}`} onClick={() => setActiveSection('map')}>
          城市地图
        </button>
        <button className={`seg-tab ${activeSection === 'spots' ? 'active' : ''}`} onClick={() => setActiveSection('spots')}>
          推荐地点
        </button>
        <button className={`seg-tab ${activeSection === 'saved' ? 'active' : ''}`} onClick={() => setActiveSection('saved')}>
          知识收藏
        </button>
        <button className={`seg-tab ${activeSection === 'interview' ? 'active' : ''}`} onClick={() => setActiveSection('interview')}>
          面试练习
        </button>
      </div>

      <div className="scroll-area">
        {activeSection === 'map' && (
          <div style={{ padding: '16px 20px' }}>
            <div className="learn-map-card">
              <div id="map-container" ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
                {mapStatus === 'no-key' ? (
                  <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                    <div style={{ fontSize: '24px', marginBottom: '10px' }}>📍</div>
                    <div style={{ fontSize: '14px' }}>地图 API Key 尚未配置</div>
                    <div style={{ fontSize: '12px', marginTop: '4px' }}>请在 LearnPage.js 中填入真实 Key 以启用地图</div>
                  </div>
                ) : mapStatus === 'error' ? (
                  <div style={{ textAlign: 'center', color: '#e6a23c', padding: '20px' }}>
                    <div style={{ fontSize: '24px', marginBottom: '10px' }}>⚠️</div>
                    <div style={{ fontSize: '14px' }}>地图加载超时或失败</div>
                    <div style={{ fontSize: '12px', marginTop: '4px' }}>请检查网络或高德后台 Key 的平台限制 (需 Web 端 JS API)</div>
                    <button 
                      onClick={() => { setMapStatus('loading'); initMap(); }}
                      style={{ marginTop: '10px', padding: '4px 12px', borderRadius: '4px', border: '1px solid #e6a23c', background: 'none', color: '#e6a23c', cursor: 'pointer' }}
                    >
                      重试
                    </button>
                  </div>
                ) : (
                  <div className="map-loading-placeholder">
                    {mapStatus === 'loading' ? '地图加载中...' : ''}
                  </div>
                )}
              </div>
              <div className="map-attribution">服务由高德地图提供</div>
            </div>

            <div className="section-label">当前城市</div>
            <div className="city-info-card">
              <div className="city-info-header">
                <span className="city-info-dot" style={{ background: 'var(--gold)' }} />
                <span className="city-info-name">北京</span>
                <span className="city-info-badge">即将出发</span>
              </div>
              <div className="city-info-stats">
                <div className="city-stat"><span className="city-stat-val">3</span><span className="city-stat-label">天后</span></div>
                <div className="city-stat"><span className="city-stat-val">5晚</span><span className="city-stat-label">行程</span></div>
                <div className="city-stat"><span className="city-stat-val">4</span><span className="city-stat-label">必访地</span></div>
              </div>
            </div>

            <div className="section-label">接下来</div>
            {[{ city: '上海', tag: '同济', days: '7天后' }, { city: '南京', tag: '东南大学', days: '14天后' }].map(c => (
              <div className="city-row-item" key={c.city}>
                <div className="city-row-dot" style={{ background: 'var(--ink-light)', opacity: 0.4 }} />
                <div className="city-row-info">
                  <span className="city-row-name">{c.city}</span>
                  <span className="city-row-tag">{c.tag}</span>
                </div>
                <span className="city-row-days">{c.days}</span>
                <span className="city-row-arrow"><ChevronRightIcon size={14} /></span>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'spots' && (
          <div style={{ padding: '16px 20px' }}>
            <div className="section-header-row">
              <div className="section-label">AI 智能推荐地点</div>
              {recommendations.length > 0 && !isGeneratingSpots && (
                <button 
                  className="ai-update-btn" 
                  onClick={generateAIRecommendations}
                  title="行程变更后点此刷新"
                >
                  <BotIcon size={12} />
                  <span>更新推荐</span>
                </button>
              )}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {isGeneratingSpots ? (
                <div className="ai-loading-card">
                  <div className="ai-loading-icon"><BotIcon size={24} /></div>
                  <div className="ai-loading-text">AI 正在根据你的专业「{user?.major || '加载中'}」生成个性化推荐...</div>
                  <div className="ai-loading-bar"><div className="ai-loading-progress"></div></div>
                </div>
              ) : recommendations.length > 0 ? (
                recommendations.map((spot, i) => (
                  <div className="spot-card ai-generated" key={i}>
                    <div className="spot-card-top">
                      <div>
                        <div className="spot-name">{spot.name}</div>
                        <div className="spot-type">{spot.type}</div>
                      </div>
                      {spot.tag && <div className="spot-tag ai-tag">{spot.tag}</div>}
                    </div>
                    <div className="spot-desc">{spot.desc}</div>
                    <div className="spot-footer">
                      <span className="spot-loc"><LocationIcon size={12} /> {spot.city}</span>
                      <span className="ai-badge">AI 推荐</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="learn-empty-hint">
                  <WarningIcon size={24} />
                  <div>请先在“设置”中设置专业，并在“行程”页添加面试安排</div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'saved' && (
          <div style={{ padding: '16px 20px' }}>
            <div className="section-label">已收藏</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {savedItems.map((item, i) => (
                <div className="saved-card" key={i}>
                  <div className="saved-card-icon"><BookmarkIcon size={16} /></div>
                  <div className="saved-card-info">
                    <div className="saved-title">{item.title}</div>
                    <div className="saved-meta">{item.category} · {item.date}</div>
                  </div>
                  <ChevronRightIcon size={14} />
                </div>
              ))}
            </div>
            <div className="learn-empty-hint">
              <SearchIcon size={28} />
              <div>浏览行程详情时，点击收藏即可保存</div>
            </div>
          </div>
        )}

        {activeSection === 'interview' && (
          <div style={{ padding: '16px 20px' }}>
            {/* 简历上传部分 */}
            <div className="section-label">上传简历</div>
            <div className="resume-upload-card">
              <div className="resume-upload-zone">
                <input
                  type="file"
                  id="resume-file-input"
                  accept=".txt,.md,.doc,.docx"
                  onChange={handleResumeFileChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="resume-file-input" className="resume-upload-label">
                  <div className="resume-upload-icon">📄</div>
                  <div className="resume-upload-text">
                    {resumeFile ? resumeFile.name : '点击选择简历文件'}
                  </div>
                  <div className="resume-upload-hint">支持 TXT、MD、DOC、DOCX 格式</div>
                </label>
              </div>

              <div className="resume-separator">或</div>

              <textarea
                className="resume-text-input"
                placeholder="粘贴简历文本内容...（包括教育背景、教育经历、奖项、项目经验等）"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={6}
              />

              {/* Word 解析加载状态 */}
              {isParsingDoc && (
                <div className="pdf-parsing-status">
                  <div className="pdf-parsing-spinner"></div>
                  <span>正在解析 Word 文档...</span>
                </div>
              )}

              {/* 简历内容已加载提示 */}
              {resumeText && !isParsingDoc && (
                <div className="pdf-parsing-status success">
                  <span>✓ 简历内容已加载（{resumeText.length} 字符）</span>
                </div>
              )}

              {(resumeFile || resumeText) && (
                <button className="resume-clear-btn" onClick={() => {
                  setResumeFile(null);
                  setResumeText('');
                  showToast('简历已清除');
                }}>
                  清除并重新上传
                </button>
              )}
            </div>

            {/* 即将参加的面试 */}
            <div className="section-label" style={{ marginTop: '20px' }}>
              我的面试日程
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {interviews.map((interview) => (
                <div className="interview-card" key={interview.id}>
                  <div className="interview-card-header">
                    <div className="interview-icon">
                      {getSchoolLogo(interview.school) ? (
                        <img
                          className="interview-school-logo"
                          src={getSchoolLogo(interview.school)}
                          alt={`${interview.school}校徽`}
                        />
                      ) : (
                        interview.type === '夏令营' ? '🏕️' : '🎤'
                      )}
                    </div>
                    <div className="interview-card-title">
                      <div className="interview-school">{interview.school}</div>
                      <div className="interview-major">{interview.major}</div>
                    </div>
                  </div>

                  <div className="interview-card-details">
                    <div className="interview-detail-item">
                      <span className="detail-label">📅 时间</span>
                      <span className="detail-value">{new Date(interview.date).toLocaleDateString()}</span>
                    </div>
                    <div className="interview-detail-item">
                      <span className="detail-label">📍 城市</span>
                      <span className="detail-value">{interview.city}</span>
                    </div>
                    <div className="interview-detail-item">
                      <span className="detail-label">📝 类型</span>
                      <span className="detail-value">{interview.type}</span>
                    </div>
                  </div>

                  <button
                    className={`interview-start-btn ${selectedInterview?.id === interview.id ? 'selected' : ''}`}
                    onClick={() => handleStartInterview(interview)}
                    disabled={isLoading}
                  >
                    {isLoading && selectedInterview?.id === interview.id ? (
                      <span>启动中...</span>
                    ) : (
                      <>
                        <BotIcon size={16} />
                        <span>启动AI面试</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
              {interviews.length === 0 && (
                <div className="learn-empty-hint">
                  <WarningIcon size={24} />
                  <div>暂无面试日程，请在“行程”页添加</div>
                </div>
              )}
            </div>

            {/* 面试提示 */}
            <div className="interview-tips-card">
              <div className="tips-header">
                <WarningIcon size={16} />
                <span>面试提示</span>
              </div>
              <ul className="tips-list">
                <li>确保简历信息完整，包括教育背景和项目经验</li>
                <li>AI将基于你的简历和学校信息进行个性化提问</li>
                <li>面试会话保存在历史记录中，可随时查看</li>
                <li>建议在安静环境下进行，准备充足时间</li>
              </ul>
            </div>
          </div>
        )}

        <div className="pb-safe" style={{ height: '80px' }} />
      </div>

      <BottomNav />
    </div>
  );
}

export default LearnPage;
