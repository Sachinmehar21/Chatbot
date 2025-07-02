import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages([...messages, { from: 'user', text: input }]);
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/chat', { message: input });
      setMessages(prev => [...prev, { from: 'bot', text: res.data.response }]);
    } catch (err) {
      setError('Failed to get response.');
    }
    setLoading(false);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h2>AI Chatbot</h2>
      <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: 16, minHeight: 300, background: '#fafafa' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ textAlign: msg.from === 'user' ? 'right' : 'left', margin: '8px 0' }}>
            <span style={{ background: msg.from === 'user' ? '#d1e7dd' : '#e2e3e5', padding: '8px 12px', borderRadius: 16, display: 'inline-block' }}>
              {msg.text}
            </span>
          </div>
        ))}
        {loading && <div style={{ color: '#888' }}>AI is typing...</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </div>
      <textarea
        rows={3}
        style={{ width: '100%', marginTop: 12, borderRadius: 8, padding: 8, resize: 'none' }}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        disabled={loading}
      />
      <button
        style={{ marginTop: 8, padding: '8px 24px', borderRadius: 8, background: '#0d6efd', color: '#fff', border: 'none', fontWeight: 'bold' }}
        onClick={sendMessage}
        disabled={loading || !input.trim()}
      >
        Send
      </button>
    </div>
  );
}

export default App; 