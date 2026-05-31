# AI Chat API - Architecture Diagrams

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT SIDE (Browser)                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   ┌───────────────────────────────────────────────────────────┐    │
│   │  React Frontend (AiChat.jsx)                              │    │
│   │  ┌────────────┐  ┌────────────┐  ┌────────────┐          │    │
│   │  │  Message   │  │   Chat     │  │  Session   │          │    │
│   │  │  Input     │  │  Display   │  │  Manager   │          │    │
│   │  └────────────┘  └────────────┘  └────────────┘          │    │
│   │         │              ▲               │                  │    │
│   └─────────┼──────────────┼───────────────┼──────────────────┘    │
│             │              │               │                        │
└─────────────┼──────────────┼───────────────┼────────────────────────┘
              │              │               │
              │ POST /chat   │ Response      │ GET /history
              │              │               │
              ▼              │               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       SERVER SIDE (Express.js)                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   ┌───────────────────────────────────────────────────────────┐    │
│   │  API Layer (Routes)                                        │    │
│   │  POST /api/chat                                            │    │
│   │  GET  /api/chat/history/:sessionId                         │    │
│   │  POST /api/chat/clear                                      │    │
│   └────────────────────────┬───────────────────────────────────┘    │
│                            │                                         │
│                            ▼                                         │
│   ┌───────────────────────────────────────────────────────────┐    │
│   │  Middleware Layer                                          │    │
│   │  ┌──────────────┐  ┌──────────────┐                       │    │
│   │  │ optionalAuth │  │ Rate Limiter │                       │    │
│   │  └──────────────┘  └──────────────┘                       │    │
│   └────────────────────────┬───────────────────────────────────┘    │
│                            │                                         │
│                            ▼                                         │
│   ┌───────────────────────────────────────────────────────────┐    │
│   │  Controller Layer (chat.js)                               │    │
│   │  ┌──────────────────────────────────────────────┐         │    │
│   │  │  generalChat()                               │         │    │
│   │  │  1. Validate input                           │         │    │
│   │  │  2. Check authentication                     │         │    │
│   │  │  3. Check rate limits                        │         │    │
│   │  │  4. Load conversation history                │         │    │
│   │  │  5. Fetch relevant context (RAG)             │         │    │
│   │  │  6. Call Groq API                            │         │    │
│   │  │  7. Save messages to Pinecone                │         │    │
│   │  │  8. Return response                          │         │    │
│   │  └──────────────────────────────────────────────┘         │    │
│   └────────────────────────┬───────────────────────────────────┘    │
│                            │                                         │
└────────────────────────────┼─────────────────────────────────────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
            ▼                ▼                ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │   MongoDB    │  │   Pinecone   │  │   Groq API   │
    │  (User Data) │  │  (Vectors)   │  │ (Llama 3.3)  │
    └──────────────┘  └──────────────┘  └──────────────┘
         Users           Chat History      AI Inference
      Subscriptions      Knowledge Base
```

---

## Request Flow Diagram

```
┌──────────┐
│  User    │
│  Types   │
│ Message  │
└─────┬────┘
      │
      │ 1. Input: "Who are the founders?"
      ▼
┌─────────────────────────────────────────┐
│  Frontend (React)                       │
│  ─────────────────────────────────────  │
│  • Capture input                        │
│  • Add to UI (optimistic update)        │
│  • Prepare HTTP request                 │
│  • Include JWT token                    │
│  • Include sessionId                    │
└─────┬───────────────────────────────────┘
      │
      │ 2. POST /api/chat
      │    Headers: Authorization: Bearer <token>
      │    Body: { message: "...", sessionId: "..." }
      ▼
┌─────────────────────────────────────────┐
│  Express Router                         │
│  ─────────────────────────────────────  │
│  Route: /api/chat                       │
└─────┬───────────────────────────────────┘
      │
      │ 3. Pass to middleware
      ▼
┌─────────────────────────────────────────┐
│  optionalAuth Middleware                │
│  ─────────────────────────────────────  │
│  • Extract JWT token                    │
│  • Verify signature                     │
│  • Decode userId                        │
│  • Load user from MongoDB               │
│  • Attach to req.user                   │
└─────┬───────────────────────────────────┘
      │
      │ 4. Pass to controller
      ▼
┌─────────────────────────────────────────┐
│  generalChat Controller - Step 1        │
│  ─────────────────────────────────────  │
│  • Validate: message not empty?         │
│  • Validate: user logged in?            │
│  └─ NO  → Return 401 Unauthorized       │
│  └─ YES → Continue                      │
└─────┬───────────────────────────────────┘
      │
      │ 5. Check subscription
      ▼
┌─────────────────────────────────────────┐
│  generalChat Controller - Step 2        │
│  ─────────────────────────────────────  │
│  • Reset daily count if 24h passed      │
│  • Check subscription tier              │
│    └─ Free: dailyLimit = 10             │
│    └─ Pro:  dailyLimit = -1 (unlimited) │
│  • Check: dailyChatCount < limit?       │
│    └─ NO  → Return 403 Forbidden        │
│    └─ YES → Increment counter & continue│
└─────┬───────────────────────────────────┘
      │
      │ 6. Load conversation history
      ▼
┌─────────────────────────────────────────┐
│  generalChat Controller - Step 3        │
│  ─────────────────────────────────────  │
│  • Check in-memory cache                │
│    └─ Found?   → Use it (fast!)         │
│    └─ Missing? → Query Pinecone         │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  Pinecone: getChatHistory()        │ │
│  │  • Filter by sessionId             │ │
│  │  • Sort by timestamp               │ │
│  │  • Return message array            │ │
│  └────────────────────────────────────┘ │
│                                          │
│  • Add system message (role-based)      │
│  • Store in memory for next request     │
└─────┬───────────────────────────────────┘
      │
      │ 7. RAG: Fetch relevant context
      ▼
┌─────────────────────────────────────────┐
│  generalChat Controller - Step 4        │
│  ─────────────────────────────────────  │
│  ┌────────────────────────────────────┐ │
│  │  Pinecone: getRelevantContext()    │ │
│  │  • Convert message to embedding    │ │
│  │  • Search similar vectors          │ │
│  │  • Filter: type = 'knowledge'      │ │
│  │  • Return top 5 matches            │ │
│  └────────────────────────────────────┘ │
│                                          │
│  • Check if context is meaningful       │
│    (Free tier: reject if empty)         │
└─────┬───────────────────────────────────┘
      │
      │ 8. Add user message to history
      ▼
┌─────────────────────────────────────────┐
│  generalChat Controller - Step 5        │
│  ─────────────────────────────────────  │
│  • Push user message to history array   │
│  • Save to Pinecone (for persistence)   │
│  • Trim history to last 20 messages     │
└─────┬───────────────────────────────────┘
      │
      │ 9. Prepare prompt for AI
      ▼
┌─────────────────────────────────────────┐
│  generalChat Controller - Step 6        │
│  ─────────────────────────────────────  │
│  Build prompt:                          │
│  ┌────────────────────────────────────┐ │
│  │ System: "You are AI Assistant..."  │ │
│  │ System: "KNOWLEDGE BASE CONTEXT:   │ │
│  │         Founders are Aleena & Surya"│ │
│  │ User:   "What services?"           │ │
│  │ Asst:   "We offer RAG, AI..."      │ │
│  │ User:   "Who are founders?"        │ │ <- Current
│  └────────────────────────────────────┘ │
└─────┬───────────────────────────────────┘
      │
      │ 10. Call Groq API
      ▼
┌─────────────────────────────────────────┐
│  Groq API (Llama 3.3 - 70B)             │
│  ─────────────────────────────────────  │
│  • Receive prompt                       │
│  • Process with 70B parameter model     │
│  • Generate response                    │
│  • Return completion                    │
└─────┬───────────────────────────────────┘
      │
      │ 11. Response: "Aleena Anna Alex (CEO)
      │              and Surya (CTO)"
      ▼
┌─────────────────────────────────────────┐
│  generalChat Controller - Step 7        │
│  ─────────────────────────────────────  │
│  • Extract AI response text             │
│  • Add to history array                 │
│  • Save to Pinecone (for persistence)   │
└─────┬───────────────────────────────────┘
      │
      │ 12. Return JSON response
      ▼
┌─────────────────────────────────────────┐
│  Frontend (React)                       │
│  ─────────────────────────────────────  │
│  • Receive response                     │
│  • Parse JSON                           │
│  • Add assistant message to state       │
│  • React re-renders                     │
│  • Message appears in chat UI           │
└─────┬───────────────────────────────────┘
      │
      ▼
┌──────────┐
│  User    │
│  Sees    │
│ Response │
└──────────┘

Total Time: ~1-3 seconds
```

---

## Database Schema Diagram

```
┌───────────────────────────────────────────────────────────────┐
│                         MongoDB                               │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Users Collection                                    │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │  _id              : ObjectId                         │    │
│  │  name             : String                           │    │
│  │  email            : String (unique)                  │    │
│  │  password         : String (bcrypt hashed)           │    │
│  │  dailyChatCount   : Number (0-10 for free)          │    │
│  │  lastChatReset    : Date (for 24h reset)            │    │
│  │  subscription     : ObjectId → Subscriptions         │◄───┐
│  │  createdAt        : Date                             │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Subscriptions Collection                            │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │  _id              : ObjectId                         │◄───┘
│  │  userId           : ObjectId → Users                 │
│  │  planName         : String (free/pro/enterprise)     │
│  │  features         : Object {                         │
│  │    aiChatAccess   : Boolean                          │
│  │    dailyChatLimit : Number (-1 = unlimited)          │
│  │    documentUpload : Number                           │
│  │    ragAccess      : Boolean                          │
│  │  }                                                   │
│  │  startDate        : Date                             │
│  │  endDate          : Date (null = lifetime)           │
│  │  status           : String (active/cancelled)        │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│                         Pinecone                              │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Chat Message Vectors                                │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │  id        : "chat_session_timestamp_role"           │    │
│  │  values    : [0.123, -0.456, ...] (384-dim)         │    │
│  │  metadata  : {                                       │    │
│  │    sessionId  : "session_1708707600000"              │    │
│  │    role       : "user" or "assistant"                │    │
│  │    content    : "Who are the founders?"              │    │
│  │    timestamp  : "2026-02-23T12:30:45.000Z"           │    │
│  │    type       : "chat"                               │    │
│  │  }                                                   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Knowledge Base Vectors                              │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │  id        : "kb_company_info_001"                   │    │
│  │  values    : [0.234, -0.567, ...] (384-dim)         │    │
│  │  metadata  : {                                       │    │
│  │    type       : "knowledge"                          │    │
│  │    category   : "company_info"                       │    │
│  │    content    : "Founders are Aleena & Surya..."     │    │
│  │    source     : "company_website"                    │    │
│  │    timestamp  : "2026-01-01T00:00:00.000Z"           │    │
│  │  }                                                   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
└───────────────────────────────────────────────────────────────┘

Relationship:
- User has one Subscription (1:1)
- User has many chat messages in Pinecone (1:N)
- SessionId groups messages together
```

---

## Authentication Flow

```
┌─────────────┐
│   User      │
│   Opens     │
│   App       │
└──────┬──────┘
       │
       │ 1. Check localStorage for token
       ▼
┌──────────────────────────────────────┐
│  Frontend                            │
│  ────────────────────────────────    │
│  token = localStorage.getItem('token')│
│                                      │
│  if (token) {                        │
│    // User was logged in            │
│  } else {                            │
│    // Show login prompt              │
│  }                                   │
└──────┬───────────────────────────────┘
       │
       │ 2. If token exists, verify it
       ▼
┌──────────────────────────────────────┐
│  GET /api/auth/profile               │
│  Headers: Authorization: Bearer ...  │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Backend Middleware                  │
│  ────────────────────────────────    │
│  • Extract token from header         │
│  • jwt.verify(token, SECRET)         │
│    └─ Invalid? → 401 Unauthorized    │
│    └─ Valid?   → Continue            │
│  • Decode userId from token          │
│  • Load user from MongoDB            │
│  • Attach user to request            │
└──────┬───────────────────────────────┘
       │
       │ 3. Return user profile
       ▼
┌──────────────────────────────────────┐
│  Response: {                         │
│    user: {                           │
│      id: "...",                      │
│      name: "...",                    │
│      email: "...",                   │
│      dailyChatCount: 5,              │
│      subscription: { ... }           │
│    }                                 │
│  }                                   │
└──────┬───────────────────────────────┘
       │
       │ 4. User authenticated!
       ▼
┌─────────────┐
│   User      │
│   Can Use   │
│   Chat      │
└─────────────┘
```

---

## Rate Limiting Flow

```
┌─────────────┐
│   User      │
│   Sends     │
│   Message   │
└──────┬──────┘
       │
       ▼
┌────────────────────────────────────────┐
│  Backend: Check Rate Limit             │
│  ──────────────────────────────────    │
│  1. Load user from database            │
│  2. Check lastChatReset timestamp      │
│                                        │
│  if (now - lastChatReset > 24 hours) { │
│    dailyChatCount = 0                  │
│    lastChatReset = now                 │
│    save()                              │
│  }                                     │
└────────┬───────────────────────────────┘
         │
         │ 3. Check subscription tier
         ▼
┌────────────────────────────────────────┐
│  Check dailyLimit                      │
│  ──────────────────────────────────    │
│  subscription = user.subscription      │
│                                        │
│  if (subscription.planName == "pro") { │
│    dailyLimit = -1  // Unlimited       │
│  } else {                              │
│    dailyLimit = 10  // Free tier       │
│  }                                     │
└────────┬───────────────────────────────┘
         │
         │ 4. Check if limit exceeded
         ▼
┌────────────────────────────────────────┐
│  Rate Limit Check                      │
│  ──────────────────────────────────    │
│  if (dailyLimit != -1 &&               │
│      dailyChatCount >= dailyLimit) {   │
│    ┌────────────────────────────────┐ │
│    │ Return 403 Forbidden           │ │
│    │ "Daily limit reached"          │ │
│    └────────────────────────────────┘ │
│  } else {                              │
│    dailyChatCount += 1                 │
│    save()                              │
│    continue to process message         │
│  }                                     │
└────────┬───────────────────────────────┘
         │
         ▼
┌─────────────┐      ┌─────────────┐
│   Allowed   │  OR  │   Blocked   │
│   Process   │      │   403 Error │
│   Message   │      │             │
└─────────────┘      └─────────────┘

Example Timeline (Free User):
─────────────────────────────────────────
Day 1, 10:00 AM
  Message 1 → ✅ (1/10)
  Message 2 → ✅ (2/10)
  ...
  Message 10 → ✅ (10/10)
  Message 11 → ❌ "Daily limit reached"
  Message 12 → ❌ "Daily limit reached"

Day 2, 10:01 AM (24h+1min later)
  Backend runs: resetDailyChatIfNeeded()
  dailyChatCount = 0
  lastChatReset = Day 2, 10:01 AM
  
  Message 1 → ✅ (1/10) - Fresh start!
```

---

## RAG (Retrieval-Augmented Generation) Flow

```
User asks: "What services does IntelAI offer?"
        │
        ▼
┌───────────────────────────────────────────────┐
│  Step 1: Convert Query to Embedding Vector   │
│  ───────────────────────────────────────────  │
│  embedQuery("What services does IntelAI...")  │
│  → [0.123, -0.456, 0.789, ..., 0.321]        │
│     (384 dimensions)                          │
└───────────────┬───────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────┐
│  Step 2: Query Pinecone for Similar Vectors  │
│  ───────────────────────────────────────────  │
│  index.query({                                │
│    vector: [0.123, -0.456, ...],              │
│    topK: 5,                                   │
│    filter: { type: 'knowledge' }              │
│  })                                           │
└───────────────┬───────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────┐
│  Step 3: Pinecone Returns Top 5 Matches      │
│  ───────────────────────────────────────────  │
│  Match 1 (score: 0.92):                       │
│  "IntelAI offers RAG, Conversational AI..."   │
│                                               │
│  Match 2 (score: 0.87):                       │
│  "Our services include Document Processing"   │
│                                               │
│  Match 3 (score: 0.81):                       │
│  "AI Agent Orchestration for enterprises"     │
│                                               │
│  Match 4 (score: 0.76):                       │
│  "Predictive Analytics and AI Security"       │
│                                               │
│  Match 5 (score: 0.65):                       │
│  "Founded by Aleena Anna Alex and Surya"      │
└───────────────┬───────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────┐
│  Step 4: Combine into Context String         │
│  ───────────────────────────────────────────  │
│  context = matches.join('\n\n')               │
│                                               │
│  KNOWLEDGE BASE CONTEXT:                      │
│  IntelAI offers RAG, Conversational AI...     │
│                                               │
│  Our services include Document Processing...  │
│                                               │
│  AI Agent Orchestration for enterprises...    │
│  ...                                          │
└───────────────┬───────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────┐
│  Step 5: Build Prompt for Groq               │
│  ───────────────────────────────────────────  │
│  [                                            │
│    {                                          │
│      role: "system",                          │
│      content: "You are AI Assistant..."       │
│    },                                         │
│    {                                          │
│      role: "system",                          │
│      content: "KNOWLEDGE BASE CONTEXT:        │
│                IntelAI offers RAG..."         │
│    },                                         │
│    {                                          │
│      role: "user",                            │
│      content: "What services does IntelAI..." │
│    }                                          │
│  ]                                            │
└───────────────┬───────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────┐
│  Step 6: Groq Generates Response             │
│  ───────────────────────────────────────────  │
│  Groq reads context and generates:            │
│                                               │
│  "IntelAI offers the following services:      │
│   1. RAG (Retrieval-Augmented Generation)     │
│   2. Conversational AI                        │
│   3. Intelligent Document Processing          │
│   4. AI Agent Orchestration                   │
│   5. Predictive Analytics                     │
│   6. Enterprise AI Security"                  │
└───────────────┬───────────────────────────────┘
                │
                ▼
        ┌───────────────┐
        │  User Sees    │
        │  Accurate,    │
        │  Grounded     │
        │  Response     │
        └───────────────┘

Key Benefits of RAG:
✅ Responses grounded in actual knowledge base
✅ Reduces AI hallucinations
✅ Always up-to-date (just update Pinecone)
✅ Scalable to millions of documents
```

---

## Session Management

```
┌──────────────────────────────────────────────────────────┐
│  Session Lifecycle                                       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  1. SESSION CREATION                                     │
│  ──────────────────────                                 │
│  User opens chat → Frontend generates:                   │
│  sessionId = `session_${Date.now()}`                     │
│  Example: "session_1708707600000"                        │
│                                                          │
│  ↓                                                       │
│                                                          │
│  2. FIRST MESSAGE                                        │
│  ────────────────                                       │
│  POST /api/chat { message: "...", sessionId: "..." }    │
│                                                          │
│  Backend:                                                │
│  • Checks if session exists in memory → NO              │
│  • Checks Pinecone for history → EMPTY                  │
│  • Creates new conversation array                        │
│  • Saves to memory: conversationHistory.set(sessionId)  │
│                                                          │
│  Message → Groq → Response                               │
│  Both saved to Pinecone with sessionId metadata          │
│                                                          │
│  ↓                                                       │
│                                                          │
│  3. SUBSEQUENT MESSAGES                                  │
│  ─────────────────────                                  │
│  POST /api/chat { message: "...", sessionId: "..." }    │
│                                                          │
│  Backend:                                                │
│  • Checks memory → FOUND! (fast)                        │
│  • Loads existing conversation                           │
│  • Adds new message to array                            │
│  • Saves to Pinecone                                     │
│                                                          │
│  ↓                                                       │
│                                                          │
│  4. PAGE REFRESH                                         │
│  ──────────────                                         │
│  Frontend:                                               │
│  • Loads sessionId from localStorage                     │
│  • GET /api/chat/history/session_1708707600000          │
│                                                          │
│  Backend:                                                │
│  • Session not in memory (server may have restarted)    │
│  • Queries Pinecone: filter { sessionId: "..." }        │
│  • Returns all messages                                  │
│  • Caches in memory for next request                    │
│                                                          │
│  Frontend displays full history → User continues         │
│                                                          │
│  ↓                                                       │
│                                                          │
│  5. CLEAR HISTORY                                        │
│  ───────────────                                        │
│  POST /api/chat/clear { sessionId: "..." }              │
│                                                          │
│  Backend:                                                │
│  • Remove from memory: conversationHistory.delete()     │
│  • Delete from Pinecone: deleteMany({ sessionId })      │
│                                                          │
│  Frontend:                                               │
│  • Generate new sessionId                                │
│  • Clear localStorage                                    │
│  • Reset UI                                              │
│                                                          │
└──────────────────────────────────────────────────────────┘

Memory Structure:
─────────────────
conversationHistory = Map {
  "session_1708707600000" => [
    { role: "system", content: "..." },
    { role: "user", content: "..." },
    { role: "assistant", content: "..." },
    ...
  ],
  "session_1708707700000" => [
    { role: "system", content: "..." },
    ...
  ]
}

Pinecone Structure:
───────────────────
[
  {
    id: "chat_session_1708707600000_1708707650000_user",
    values: [...],
    metadata: {
      sessionId: "session_1708707600000",
      role: "user",
      content: "Who are founders?",
      timestamp: "..."
    }
  },
  {
    id: "chat_session_1708707600000_1708707655000_assistant",
    values: [...],
    metadata: {
      sessionId: "session_1708707600000",
      role: "assistant",
      content: "Aleena and Surya",
      timestamp: "..."
    }
  }
]
```

---

## Technology Stack

```
┌──────────────────────────────────────────────────────────┐
│                     FRONTEND LAYER                        │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  React 18           - UI framework                       │
│  React Router       - Navigation                         │
│  Framer Motion      - Animations                         │
│  React Markdown     - Render AI responses                │
│  Lucide React       - Icons                              │
│  Vite               - Build tool                         │
│  localStorage       - Token & session persistence        │
│                                                          │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                     BACKEND LAYER                         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Express.js         - Web server                         │
│  MongoDB/Mongoose   - User data, subscriptions           │
│  JWT (jsonwebtoken) - Authentication                     │
│  bcrypt             - Password hashing                   │
│  cors               - Cross-origin requests              │
│  dotenv             - Environment variables              │
│  Multer             - File uploads                       │
│                                                          │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                       AI LAYER                            │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Groq SDK           - Llama 3.3 (70B) inference          │
│  Transformers.js    - Local embeddings                   │
│  (@xenova)            (Xenova/all-MiniLM-L6-v2)          │
│                                                          │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  MongoDB            - Users, subscriptions               │
│  Pinecone           - Vector database for:               │
│                       • Chat history                     │
│                       • Knowledge base                   │
│                       • RAG context                      │
│                                                          │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                   DEPLOYMENT LAYER                        │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Docker             - Containerization                   │
│  Docker Compose     - Multi-container orchestration      │
│  PowerShell         - Windows automation scripts         │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Conclusion

This architecture provides:
- ✅ **Scalability**: Pinecone handles millions of vectors
- ✅ **Performance**: In-memory caching + fast Groq inference
- ✅ **Reliability**: Persistent storage survives restarts
- ✅ **Security**: JWT auth + rate limiting + access control
- ✅ **Intelligence**: RAG for grounded responses
- ✅ **User Experience**: Session continuity across devices

The system is production-ready and can handle thousands of concurrent users.

