import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BackIcon, SendIcon } from '../components/Icons';
import { RobotOne } from '@icon-park/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function ChatPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

  const isInterviewMode = location.state?.interviewMode || false;
  const schoolName = location.state?.schoolName;
  const majorName = location.state?.majorName;
  const interviewCity = location.state?.interviewCity;
  const interviewType = location.state?.interviewType;
  const difficulty = location.state?.difficulty || '中级';
  const resumeContent = location.state?.resumeContent;

  const [userName, setUserName] = useState('我');
  const [messages, setMessages] = useState(
    isInterviewMode
      ? []
      : [{
          role: 'ai',
          content:
            '你好，我是漫旅 AI。\n\n我可以帮你做行程冲突分析、面试准备、城市备考和情绪疏导。你可以直接提问，或先从下方快捷问题开始。',
          time: '09:24',
          suggestions: [
            '帮我检查面试安排里是否有时间冲突，并给出解决方案',
            '请根据我的安排生成未来7天备考计划（按天列出）',
            '查一下我下一场面试城市明天的天气，并给出穿搭建议'
          ]
        }]
  );
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showContextPanel, setShowContextPanel] = useState(!isInterviewMode);
  const hasAutoStartedInterviewRef = useRef(false);

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
  const interviewContext = {
    school_name: schoolName || '',
    major_name: majorName || '',
    interview_city: interviewCity || '',
    interview_type: interviewType || '',
    difficulty,
    resume_content: resumeContent || ''
  };

  const contextChips = [
    { label: '冲突检查', msg: '请先检查我的面试安排是否冲突，再给出按优先级排序的处理建议。' },
    { label: '7天计划', msg: '请按“今天到未来7天”给我生成备考计划，每天列3项任务。' },
    { label: '城市天气', msg: '请查询我下一场面试城市明天的天气，并给出交通和穿搭建议。' },
    { label: '1分钟自介', msg: '请帮我生成一版1分钟自我介绍，突出我的专业优势和项目亮点。' }
  ];

  const buildApiMessages = (text) => {
    const history = messages
      .filter((msg) => (msg.role === 'user' || msg.role === 'ai') && msg.content?.trim())
      .map((msg) => ({
        role: msg.role === 'ai' ? 'assistant' : 'user',
        content: msg.content
      }));

    return [...history, { role: 'user', content: text }];
  };

  const requestAiReply = async ({ text, appendUser = true }) => {
    if (!text.trim()) return;

    if (!isInterviewMode) setShowContextPanel(false);
    if (appendUser) {
      setMessages((prev) => [...prev, { role: 'user', content: text, time: getTime() }]);
    }
    setInputValue('');
    setIsTyping(true);

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

      const response = await fetch(`${apiBaseUrl}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          mode: isInterviewMode ? 'interviewer' : 'advisor',
          messages: buildApiMessages(text),
          context: isInterviewMode ? interviewContext : undefined
        })
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
              setIsTyping(false); // 只要开始思考，就关闭基础加载状态
              const toolLabel =
                {
                  get_user_profile: '分析用户资料',
                  list_interviews: '查询面试安排',
                  create_interview: '创建面试记录',
                  analyze_schedule_conflicts: '分析行程冲突',
                  get_weather: '查询天气',
                  search_hotels: '搜索周边酒店'
                }[parsed.tool] || parsed.tool;

              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === msgId ? { ...msg, thinking: toolLabel } : msg
                )
              );
            }

            if (parsed.type === 'text') {
              setIsTyping(false);
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === msgId ? { ...msg, content: msg.content + parsed.content, thinking: '', isStreaming: true } : msg
                )
              );
            }

            if (parsed.type === 'done') {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === msgId ? { ...msg, usedTools: parsed.usedTools || [], thinking: '', isStreaming: false } : msg
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

  const handleSend = async (text = inputValue) => {
    await requestAiReply({ text, appendUser: true });
  };

  useEffect(() => {
    if (!isInterviewMode || hasAutoStartedInterviewRef.current) return;
    hasAutoStartedInterviewRef.current = true;
    requestAiReply({ text: '开始面试', appendUser: false });
  }, [isInterviewMode]);

  const handleFinishInterview = async () => {
    if (!isInterviewMode) return;
    await requestAiReply({
      text: '面试结束，请根据我们刚才的完整面试过程输出结构化复盘报告，并严格遵守你的复盘报告格式。',
      appendUser: true
    });
  };

  return (
    <div className={`page chat-page ${isInterviewMode ? 'interview-mode' : ''}`}>
      <div className="chat-header chat-header-pro" ref={headerRef}>
        <div className="chat-header-top">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <BackIcon size={18} />
          </button>
          <div className={`ai-avatar ${isInterviewMode ? 'minimal' : ''}`}>
            <img src="/ai-avatar-monkey.png" alt="漫旅 AI" className="ai-avatar-img" />
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
                    <img src="/ai-avatar-monkey.png" alt="漫旅 AI" className="ai-avatar-mini-img" />
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

              {/* 合并加载/思考/内容状态 */}
              {msg.role === 'ai' && !msg.content?.trim() ? (
                <div className="typing-indicator-pro">
                  <div className="typing-bars">
                    <div className="typing-bar" />
                    <div className="typing-bar" />
                    <div className="typing-bar" />
                    <div className="typing-bar" />
                  </div>
                  <span className="typing-text">
                    {msg.thinking ? `正在${msg.thinking}...` : 'AI 正在思考...'}
                  </span>
                </div>
              ) : msg.content?.trim() ? (
                <div className={`msg-bubble ${msg.role === 'user' ? 'user' : ''} ${msg.isStreaming ? 'streaming' : ''}`}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  {msg.isStreaming && <span className="streaming-cursor" />}
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
