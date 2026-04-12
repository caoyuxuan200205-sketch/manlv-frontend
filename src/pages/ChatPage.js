import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BackIcon, SendIcon } from '../components/Icons';
import { RobotOne } from '@icon-park/react';
import MockInterviewService from '../services/MockInterviewService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function ChatPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

  const isInterviewMode = location.state?.interviewMode || false;
  const sessionId = location.state?.sessionId;
  const schoolName = location.state?.schoolName;
  const majorName = location.state?.majorName;

  const [userName, setUserName] = useState('我');
  const [messages, setMessages] = useState([
    isInterviewMode
      ? {
          role: 'ai',
          content: location.state?.prefill || '欢迎参加模拟面试，我们现在可以开始第一题。',
          time: '09:24',
          isInterview: true
        }
      : {
          role: 'ai',
          content:
            '你好，我是漫旅 AI。\n\n我可以帮你做行程冲突分析、面试准备、城市备考和情绪疏导。你可以直接提问，或先从下方快捷问题开始。',
          time: '09:24',
          suggestions: [
            '帮我检查面试安排里是否有时间冲突，并给出解决方案',
            '请根据我的安排生成未来7天备考计划（按天列出）',
            '查一下我下一场面试城市明天的天气，并给出穿搭建议'
          ]
        }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showContextPanel, setShowContextPanel] = useState(!isInterviewMode);

  const messagesEndRef = useRef(null);
  const inputAreaRef = useRef(null);
  const headerRef = useRef(null);
  const [inputAreaHeight, setInputAreaHeight] = useState(120);
  const [headerHeight, setHeaderHeight] = useState(isInterviewMode ? 76 : 94);

  const hasUserMessage = messages.some((msg) => msg.role === 'user');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (hasUserMessage && !isInterviewMode) {
      setShowContextPanel(false);
    }
  }, [hasUserMessage, isInterviewMode]);

  useEffect(() => {
    const updateInputAreaHeight = () => {
      const height = inputAreaRef.current?.offsetHeight || 0;
      setInputAreaHeight(height + 8);
    };

    updateInputAreaHeight();
    window.addEventListener('resize', updateInputAreaHeight);

    let observer;
    if (window.ResizeObserver && inputAreaRef.current) {
      observer = new ResizeObserver(updateInputAreaHeight);
      observer.observe(inputAreaRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateInputAreaHeight);
      if (observer) observer.disconnect();
    };
  }, [isInterviewMode]);

  useEffect(() => {
    const updateHeaderHeight = () => {
      const height = headerRef.current?.offsetHeight || 0;
      setHeaderHeight(height + 8);
    };

    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);

    let observer;
    if (window.ResizeObserver && headerRef.current) {
      observer = new ResizeObserver(updateHeaderHeight);
      observer.observe(headerRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateHeaderHeight);
      if (observer) observer.disconnect();
    };
  }, [isInterviewMode, showContextPanel]);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('manlv_token');
      if (!token) return;

      try {
        const res = await fetch(`${apiBaseUrl}/api/user`, {
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
  }, [apiBaseUrl]);

  const getTime = () => new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  const userAvatarText = (userName || '我').trim().slice(0, 1);

  const contextChips = [
    { label: '冲突检查', msg: '请先检查我的面试安排是否冲突，再给出按优先级排序的处理建议。' },
    { label: '7天计划', msg: '请按“今天到未来7天”给我生成备考计划，每天列3项任务。' },
    { label: '城市天气', msg: '请查询我下一场面试城市明天的天气，并给出交通和穿搭建议。' },
    { label: '1分钟自介', msg: '请帮我生成一版1分钟自我介绍，突出我的专业优势和项目亮点。' }
  ];

  const handleSend = async (text = inputValue) => {
    if (!text.trim()) return;

    if (!isInterviewMode) setShowContextPanel(false);
    setMessages((prev) => [...prev, { role: 'user', content: text, time: getTime() }]);
    setInputValue('');
    setIsTyping(true);

    if (isInterviewMode && sessionId) {
      try {
        const result = await MockInterviewService.submitAnswer(sessionId, text);
        setMessages((prev) => [
          ...prev,
          {
            role: 'ai',
            content: result.feedback || result.next_question || '收到，我们继续下一题。',
            time: getTime(),
            isInterview: true
          }
        ]);
      } catch (error) {
        console.error('[模拟面试对话失败]', error);
        setMessages((prev) => [
          ...prev,
          {
            role: 'ai',
            content: '面试系统暂时不可用，请稍后重试。',
            time: getTime(),
            isInterview: true
          }
        ]);
      } finally {
        setIsTyping(false);
      }
      return;
    }

    try {
      const token = localStorage.getItem('manlv_token');
      if (!token) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'ai',
            content: '当前登录状态已失效，请重新登录后再试。',
            time: getTime()
          }
        ]);
        setIsTyping(false);
        return;
      }

      const msgId = `ai_${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: msgId,
          role: 'ai',
          content: '',
          thinking: '',
          usedTools: [],
          time: getTime()
        }
      ]);
      setIsTyping(false);

      const response = await fetch(`${apiBaseUrl}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: text })
      });

      if (!response.ok) throw new Error('AI 服务暂时不可用');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const raw = line.replace('data:', '').trim();

          try {
            const parsed = JSON.parse(raw);

            if (parsed.type === 'thinking') {
              const toolLabel =
                {
                  get_user_profile: '读取用户资料',
                  list_interviews: '查询面试安排',
                  create_interview: '创建面试记录',
                  analyze_schedule_conflicts: '分析行程冲突',
                  get_weather: '查询天气'
                }[parsed.tool] || parsed.tool;

              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === msgId ? { ...msg, thinking: `正在调用工具：${toolLabel}` } : msg
                )
              );
            }

            if (parsed.type === 'text') {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === msgId ? { ...msg, content: msg.content + parsed.content, thinking: '' } : msg
                )
              );
            }

            if (parsed.type === 'done') {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === msgId ? { ...msg, usedTools: parsed.usedTools || [], thinking: '' } : msg
                )
              );
            }

            if (parsed.type === 'error') {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === msgId ? { ...msg, content: `出错了：${parsed.message}`, thinking: '' } : msg
                )
              );
            }
          } catch (e) {
            // ignore parse error
          }
        }
      }
    } catch (error) {
      console.error('[通用 AI 对话失败]', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: `AI 服务调用失败：${error.message || '未知错误'}`,
          time: getTime()
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFinishInterview = async () => {
    if (!isInterviewMode || !sessionId) return;

    try {
      setIsTyping(true);
      const result = await MockInterviewService.finishInterview(sessionId);
      const scoreMessage = `
【面试评估报告】

总体评分：${result.total_score || 0}/100
等级：${result.equivalent_level || '良好'}

详细反馈：
${result.feedback || '整体表现不错，建议继续巩固知识点并强化表达。'}

后续建议：
${(result.suggestions || ['补齐高频问题回答模板', '复盘本次薄弱项', '做一次计时模拟']).map((s, i) => `${i + 1}. ${s}`).join('\n')}
      `.trim();

      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: scoreMessage,
          time: getTime(),
          isInterview: true
        }
      ]);
    } catch (error) {
      console.error('[面试结束失败]', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: '面试评分系统暂时不可用。',
          time: getTime(),
          isInterview: true
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`page chat-page ${isInterviewMode ? 'interview-mode' : ''}`}>
      <div className="chat-header chat-header-pro" ref={headerRef}>
        <div className="chat-header-top">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <BackIcon size={18} />
          </button>
          <div className={`ai-avatar ${isInterviewMode ? 'minimal' : ''}`}>
            {isInterviewMode ? <span className="ai-avatar-text">AI</span> : <RobotOne theme="outline" size="18" fill="#333" />}
            <div className="ai-status-dot" />
          </div>
          <div className="ai-info">
            <div className="ai-name">{isInterviewMode ? `${schoolName || ''} ${majorName || ''}`.trim() : '漫旅 AI'}</div>
            <div className="ai-desc">{isInterviewMode ? '模拟面试模式' : '你的保研智能助手'}</div>
          </div>
          {!isInterviewMode && (
            <button className="chat-chip-toggle" onClick={() => setShowContextPanel((v) => !v)}>
              {showContextPanel ? '收起' : '灵感'}
            </button>
          )}
        </div>

        {!isInterviewMode && (
          <div className={`context-strip context-strip-pro ${showContextPanel ? 'expanded' : ''}`}>
            {contextChips.map((chip) => (
              <button key={chip.label} className="context-chip" onClick={() => handleSend(chip.msg)}>
                {chip.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="chat-messages" style={{ paddingTop: `${headerHeight}px`, paddingBottom: `${inputAreaHeight}px` }}>
        {messages.map((msg, index) => (
          <div key={msg.id || index} className={`msg ${msg.role}`}>
            <div className="msg-content">
              {msg.role === 'ai' && (
                <div className="msg-ai-meta">
                  <div className="msg-avatar-mini">
                    {isInterviewMode ? <span className="ai-avatar-text">AI</span> : <RobotOne theme="outline" size="12" fill="#333" />}
                  </div>
                  <span className="msg-ai-name">{isInterviewMode ? 'Interview AI' : 'ManLv AI'}</span>
                </div>
              )}
              {msg.role === 'user' && (
                <div className="msg-user-meta">
                  <span className="msg-user-name">你</span>
                  <div className="msg-avatar-mini user">{userAvatarText}</div>
                </div>
              )}
              {msg.thinking && <div className="msg-thinking">{msg.thinking}</div>}
              {msg.content?.trim() ? (
                <div className="msg-bubble">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                </div>
              ) : null}

              {msg.suggestions && (
                <div className="suggest-chips">
                  {msg.suggestions.map((s, i) => (
                    <button key={i} className="suggest-chip" onClick={() => handleSend(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {msg.usedTools && msg.usedTools.length > 0 && (
                <div className="suggest-chips">
                  {msg.usedTools.map((tool, i) => (
                    <span key={`${tool.name}-${i}`} className="suggest-chip">
                      {tool.ok ? '已调用' : '失败'} · {tool.name}
                    </span>
                  ))}
                </div>
              )}

              <div className="msg-time">{msg.time}</div>
            </div>

          </div>
        ))}

        {isTyping && isInterviewMode && (
          <div className="msg ai">
            <div className="msg-content">
              <div className="msg-ai-meta">
                <div className="msg-avatar-mini">
                  {isInterviewMode ? <span className="ai-avatar-text">AI</span> : <RobotOne theme="outline" size="12" fill="#333" />}
                </div>
                <span className="msg-ai-name">{isInterviewMode ? 'Interview AI' : 'ManLv AI'}</span>
              </div>
              <div className="typing-indicator">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area" ref={inputAreaRef}>
        {!isInterviewMode && (
          <div className="chat-input-tools">
            <button className="chat-tool-btn" type="button">
              附件
            </button>
            <button className="chat-tool-btn" type="button">
              语音
            </button>
            <button className="chat-tool-btn" type="button" onClick={() => setInputValue('')}>
              清空
            </button>
          </div>
        )}

        <div className="chat-input-row">
          <textarea
            className="chat-input"
            placeholder={isInterviewMode ? '请输入你的面试回答...' : '输入问题，让漫旅 AI 帮你分析...'}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={1}
          />
          <button className="send-btn" onClick={() => handleSend()} disabled={!inputValue.trim()}>
            <SendIcon size={16} />
          </button>
        </div>

        {isInterviewMode && (
          <div className="interview-end-wrap">
            <button className="interview-end-btn" onClick={handleFinishInterview}>
              结束面试并查看评估
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatPage;
