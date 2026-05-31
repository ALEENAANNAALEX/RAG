/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AI CHAT API - COMPLETE IMPLEMENTATION WITH RULES
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This is a comprehensive AI Chat API with built-in rules and validation.
 * All business rules, constraints, and validation logic are defined here.
 * 
 * Author: IntelAI
 * Version: 1.0.0
 * Created: February 2026
 */

import 'dotenv/config';
import Groq from "groq-sdk";
import { embeddings } from '../utils/helper.js';
import { Pinecone } from '@pinecone-database/pinecone';

// ═══════════════════════════════════════════════════════════════════════════
// API CONFIGURATION & RULES
// ═══════════════════════════════════════════════════════════════════════════

const API_RULES = {
    // Rate Limiting Rules
    RATE_LIMITS: {
        FREE_TIER: {
            DAILY_LIMIT: 10,
            RESET_HOURS: 24,
            DESCRIPTION: 'Free users get 10 messages per day'
        },
        PREMIUM_TIER: {
            DAILY_LIMIT: -1, // Unlimited
            DESCRIPTION: 'Premium users have unlimited messages'
        }
    },

    // Message Validation Rules
    MESSAGE: {
        MIN_LENGTH: 1,
        MAX_LENGTH: 2000,
        REQUIRED: true,
        ALLOWED_TYPES: ['string'],
        TRIM_WHITESPACE: true
    },

    // Session Rules
    SESSION: {
        ID_REQUIRED: false,
        AUTO_GENERATE: true,
        PREFIX: 'chat_session_',
        MAX_HISTORY_LENGTH: 20, // Keep last 20 messages
        PERSIST_TO_DB: true
    },

    // Authentication Rules
    AUTH: {
        REQUIRED: true,
        TOKEN_TYPE: 'Bearer',
        GUEST_ACCESS: false,
        VERIFY_SUBSCRIPTION: true
    },

    // AI Model Rules
    AI_MODEL: {
        PROVIDER: 'Groq',
        MODEL: 'llama-3.3-70b-versatile',
        TEMPERATURE: 0.5,
        MAX_TOKENS: 500,
        TIMEOUT_MS: 30000
    },

    // RAG (Retrieval-Augmented Generation) Rules
    RAG: {
        ENABLED: true,
        TOP_K_RESULTS: 5,
        MIN_SCORE: 0.5,
        KNOWLEDGE_BASE_REQUIRED: true,
        FREE_TIER_RESTRICTION: true // Free users only get KB queries
    },

    // Response Rules
    RESPONSE: {
        FORMAT: 'json',
        INCLUDE_METADATA: true,
        INCLUDE_SESSION_ID: true,
        MARKDOWN_SUPPORTED: true,
        MAX_RETRIES: 2
    },

    // Error Handling Rules
    ERROR_HANDLING: {
        LOG_ERRORS: true,
        RETURN_DETAILS: true,
        SANITIZE_MESSAGES: true,
        FALLBACK_RESPONSE: "I apologize, but I'm having trouble processing your request right now."
    },

    // Content Moderation Rules
    MODERATION: {
        ENABLED: true,
        BLOCK_PROFANITY: false,
        BLOCK_HARMFUL: true,
        LOG_VIOLATIONS: true
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// INITIALIZE SERVICES
// ═══════════════════════════════════════════════════════════════════════════

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

// In-memory conversation cache
const conversationCache = new Map();

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS WITH BUILT-IN RULES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Validate incoming message according to MESSAGE rules
 */
function validateMessage(message) {
    const rules = API_RULES.MESSAGE;
    
    if (rules.REQUIRED && !message) {
        return { valid: false, error: 'Message is required' };
    }
    
    if (typeof message !== 'string') {
        return { valid: false, error: 'Message must be a string' };
    }
    
    const trimmed = rules.TRIM_WHITESPACE ? message.trim() : message;
    
    if (trimmed.length < rules.MIN_LENGTH) {
        return { valid: false, error: `Message must be at least ${rules.MIN_LENGTH} character(s)` };
    }
    
    if (trimmed.length > rules.MAX_LENGTH) {
        return { valid: false, error: `Message cannot exceed ${rules.MAX_LENGTH} characters` };
    }
    
    return { valid: true, message: trimmed };
}

/**
 * Check rate limits according to RATE_LIMITS rules
 */
function checkRateLimit(user, subscription) {
    const limits = API_RULES.RATE_LIMITS;
    
    // Determine user tier
    const isPremium = subscription && subscription.isActive && subscription.isActive();
    const tier = isPremium ? limits.PREMIUM_TIER : limits.FREE_TIER;
    
    // Reset counter if 24 hours passed
    const hoursSinceReset = (new Date() - user.lastChatReset) / (1000 * 60 * 60);
    if (hoursSinceReset >= limits.FREE_TIER.RESET_HOURS) {
        user.dailyChatCount = 0;
        user.lastChatReset = new Date();
    }
    
    // Check limit
    if (tier.DAILY_LIMIT !== -1 && user.dailyChatCount >= tier.DAILY_LIMIT) {
        return {
            allowed: false,
            error: `Daily limit reached (${tier.DAILY_LIMIT} messages). ${isPremium ? '' : 'Please upgrade for unlimited access.'}`,
            limit: tier.DAILY_LIMIT,
            used: user.dailyChatCount
        };
    }
    
    return {
        allowed: true,
        limit: tier.DAILY_LIMIT,
        used: user.dailyChatCount,
        isPremium
    };
}

/**
 * Generate or validate session ID according to SESSION rules
 */
function handleSessionId(providedSessionId) {
    const rules = API_RULES.SESSION;
    
    if (providedSessionId) {
        return providedSessionId;
    }
    
    if (rules.AUTO_GENERATE) {
        return `${rules.PREFIX}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    return 'default';
}

/**
 * Fetch conversation history according to SESSION rules
 */
async function getConversationHistory(sessionId) {
    const rules = API_RULES.SESSION;
    
    // Check cache first
    if (conversationCache.has(sessionId)) {
        return conversationCache.get(sessionId);
    }
    
    // Fetch from Pinecone if persistence enabled
    if (rules.PERSIST_TO_DB) {
        try {
            const index = pinecone.index(process.env.PINECONE_INDEX);
            const queryResponse = await index.query({
                filter: { sessionId, type: 'chat' },
                topK: rules.MAX_HISTORY_LENGTH,
                includeMetadata: true
            });
            
            const messages = queryResponse.matches
                .sort((a, b) => new Date(a.metadata.timestamp) - new Date(b.metadata.timestamp))
                .map(match => ({
                    role: match.metadata.role,
                    content: match.metadata.content
                }));
            
            return messages;
        } catch (error) {
            console.error('Error fetching history:', error);
            return [];
        }
    }
    
    return [];
}

/**
 * Save message to Pinecone according to SESSION rules
 */
async function saveMessage(sessionId, role, content) {
    const rules = API_RULES.SESSION;
    
    if (!rules.PERSIST_TO_DB) return;
    
    try {
        const index = pinecone.index(process.env.PINECONE_INDEX);
        const embedding = await embeddings.embedQuery(content);
        
        await index.upsert([{
            id: `chat_${sessionId}_${Date.now()}_${role}`,
            values: embedding,
            metadata: {
                sessionId,
                role,
                content,
                timestamp: new Date().toISOString(),
                type: 'chat'
            }
        }]);
    } catch (error) {
        console.error('Error saving message:', error);
    }
}

/**
 * Fetch RAG context according to RAG rules
 */
async function fetchRAGContext(query, isPremium) {
    const rules = API_RULES.RAG;
    
    if (!rules.ENABLED) return null;
    
    try {
        const index = pinecone.index(process.env.PINECONE_INDEX);
        const queryEmbedding = await embeddings.embedQuery(query);
        
        const results = await index.query({
            vector: queryEmbedding,
            topK: rules.TOP_K_RESULTS,
            filter: { type: 'knowledge' },
            includeMetadata: true
        });
        
        const relevantChunks = results.matches
            .filter(match => match.score >= rules.MIN_SCORE)
            .map(match => match.metadata.content);
        
        const context = relevantChunks.join('\n\n');
        
        // For free tier, block if no relevant context found
        if (rules.FREE_TIER_RESTRICTION && !isPremium && context.length < 50) {
            return { blocked: true, reason: 'outside_knowledge_base' };
        }
        
        return { blocked: false, context };
    } catch (error) {
        console.error('Error fetching RAG context:', error);
        return { blocked: false, context: '' };
    }
}

/**
 * Generate AI response according to AI_MODEL rules
 */
async function generateAIResponse(messages, context) {
    const rules = API_RULES.AI_MODEL;
    
    const finalMessages = [...messages];
    
    // Add RAG context if available
    if (context) {
        finalMessages.splice(1, 0, {
            role: 'system',
            content: `KNOWLEDGE BASE CONTEXT:\n${context}\n\nUse this context to answer the user's question.`
        });
    }
    
    try {
        const completion = await Promise.race([
            groq.chat.completions.create({
                messages: finalMessages,
                model: rules.MODEL,
                temperature: rules.TEMPERATURE,
                max_tokens: rules.MAX_TOKENS
            }),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('AI request timeout')), rules.TIMEOUT_MS)
            )
        ]);
        
        return {
            success: true,
            response: completion.choices[0]?.message?.content || rules.FALLBACK_RESPONSE
        };
    } catch (error) {
        console.error('AI generation error:', error);
        return {
            success: false,
            response: API_RULES.ERROR_HANDLING.FALLBACK_RESPONSE,
            error: error.message
        };
    }
}

/**
 * Build system message based on user tier
 */
function buildSystemMessage(isPremium) {
    if (isPremium) {
        return {
            role: 'system',
            content: `You are an advanced AI Assistant for IntelAI.

CAPABILITIES:
- Answer questions about AI, Machine Learning, Data Science, RAG technology
- Provide technical explanations and code examples
- Assist with general knowledge queries

COMPANY INFO:
- Email: support@ragqa.io
- Phone: +91 98765 43210
- Founders: Aleena Anna Alex (CEO) and Surya (CTO)
- Services: RAG, Conversational AI, Document Processing, AI Orchestration, Predictive Analytics, AI Security

Be helpful, accurate, and professional.`
        };
    } else {
        return {
            role: 'system',
            content: `You are a RESTRICTED AI Assistant for IntelAI (Free Tier).

STRICT LIMITATIONS:
- ONLY answer questions about IntelAI company information
- Company: IntelAI
- Founders: Aleena Anna Alex (CEO) and Surya (CTO)
- Contact: support@ragqa.io, +91 98765 43210

For ANY question outside IntelAI information, respond:
"⚠️ This query requires a premium subscription. Upgrade for unlimited AI conversations on any topic!"

DO NOT provide general knowledge or technical assistance.`
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN API ENDPOINT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * AI Chat API - Main Endpoint
 * 
 * POST /api/v1/ai-chat
 * 
 * Request Body:
 * {
 *   "message": "User's message",
 *   "sessionId": "optional_session_id"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": "AI response",
 *   "sessionId": "session_id",
 *   "metadata": { ... }
 * }
 */
export const aiChatAPI = async (req, res) => {
    console.log('🤖 AI Chat API called:', new Date().toISOString());
    
    try {
        const { message: rawMessage, sessionId: rawSessionId } = req.body;
        const user = req.user; // From auth middleware
        
        // ═══════════════════════════════════════════════════════════════════
        // RULE 1: Authentication Check
        // ═══════════════════════════════════════════════════════════════════
        if (API_RULES.AUTH.REQUIRED && !user) {
            console.log('❌ Authentication required');
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
                message: 'Please login to use AI Chat',
                code: 'AUTH_REQUIRED'
            });
        }
        
        // ═══════════════════════════════════════════════════════════════════
        // RULE 2: Message Validation
        // ═══════════════════════════════════════════════════════════════════
        const validation = validateMessage(rawMessage);
        if (!validation.valid) {
            console.log('❌ Invalid message:', validation.error);
            return res.status(400).json({
                success: false,
                error: 'Invalid message',
                message: validation.error,
                code: 'INVALID_MESSAGE'
            });
        }
        const message = validation.message;
        
        // ═══════════════════════════════════════════════════════════════════
        // RULE 3: Session Handling
        // ═══════════════════════════════════════════════════════════════════
        const sessionId = handleSessionId(rawSessionId);
        console.log(`📝 Session: ${sessionId}`);
        
        // ═══════════════════════════════════════════════════════════════════
        // RULE 4: Rate Limiting
        // ═══════════════════════════════════════════════════════════════════
        const subscription = user.subscription;
        const rateCheck = checkRateLimit(user, subscription);
        
        if (!rateCheck.allowed) {
            console.log('❌ Rate limit exceeded');
            return res.status(429).json({
                success: false,
                error: 'Rate limit exceeded',
                message: rateCheck.error,
                code: 'RATE_LIMIT_EXCEEDED',
                metadata: {
                    limit: rateCheck.limit,
                    used: rateCheck.used
                }
            });
        }
        
        // Increment counter
        user.dailyChatCount += 1;
        await user.save();
        console.log(`✅ Rate limit check passed (${user.dailyChatCount}/${rateCheck.limit === -1 ? '∞' : rateCheck.limit})`);
        
        // ═══════════════════════════════════════════════════════════════════
        // RULE 5: Load Conversation History
        // ═══════════════════════════════════════════════════════════════════
        let history = conversationCache.get(sessionId);
        if (!history) {
            history = await getConversationHistory(sessionId);
            console.log(`📚 Loaded ${history.length} messages from history`);
        }
        
        // Build system message
        const systemMessage = buildSystemMessage(rateCheck.isPremium);
        const messages = [systemMessage, ...history];
        
        // ═══════════════════════════════════════════════════════════════════
        // RULE 6: RAG Context Retrieval
        // ═══════════════════════════════════════════════════════════════════
        const ragResult = await fetchRAGContext(message, rateCheck.isPremium);
        
        if (ragResult.blocked) {
            console.log('⚠️ Query blocked: Outside knowledge base (free tier)');
            return res.status(200).json({
                success: true,
                data: "⚠️ This query is outside your knowledge base. Please upgrade your subscription to access broader AI responses.\n\n🎯 **What you can ask about (Free Tier):**\n- IntelAI company information\n- Our services and features\n- Founders and contact details\n\n✨ **Upgrade to Premium** for unlimited AI conversations on any topic!",
                sessionId,
                metadata: {
                    blocked: true,
                    reason: 'outside_knowledge_base',
                    tier: 'free'
                }
            });
        }
        
        console.log(`🔍 RAG context fetched: ${ragResult.context.length} chars`);
        
        // ═══════════════════════════════════════════════════════════════════
        // RULE 7: Add User Message to History
        // ═══════════════════════════════════════════════════════════════════
        messages.push({ role: 'user', content: message });
        
        // Save user message
        await saveMessage(sessionId, 'user', message);
        
        // Trim history if needed
        const maxLength = API_RULES.SESSION.MAX_HISTORY_LENGTH;
        if (messages.length > maxLength + 1) { // +1 for system message
            messages.splice(1, messages.length - maxLength - 1);
        }
        
        // ═══════════════════════════════════════════════════════════════════
        // RULE 8: Generate AI Response
        // ═══════════════════════════════════════════════════════════════════
        console.log('🤖 Calling AI model...');
        const aiResult = await generateAIResponse(messages, ragResult.context);
        
        if (!aiResult.success) {
            console.error('❌ AI generation failed:', aiResult.error);
            return res.status(500).json({
                success: false,
                error: 'AI generation failed',
                message: aiResult.response,
                code: 'AI_ERROR'
            });
        }
        
        const aiResponse = aiResult.response;
        console.log('✅ AI response generated');
        
        // ═══════════════════════════════════════════════════════════════════
        // RULE 9: Save AI Response
        // ═══════════════════════════════════════════════════════════════════
        messages.push({ role: 'assistant', content: aiResponse });
        await saveMessage(sessionId, 'assistant', aiResponse);
        
        // Update cache
        conversationCache.set(sessionId, messages.slice(1)); // Exclude system message
        
        // ═══════════════════════════════════════════════════════════════════
        // RULE 10: Return Response
        // ═══════════════════════════════════════════════════════════════════
        const response = {
            success: true,
            data: aiResponse,
            sessionId: sessionId
        };
        
        if (API_RULES.RESPONSE.INCLUDE_METADATA) {
            response.metadata = {
                model: API_RULES.AI_MODEL.MODEL,
                provider: API_RULES.AI_MODEL.PROVIDER,
                timestamp: new Date().toISOString(),
                messageCount: messages.length - 1, // Exclude system
                tier: rateCheck.isPremium ? 'premium' : 'free',
                ragEnabled: API_RULES.RAG.ENABLED,
                contextUsed: ragResult.context.length > 0
            };
        }
        
        console.log('✅ Response sent successfully');
        return res.status(200).json(response);
        
    } catch (error) {
        // ═══════════════════════════════════════════════════════════════════
        // Error Handling According to ERROR_HANDLING Rules
        // ═══════════════════════════════════════════════════════════════════
        console.error('❌ AI Chat API Error:', error);
        
        if (API_RULES.ERROR_HANDLING.LOG_ERRORS) {
            console.error('Stack trace:', error.stack);
        }
        
        const errorResponse = {
            success: false,
            error: 'Internal server error',
            message: API_RULES.ERROR_HANDLING.FALLBACK_RESPONSE,
            code: 'SERVER_ERROR'
        };
        
        if (API_RULES.ERROR_HANDLING.RETURN_DETAILS && process.env.NODE_ENV === 'development') {
            errorResponse.details = error.message;
        }
        
        return res.status(500).json(errorResponse);
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// ADDITIONAL API ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Clear Chat History
 * POST /api/v1/ai-chat/clear
 */
export const clearChatHistoryAPI = async (req, res) => {
    try {
        const { sessionId } = req.body;
        
        if (!sessionId) {
            return res.status(400).json({
                success: false,
                error: 'Session ID required',
                code: 'MISSING_SESSION_ID'
            });
        }
        
        // Remove from cache
        conversationCache.delete(sessionId);
        
        // Delete from Pinecone
        try {
            const index = pinecone.index(process.env.PINECONE_INDEX);
            await index.deleteMany({ sessionId });
        } catch (error) {
            console.error('Error deleting from Pinecone:', error);
        }
        
        console.log(`✅ Chat history cleared for session: ${sessionId}`);
        
        return res.status(200).json({
            success: true,
            message: 'Chat history cleared',
            sessionId
        });
    } catch (error) {
        console.error('Error clearing history:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to clear history',
            code: 'CLEAR_ERROR'
        });
    }
};

/**
 * Get Chat History
 * GET /api/v1/ai-chat/history/:sessionId
 */
export const getChatHistoryAPI = async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        if (!sessionId) {
            return res.status(400).json({
                success: false,
                error: 'Session ID required',
                code: 'MISSING_SESSION_ID'
            });
        }
        
        const history = await getConversationHistory(sessionId);
        
        return res.status(200).json({
            success: true,
            data: history,
            sessionId,
            count: history.length
        });
    } catch (error) {
        console.error('Error fetching history:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch history',
            code: 'FETCH_ERROR'
        });
    }
};

/**
 * Get API Rules (for documentation/debugging)
 * GET /api/v1/ai-chat/rules
 */
export const getAPIRulesAPI = (req, res) => {
    return res.status(200).json({
        success: true,
        rules: API_RULES,
        version: '1.0.0'
    });
};

// ═══════════════════════════════════════════════════════════════════════════
// Export API Rules for external use
// ═══════════════════════════════════════════════════════════════════════════
export { API_RULES };

