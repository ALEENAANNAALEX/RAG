import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, Sparkles, Trash2, Loader2, Bot, User, Lock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const AiChat = () => {
    const API_URL = import.meta.env.VITE_API_URL
        ? (import.meta.env.VITE_API_URL.endsWith('/api')
            ? import.meta.env.VITE_API_URL
            : import.meta.env.VITE_API_URL + '/api')
        : '/api';

    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState(() => {
        const token = localStorage.getItem('token');
        // Only load sessionId if user is logged in
        return token ? (localStorage.getItem('chatSessionId') || `session_${Date.now()}`) : null;
    });
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    // Check authentication and set initial greeting
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (!token || !userData) {
            setIsAuthenticated(false);
            // Clear messages if not authenticated
            setMessages([]);
            setSessionId(null);
        } else {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            setIsAuthenticated(true);
            
            // Load saved messages only if authenticated
            const saved = localStorage.getItem('chatMessages');
            if (saved && JSON.parse(saved).length > 0) {
                setMessages(JSON.parse(saved));
            } else {
                // Set initial greeting if no messages
                setMessages([{
                    role: 'assistant',
                    content: `Hello ${parsedUser.name}! 👋 Welcome to Intel AI Assistant. How can I help you today?`
                }]);
            }
            
            // Set or create session ID
            const existingSessionId = localStorage.getItem('chatSessionId');
            if (existingSessionId) {
                setSessionId(existingSessionId);
            } else {
                const newSessionId = `session_${Date.now()}`;
                setSessionId(newSessionId);
                localStorage.setItem('chatSessionId', newSessionId);
            }
        }
    }, []);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
        }, 100);
    };

    useEffect(() => {
        // Save state to local storage whenever it changes
        if (sessionId) localStorage.setItem('chatSessionId', sessionId);
        localStorage.setItem('chatMessages', JSON.stringify(messages));
        // Scroll to bottom when messages change
        scrollToBottom();
    }, [messages, sessionId]);

    useEffect(() => {
        // Load history from Pinecone if we already have a session
        const loadHistory = async () => {
            if (isAuthenticated && sessionId) {
                try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(`${API_URL}/chat/history/${sessionId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
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
    }, [isAuthenticated]);

    // Scroll to bottom on mount and when messages load
    useEffect(() => {
        scrollToBottom();
    }, []);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        // Check if user is authenticated
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const userMessage = input.trim();
        setInput('');

        const newMessages = [...messages, { role: 'user', content: userMessage }];
        setMessages(newMessages);

        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/chat`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message: userMessage, sessionId }),
            });

            const data = await response.json();

            if (data.success) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.data }]);
            } else {
                // Check if subscription is required
                if (data.requiresSubscription || data.requiresAuth) {
                    setMessages(prev => [...prev, {
                        role: 'assistant',
                        content: `❌ ${data.message} Please upgrade your subscription to continue.`
                    }]);
                    setTimeout(() => navigate('/pricing'), 2000);
                } else {
                    setMessages(prev => [...prev, {
                        role: 'assistant',
                        content: '❌ Sorry, I encountered an error. Please try again.'
                    }]);
                }
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
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/chat/clear`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ sessionId }),
            });

            // Reset chat history
            localStorage.removeItem('chatSessionId');
            localStorage.removeItem('chatMessages');

            const newSid = `session_${Date.now()}`;
            setSessionId(newSid);
            localStorage.setItem('chatSessionId', newSid);

            setMessages([
                { role: 'assistant', content: `Hello ${user.name}! 👋 Chat history cleared. How can I help you today?` }
            ]);

        } catch (error) {
            console.error('Clear error:', error);
        }
    };

    return (
        <div className="page-container" style={{ paddingTop: '5rem', paddingBottom: '2rem' }}>
            {!isAuthenticated && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        marginBottom: '2rem',
                        textAlign: 'center',
                        maxWidth: '900px',
                        margin: '0 auto 2rem'
                    }}
                >
                    <Lock size={32} color="#3b82f6" style={{ margin: '0 auto 1rem' }} />
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 700 }}>
                        Authentication Required
                    </h3>
                    <p style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>
                        Please log in to access AI Chat and enjoy unlimited conversations
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <Link to="/login" className="btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                            Login
                        </Link>
                        <Link 
                            to="/signup" 
                            style={{
                                padding: '0.75rem 1.5rem',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                color: 'white'
                            }}
                        >
                            Sign Up
                        </Link>
                    </div>
                </motion.div>
            )}
            
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
                maxWidth: '1200px',
                margin: '0 auto',
                height: '700px',
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
