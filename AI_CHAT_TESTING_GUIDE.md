# AI Chat API - Quick Testing Guide

## Prerequisites

Before testing, ensure you have:
1. ✅ Server running on `http://localhost:3000`
2. ✅ User account created (via signup)
3. ✅ JWT token obtained (via login)
4. ✅ API testing tool (Postman, cURL, or Thunder Client)

---

## Step 1: Register a New User

### Endpoint
```
POST http://localhost:3000/api/auth/register
```

### Request Body
```json
{
  "name": "Test User",
  "email": "testuser@example.com",
  "password": "securePassword123"
}
```

### cURL Command
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser@example.com",
    "password": "securePassword123"
  }'
```

### Expected Response
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NWQ...",
  "user": {
    "id": "65d1234567890abcdef12345",
    "name": "Test User",
    "email": "testuser@example.com"
  }
}
```

**💡 Save the token!** You'll need it for all subsequent requests.

---

## Step 2: Login (If Already Registered)

### Endpoint
```
POST http://localhost:3000/api/auth/login
```

### Request Body
```json
{
  "email": "testuser@example.com",
  "password": "securePassword123"
}
```

### cURL Command
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "securePassword123"
  }'
```

### Expected Response
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NWQ...",
  "user": {
    "id": "65d1234567890abcdef12345",
    "name": "Test User",
    "email": "testuser@example.com"
  }
}
```

---

## Step 3: Send Your First Chat Message

### Endpoint
```
POST http://localhost:3000/api/chat
```

### Headers
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
Content-Type: application/json
```

### Request Body
```json
{
  "message": "Who are the founders of IntelAI?",
  "sessionId": "test_session_001"
}
```

### cURL Command
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "message": "Who are the founders of IntelAI?",
    "sessionId": "test_session_001"
  }'
```

### Expected Response
```json
{
  "success": true,
  "data": "IntelAI was founded by **Aleena Anna Alex** (Co-Founder & CEO) and **Surya** (Co-Founder & CTO). The company specializes in RAG technology and AI solutions. You can contact them at support@ragqa.io or call +91 98765 43210.",
  "sessionId": "test_session_001",
  "serverId": "2026-02-23T12:00:00.000Z"
}
```

---

## Step 4: Continue the Conversation

### Request Body
```json
{
  "message": "What services does IntelAI offer?",
  "sessionId": "test_session_001"
}
```

### cURL Command
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "message": "What services does IntelAI offer?",
    "sessionId": "test_session_001"
  }'
```

### Expected Response
```json
{
  "success": true,
  "data": "IntelAI offers the following services:\n\n1. **RAG (Retrieval-Augmented Generation)** - Advanced document understanding\n2. **Conversational AI** - Intelligent chatbots and assistants\n3. **Intelligent Document Processing** - Extract insights from documents\n4. **AI Agent Orchestration** - Coordinate multiple AI agents\n5. **Predictive Analytics** - Data-driven insights\n6. **Enterprise AI Security** - Secure AI implementations",
  "sessionId": "test_session_001",
  "serverId": "2026-02-23T12:00:00.000Z"
}
```

---

## Step 5: Test Rate Limiting (Free Tier)

Send 11 messages in quick succession. The 11th should fail.

### 11th Request
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "message": "This is my 11th message",
    "sessionId": "test_session_001"
  }'
```

### Expected Response (403 Forbidden)
```json
{
  "success": false,
  "message": "Daily chat limit reached (10 messages). Please upgrade your subscription for unlimited access.",
  "requiresSubscription": true
}
```

---

## Step 6: Test Knowledge Base Restriction (Free Tier)

Ask a question outside the knowledge base.

### Request Body
```json
{
  "message": "Explain quantum computing in detail",
  "sessionId": "test_session_001"
}
```

### cURL Command
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "message": "Explain quantum computing in detail",
    "sessionId": "test_session_001"
  }'
```

### Expected Response
```json
{
  "success": true,
  "data": "⚠️ This query is outside your knowledge base. Please upgrade your subscription to access broader AI responses.\n\n🎯 **What you can ask about (Free Tier):**\n- IntelAI company information\n- Our services and features\n- Founders and contact details\n\n✨ **Upgrade to Pro** for unlimited AI conversations on any topic!"
}
```

---

## Step 7: Fetch Chat History

### Endpoint
```
GET http://localhost:3000/api/chat/history/:sessionId
```

### cURL Command
```bash
curl -X GET http://localhost:3000/api/chat/history/test_session_001 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Expected Response
```json
{
  "success": true,
  "data": [
    {
      "role": "user",
      "content": "Who are the founders of IntelAI?"
    },
    {
      "role": "assistant",
      "content": "IntelAI was founded by **Aleena Anna Alex** (Co-Founder & CEO)..."
    },
    {
      "role": "user",
      "content": "What services does IntelAI offer?"
    },
    {
      "role": "assistant",
      "content": "IntelAI offers the following services..."
    }
  ]
}
```

---

## Step 8: Clear Chat History

### Endpoint
```
POST http://localhost:3000/api/chat/clear
```

### Request Body
```json
{
  "sessionId": "test_session_001"
}
```

### cURL Command
```bash
curl -X POST http://localhost:3000/api/chat/clear \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "sessionId": "test_session_001"
  }'
```

### Expected Response
```json
{
  "success": true,
  "message": "Chat history cleared"
}
```

---

## Step 9: Check User Profile

### Endpoint
```
GET http://localhost:3000/api/auth/profile
```

### cURL Command
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Expected Response
```json
{
  "success": true,
  "user": {
    "id": "65d1234567890abcdef12345",
    "name": "Test User",
    "email": "testuser@example.com",
    "dailyChatCount": 3,
    "lastChatReset": "2026-02-23T00:00:00.000Z",
    "subscription": {
      "planName": "free",
      "features": {
        "aiChatAccess": true,
        "dailyChatLimit": 10,
        "documentUploadLimit": 5,
        "ragAccess": false
      },
      "status": "active"
    }
  }
}
```

---

## Complete Postman Collection

### Import this JSON into Postman:

```json
{
  "info": {
    "name": "IntelAI Chat API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth - Register",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"Test User\",\n  \"email\": \"testuser@example.com\",\n  \"password\": \"securePassword123\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/api/auth/register",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "auth", "register"]
        }
      }
    },
    {
      "name": "Auth - Login",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"testuser@example.com\",\n  \"password\": \"securePassword123\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/api/auth/login",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "auth", "login"]
        }
      }
    },
    {
      "name": "Chat - Send Message",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"message\": \"Who are the founders of IntelAI?\",\n  \"sessionId\": \"test_session_001\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/api/chat",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "chat"]
        }
      }
    },
    {
      "name": "Chat - Get History",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": {
          "raw": "http://localhost:3000/api/chat/history/test_session_001",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "chat", "history", "test_session_001"]
        }
      }
    },
    {
      "name": "Chat - Clear History",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"sessionId\": \"test_session_001\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/api/chat/clear",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "chat", "clear"]
        }
      }
    },
    {
      "name": "Auth - Get Profile",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": {
          "raw": "http://localhost:3000/api/auth/profile",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "auth", "profile"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "token",
      "value": "YOUR_JWT_TOKEN_HERE"
    }
  ]
}
```

---

## Testing Checklist

### ✅ Basic Functionality
- [ ] User can register successfully
- [ ] User can login successfully
- [ ] User can send a chat message
- [ ] AI responds with relevant answer
- [ ] Conversation history persists
- [ ] Multiple messages in same session work
- [ ] User can fetch chat history
- [ ] User can clear chat history

### ✅ Rate Limiting (Free Tier)
- [ ] First 10 messages succeed
- [ ] 11th message returns 403 error
- [ ] Counter resets after 24 hours

### ✅ Knowledge Base Restriction (Free Tier)
- [ ] IntelAI questions answered fully
- [ ] General questions return upgrade prompt
- [ ] Context retrieval works correctly

### ✅ Authentication
- [ ] Requests without token return 401
- [ ] Requests with invalid token return 401
- [ ] Requests with expired token return 401
- [ ] Valid token allows access

### ✅ Session Management
- [ ] SessionId persists across requests
- [ ] History loads correctly for session
- [ ] Multiple sessions work independently
- [ ] Clearing one session doesn't affect others

### ✅ Error Handling
- [ ] Empty message returns 400
- [ ] Missing fields return 400
- [ ] Server errors return 500 with message

---

## Common Issues & Solutions

### Issue: "Authorization header missing"
**Solution:** Make sure you include the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

### Issue: "Daily limit reached" immediately after signup
**Solution:** Check if user was already created. Try logging in instead of registering again.

### Issue: "Invalid token"
**Solution:** Token may have expired. Login again to get a fresh token.

### Issue: "Groq API error"
**Solution:** 
1. Check `.env` file has `GROQ_API_KEY`
2. Verify API key is valid on Groq console
3. Check internet connectivity

### Issue: "Pinecone timeout"
**Solution:**
1. Verify `PINECONE_API_KEY` in `.env`
2. Check Pinecone index exists
3. Ensure index name matches `PINECONE_INDEX` env var

---

## Environment Variables Required

Make sure your `.env` file contains:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/intelai-db

# JWT
JWT_SECRET=your_super_secret_key_here_change_in_production

# Groq API
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Pinecone
PINECONE_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
PINECONE_INDEX=intelai-rag-index

# Server
PORT=3000
```

---

## Sample Test Script (Node.js)

```javascript
const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
let token = '';

async function testAPI() {
  try {
    // 1. Register
    console.log('1. Registering user...');
    const registerRes = await axios.post(`${API_URL}/auth/register`, {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'Test123!'
    });
    token = registerRes.data.token;
    console.log('✅ Registration successful');

    // 2. Send chat message
    console.log('\n2. Sending chat message...');
    const chatRes = await axios.post(
      `${API_URL}/chat`,
      {
        message: 'Who are the founders?',
        sessionId: 'test_session_001'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    console.log('✅ Chat response:', chatRes.data.data);

    // 3. Get history
    console.log('\n3. Fetching history...');
    const historyRes = await axios.get(
      `${API_URL}/chat/history/test_session_001`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    console.log('✅ History count:', historyRes.data.data.length);

    // 4. Clear history
    console.log('\n4. Clearing history...');
    await axios.post(
      `${API_URL}/chat/clear`,
      { sessionId: 'test_session_001' },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    console.log('✅ History cleared');

    console.log('\n🎉 All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAPI();
```

---

## Performance Benchmarks

### Expected Response Times

| Endpoint | Expected Time | Notes |
|----------|---------------|-------|
| `/auth/register` | 100-300ms | Includes password hashing |
| `/auth/login` | 100-300ms | Includes password verification |
| `/chat` (first) | 2-4 seconds | Includes RAG + Groq inference |
| `/chat` (subsequent) | 1-2 seconds | History cached in memory |
| `/chat/history/:id` | 200-500ms | Pinecone query |
| `/chat/clear` | 100-300ms | Memory + Pinecone delete |

---

## Next Steps

After testing the API:
1. ✅ Try integrating with your frontend
2. ✅ Test with different user accounts
3. ✅ Monitor server logs for errors
4. ✅ Test rate limiting thoroughly
5. ✅ Try upgrading to premium and testing unlimited access

---

## Support

If you encounter issues:
- Check server logs: Look at terminal running `npm start`
- Check MongoDB: Verify user document exists
- Check Pinecone: Verify vectors are being stored
- Check Groq: Verify API key is valid

For questions, contact: support@ragqa.io

