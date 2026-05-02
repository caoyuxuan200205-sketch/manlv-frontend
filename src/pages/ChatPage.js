import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BackIcon, SendIcon, DownloadIcon, CopyIcon } from '../components/Icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import API_BASE_URL from '../config/api';
import {
  consumePendingFeishuChatIntent,
  fetchFeishuStatus,
  getDefaultFeishuRedirectUri,
  savePendingFeishuChatIntent,
  startFeishuAuth
} from '../services/feishuAuth';
import '../styles/ChatPage.css';

const CODE_LANGUAGE_LABELS = {
  js: 'JavaScript',
  jsx: 'React JSX',
  ts: 'TypeScript',
  tsx: 'React TSX',
  json: 'JSON',
  prisma: 'Prisma',
  sql: 'SQL',
  bash: 'Bash',
  sh: 'Shell',
  http: 'HTTP',
  html: 'HTML',
  css: 'CSS',
  xml: 'XML',
  yaml: 'YAML',
  yml: 'YAML',
  md: 'Markdown',
  text: 'Text'
};

const extractTextContent = (value) =>
  React.Children.toArray(value)
    .map((child) => {
      if (typeof child === 'string') return child;
      if (typeof child === 'number') return String(child);
      if (React.isValidElement(child)) return extractTextContent(child.props.children);
      return '';
    })
    .join('');

const getLanguageLabel = (language) => {
  const normalized = String(language || 'text').toLowerCase();
  return CODE_LANGUAGE_LABELS[normalized] || normalized.toUpperCase();
};

const TOOL_EVENT_COPY = {
  get_user_profile: {
    label: '读取你的资料',
    start: '正在读取你的个人信息与长期记忆',
    success: '已完成资料读取',
    failure: '资料读取失败，已继续尝试回答'
  },
  list_interviews: {
    label: '检查面试安排',
    start: '正在检查你的面试与夏令营安排',
    success: '已获取行程安排',
    failure: '行程读取失败，无法完整检查冲突'
  },
  create_interview: {
    label: '写入面试记录',
    start: '正在保存新的面试安排',
    success: '已写入面试记录',
    failure: '面试记录写入失败'
  },
  analyze_schedule_conflicts: {
    label: '分析行程冲突',
    start: '正在分析时间、城市与路线冲突',
    success: '已完成冲突分析',
    failure: '冲突分析失败，建议稍后重试'
  },
  get_weather: {
    label: '查询天气信息',
    start: '正在查询目的地天气情况',
    success: '已获取天气信息',
    failure: '天气查询失败'
  },
  search_hotels: {
    label: '筛选附近住宿',
    start: '正在搜索面试地点附近住宿',
    success: '已获取住宿候选结果',
    failure: '住宿搜索失败'
  },
  web_search: {
    label: '联网补充信息',
    start: '正在联网搜索最新信息',
    success: '已补充最新公开信息',
    failure: '联网搜索失败'
  },
  bazi_reading: {
    label: '传统文化陪伴分析',
    start: '正在整理出生信息并准备八字解读',
    success: '已完成传统文化陪伴分析准备',
    failure: '传统文化陪伴分析失败'
  },
  lark_auth_status: {
    label: '检查飞书连接状态',
    start: '正在确认飞书授权状态',
    success: '已确认飞书连接状态',
    failure: '飞书状态检查失败'
  },
  lark_auth_login: {
    label: '发起飞书授权',
    start: '正在发起飞书授权流程',
    success: '已完成飞书授权发起',
    failure: '飞书授权发起失败'
  },
  lark_docs_fetch: {
    label: '读取飞书文档',
    start: '正在读取飞书文档内容',
    success: '已读取飞书文档',
    failure: '飞书文档读取失败'
  },
  lark_docs_create: {
    label: '创建飞书文档',
    start: '正在创建飞书文档',
    success: '已创建飞书文档',
    failure: '飞书文档创建失败'
  },
  lark_docs_update: {
    label: '更新飞书文档',
    start: '正在更新飞书文档内容',
    success: '已更新飞书文档',
    failure: '飞书文档更新失败'
  },
  lark_calendar_list: {
    label: '查询飞书日程',
    start: '正在读取飞书日程安排',
    success: '已获取飞书日程',
    failure: '飞书日程读取失败'
  },
  lark_calendar_create: {
    label: '创建飞书日程',
    start: '正在创建飞书日程',
    success: '已创建飞书日程',
    failure: '飞书日程创建失败'
  },
  lark_drive_list: {
    label: '读取飞书云盘',
    start: '正在读取飞书云盘文件',
    success: '已获取飞书云盘文件列表',
    failure: '飞书云盘读取失败'
  }
};

const createExecutionStep = ({ key, title, detail, status = 'pending', kind = 'system', toolName = null }) => ({
  key,
  title,
  detail,
  status,
  kind,
  toolName
});

const cloneExecutionSteps = (steps) => (Array.isArray(steps) ? steps.map((step) => ({ ...step })) : []);

const getToolEventCopy = (toolName) =>
  TOOL_EVENT_COPY[toolName] || {
    label: '调用外部能力',
    start: `正在执行 ${toolName}`,
    success: `${toolName} 执行完成`,
    failure: `${toolName} 执行失败`
  };

const formatExecutionSummary = (steps, isStreaming) => {
  const total = steps.length;
  const completed = steps.filter((step) => step.status === 'completed').length;
  const failed = steps.filter((step) => step.status === 'failed').length;
  const running = steps.find((step) => step.status === 'in_progress');

  if (running) return `${running.title}中`;
  if (isStreaming) return '正在组织最终回答';
  if (failed > 0) return `已完成 ${completed}/${total} 步，${failed} 步未成功`;
  if (total === 0) return '正在准备回答';
  return `已完成 ${completed}/${total} 步`;
};

const buildToolUsageFromSteps = (steps) => {
  const toolMap = new Map();
  let sequence = 0;

  (steps || []).forEach((step) => {
    if (step.kind !== 'tool' || !step.toolName) return;

    sequence += 1;
    const copy = getToolEventCopy(step.toolName);
    const existing = toolMap.get(step.toolName) || {
      toolName: step.toolName,
      label: copy.label,
      callCount: 0,
      completedCount: 0,
      failedCount: 0,
      inProgressCount: 0,
      lastStatus: step.status,
      lastDetail: step.detail,
      lastOrder: 0
    };

    existing.callCount += 1;
    if (step.status === 'completed') existing.completedCount += 1;
    if (step.status === 'failed') existing.failedCount += 1;
    if (step.status === 'in_progress') existing.inProgressCount += 1;
    existing.lastStatus = step.status;
    existing.lastDetail = step.detail;
    existing.lastOrder = sequence;

    toolMap.set(step.toolName, existing);
  });

  return Array.from(toolMap.values()).sort((a, b) => {
    if (a.inProgressCount > 0 && b.inProgressCount === 0) return -1;
    if (a.inProgressCount === 0 && b.inProgressCount > 0) return 1;
    return b.lastOrder - a.lastOrder;
  });
};

const formatToolLedgerSummary = (toolUsage) => {
  if (!toolUsage.length) return '暂无工具调用';

  const runningCount = toolUsage.filter((item) => item.inProgressCount > 0).length;
  const leadToolName = toolUsage[0]?.toolName || toolUsage[0]?.label || '工具';
  const prefix = runningCount > 0 ? '调用中' : '已调用';

  if (toolUsage.length === 1) return `${prefix} · ${leadToolName}`;
  return `${prefix} · ${leadToolName} 等 ${toolUsage.length} 个工具`;
};

const finalizeExecutionSteps = (steps, hasContent) => {
  const nextSteps = cloneExecutionSteps(steps);
  const understandingStep = nextSteps.find((step) => step.key === 'understand');
  if (understandingStep && understandingStep.status === 'in_progress') {
    understandingStep.status = 'completed';
    understandingStep.detail = '已完成任务理解';
  }

  const synthesisStep = nextSteps.find((step) => step.key === 'synthesis');
  if (hasContent) {
    if (synthesisStep) {
      synthesisStep.status = 'completed';
      synthesisStep.detail = '已生成最终回答';
    } else {
      nextSteps.push(
        createExecutionStep({
          key: 'synthesis',
          title: '生成回答',
          detail: '已生成最终回答',
          status: 'completed'
        })
      );
    }
  }

  return nextSteps.map((step) =>
    step.status === 'in_progress'
      ? {
          ...step,
          status: step.kind === 'tool' ? 'completed' : step.status
        }
      : step
  );
};

const copyTextToClipboard = async (text) => {
  if (!text) return;

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
};

const extractHastText = (node) => {
  if (!node) return '';
  if (node.type === 'text') return node.value || '';
  if (!Array.isArray(node.children)) return '';
  return node.children.map((child) => extractHastText(child)).join('');
};

const normalizeCellText = (value) => String(value || '').replace(/\s+/g, ' ').trim();

const extractTableRows = (tableNode) => {
  if (!tableNode || !Array.isArray(tableNode.children)) return [];

  const sections = tableNode.children.filter(
    (child) => child?.type === 'element' && ['thead', 'tbody', 'tfoot'].includes(child.tagName)
  );

  return sections.flatMap((section) =>
    (section.children || [])
      .filter((row) => row?.type === 'element' && row.tagName === 'tr')
      .map((row) =>
        (row.children || [])
          .filter((cell) => cell?.type === 'element' && ['th', 'td'].includes(cell.tagName))
          .map((cell) => normalizeCellText(extractHastText(cell)))
      )
      .filter((row) => row.length > 0)
  );
};

const toMarkdownTable = (rows) => {
  if (!Array.isArray(rows) || rows.length === 0) return '';

  const maxColumns = Math.max(...rows.map((row) => row.length), 0);
  if (!maxColumns) return '';

  const normalizedRows = rows.map((row) =>
    Array.from({ length: maxColumns }, (_, index) => (row[index] || '').replace(/\|/g, '\\|'))
  );

  const [headerRow, ...bodyRows] = normalizedRows;
  const separator = Array.from({ length: maxColumns }, () => '---');
  const lines = [
    `| ${headerRow.join(' | ')} |`,
    `| ${separator.join(' | ')} |`,
    ...bodyRows.map((row) => `| ${row.join(' | ')} |`)
  ];

  return lines.join('\n');
};

const toTsvTable = (rows) =>
  (Array.isArray(rows) ? rows : [])
    .map((row) => row.map((cell) => String(cell || '').replace(/\t/g, ' ')).join('\t'))
    .join('\n');

function MarkdownCodeBlock({ children }) {
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef(null);
  const codeElement = React.Children.toArray(children)[0];
  const className = codeElement?.props?.className || '';
  const languageMatch = className.match(/language-([\w-]+)/);
  const language = languageMatch?.[1] || 'text';
  const rawCode = extractTextContent(codeElement?.props?.children).replace(/\n$/, '');

  useEffect(() => () => {
    if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
  }, []);

  const handleCopy = async () => {
    if (!rawCode) return;

    try {
      await copyTextToClipboard(rawCode);
      setCopied(true);
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
      copyTimerRef.current = window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error('复制代码失败:', error);
    }
  };

  return (
    <div className="md-code-block">
      <div className="md-code-toolbar">
        <span className="md-code-language">{getLanguageLabel(language)}</span>
        <div className="md-code-actions">
          <button
            type="button"
            className="md-code-icon-btn is-disabled"
            disabled
            aria-label="下载代码（暂未开放）"
            title="下载代码（暂未开放）"
          >
            <DownloadIcon size={18} />
          </button>
          <button
            type="button"
            className={`md-code-icon-btn${copied ? ' is-success' : ''}`}
            onClick={handleCopy}
            aria-label={copied ? '已复制代码' : '复制代码'}
            title={copied ? '已复制代码' : '复制代码'}
          >
            <CopyIcon size={18} />
          </button>
        </div>
      </div>
      <pre>
        <code className={className}>{codeElement?.props?.children}</code>
      </pre>
    </div>
  );
}

function MarkdownTableBlock({ node, children }) {
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef(null);
  const tableRows = extractTableRows(node);

  useEffect(() => () => {
    if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
  }, []);

  const handleCopyTable = async () => {
    if (!tableRows.length) return;

    const markdown = toMarkdownTable(tableRows);
    const tsv = toTsvTable(tableRows);

    try {
      if (navigator.clipboard?.write && window.ClipboardItem && markdown && tsv) {
        const htmlTable = `
          <table>
            ${tableRows
              .map((row, rowIndex) => {
                const tag = rowIndex === 0 ? 'th' : 'td';
                return `<tr>${row
                  .map((cell) => `<${tag}>${String(cell || '')
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')}</${tag}>`)
                  .join('')}</tr>`;
              })
              .join('')}
          </table>
        `.trim();

        await navigator.clipboard.write([
          new window.ClipboardItem({
            'text/plain': new Blob([tsv], { type: 'text/plain' }),
            'text/html': new Blob([htmlTable], { type: 'text/html' })
          })
        ]);
      } else {
        await copyTextToClipboard(tsv || markdown);
      }

      setCopied(true);
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
      copyTimerRef.current = window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error('复制表格失败:', error);
    }
  };

  return (
    <div className="md-table-block">
      <div className="md-table-toolbar">
        <span className="md-table-label">表格</span>
        <div className="md-code-actions">
          <button
            type="button"
            className={`md-code-icon-btn${copied ? ' is-success' : ''}`}
            onClick={handleCopyTable}
            aria-label={copied ? '已复制表格' : '复制表格'}
            title={copied ? '已复制表格' : '复制表格'}
          >
            <CopyIcon size={18} />
          </button>
        </div>
      </div>
      <div className="md-table-scroll">
        <table>{children}</table>
      </div>
    </div>
  );
}

const VOICE_DEMO_TEXTS = [
  '帮我查一下同济大学建筑学院 2026 年夏令营通知有没有更新，并附上官网链接。',
  '请根据我下一场南京的面试安排，给我一份今晚到明早的冲刺清单。',
  '帮我看看上海明天的天气，再推荐一套适合面试的穿搭。'
];

const BAZI_TRIGGER_PROMPT =
  '我想开启传统文化陪伴模式，请只在这个模式下使用八字分析。请先收集我的公历/农历生日、出生时辰、性别、出生地，以及我最想咨询的方向，并先明确说明这仅供传统文化学习与娱乐参考，不作为现实决策依据。';

const splitVoiceDraft = (text) => {
  const parts = text.match(/.{1,10}/g);
  return Array.isArray(parts) && parts.length > 0 ? parts : [text];
};

function ChatPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const apiBaseUrl = API_BASE_URL;

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
  const [isBaziPresetSelected, setIsBaziPresetSelected] = useState(false);
  const [showContextPanel, setShowContextPanel] = useState(!isInterviewMode);
  const [voiceState, setVoiceState] = useState('idle');
  const [voiceDraft, setVoiceDraft] = useState('');
  const [feishuStatus, setFeishuStatus] = useState(null);
  const [pageToast, setPageToast] = useState('');
  const [feishuActionLoading, setFeishuActionLoading] = useState(false);
  const hasAutoStartedInterviewRef = useRef(false);
  const handledFeishuResultRef = useRef('');

  const messagesEndRef = useRef(null);
  const inputAreaRef = useRef(null);
  const textareaRef = useRef(null);
  const headerRef = useRef(null);
  const voiceTimerRef = useRef([]);
  const voiceDemoIndexRef = useRef(0);
  const [inputAreaHeight, setInputAreaHeight] = useState(120);
  const [headerHeight, setHeaderHeight] = useState(isInterviewMode ? 76 : 94);

  const hasUserMessage = messages.some((msg) => msg.role === 'user');
  const latestUserMessageText = useMemo(
    () => [...messages].reverse().find((msg) => msg.role === 'user' && msg.content?.trim())?.content?.trim() || '',
    [messages]
  );

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

  useEffect(() => () => {
    voiceTimerRef.current.forEach((timer) => window.clearTimeout(timer));
    voiceTimerRef.current = [];
  }, []);

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
        if (user?.feishu) setFeishuStatus(user.feishu);
      } catch (e) {
        console.error(e);
      }
    };
    fetchUser();
  }, [apiBaseUrl]);

  const handleConnectFeishu = async () => {
    setFeishuActionLoading(true);
    try {
      const redirectUri = getDefaultFeishuRedirectUri('chat', '/chat');
      const draftText = inputValue.trim();
      const pendingText = draftText || latestUserMessageText;
      if (pendingText) {
        savePendingFeishuChatIntent({
          text: pendingText,
          appendUser: Boolean(draftText)
        });
      }
      const payload = await startFeishuAuth({ redirectUri });
      window.location.href = payload.authorizeUrl;
    } catch (error) {
      showPageToast(error.message || '飞书授权暂时不可用');
    } finally {
      setFeishuActionLoading(false);
    }
  };

  const getTime = useCallback(
    () => new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    []
  );
  const userAvatarText = (userName || '我').trim().slice(0, 1);
  const interviewContext = useMemo(
    () => ({
      school_name: schoolName || '',
      major_name: majorName || '',
      interview_city: interviewCity || '',
      interview_type: interviewType || '',
      difficulty,
      resume_content: resumeContent || ''
    }),
    [difficulty, interviewCity, interviewType, majorName, resumeContent, schoolName]
  );

  const contextChips = [
    { label: '冲突检查', msg: '请先检查我的面试安排是否冲突，再给出按优先级排序的处理建议。' },
    { label: '7天计划', msg: '请按“今天到未来7天”给我生成备考计划，每天列3项任务。' },
    { label: '城市天气', msg: '请查询我下一场面试城市明天的天气，并给出交通和穿搭建议。' },
    { label: '1分钟自介', msg: '请帮我生成一版1分钟自我介绍，突出我的专业优势和项目亮点。' }
  ];

  const clearVoiceSimulation = () => {
    voiceTimerRef.current.forEach((timer) => window.clearTimeout(timer));
    voiceTimerRef.current = [];
  };

  const showPageToast = useCallback((message) => {
    if (!message) return;
    setPageToast(message);
    window.setTimeout(() => setPageToast(''), 2600);
  }, []);

  const refreshFeishuStatus = useCallback(async ({ silent = false } = {}) => {
    try {
      const latestStatus = await fetchFeishuStatus();
      setFeishuStatus(latestStatus);
      return latestStatus;
    } catch (error) {
      if (!silent) {
        showPageToast(error.message || '获取飞书状态失败');
      }
      return null;
    }
  }, [showPageToast]);

  const toggleTimeline = (messageId) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, timelineExpanded: !msg.timelineExpanded }
          : msg
      )
    );
  };

  const toggleToolLedger = (messageId) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, toolLedgerExpanded: !msg.toolLedgerExpanded }
          : msg
      )
    );
  };

  const buildApiMessages = useCallback((text) => {
    const history = messages
      .filter((msg) => (msg.role === 'user' || msg.role === 'ai') && msg.content?.trim())
      .map((msg) => ({
        role: msg.role === 'ai' ? 'assistant' : 'user',
        content: msg.content
      }));

    return [...history, { role: 'user', content: text }];
  }, [messages]);

  const requestAiReply = useCallback(async ({ text, appendUser = true }) => {
    if (!text.trim()) return;

    if (!isInterviewMode) setShowContextPanel(false);
    if (appendUser) {
      setMessages((prev) => [...prev, { role: 'user', content: text, time: getTime() }]);
    }
    setInputValue('');
    setIsBaziPresetSelected(false);

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
        return;
      }

      const msgId = `ai_${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: msgId,
          role: 'ai',
          content: '',
          toolLedgerExpanded: false,
          executionSteps: [
            createExecutionStep({
              key: 'understand',
              title: '理解任务',
              detail: '正在分析你的问题与上下文',
              status: 'in_progress'
            })
          ],
          timelineExpanded: true,
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

            if (parsed.type === 'thinking' || parsed.type === 'tool_start') {
              const { label, start } = getToolEventCopy(parsed.tool);
              setMessages((prev) =>
                prev.map((msg) => {
                  if (msg.id !== msgId) return msg;

                  const nextSteps = cloneExecutionSteps(msg.executionSteps);
                  const understandingStep = nextSteps.find((step) => step.key === 'understand');
                  if (understandingStep && understandingStep.status === 'in_progress') {
                    understandingStep.status = 'completed';
                    understandingStep.detail = '已理解你的问题与当前上下文';
                  }

                  const hasSameRunningTool = nextSteps.some(
                    (step) =>
                      step.kind === 'tool' &&
                      step.toolName === parsed.tool &&
                      step.status === 'in_progress'
                  );

                  if (!hasSameRunningTool) {
                    nextSteps.push(
                      createExecutionStep({
                        key: `tool-${parsed.tool}-${Date.now()}-${nextSteps.length}`,
                        title: label,
                        detail: start,
                        status: 'in_progress',
                        kind: 'tool',
                        toolName: parsed.tool
                      })
                    );
                  }

                  return {
                    ...msg,
                    executionSteps: nextSteps,
                    timelineExpanded: true
                  };
                })
              );
            }

            if (parsed.type === 'tool_result') {
              const { success, failure } = getToolEventCopy(parsed.tool);
              setMessages((prev) =>
                prev.map((msg) => {
                  if (msg.id !== msgId) return msg;

                  const nextSteps = cloneExecutionSteps(msg.executionSteps);
                  const targetIndex = [...nextSteps]
                    .reverse()
                    .findIndex(
                      (step) =>
                        step.kind === 'tool' &&
                        step.toolName === parsed.tool &&
                        step.status === 'in_progress'
                    );

                  if (targetIndex !== -1) {
                    const realIndex = nextSteps.length - 1 - targetIndex;
                    nextSteps[realIndex] = {
                      ...nextSteps[realIndex],
                      status: parsed.ok ? 'completed' : 'failed',
                      detail: parsed.ok ? success : failure
                    };
                  }

                  return {
                    ...msg,
                    executionSteps: nextSteps
                  };
                })
              );
            }

            if (parsed.type === 'text') {
              setMessages((prev) =>
                prev.map((msg) => {
                  if (msg.id !== msgId) return msg;

                  const nextSteps = cloneExecutionSteps(msg.executionSteps);
                  const understandingStep = nextSteps.find((step) => step.key === 'understand');
                  if (understandingStep && understandingStep.status === 'in_progress') {
                    understandingStep.status = 'completed';
                    understandingStep.detail = '已理解你的问题与当前上下文';
                  }

                  const synthesisStep = nextSteps.find((step) => step.key === 'synthesis');
                  if (synthesisStep) {
                    synthesisStep.status = 'in_progress';
                    synthesisStep.detail = '正在整合信息并生成回答';
                  } else {
                    nextSteps.push(
                      createExecutionStep({
                        key: 'synthesis',
                        title: '生成回答',
                        detail: '正在整合信息并生成回答',
                        status: 'in_progress'
                      })
                    );
                  }

                  return {
                    ...msg,
                    content: msg.content + parsed.content,
                    executionSteps: nextSteps,
                    isStreaming: true
                  };
                })
              );
            }

            if (parsed.type === 'done') {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === msgId
                    ? {
                        ...msg,
                        executionSteps: finalizeExecutionSteps(msg.executionSteps, Boolean(msg.content?.trim())),
                        isStreaming: false
                      }
                    : msg
                )
              );
            }

            if (parsed.type === 'error') {
              setMessages((prev) =>
                prev.map((msg) => {
                  if (msg.id !== msgId) return msg;
                  const nextSteps = cloneExecutionSteps(msg.executionSteps).map((step) =>
                    step.status === 'in_progress'
                      ? { ...step, status: 'failed', detail: '执行中断，请稍后重试' }
                      : step
                  );
                  return {
                    ...msg,
                    content: `出错了：${parsed.message}`,
                    executionSteps: nextSteps,
                    isStreaming: false
                  };
                })
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
    }
  }, [apiBaseUrl, buildApiMessages, getTime, interviewContext, isInterviewMode]);

  const handleSend = async (text = inputValue) => {
    await requestAiReply({ text, appendUser: true });
  };

  const handleVoiceSimulation = () => {
    if (voiceState !== 'idle') {
      clearVoiceSimulation();
      setVoiceState('idle');
      setVoiceDraft('');
      return;
    }

    const transcript = VOICE_DEMO_TEXTS[voiceDemoIndexRef.current % VOICE_DEMO_TEXTS.length];
    voiceDemoIndexRef.current += 1;
    const chunks = splitVoiceDraft(transcript);

    setShowContextPanel(false);
    setVoiceState('listening');
    setVoiceDraft('正在收听...');

    voiceTimerRef.current.push(window.setTimeout(() => {
      setVoiceState('recognizing');
      setVoiceDraft(chunks[0]);
    }, 900));

    chunks.slice(1).forEach((chunk, index) => {
      voiceTimerRef.current.push(window.setTimeout(() => {
        const partialText = chunks.slice(0, index + 2).join('');
        setVoiceDraft(partialText);
      }, 1700 + (index * 550)));
    });

    const finishDelay = 1700 + (Math.max(chunks.length - 1, 0) * 550) + 500;
    voiceTimerRef.current.push(window.setTimeout(() => {
      setVoiceState('completed');
      setVoiceDraft(transcript);
      setInputValue(transcript);
      textareaRef.current?.focus();
    }, finishDelay));

    voiceTimerRef.current.push(window.setTimeout(() => {
      setVoiceState('idle');
      setVoiceDraft('');
      clearVoiceSimulation();
    }, finishDelay + 1600));
  };

  const voiceButtonText = {
    idle: '语音',
    listening: '录音中',
    recognizing: '识别中',
    completed: '已写入'
  }[voiceState];
  const isBaziPresetActive = isBaziPresetSelected;

  const voiceHintText = {
    listening: '正在模拟录音，请稍候...',
    recognizing: '正在将语音转换成文字...',
    completed: '识别完成，文字已写入输入框'
  }[voiceState];

  useEffect(() => {
    const result = location.state?.feishuAuthResult;
    if (!result) return;

    const signature = `${result.status}:${result.message || ''}`;
    if (handledFeishuResultRef.current === signature) return;
    handledFeishuResultRef.current = signature;

    showPageToast(result.message || (result.status === 'success' ? '飞书授权成功' : '飞书授权未完成'));
    refreshFeishuStatus({ silent: result.status !== 'success' });
    const pendingIntent = consumePendingFeishuChatIntent();

    setMessages((prev) => [
      ...prev,
      {
        role: 'ai',
        content: result.status === 'success'
          ? '飞书已连接成功。接下来你可以继续让我读取飞书文档、查看日程或整理云盘文件。'
          : `飞书授权未完成：${result.message || '请稍后重试或重新发起授权。'}`,
        time: getTime()
      }
    ]);

    navigate(location.pathname, { replace: true, state: null });

    if (result.status === 'success' && pendingIntent?.text) {
      window.setTimeout(() => {
        requestAiReply({
          text: pendingIntent.text,
          appendUser: pendingIntent.appendUser
        });
      }, 180);
    }
  }, [getTime, location.pathname, location.state, navigate, refreshFeishuStatus, requestAiReply, showPageToast]);

  useEffect(() => {
    if (!isInterviewMode || hasAutoStartedInterviewRef.current) return;
    hasAutoStartedInterviewRef.current = true;
    requestAiReply({ text: '开始面试', appendUser: false });
  }, [isInterviewMode, requestAiReply]);

  const handleFinishInterview = async () => {
    if (!isInterviewMode) return;
    await requestAiReply({
      text: '面试结束，请根据我们刚才的完整面试过程输出结构化复盘报告，并严格遵守你的复盘报告格式。',
      appendUser: true
    });
  };

  const handleBaziPresetToggle = () => {
    if (isBaziPresetActive) {
      setIsBaziPresetSelected(false);
      setInputValue('');
      textareaRef.current?.focus();
      return;
    }

    setShowContextPanel(false);
    setIsBaziPresetSelected(true);
    setInputValue(BAZI_TRIGGER_PROMPT);
    textareaRef.current?.focus();
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

        {!isInterviewMode && (
          <div className="feishu-auth-strip">
            <div className="feishu-auth-copy">
              <div className="feishu-auth-title">
                {feishuStatus?.connected ? '飞书已连接' : '连接飞书后可直接读文档和查日程'}
              </div>
              <div className="feishu-auth-desc">
                {feishuStatus?.connected
                  ? (feishuStatus?.profile?.name
                    ? `当前已绑定：${feishuStatus.profile.name}`
                    : '当前漫旅账号已绑定飞书')
                  : '授权完成后会自动返回当前页面'}
              </div>
            </div>
            <button
              type="button"
              className={`feishu-auth-btn ${feishuStatus?.connected ? 'is-connected' : ''}`}
              onClick={feishuStatus?.connected ? () => refreshFeishuStatus() : handleConnectFeishu}
              disabled={feishuActionLoading}
            >
              {feishuActionLoading
                ? '跳转中...'
                : feishuStatus?.connected
                  ? '刷新状态'
                  : '连接飞书'}
            </button>
          </div>
        )}
      </div>

      <div className="chat-messages" style={{ paddingTop: `${headerHeight}px`, paddingBottom: `${inputAreaHeight}px` }}>
        {messages.map((msg, index) => (
          <div key={msg.id || index} className={`msg ${msg.role}`}>
            <div
              className={`msg-content ${
                msg.role === 'ai' && msg.executionSteps?.length > 0 && !msg.content?.trim()
                  ? 'has-pre-response-timeline'
                  : ''
              }`}
            >
              {(() => {
                const toolUsage = buildToolUsageFromSteps(msg.executionSteps);
                const toolLedgerSummary = formatToolLedgerSummary(toolUsage);

                return (
                  <>
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

              {msg.role === 'ai' && msg.executionSteps?.length > 0 && (
                <div className={`execution-timeline ${msg.timelineExpanded ? 'expanded' : ''}`}>
                  <button
                    type="button"
                    className="execution-toggle"
                    onClick={() => toggleTimeline(msg.id)}
                  >
                    <div className="execution-toggle-copy">
                      <span className="execution-toggle-label">执行过程</span>
                      <span className="execution-toggle-summary">
                        {formatExecutionSummary(msg.executionSteps, msg.isStreaming)}
                      </span>
                    </div>
                    <span className="execution-toggle-action">
                      {msg.timelineExpanded ? '收起' : '展开'}
                    </span>
                  </button>

                  {msg.timelineExpanded && (
                    <div className="execution-steps">
                      {msg.executionSteps.map((step) => (
                        <div
                          key={step.key}
                          className={`execution-step is-${step.status}`}
                        >
                          <span className="execution-step-dot" />
                          <div className="execution-step-body">
                            <div className="execution-step-title-row">
                              <span className="execution-step-title">{step.title}</span>
                              <span className="execution-step-status">
                                {step.status === 'completed'
                                  ? '已完成'
                                  : step.status === 'failed'
                                    ? '未完成'
                                    : '进行中'}
                              </span>
                            </div>
                            <div className="execution-step-detail">{step.detail}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {msg.content?.trim() ? (
                <div className={`msg-bubble ${msg.role === 'user' ? 'user' : ''} ${msg.isStreaming ? 'streaming' : ''}`}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      pre: ({ node, children, ...props }) => (
                        <MarkdownCodeBlock {...props}>{children}</MarkdownCodeBlock>
                      ),
                      table: ({ node, children }) => (
                        <MarkdownTableBlock node={node}>{children}</MarkdownTableBlock>
                      ),
                      a: ({ node, children, ...props }) => (
                        <a {...props} target="_blank" rel="noopener noreferrer">{children}</a>
                      )
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                  {msg.isStreaming && <span className="streaming-cursor" />}
                </div>
              ) : msg.role === 'ai' && !msg.executionSteps?.length ? (
                <div className="typing-indicator-pro">
                  <div className="typing-bars">
                    <div className="typing-bar" />
                    <div className="typing-bar" />
                    <div className="typing-bar" />
                    <div className="typing-bar" />
                  </div>
                  <span className="typing-text">AI 正在思考...</span>
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

              {msg.role === 'ai' && toolUsage.length > 0 && (
                <div className="tool-ledger">
                  <button
                    type="button"
                    className="tool-ledger-toggle"
                    onClick={() => toggleToolLedger(msg.id)}
                  >
                    <div className="tool-ledger-copy">
                      <span className="tool-ledger-label">工具调用</span>
                      <span className="tool-ledger-summary">{toolLedgerSummary}</span>
                    </div>
                    <span className="tool-ledger-action">
                      {msg.toolLedgerExpanded ? '收起' : '展开'}
                    </span>
                  </button>

                  {msg.toolLedgerExpanded && (
                    <div className="tool-ledger-list">
                      {toolUsage.map((item) => (
                        <div key={item.toolName} className={`tool-ledger-item is-${item.lastStatus}`}>
                          <span className="tool-ledger-item-name">{item.toolName}</span>
                          <span className="tool-ledger-item-status">
                            {item.inProgressCount > 0
                              ? '进行中'
                              : item.failedCount > 0
                                ? '异常'
                                : '完成'}
                          </span>
                          <span className="tool-ledger-item-count">{item.callCount} 次</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="msg-time">{msg.time}</div>
                  </>
                );
              })()}
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
            <button
              className={`chat-tool-btn ${isBaziPresetActive ? 'active' : ''}`}
              type="button"
              onClick={handleBaziPresetToggle}
              title="显式开启传统文化陪伴模式"
            >
              八字陪伴
            </button>
            <button
              className={`chat-tool-btn ${voiceState !== 'idle' ? 'active' : ''}`}
              type="button"
              onClick={handleVoiceSimulation}
            >
              {voiceButtonText}
            </button>
            <button
              className="chat-tool-btn"
              type="button"
              onClick={() => {
                setInputValue('');
                setIsBaziPresetSelected(false);
              }}
            >
              清空
            </button>
          </div>
        )}

        {!isInterviewMode && voiceState !== 'idle' && (
          <div className={`voice-sim-panel ${voiceState}`}>
            <div className="voice-sim-dot" />
            <div className="voice-sim-body">
              <div className="voice-sim-title">{voiceHintText}</div>
              <div className="voice-sim-text">{voiceDraft}</div>
            </div>
          </div>
        )}

        <div className="chat-input-row">
          <textarea
            ref={textareaRef}
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
      {pageToast && <div className="toast show">{pageToast}</div>}
    </div>
  );
}

export default ChatPage;
