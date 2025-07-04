import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './index.css';

// Responsive hook
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return width;
}

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(true);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const [darkMode, setDarkMode] = useState(() => {
    // Try to use system preference or localStorage
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) return stored === 'true';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth <= 600;
  const API_BASE = process.env.REACT_APP_API_BASE || '';

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Test server connection on mount
  useEffect(() => {
    checkServerConnection();
  }, []);

  const checkServerConnection = async () => {
    try {
      await axios.get(`${API_BASE}/health`, { timeout: 3000 });
      setIsConnected(true);
    } catch (err) {
      setIsConnected(false);
      setError('Cannot connect to server. Make sure your backend is running on port 5000.');
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    const newUserMessage = { from: 'user', text: userMessage, timestamp: new Date() };
    
    setMessages(prev => [...prev, newUserMessage]);
    setLoading(true);
    setError('');
    setInput('');

    try {
      const res = await axios.post(`${API_BASE}/api/chat`, 
        { message: userMessage },
        { timeout: 60000 }
      );
      
      const botMessage = {
        from: 'bot',
        text: res.data.reply || 'Sorry, I couldn\'t generate a response.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsConnected(true);
      
    } catch (err) {
      console.error('Chat error:', err);
      
      let errorMessage = 'Failed to get response.';
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. The AI is taking too long to respond.';
      } else if (err.response?.status === 503) {
        errorMessage = 'AI model is loading. Please wait a moment and try again.';
      } else if (err.response?.status === 429) {
        errorMessage = 'Too many requests. Please wait a moment before trying again.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Authentication failed. Please check your API key.';
      } else if (!err.response) {
        errorMessage = 'Cannot connect to server. Make sure your backend is running.';
        setIsConnected(false);
      }
      
      setError(errorMessage);
      
      // Add error message to chat
      const errorMsg = {
        from: 'system',
        text: `❌ ${errorMessage}`,
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    }
    
    setLoading(false);
    
    // Focus back to textarea
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError('');
  };

  const retryConnection = () => {
    setError('');
    checkServerConnection();
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageStyle = (msg, darkMode, isMobile) => {
    const baseStyle = {
      padding: isMobile ? '8px 12px' : '12px 18px',
      borderRadius: '18px',
      display: 'inline-block',
      maxWidth: isMobile ? '95vw' : '80%',
      wordWrap: 'break-word',
      fontSize: isMobile ? '13px' : '15px',
      lineHeight: '1.5',
      marginBottom: 2,
      boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,0.25)' : '0 1px 2px rgba(0,0,0,0.05)'
    };

    if (msg.from === 'user') {
      return {
        ...baseStyle,
        background: darkMode ? 'linear-gradient(135deg, #6366f1 0%, #a21caf 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        marginLeft: 'auto',
        border: darkMode ? '1px solid #6366f1' : 'none'
      };
    } else if (msg.from === 'system' && msg.isError) {
      return {
        ...baseStyle,
        background: darkMode ? '#7f1d1d' : '#fee2e2',
        color: darkMode ? '#fca5a5' : '#dc2626',
        border: darkMode ? '1px solid #f87171' : '1px solid #fecaca'
      };
    } else {
      return {
        ...baseStyle,
        background: darkMode ? '#27272a' : 'white',
        color: darkMode ? '#f4f4f5' : '#333',
        border: darkMode ? '1px solid #444' : '1px solid #e5e7eb',
        boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,0.25)' : '0 1px 2px rgba(0,0,0,0.05)'
      };
    }
  };

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    document.body.style.background = darkMode ? '#18181b' : '#f8fafc';
  }, [darkMode]);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      background: darkMode ? '#18181b' : '#f8fafc',
      borderRadius: 0,
      overflow: 'hidden',
      boxShadow: 'none',
      minHeight: '100vh',
      minWidth: '100vw',
      touchAction: 'manipulation',
      WebkitOverflowScrolling: 'touch'
    }}>
      
      {/* Header */}
      <div style={{
        background: darkMode ? 'linear-gradient(135deg, #232526 0%, #414345 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: isMobile ? '10px 8px' : '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: darkMode ? '1px solid #27272a' : 'none',
        minHeight: isMobile ? 48 : 64
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 10 }}>
          <span style={{ fontSize: isMobile ? 22 : 28, marginRight: isMobile ? 6 : 10 }}>🤖</span>
          <div>
            <h2 style={{ margin: 0, fontSize: isMobile ? '15px' : '18px', fontWeight: '600', letterSpacing: 1, display: 'inline-block' }}>
              AI Chat Assistant
              <span style={{ fontSize: isMobile ? '9px' : '11px', fontWeight: 400, marginLeft: 8, color: 'rgba(255,255,255,0.7)', verticalAlign: 'middle' }}>
                by sachin
              </span>
            </h2>
            <div style={{ fontSize: isMobile ? '10px' : '12px', opacity: 0.9, marginTop: '2px' }}>
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 10 }}>
          <button
            onClick={() => setDarkMode(dm => !dm)}
            style={{
              background: darkMode ? '#27272a' : 'rgba(255,255,255,0.2)',
              border: 'none',
              color: darkMode ? '#fbbf24' : '#333',
              padding: isMobile ? '4px 8px' : '6px 12px',
              borderRadius: '6px',
              fontSize: isMobile ? '12px' : '14px',
              cursor: 'pointer',
              marginRight: 8,
              transition: 'background 0.2s, color 0.2s',
              boxShadow: darkMode ? '0 1px 2px rgba(0,0,0,0.2)' : 'none'
            }}
            title="Toggle dark mode"
          >
            {darkMode ? '🌙' : '☀️'}
          </button>
          <button
            onClick={clearChat}
            style={{
              background: darkMode ? '#27272a' : 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: isMobile ? '4px 8px' : '6px 12px',
              borderRadius: '6px',
              fontSize: isMobile ? '10px' : '12px',
              cursor: 'pointer',
              marginRight: '8px',
              transition: 'background 0.2s, color 0.2s',
              opacity: messages.length === 0 ? 0.5 : 1
            }}
            disabled={messages.length === 0}
          >
            Clear
          </button>
          {!isConnected && (
            <button
              onClick={retryConnection}
              style={{
                background: darkMode ? '#27272a' : 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                padding: isMobile ? '4px 8px' : '6px 12px',
                borderRadius: '6px',
                fontSize: isMobile ? '10px' : '12px',
                cursor: 'pointer',
                transition: 'background 0.2s, color 0.2s'
              }}
            >
              Retry
            </button>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div style={{
        flex: 1,
        padding: isMobile ? '10px 4px' : '20px',
        overflowY: 'auto',
        background: darkMode ? '#23272a' : '#ffffff',
        transition: 'background 0.2s',
        scrollbarColor: darkMode ? '#444 #23272a' : undefined
      }}>
        {messages.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: darkMode ? '#a1a1aa' : '#6b7280',
            marginTop: isMobile ? '20px' : '40px'
          }}>
            <div style={{ fontSize: isMobile ? '32px' : '48px', marginBottom: isMobile ? '10px' : '16px' }}>💬</div>
            <h3 style={{ margin: 0, fontWeight: '500', fontSize: isMobile ? '15px' : '18px' }}>Start a conversation</h3>
            <p style={{ marginTop: '8px', fontSize: isMobile ? '12px' : '14px' }}>
              {darkMode ? 'Type your message below and get instant AI responses.' : 'Type your message below and get instant AI responses.'}
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.from === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: isMobile ? 10 : 18
            }}>
              <div style={getMessageStyle(msg, darkMode, isMobile)}>
                {msg.text}
              </div>
              <div style={{ fontSize: isMobile ? '9px' : '11px', color: darkMode ? '#a1a1aa' : '#6b7280', marginTop: 2 }}>
                {msg.from === 'user' ? 'You' : msg.from === 'bot' ? 'AI' : 'System'} · {formatTime(msg.timestamp)}
              </div>
            </div>
          ))
        )}
        
        {loading && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            color: darkMode ? '#a1a1aa' : '#6b7280',
            fontSize: '14px',
            margin: '12px 0'
          }}>
            <div style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: darkMode ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              marginRight: '8px',
              animation: 'pulse 1.5s ease-in-out infinite'
            }}></div>
            AI is thinking...
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={e => { e.preventDefault(); sendMessage(); }}
        style={{
          background: darkMode ? '#18181b' : '#f8fafc',
          padding: isMobile ? '10px 6px' : '18px 20px',
          borderTop: darkMode ? '1px solid #27272a' : '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 6 : 12
        }}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          rows={1}
          style={{
            flex: 1,
            resize: 'none',
            border: 'none',
            outline: 'none',
            background: darkMode ? '#23272a' : '#fff',
            color: darkMode ? '#f4f4f5' : '#222',
            fontSize: isMobile ? '13px' : '15px',
            borderRadius: '10px',
            padding: isMobile ? '8px 10px' : '12px 14px',
            boxShadow: darkMode ? '0 1px 2px rgba(0,0,0,0.2)' : '0 1px 2px rgba(0,0,0,0.05)',
            transition: 'background 0.2s, color 0.2s'
          }}
          autoFocus
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            background: darkMode ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            padding: isMobile ? '8px 14px' : '12px 22px',
            fontSize: isMobile ? '13px' : '15px',
            fontWeight: 600,
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            opacity: loading || !input.trim() ? 0.6 : 1,
            boxShadow: darkMode ? '0 1px 2px rgba(0,0,0,0.2)' : '0 1px 2px rgba(0,0,0,0.05)',
            transition: 'background 0.2s, color 0.2s'
          }}
        >
          {loading ? '...' : 'Send'}
        </button>
      </form>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

export default App;