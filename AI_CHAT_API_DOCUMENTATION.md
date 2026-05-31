# AI Chat API Documentation

## Overview
This document provides comprehensive documentation for the AI Chat API endpoints in the IntelAI RAG-QA system. The chat system uses Groq's Llama 3.3 model for natural language processing and Pinecone for conversation persistence.

---

## Table of Contents
1. [Authentication](#authentication)
2. [API Endpoints](#api-endpoints)
3. [Request/Response Examples](#request-response-examples)
4. [Error Handling](#error-handling)
5. [Rate Limits & Subscription Tiers](#rate-limits--subscription-tiers)
6. [Architecture Overview](#architecture-overview)

---

## Authentication

All chat endpoints use **optional authentication** via JWT tokens. However, actual usage requires login.

### How Authentication Works
```javascript
// Include JWT token in request headers
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN',
  'Content-Type': 'application/json'
}
```

### Access Levels
- **Guest (Not Logged In)**: ❌ Access Denied - Must login
- **Free Tier (Logged In)**: ✅ 10 messages/day, knowledge-base only responses
- **Premium Tier**: ✅ Unlimited messages, full AI capabilities

---

## API Endpoints

### 1. Send Chat Message
**Endpoint:** `POST /api/chat`

**Purpose:** Send a message to the AI assistant and receive a response.

**Authentication:** Required (Optional middleware but enforced in logic)

**Request Body:**
```json
{
  "message": "What is Retrieval-Augmented Generation?",
  "sessionId": "session_1234567890"
}
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| message | string | Yes | User's message to the AI assistant |
| sessionId | string | No | Session ID for conversation continuity. Auto-generated if not provided |

**Response (Success):**
```json
{
  "success": true,
  "data": "Retrieval-Augmented Generation (RAG) is a technique...",
  "sessionId": "session_1234567890",
  "serverId": "2026-02-23T12:00:00.000Z"
}
```

**Response (Rate Limited):**
```json
{
  "success": false,
  "message": "Daily chat limit reached (10 messages). Please upgrade your subscription for unlimited access.",
  "requiresSubscription": true
}
```

**Response (Unauthorized):**
```json
{
  "success": false,
  "message": "Please login to use AI Chat. Create a free account to get started!",
  "requiresAuth": true
}
```

---

### 2. Clear Chat History
**Endpoint:** `POST /api/chat/clear`

**Purpose:** Clear all conversation history for a specific session.

**Authentication:** Required

**Request Body:**
```json
{
  "sessionId": "session_1234567890"
}
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| sessionId | string | No | Session ID to clear. Defaults to 'default' |

**Response:**
```json
{
  "success": true,
  "message": "Chat history cleared"
}
```

---

### 3. Fetch Chat History
**Endpoint:** `GET /api/chat/history/:sessionId`

**Purpose:** Retrieve conversation history for a specific session.

**Authentication:** Required

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| sessionId | string | Yes | Session ID to fetch history for |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "role": "user",
      "content": "What is RAG?"
    },
    {
      "role": "assistant",
      "content": "Retrieval-Augmented Generation is..."
    }
  ]
}
```

---

## Request/Response Examples

### Example 1: First Message in a Session

**Request:**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "message": "Who are the founders of IntelAI?",
    "sessionId": "session_1708707600000"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": "The founders of IntelAI are:\n- **Aleena Anna Alex** - Co-Founder & CEO\n- **Surya** - Co-Founder & CTO\n\nFor more information, you can contact us at support@ragqa.io or call +91 98765 43210.",
  "sessionId": "session_1708707600000",
  "serverId": "2026-02-23T12:00:00.000Z"
}
```

---

### Example 2: Free User Asking Outside Knowledge Base

**Request:**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer FREE_USER_TOKEN..." \
  -d '{
    "message": "Explain quantum computing"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": "⚠️ This query is outside your knowledge base. Please upgrade your subscription to access broader AI responses.\n\n🎯 **What you can ask about (Free Tier):**\n- IntelAI company information\n- Our services and features\n- Founders and contact details\n\n✨ **Upgrade to Pro** for unlimited AI conversations on any topic!"
}
```

---

### Example 3: Clearing Chat History

**Request:**
```bash
curl -X POST http://localhost:3000/api/chat/clear \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN..." \
  -d '{
    "sessionId": "session_1708707600000"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Chat history cleared"
}
```

---

### Example 4: Fetching History

**Request:**
```bash
curl -X GET http://localhost:3000/api/chat/history/session_1708707600000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN..."
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "role": "user",
      "content": "Who are the founders?"
    },
    {
      "role": "assistant",
      "content": "The founders are Aleena Anna Alex (CEO) and Surya (CTO)."
    },
    {
      "role": "user",
      "content": "What services do you offer?"
    },
    {
      "role": "assistant",
      "content": "We offer RAG, Conversational AI, Intelligent Document Processing..."
    }
  ]
}
```

---

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "message": "Message is required"
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "Please login to use AI Chat. Create a free account to get started!",
  "requiresAuth": true
}
```

#### 403 Forbidden (Rate Limited)
```json
{
  "success": false,
  "message": "Daily chat limit reached (10 messages). Please upgrade your subscription for unlimited access.",
  "requiresSubscription": true
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to process chat request",
  "error": "Groq API timeout"
}
```

---

## Rate Limits & Subscription Tiers

### Free Tier
- **Daily Limit:** 10 messages per day
- **Reset:** Every 24 hours (midnight UTC)
- **Capabilities:** Knowledge-base queries only (IntelAI company info)
- **Restrictions:** Cannot answer general AI/tech questions

### Premium Tier
- **Daily Limit:** Unlimited (-1)
- **Reset:** N/A
- **Capabilities:** Full AI assistant access
- **Features:**
  - General AI and tech questions
  - Programming assistance
  - Data science queries
  - RAG technology discussions
  - Company information

### Daily Limit Reset Logic
```javascript
// User model automatically resets counter after 24 hours
user.resetDailyChatIfNeeded();
```

---

## Architecture Overview

### System Components

```
┌─────────────────┐
│   Frontend      │
│   (React)       │
└────────┬────────┘
         │
         │ HTTP/REST
         ▼
┌─────────────────────────────────────────┐
│       Express Backend                    │
│  ┌───────────────────────────────────┐  │
│  │  Chat Controller                  │  │
│  │  - Authentication Check           │  │
│  │  - Rate Limiting                  │  │
│  │  - Session Management             │  │
│  └───────┬───────────────────────────┘  │
│          │                               │
│          ▼                               │
│  ┌───────────────────┐                  │
│  │  Pinecone Utils   │                  │
│  │  - Get Context    │                  │
│  │  - Save Messages  │                  │
│  │  - Load History   │                  │
│  └───────┬───────────┘                  │
└──────────┼──────────────────────────────┘
           │
           ▼
    ┌──────────────┐         ┌──────────────┐
    │  Pinecone    │         │   Groq API   │
    │  (Vector DB) │         │  (Llama 3.3) │
    └──────────────┘         └──────────────┘
```

### Data Flow

1. **User sends message** → Frontend (AiChat.jsx)
2. **POST /api/chat** → Backend receives request
3. **Authentication check** → Validate JWT token
4. **Rate limiting** → Check daily message count
5. **Fetch context** → Query Pinecone for relevant knowledge
6. **Build prompt** → Combine system message + context + history
7. **Call Groq API** → Get AI response from Llama 3.3
8. **Save to Pinecone** → Store user message + AI response
9. **Return response** → Send back to frontend
10. **Display message** → Render in chat interface

### Key Technologies

| Technology | Purpose |
|------------|---------|
| **Groq SDK** | AI inference with Llama 3.3 (70B parameters) |
| **Pinecone** | Vector database for conversation storage & RAG |
| **JWT** | Authentication tokens |
| **MongoDB** | User data, subscriptions, daily limits |
| **Express.js** | REST API server |
| **React** | Frontend chat interface |

### Conversation Storage

**Memory Storage (In-Process):**
```javascript
const conversationHistory = new Map();
// Key: sessionId
// Value: Array of messages
```

**Persistent Storage (Pinecone):**
- Each message is stored as a vector
- Metadata includes: sessionId, role, content, timestamp
- Allows cross-server session recovery
- Enables semantic search over chat history

---

## Frontend Integration

### React Component Usage

```javascript
// 1. Send a chat message
const response = await fetch(`${API_URL}/chat`, {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  body: JSON.stringify({ 
    message: userInput, 
    sessionId: currentSessionId 
  }),
});

const data = await response.json();

if (data.success) {
  // Display AI response
  setMessages(prev => [...prev, { 
    role: 'assistant', 
    content: data.data 
  }]);
}
```

```javascript
// 2. Load conversation history
const loadHistory = async () => {
  const response = await fetch(
    `${API_URL}/chat/history/${sessionId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  const data = await response.json();
  
  if (data.success && data.data.length > 0) {
    setMessages(data.data);
  }
};
```

```javascript
// 3. Clear chat history
const handleClear = async () => {
  await fetch(`${API_URL}/chat/clear`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ sessionId }),
  });
  
  // Reset local state
  const newSessionId = `session_${Date.now()}`;
  setSessionId(newSessionId);
  setMessages([]);
};
```

---

## Advanced Features

### 1. Retrieval-Augmented Generation (RAG)

The chat system uses RAG to enhance responses with relevant context:

```javascript
// Fetch relevant context from knowledge base
const kbContext = await getRelevantContext(message);

// Include in prompt
const finalMessages = [
  systemMessage,
  {
    role: "system",
    content: `KNOWLEDGE BASE CONTEXT: \n${kbContext}`
  },
  ...conversationHistory
];
```

### 2. Conversation Memory Management

Limits history to prevent token overflow:

```javascript
// Keep only last 20 messages (plus system message)
if (history.length > 21) {
  history.splice(1, history.length - 21);
}
```

### 3. Smart Context Filtering

Free users get rejected if query is outside knowledge base:

```javascript
if (!hasFullAccess && (!kbContext || kbContext.trim().length < 50)) {
  return "This query is outside your knowledge base...";
}
```

### 4. Session Recovery

Chat history persists across page refreshes and server restarts:
- **In-memory:** Fast access for active sessions
- **Pinecone:** Persistent storage for recovery

---

## Security Considerations

### 1. Authentication
- JWT tokens expire after configured duration
- Tokens stored in localStorage (frontend)
- Middleware validates tokens on each request

### 2. Rate Limiting
- Per-user daily message limits
- Automatic reset every 24 hours
- Database-backed counter (survives restarts)

### 3. Input Validation
- Empty messages rejected
- Maximum token limits enforced
- SQL injection prevention (MongoDB)

### 4. API Key Protection
- Groq API key stored in environment variables
- Never exposed to frontend
- Server-side only usage

---

## Troubleshooting

### Issue: "Daily limit reached"
**Solution:** Wait 24 hours or upgrade to premium subscription.

### Issue: "Please login to use AI Chat"
**Solution:** User must authenticate with valid JWT token.

### Issue: "Failed to process chat request"
**Possible Causes:**
- Groq API timeout
- Invalid API key
- Network connectivity issues
- Pinecone database error

**Debug Steps:**
1. Check server logs for error details
2. Verify `GROQ_API_KEY` in `.env` file
3. Test Pinecone connection
4. Check MongoDB connection

### Issue: History not loading
**Solution:**
- Verify sessionId is consistent
- Check Pinecone index exists
- Ensure user is authenticated

---

## Performance Optimization

### 1. Caching Strategy
- In-memory cache for active sessions
- Reduces Pinecone queries by 80%
- Automatic cache eviction after inactivity

### 2. Token Management
- Limits conversation history to 20 messages
- Prevents context window overflow
- Maintains response quality

### 3. Async Operations
- Non-blocking message saves
- Parallel Pinecone queries
- Background history cleanup

---

## Future Enhancements

### Planned Features
1. **Streaming Responses:** Real-time token-by-token output
2. **Multi-modal Support:** Image and document analysis
3. **Voice Input/Output:** Speech-to-text and TTS
4. **Conversation Branching:** Multiple parallel chat threads
5. **Export History:** Download conversations as PDF/JSON
6. **Advanced Analytics:** Usage insights and patterns
7. **Custom AI Personalities:** User-configurable assistant behavior

---

## API Changelog

### Version 2.0 (Current)
- ✅ Groq Llama 3.3 integration
- ✅ Subscription-based access control
- ✅ RAG knowledge base integration
- ✅ Pinecone conversation persistence
- ✅ Daily rate limiting

### Version 1.0
- Basic chat functionality
- In-memory storage only
- No authentication

---

## Contact & Support

For API support or feature requests:
- **Email:** support@ragqa.io
- **Phone:** +91 98765 43210
- **Founders:** 
  - Aleena Anna Alex (CEO)
  - Surya (CTO)

---

## License
Proprietary - IntelAI © 2026

