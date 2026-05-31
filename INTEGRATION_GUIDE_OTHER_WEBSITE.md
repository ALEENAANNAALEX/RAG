# 🌐 Integration Guide - Use AI Chat API on Another Website

## 📋 Overview

This guide shows you how to integrate your AI Chat API into **another website**.

---

## 🎯 What You Need

### On Your Main Server (This Project):
1. ✅ Your AI Chat API running
2. ✅ CORS configured to allow other domains
3. ✅ Server publicly accessible

### On Your Other Website:
1. ✅ The client library (`ai-chat-client.js`)
2. ✅ Your server's URL
3. ✅ User authentication setup

---

## 📡 Step 1: Configure Your Server for External Access

### Update CORS in `backend/index.js`:

```javascript
// Current CORS configuration (line 51)
app.use(cors({
    origin: '*',  // ✅ Already allows all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**Or restrict to specific domain**:

```javascript
app.use(cors({
    origin: 'https://your-other-website.com',  // Only allow this domain
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
```

---

## 📦 Step 2: Copy Client Library to Other Website

Copy this file to your other website:

```
ai-chat-client.js  →  your-other-website/js/ai-chat-client.js
```

---

## 🔧 Step 3: Configure Client

Edit `ai-chat-client.js` line 17:

```javascript
const CONFIG = {
    // Change this to your actual server URL
    API_BASE_URL: 'https://your-server.com',  // e.g., 'https://api.intelai.com'
    
    ENDPOINTS: {
        // ... rest stays the same
    }
};
```

---

## 💻 Step 4: Use in Your Other Website

### Option A: HTML + JavaScript

```html
<!DOCTYPE html>
<html>
<head>
    <title>AI Chat Integration</title>
    <style>
        #chat-container {
            width: 600px;
            margin: 50px auto;
            border: 1px solid #ccc;
            border-radius: 10px;
            padding: 20px;
        }
        #messages {
            height: 400px;
            overflow-y: auto;
            margin-bottom: 20px;
            border: 1px solid #eee;
            padding: 10px;
        }
        .message {
            margin: 10px 0;
            padding: 10px;
            border-radius: 5px;
        }
        .message.user {
            background: #007bff;
            color: white;
            text-align: right;
        }
        .message.assistant {
            background: #f1f1f1;
        }
        #input-area {
            display: flex;
            gap: 10px;
        }
        #message-input {
            flex: 1;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 5px;
        }
        #send-btn {
            padding: 10px 20px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div id="chat-container">
        <h2>AI Chat Assistant</h2>
        <div id="messages"></div>
        <div id="input-area">
            <input id="message-input" type="text" placeholder="Type your message...">
            <button id="send-btn">Send</button>
        </div>
    </div>

    <!-- Include the client library -->
    <script src="ai-chat-client.js"></script>

    <script>
        // Initialize client
        const aiChat = new AIChatClient('https://your-server.com');

        // Check if logged in
        async function init() {
            if (!aiChat.isLoggedIn()) {
                // Show login form or auto-login
                const email = prompt('Enter email:');
                const password = prompt('Enter password:');
                
                try {
                    await aiChat.login(email, password);
                    console.log('Logged in successfully!');
                } catch (error) {
                    alert('Login failed: ' + error.message);
                    return;
                }
            }
            
            // Load previous chat history
            try {
                const history = await aiChat.getHistory();
                history.data.forEach(msg => {
                    addMessage(msg.role, msg.content);
                });
            } catch (error) {
                console.log('No previous history');
            }
        }

        // Send message on button click
        document.getElementById('send-btn').addEventListener('click', sendMessage);

        // Send message on Enter key
        document.getElementById('message-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });

        async function sendMessage() {
            const input = document.getElementById('message-input');
            const message = input.value.trim();
            
            if (!message) return;
            
            // Display user message
            addMessage('user', message);
            input.value = '';
            
            // Show loading
            const loadingDiv = addMessage('assistant', 'Thinking...');
            
            try {
                // Send to API
                const response = await aiChat.sendMessage(message);
                
                // Remove loading message
                loadingDiv.remove();
                
                // Display AI response
                addMessage('assistant', response.data);
            } catch (error) {
                loadingDiv.remove();
                addMessage('assistant', '❌ Error: ' + error.message);
            }
        }

        function addMessage(role, content) {
            const messagesDiv = document.getElementById('messages');
            const msgDiv = document.createElement('div');
            msgDiv.className = `message ${role}`;
            msgDiv.textContent = content;
            messagesDiv.appendChild(msgDiv);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
            return msgDiv;
        }

        // Initialize on page load
        init();
    </script>
</body>
</html>
```

---

### Option B: React Component

```jsx
import React, { useState, useEffect } from 'react';
import AIChatClient from './ai-chat-client';

function AIChatWidget() {
    const [client] = useState(() => new AIChatClient('https://your-server.com'));
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Check if user is logged in
        if (client.isLoggedIn()) {
            setIsLoggedIn(true);
            loadHistory();
        }
    }, []);

    async function loadHistory() {
        try {
            const history = await client.getHistory();
            setMessages(history.data || []);
        } catch (error) {
            console.log('No previous history');
        }
    }

    async function handleLogin(email, password) {
        try {
            await client.login(email, password);
            setIsLoggedIn(true);
            await loadHistory();
        } catch (error) {
            alert('Login failed: ' + error.message);
        }
    }

    async function handleSend() {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        
        // Add user message
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        
        setLoading(true);
        try {
            const response = await client.sendMessage(userMessage);
            
            // Add AI response
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: response.data 
            }]);
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    }

    if (!isLoggedIn) {
        return (
            <div className="login-form">
                <h3>Login to AI Chat</h3>
                <input 
                    type="email" 
                    placeholder="Email"
                    id="email"
                />
                <input 
                    type="password" 
                    placeholder="Password"
                    id="password"
                />
                <button onClick={() => {
                    const email = document.getElementById('email').value;
                    const password = document.getElementById('password').value;
                    handleLogin(email, password);
                }}>
                    Login
                </button>
            </div>
        );
    }

    return (
        <div className="ai-chat-widget">
            <div className="messages">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.role}`}>
                        {msg.content}
                    </div>
                ))}
                {loading && <div className="message assistant">Thinking...</div>}
            </div>
            
            <div className="input-area">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your message..."
                    disabled={loading}
                />
                <button onClick={handleSend} disabled={loading || !input.trim()}>
                    Send
                </button>
            </div>
        </div>
    );
}

export default AIChatWidget;
```

---

## 🔐 Authentication Flow

### Option 1: Users Login Directly

```javascript
// On your other website
const aiChat = new AIChatClient('https://your-server.com');

// User fills login form
await aiChat.login(email, password);

// Now can use chat
await aiChat.sendMessage('Hello!');
```

### Option 2: Shared Session

If users are already logged in on your main site, you can share the JWT token:

```javascript
// On main website: After login
localStorage.setItem('shared_token', token);

// On other website: Read shared token
const token = localStorage.getItem('shared_token');
const aiChat = new AIChatClient('https://your-server.com');
aiChat.storeToken(token);  // Use shared token

// Now can use chat
await aiChat.sendMessage('Hello!');
```

---

## 📊 API Endpoints Your Other Website Will Use

```
POST   https://your-server.com/api/auth/login
POST   https://your-server.com/api/auth/register
POST   https://your-server.com/api/v1/ai-chat
GET    https://your-server.com/api/v1/ai-chat/history/:sessionId
POST   https://your-server.com/api/v1/ai-chat/clear
GET    https://your-server.com/api/v1/ai-chat/rules
```

---

## ✅ Checklist

Before deploying:

- [ ] Server is publicly accessible
- [ ] CORS is configured correctly
- [ ] `ai-chat-client.js` copied to other website
- [ ] `API_BASE_URL` updated in client
- [ ] Users can register/login
- [ ] Chat messages work
- [ ] History loads correctly
- [ ] SSL certificate installed (HTTPS)

---

## 🚀 Quick Test

```javascript
// Test from browser console on your other website
const aiChat = new AIChatClient('https://your-server.com');

// Login
await aiChat.login('test@example.com', 'password123');

// Send message
const response = await aiChat.sendMessage('Hello AI!');
console.log(response.data);
```

---

## 🔒 Security Notes

### ✅ DO:
- Use HTTPS for production
- Validate user input
- Use secure JWT secrets
- Rate limit requests
- Monitor API usage

### ❌ DON'T:
- Share your Groq API key
- Share your Pinecone API key
- Share your JWT secret
- Expose database credentials
- Allow unlimited requests

---

## 📝 Summary

**What Another Website Needs**:
1. ✅ `ai-chat-client.js` (JavaScript library)
2. ✅ Your server URL (e.g., `https://api.intelai.com`)
3. ✅ User accounts (register/login)

**What You Keep Secret**:
- ❌ Groq API key
- ❌ Pinecone API key
- ❌ JWT secret
- ❌ Database credentials

**The other website only calls YOUR API endpoints** - all the AI processing happens on your server! 🎉

