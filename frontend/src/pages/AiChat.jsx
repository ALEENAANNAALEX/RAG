import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, Sparkles, Trash2, Loader2, Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const AiChat = () => {
    const API_URL = import.meta.env.VITE_API_URL
        ? (import.meta.env.VITE_API_URL.endsWith('/api')
            ? import.meta.env.VITE_API_URL
            : import.meta.env.VITE_API_URL + '/api')
        : '/api';

    const [userMetaData, setUserMetaData] = useState(() => {
        const saved = localStorage.getItem('chatUser');
        return saved ? JSON.parse(saved) : null;
    });
    const [serverId, setServerId] = useState("Connecting...");

    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem('chatMessages');
        return saved ? JSON.parse(saved) : [
            {
                role: 'assistant',
                content: 'Hello! Welcome 😊 Please share your name and email to continue.'
            }
        ];
    });
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState(() => {
        return localStorage.getItem('chatSessionId') || `session_${Date.now()}`;
    });
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        // Save state to local storage whenever it changes
        if (userMetaData) localStorage.setItem('chatUser', JSON.stringify(userMetaData));
        if (sessionId) localStorage.setItem('chatSessionId', sessionId);
        localStorage.setItem('chatMessages', JSON.stringify(messages));
    }, [messages, userMetaData, sessionId]);

    useEffect(() => {
        // Fetch server ID on startup
        fetch(`${API_URL.replace('/api', '')}/health`)
            .then(res => res.json())
            .then(data => setServerId(data.serverId || "Unknown"))
            .catch(err => setServerId("Offline"));

        // Load history from Pinecone if we already have a session
        const loadHistory = async () => {
            if (userMetaData && sessionId) {
                try {
                    const response = await fetch(`${API_URL}/chat/history/${sessionId}`);
                    const data = await response.json();
                    if (data.success && data.data.length > 0) {
                        setMessages(data.data);
                    }
                } catch (e) {
                    console.error("Failed to load history:", e);
                }
            }
        };

        loadHistory();
        scrollToBottom();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');

        const newMessages = [...messages, { role: 'user', content: userMessage }];
        setMessages(newMessages);

        // Lead Generation Phase - RESTORED
        if (!userMetaData) {
            setIsLoading(true);

            // Simple check for name and email in the string
            const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
            const emailMatch = userMessage.match(emailRegex);

            if (emailMatch) {
                const email = emailMatch[0];
                let name = userMessage.split(/[, ]+/)[0];
                const newUserData = { name, email };
                setUserMetaData(newUserData);
                localStorage.setItem('chatUser', JSON.stringify(newUserData));

                // Even though we validated locally, we still send a "ping" to the backend to start the session in Pinecone
                try {
                    await fetch(`${API_URL}/chat`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            message: `USER_AUTH: ${name} (${email})`,
                            sessionId
                        }),
                    });
                } catch (e) { console.error("Sync error:", e); }

                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: `Thank you, ${name}. How can I help you today?`
                }]);
            } else {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: `I'm sorry, I need your name and email address (e.g., abc, abc@gmail.com) to continue.`
                }]);
            }
            setIsLoading(false);
            return;
        }

        // Standard AI Chat Phase
        const today = new Date().toISOString().split('T')[0];
        const storedUsage = JSON.parse(localStorage.getItem('chatUsage') || '{"count": 0, "date": ""}');

        if (storedUsage.date !== today) {
            storedUsage.count = 0;
            storedUsage.date = today;
        }

        if (storedUsage.count >= 50) {
            navigate('/pricing');
            return;
        }

        storedUsage.count += 1;
        localStorage.setItem('chatUsage', JSON.stringify(storedUsage));

        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage, sessionId }),
            });

            const data = await response.json();

            if (data.success) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.data }]);
            } else {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: '❌ Sorry, I encountered an error. Please try again.'
                }]);
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '❌ Connection error. Please refresh or try again later.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = async () => {
        try {
            await fetch(`${API_URL}/chat/clear`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId }),
            });

            // Reset everything to force name/email collection again
            localStorage.removeItem('chatUser');
            localStorage.removeItem('chatSessionId');
            localStorage.removeItem('chatMessages');

            setUserMetaData(null);
            const newSid = `session_${Date.now()}`;
            setSessionId(newSid);
            localStorage.setItem('chatSessionId', newSid);

            setMessages([
                { role: 'assistant', content: 'History cleared! Hello! Welcome 😊 Please share your name and email to continue.' }
            ]);

        } catch (error) {
            console.error('Clear error:', error);
        }
    };

    return (
        <div className="page-container" style={{ paddingTop: '5rem', paddingBottom: '2rem' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', marginBottom: '2rem' }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Sparkles size={40} color="#3b82f6" />
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>
                            AI <span className="gradient-text">Assistant</span>
                        </h1>
                    </div>
                </div>
            </motion.div>

            <div className="card" style={{
                maxWidth: '900px',
                margin: '0 auto',
                height: '500px',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Chat Messages */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                display: 'flex',
                                gap: '1rem',
                                alignItems: 'flex-start',
                                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                            }}
                        >
                            {msg.role === 'assistant' && (
                                <div style={{
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                    padding: '0.5rem',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minWidth: '40px',
                                    height: '40px'
                                }}>
                                    <Bot size={20} />
                                </div>
                            )}
                            <div style={{
                                background: msg.role === 'user'
                                    ? 'linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%)'
                                    : 'rgba(51, 65, 85, 0.5)',
                                padding: '1rem 1.25rem',
                                borderRadius: '16px',
                                maxWidth: '70%',
                                wordBreak: 'break-word',
                                lineHeight: '1.6'
                            }}>
                                <ReactMarkdown
                                    components={{
                                        h1: ({ node, ...props }) => <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#3b82f6' }} {...props} />,
                                        h2: ({ node, ...props }) => <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#60a5fa' }} {...props} />,
                                        h3: ({ node, ...props }) => <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#93c5fd' }} {...props} />,
                                        ul: ({ node, ...props }) => <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem', marginBottom: '0.5rem' }} {...props} />,
                                        ol: ({ node, ...props }) => <ol style={{ marginLeft: '1.5rem', marginTop: '0.5rem', marginBottom: '0.5rem' }} {...props} />,
                                        li: ({ node, ...props }) => <li style={{ marginBottom: '0.25rem' }} {...props} />,
                                        p: ({ node, ...props }) => <p style={{ marginBottom: '0.5rem' }} {...props} />,
                                        strong: ({ node, ...props }) => <strong style={{ fontWeight: 'bold', color: '#93c5fd' }} {...props} />,
                                        code: ({ node, inline, ...props }) => inline
                                            ? <code style={{ background: 'rgba(0,0,0,0.3)', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.9em' }} {...props} />
                                            : <code style={{ display: 'block', background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '8px', marginTop: '0.5rem', marginBottom: '0.5rem', overflowX: 'auto' }} {...props} />
                                    }}
                                >
                                    {msg.content}
                                </ReactMarkdown>
                            </div>
                            {msg.role === 'user' && (
                                <div style={{
                                    background: '#1e293b',
                                    padding: '0.5rem',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minWidth: '40px',
                                    height: '40px',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}>
                                    <User size={20} />
                                </div>
                            )}
                        </motion.div>
                    ))}
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}
                        >
                            <div style={{
                                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                padding: '0.5rem',
                                borderRadius: '12px',
                                minWidth: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Bot size={20} />
                            </div>
                            <div style={{
                                background: 'rgba(51, 65, 85, 0.5)',
                                padding: '1rem 1.25rem',
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <Loader2 className="animate-spin" size={16} />
                                <span>Thinking...</span>
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    padding: '1.5rem',
                    display: 'flex',
                    gap: '1rem'
                }}>
                    <form onSubmit={handleSend} style={{ flex: 1, display: 'flex', gap: '1rem' }}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message..."
                            disabled={isLoading}
                            style={{
                                flex: 1,
                                background: '#0a0a0b',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                padding: '0.875rem 1.25rem',
                                color: 'white',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="btn-primary"
                            style={{
                                opacity: (!input.trim() || isLoading) ? 0.5 : 1,
                                padding: '0.875rem 1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <Send size={18} />
                            Send
                        </button>
                    </form>
                    <button
                        onClick={handleClear}
                        style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '12px',
                            padding: '0.875rem 1.25rem',
                            color: '#ef4444',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                    >
                        <Trash2 size={18} />
                        Clear
                    </button>
                </div>
            </div>

            <style>{`
        @keyframes spin { 
          from { transform: rotate(0deg); } 
          to { transform: rotate(360deg); } 
        }
        .animate-spin { 
          animation: spin 1s linear infinite; 
        }
      `}</style>
        </div>
    );
};

export default AiChat;
