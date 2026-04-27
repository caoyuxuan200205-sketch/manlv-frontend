import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import SchedulePage from './pages/SchedulePage';
import TripDetailPage from './pages/TripDetailPage';
import ChatPage from './pages/ChatPage';
import LearnPage from './pages/LearnPage';
import InboxPage from './pages/InboxPage';
import ProfilePage from './pages/ProfilePage';
import ScrollToTop from './components/ScrollToTop';
import { BotIcon, CloseIcon, SendIcon, MinusIcon } from './components/Icons';

function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [showAssistant, setShowAssistant] = React.useState(false);
  const [assistantMessages, setAssistantMessages] = React.useState([
    {
      role: 'ai',
      content: '你好！👋 我是漫旅AI助手。有什么我可以帮助你的吗？',
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = React.useState('');
  const [isMinimized, setIsMinimized] = React.useState(false);
  const messagesEndRef = React.useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [assistantMessages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      role: 'user',
      content: inputValue,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    };

    setAssistantMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // 模拟AI回复
    setTimeout(() => {
      const responses = [
        '我已收到你的问题，正在为你分析...',
        '这是一个不错的问题！让我帮你规划一下。',
        '根据你的保研行程，我建议...',
        '有什么具体需要我帮助的吗？',
        '我已将你的信息记录下来，会继续为你提供支持。'
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const aiMessage = {
        role: 'ai',
        content: randomResponse,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      };
      setAssistantMessages(prev => [...prev, aiMessage]);
    }, 800);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const guard = (el) => isLoggedIn ? el : <Navigate to="/" />;

  return (
    <Router>
      <ScrollToTop />
      <div className="app-shell">
        <Routes>
          <Route path="/" element={isLoggedIn ? <Navigate to="/home" /> : <AuthPage onLogin={() => setIsLoggedIn(true)} />} />
          <Route path="/home" element={guard(<HomePage />)} />
          <Route path="/trip" element={guard(<SchedulePage />)} />
          <Route path="/trip/:school" element={guard(<TripDetailPage />)} />
          <Route path="/learn" element={guard(<LearnPage />)} />
          <Route path="/inbox" element={guard(<InboxPage />)} />
          <Route path="/profile" element={guard(<ProfilePage onLogout={() => setIsLoggedIn(false)} />)} />
          <Route path="/chat" element={guard(<ChatPage />)} />
          {/* legacy redirect */}
          <Route path="/schedule" element={<Navigate to="/trip" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
