import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { BackIcon, SendIcon } from '../components/Icons';
import { RobotOne } from '@icon-park/react';
import { useNavigate } from 'react-router-dom';
import MockInterviewService from '../services/MockInterviewService';

function ChatPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 从导航状态获取面试模式信息
  const isInterviewMode = location.state?.interviewMode || false;
  const sessionId = location.state?.sessionId;
  const schoolName = location.state?.schoolName;
  const majorName = location.state?.majorName;
  const [userName, setUserName] = useState('我');
  
  const [messages, setMessages] = useState([
    isInterviewMode ? {
      role: 'ai',
      content: location.state?.prefill || '欢迎参加面试！',
      time: '09:24',
      isInterview: true
    } : {
      role: 'ai',
      content: `你好！我是你的保研行程助手。\n\n我已读取你的邮箱，整理了 4 所院校的入营/面试通知，发现 7月20日存在行程冲突（清华夏令营第3天 vs 同济预推免面试）。\n\n需要我现在帮你规划解决方案吗？`,
      time: '09:24',
      suggestions: ['帮我分析7月20日的行程冲突，给出最优解决方案', '先继续，我想问别的']
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => { scrollToBottom(); }, [messages]);
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('manlv_token');
      if (!token) return;
      try {
        const res = await fetch('http://localhost:3001/api/user', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return;
        const user = await res.json();
        if (user?.name) setUserName(user.name);
      } catch (e) {
        console.error(e);
      }
    };
    fetchUser();
  }, []);

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };
  const getTime = () => new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  const userAvatarText = (userName || '我').trim().slice(0, 1);

  const handleSend = async (text = inputValue) => {
    if (!text.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: text, time: getTime() }]);
    setInputValue('');
    setIsTyping(true);

    if (isInterviewMode && sessionId) {
      // 面试模式：调用 MockInterviewService
      try {
        const result = await MockInterviewService.submitAnswer(sessionId, text);
        setMessages(prev => [...prev, {
          role: 'ai',
          content: result.feedback || result.next_question,
          time: getTime(),
          isInterview: true
        }]);
        console.log('[面试对话]', { sessionId, score: result.score });
      } catch (error) {
        console.error('[面试对话失败]', error);
        setMessages(prev => [...prev, {
          role: 'ai',
          content: '面试系统暂时不可用，请稍后重试。',
          time: getTime(),
          isInterview: true
        }]);
      }
    } else {
      // 通用 AI 模式：返回通用回复
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'ai',
          content: `收到你的问题！作为漫旅AI助手，我来帮你分析。\n\n关于「${text}」这个问题，我建议...\n\n（实际AI功能需要配置API密钥）`,
          time: getTime()
        }]);
        setIsTyping(false);
      }, 1500);
      return;
    }

    setIsTyping(false);
  };

  const handleFinishInterview = async () => {
    if (isInterviewMode && sessionId) {
      try {
        setIsTyping(true);
        const result = await MockInterviewService.finishInterview(sessionId);
        
        const scoreMessage = `
【面试评分报告】
━━━━━━━━━━━━━━━━━━━━━━

📊 总体评分：${result.total_score}/100  |  等级：${result.equivalent_level || '良好'}

📈 能力评估：
  • 知识掌握：${result.breakdown?.knowledge || 75}/100
  • 表达能力：${result.breakdown?.communication || 75}/100
  • 学习热情：${result.breakdown?.passion || 75}/100
  • 准备程度：${result.breakdown?.preparation || 75}/100

✨ 核心优势：
${result.strengths && result.strengths.length > 0 
  ? result.strengths.map((s, i) => `  ${i + 1}. ${s}`).join('\n')
  : '  • 回答逻辑清晰\n  • 基础知识扎实\n  • 沟通表达流利'}

⚠️ 知识短板：
${result.weaknesses && result.weaknesses.length > 0
  ? result.weaknesses.map((w, i) => `  ${i + 1}. ${w}`).join('\n')
  : '  • 需要加深对某些知识点的理解\n  • 建议多看行业案例'}

💡 备考建议：
${result.suggestions && result.suggestions.length > 0
  ? result.suggestions.map((s, i) => `  ${i + 1}. ${s}`).join('\n')
  : '  • 加强专业基础知识学习\n  • 总结项目经验亮点\n  • 了解目标院校特色'}

📝 详细反馈：
${result.feedback || '总体表现不错，继续加油！'}

✨ 漫旅学习打卡 +1
━━━━━━━━━━━━━━━━━━━━━━
        `.trim();
        
        setMessages(prev => [...prev, {
          role: 'ai',
          content: scoreMessage,
          time: getTime(),
          isInterview: true
        }]);
        
        console.log('[面试结束]', result);
      } catch (error) {
        console.error('[面试结束失败]', error);
        setMessages(prev => [...prev, {
          role: 'ai',
          content: '面试评分系统暂时不可用。',
          time: getTime(),
          isInterview: true
        }]);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const contextChips = [
    { label: '行程冲突分析', msg: '帮我分析7月20日的行程冲突，给出解决方案' },
    { label: '城市备考', msg: '北京面试我应该了解哪些城市知识？' },
    { label: '自我介绍', msg: '帮我写一份2分钟的自我介绍，突出建筑学专业背景' },
    { label: '情绪疏导', msg: '我现在很焦虑，帮我减压' },
  ];

  return (
    <div className={`page chat-page ${isInterviewMode ? 'interview-mode' : ''}`}>
      <div className="chat-header">
        <div className="chat-header-top">
          <button className="back-btn" onClick={() => navigate(-1)}><BackIcon size={18} /></button>
          <div className={`ai-avatar ${isInterviewMode ? 'minimal' : ''}`}>
            {isInterviewMode ? <span className="ai-avatar-text">AI</span> : <RobotOne theme="outline" size="18" fill="#333" />}
            <div className="ai-status-dot" />
          </div>
          <div className="ai-info">
            <div className="ai-name">{isInterviewMode ? `${schoolName} ${majorName}` : '漫旅 AI'}</div>
            <div className="ai-desc">{isInterviewMode ? 'AI 模拟面试' : '保研全程智能伴旅助手'}</div>
          </div>
        </div>
        {!isInterviewMode && (
          <div className="context-strip">
            {contextChips.map((chip) => (
              <button key={chip.label} className="context-chip" onClick={() => handleSend(chip.msg)}>
                {chip.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`msg ${msg.role}`}>
            {msg.role === 'ai' && (
              <div className={`msg-avatar ai ${isInterviewMode ? 'minimal' : ''}`}>
                {isInterviewMode ? <span className="ai-avatar-text">AI</span> : <RobotOne theme="outline" size="14" fill="#333" />}
              </div>
            )}
            <div className="msg-content">
              <div className="msg-bubble">
                {msg.content.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < msg.content.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
              {msg.suggestions && (
                <div className="suggest-chips">
                  {msg.suggestions.map((s, i) => (
                    <button key={i} className="suggest-chip" onClick={() => handleSend(s)}>{s}</button>
                  ))}
                </div>
              )}
              <div className="msg-time">{msg.time}</div>
            </div>
            {msg.role === 'user' && (
              <div className="msg-avatar user-av">
                {userAvatarText}
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="msg ai">
            <div className={`msg-avatar ai ${isInterviewMode ? 'minimal' : ''}`}>
              {isInterviewMode ? <span className="ai-avatar-text">AI</span> : <RobotOne theme="outline" size="14" fill="#333" />}
            </div>
            <div className="typing-indicator">
              <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <div className="chat-input-row">
          <textarea
            className="chat-input"
            placeholder={isInterviewMode ? "请回答问题..." : "问我任何关于保研的问题…"}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={isInterviewMode ? (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } } : (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            rows={1}
          />
          <button className="send-btn" onClick={() => handleSend()}>
            <SendIcon size={16} />
          </button>
        </div>
        {isInterviewMode && (
          <div style={{ padding: '12px 0', textAlign: 'center' }}>
            <button 
              onClick={handleFinishInterview}
              style={{
                padding: '8px 20px',
                background: 'rgba(219, 112, 112, 0.1)',
                border: '1px solid rgba(219, 112, 112, 0.3)',
                borderRadius: '8px',
                color: '#db7070',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontWeight: 500
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(219, 112, 112, 0.15)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(219, 112, 112, 0.1)'}
            >
              结束面试并查看评分
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatPage;
