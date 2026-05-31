/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AI CHAT API CLIENT - For External Website Integration
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This file contains everything needed to integrate your AI Chat API
 * into ANOTHER website.
 * 
 * Usage:
 * 1. Copy this file to your other website
 * 2. Update API_BASE_URL to your server's URL
 * 3. Use the AIChatClient class to interact with the API
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
    // 🔧 CHANGE THIS to your actual server URL
    API_BASE_URL: 'http://your-server.com',  // e.g., 'https://api.intelai.com'
    
    // API endpoints (don't change these)
    ENDPOINTS: {
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        CHAT: '/api/v1/ai-chat',
        CHAT_HISTORY: '/api/v1/ai-chat/history',
        CHAT_CLEAR: '/api/v1/ai-chat/clear',
        CHAT_RULES: '/api/v1/ai-chat/rules'
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// AI CHAT CLIENT CLASS
// ═══════════════════════════════════════════════════════════════════════════

class AIChatClient {
    constructor(baseURL = CONFIG.API_BASE_URL) {
        this.baseURL = baseURL;
        this.token = this.getStoredToken();
        this.sessionId = this.getStoredSessionId();
    }

    // ───────────────────────────────────────────────────────────────────────
    // Token Management
    // ───────────────────────────────────────────────────────────────────────

    getStoredToken() {
        return localStorage.getItem('ai_chat_token');
    }

    storeToken(token) {
        localStorage.setItem('ai_chat_token', token);
        this.token = token;
    }

    clearToken() {
        localStorage.removeItem('ai_chat_token');
        this.token = null;
    }

    // ───────────────────────────────────────────────────────────────────────
    // Session Management
    // ───────────────────────────────────────────────────────────────────────

    getStoredSessionId() {
        return localStorage.getItem('ai_chat_session');
    }

    storeSessionId(sessionId) {
        localStorage.setItem('ai_chat_session', sessionId);
        this.sessionId = sessionId;
    }

    clearSessionId() {
        localStorage.removeItem('ai_chat_session');
        this.sessionId = null;
    }

    // ───────────────────────────────────────────────────────────────────────
    // HTTP Request Helper
    // ───────────────────────────────────────────────────────────────────────

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        // Add auth token if available
        if (this.token && !options.noAuth) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.error || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    // ───────────────────────────────────────────────────────────────────────
    // Authentication Methods
    // ───────────────────────────────────────────────────────────────────────

    /**
     * Register a new user
     * @param {string} name - User's name
     * @param {string} email - User's email
     * @param {string} password - User's password
     * @returns {Promise} User data and token
     */
    async register(name, email, password) {
        const data = await this.request(CONFIG.ENDPOINTS.REGISTER, {
            method: 'POST',
            body: JSON.stringify({ name, email, password }),
            noAuth: true
        });

        if (data.success && data.token) {
            this.storeToken(data.token);
        }

        return data;
    }

    /**
     * Login existing user
     * @param {string} email - User's email
     * @param {string} password - User's password
     * @returns {Promise} User data and token
     */
    async login(email, password) {
        const data = await this.request(CONFIG.ENDPOINTS.LOGIN, {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            noAuth: true
        });

        if (data.success && data.token) {
            this.storeToken(data.token);
        }

        return data;
    }

    /**
     * Logout user
     */
    logout() {
        this.clearToken();
        this.clearSessionId();
    }

    /**
     * Check if user is logged in
     */
    isLoggedIn() {
        return !!this.token;
    }

    // ───────────────────────────────────────────────────────────────────────
    // Chat Methods
    // ───────────────────────────────────────────────────────────────────────

    /**
     * Send a message to AI and get response
     * @param {string} message - User's message
     * @param {string} sessionId - Optional session ID
     * @returns {Promise} AI response
     */
    async sendMessage(message, sessionId = null) {
        if (!this.isLoggedIn()) {
            throw new Error('User must be logged in to send messages');
        }

        const data = await this.request(CONFIG.ENDPOINTS.CHAT, {
            method: 'POST',
            body: JSON.stringify({
                message,
                sessionId: sessionId || this.sessionId
            })
        });

        if (data.success && data.sessionId) {
            this.storeSessionId(data.sessionId);
        }

        return data;
    }

    /**
     * Get chat history for current session
     * @param {string} sessionId - Optional session ID
     * @returns {Promise} Chat history
     */
    async getHistory(sessionId = null) {
        if (!this.isLoggedIn()) {
            throw new Error('User must be logged in');
        }

        const sid = sessionId || this.sessionId;
        if (!sid) {
            throw new Error('No session ID available');
        }

        return await this.request(`${CONFIG.ENDPOINTS.CHAT_HISTORY}/${sid}`, {
            method: 'GET'
        });
    }

    /**
     * Clear chat history
     * @param {string} sessionId - Optional session ID
     * @returns {Promise} Success confirmation
     */
    async clearHistory(sessionId = null) {
        if (!this.isLoggedIn()) {
            throw new Error('User must be logged in');
        }

        const data = await this.request(CONFIG.ENDPOINTS.CHAT_CLEAR, {
            method: 'POST',
            body: JSON.stringify({
                sessionId: sessionId || this.sessionId
            })
        });

        if (data.success) {
            this.clearSessionId();
        }

        return data;
    }

    /**
     * Get API rules and configuration
     * @returns {Promise} API rules
     */
    async getRules() {
        return await this.request(CONFIG.ENDPOINTS.CHAT_RULES, {
            method: 'GET',
            noAuth: true
        });
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// USAGE EXAMPLES
// ═══════════════════════════════════════════════════════════════════════════

// Example 1: Initialize client
const aiChat = new AIChatClient('http://your-server.com');

// Example 2: Register new user
async function registerExample() {
    try {
        const result = await aiChat.register('John Doe', 'john@example.com', 'password123');
        console.log('Registration successful:', result);
    } catch (error) {
        console.error('Registration failed:', error.message);
    }
}

// Example 3: Login existing user
async function loginExample() {
    try {
        const result = await aiChat.login('john@example.com', 'password123');
        console.log('Login successful:', result);
    } catch (error) {
        console.error('Login failed:', error.message);
    }
}

// Example 4: Send message to AI
async function chatExample() {
    try {
        const response = await aiChat.sendMessage('Who are the founders of IntelAI?');
        console.log('AI Response:', response.data);
        console.log('Session ID:', response.sessionId);
        console.log('Metadata:', response.metadata);
    } catch (error) {
        console.error('Chat failed:', error.message);
    }
}

// Example 5: Get chat history
async function historyExample() {
    try {
        const history = await aiChat.getHistory();
        console.log('Chat history:', history.data);
        console.log('Message count:', history.count);
    } catch (error) {
        console.error('Failed to get history:', error.message);
    }
}

// Example 6: Clear history
async function clearExample() {
    try {
        const result = await aiChat.clearHistory();
        console.log('History cleared:', result);
    } catch (error) {
        console.error('Failed to clear history:', error.message);
    }
}

// Example 7: Check API rules
async function rulesExample() {
    try {
        const rules = await aiChat.getRules();
        console.log('API Rules:', rules.rules);
        console.log('Rate limits:', rules.rules.RATE_LIMITS);
    } catch (error) {
        console.error('Failed to get rules:', error.message);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// REACT COMPONENT EXAMPLE
// ═══════════════════════════════════════════════════════════════════════════

/*
import React, { useState, useEffect } from 'react';

function AIChatComponent() {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [client] = useState(() => new AIChatClient('http://your-server.com'));

    // Login on mount
    useEffect(() => {
        async function autoLogin() {
            if (!client.isLoggedIn()) {
                // Prompt user to login or redirect
                console.log('User needs to login');
            } else {
                // Load chat history
                const history = await client.getHistory();
                setMessages(history.data || []);
            }
        }
        autoLogin();
    }, []);

    async function handleSend() {
        if (!message.trim()) return;

        setLoading(true);
        try {
            // Add user message to UI
            setMessages(prev => [...prev, { role: 'user', content: message }]);
            
            // Send to API
            const response = await client.sendMessage(message);
            
            // Add AI response to UI
            setMessages(prev => [...prev, { role: 'assistant', content: response.data }]);
            
            setMessage('');
        } catch (error) {
            console.error('Send failed:', error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="ai-chat">
            <div className="messages">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.role}`}>
                        {msg.content}
                    </div>
                ))}
            </div>
            
            <div className="input-area">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your message..."
                    disabled={loading}
                />
                <button onClick={handleSend} disabled={loading}>
                    {loading ? 'Sending...' : 'Send'}
                </button>
            </div>
        </div>
    );
}

export default AIChatComponent;
*/

// ═══════════════════════════════════════════════════════════════════════════
// VANILLA JAVASCRIPT EXAMPLE
// ═══════════════════════════════════════════════════════════════════════════

/*
<!DOCTYPE html>
<html>
<head>
    <title>AI Chat Integration</title>
    <script src="ai-chat-client.js"></script>
</head>
<body>
    <div id="chat-container">
        <div id="messages"></div>
        <input id="message-input" type="text" placeholder="Type your message...">
        <button id="send-btn">Send</button>
    </div>

    <script>
        // Initialize client
        const aiChat = new AIChatClient('http://your-server.com');

        // Auto-login (you should implement proper login UI)
        async function init() {
            if (!aiChat.isLoggedIn()) {
                await aiChat.login('user@example.com', 'password');
            }
            
            // Load history
            const history = await aiChat.getHistory();
            displayMessages(history.data);
        }

        // Send message
        document.getElementById('send-btn').addEventListener('click', async () => {
            const input = document.getElementById('message-input');
            const message = input.value.trim();
            
            if (!message) return;
            
            // Display user message
            addMessage('user', message);
            input.value = '';
            
            try {
                // Send to API
                const response = await aiChat.sendMessage(message);
                
                // Display AI response
                addMessage('assistant', response.data);
            } catch (error) {
                alert('Error: ' + error.message);
            }
        });

        function addMessage(role, content) {
            const messagesDiv = document.getElementById('messages');
            const msgDiv = document.createElement('div');
            msgDiv.className = `message ${role}`;
            msgDiv.textContent = content;
            messagesDiv.appendChild(msgDiv);
        }

        function displayMessages(messages) {
            messages.forEach(msg => addMessage(msg.role, msg.content));
        }

        // Initialize on page load
        init();
    </script>
</body>
</html>
*/

// ═══════════════════════════════════════════════════════════════════════════
// Export for use in other files
// ═══════════════════════════════════════════════════════════════════════════

// For Node.js / ES Modules
export default AIChatClient;
export { CONFIG };

// For browser / script tag
if (typeof window !== 'undefined') {
    window.AIChatClient = AIChatClient;
    window.AIChatConfig = CONFIG;
}

