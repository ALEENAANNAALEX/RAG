import 'dotenv/config';
import Groq from "groq-sdk";
import { HTTP_STATUS_CODE } from '../utils/helper.js';
import { saveChatMessage, getChatHistory, deleteChatHistory, getRelevantContext } from '../utils/pinecone.js';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';

const GROQ_API_KEY = (process.env.GROQ_API_KEY || "").trim();

if (!GROQ_API_KEY) {
    console.error("❌ GROQ_API_KEY is missing! General chat will fail.");
} else {
    console.log("✅ GROQ_API_KEY loaded for general chat.");
}

const groq = new Groq({ apiKey: GROQ_API_KEY });

// Store conversation history in memory (could be moved to database in production)
const conversationHistory = new Map();

export const generalChat = async (req, res) => {
    console.log("📥 Incoming chat request:", req.body);
    try {
        const { message, sessionId } = req.body;
        const user = req.user; // From optionalAuth middleware

        if (!message || !message.trim()) {
            return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
                success: false,
                message: "Message is required",
            });
        }

        // Check access limits
        let hasFullAccess = false;
        let dailyLimit = 10; // Free tier default

        if (user) {
            // Reset daily count if needed
            if (user.resetDailyChatIfNeeded()) {
                await user.save();
            }

            // Check if user has active subscription
            const subscription = user.subscription;
            if (subscription && subscription.isActive && subscription.isActive()) {
                hasFullAccess = subscription.features.aiChatAccess;
                dailyLimit = subscription.features.dailyChatLimit;
            }
            // Free users get 10 chats/day by default

            // Check if user exceeded daily limit (for non-unlimited users)
            if (dailyLimit !== -1 && user.dailyChatCount >= dailyLimit) {
                return res.status(HTTP_STATUS_CODE.FORBIDDEN).json({
                    success: false,
                    message: `Daily chat limit reached (${dailyLimit} messages). Please upgrade your subscription for unlimited access.`,
                    requiresSubscription: true
                });
            }

            // Increment chat count
            user.dailyChatCount += 1;
            await user.save();
        } else {
            // Guest user - must login
            return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({
                success: false,
                message: "Please login to use AI Chat. Create a free account to get started!",
                requiresAuth: true
            });
        }

        // Get or create conversation history for this session
        const session = sessionId || 'default';
        if (!conversationHistory.has(session)) {
            // Try memory first, if not there, try Pinecone
            console.log(`🔍 Checking Pinecone for history of session: ${session}`);
            const savedMessages = await getChatHistory(session);

            // Determine system message based on subscription
            let systemContent = '';
            
            if (hasFullAccess) {
                // Premium users get full AI capabilities
                systemContent = `You are a specialized AI Assistant for IntelAI. 
                
                STRICT RULES:
                1. Answer questions related to Artificial Intelligence, Machine Learning, Data Science, or RAG technology.
                2. IMPORTANT COMPANY INFO:
                   - Email: support@ragqa.io
                   - Phone: +91 98765 43210
                   - Founders: Aleena Anna Alex (Co-Founder & CEO) and Surya (Co-Founder & CTO)
                   - Services: RAG (Retrieval-Augmented Generation), Conversational AI, Intelligent Document Processing, AI Agent Orchestration, Predictive Analytics, and Enterprise AI Security.
                3. CONTACT INSTRUCTIONS: If asked about contacting us, provide the Email and Phone number above. NEVER mention "Live Chat", "Start Chat", or "Live Support".
                4. Answer about IntelAI only using the KNOWLEDGE BASE CONTEXT provided.
                5. If a topic is completely unrelated, politely redirect to AI or our services.`;
            } else {
                // Free users - STRICTLY LIMITED to knowledge base only
                systemContent = `You are a RESTRICTED AI Assistant for IntelAI (Free Tier). 
                
                CRITICAL RESTRICTIONS:
                1. You can ONLY answer questions about:
                   - IntelAI company information
                   - Our services and features
                   - Founders: Aleena Anna Alex (Co-Founder & CEO) and Surya (Co-Founder & CTO)
                   - Contact: support@ragqa.io, +91 98765 43210
                
                2. For ANY question outside IntelAI information, you MUST respond EXACTLY with:
                   "This query is outside your knowledge base. Please upgrade your subscription to access broader AI responses."
                
                3. DO NOT answer general questions about AI, programming, science, or any other topics.
                4. DO NOT provide helpful responses to unrelated queries.
                5. Only use the KNOWLEDGE BASE CONTEXT provided about IntelAI.`;
            }

            const systemMessage = {
                role: "system",
                content: systemContent
            };

            if (savedMessages && savedMessages.length > 0) {
                console.log(`✅ Loaded ${savedMessages.length} messages from Pinecone.`);
                conversationHistory.set(session, [systemMessage, ...savedMessages]);
            } else {
                console.log(`ℹ️ No history found in Pinecone. Starting fresh.`);
                conversationHistory.set(session, [systemMessage]);
            }
        }

        const history = conversationHistory.get(session);

        // 🔍 RAG: Fetch relevant context from Knowledge Base
        const kbContext = await getRelevantContext(message.trim());

        // For free users, check if query has relevant knowledge base context
        if (!hasFullAccess && (!kbContext || kbContext.trim().length < 50)) {
            // No relevant context found - query is likely outside knowledge base
            return res.status(HTTP_STATUS_CODE.OK).json({
                success: true,
                data: "⚠️ This query is outside your knowledge base. Please upgrade your subscription to access broader AI responses.\n\n🎯 **What you can ask about (Free Tier):**\n- IntelAI company information\n- Our services and features\n- Founders and contact details\n\n✨ **Upgrade to Pro** for unlimited AI conversations on any topic!"
            });
        }

        // Add user message to history
        history.push({
            role: "user",
            content: message.trim()
        });

        // SAVE: Wait for user message to save to Pinecone
        console.log(`💾 Attempting to save user message for session: ${session}`);
        await saveChatMessage(session, "user", message.trim());

        // Keep only last 20 messages to prevent token overflow
        if (history.length > 21) { // 1 system + 20 messages
            history.splice(1, history.length - 21);
        }

        console.log(`💬 General chat query received (session: ${session})`);

        // Prepare the messages for Groq - include KB Context if found
        const finalMessages = [...history];
        if (kbContext) {
            finalMessages.splice(1, 0, {
                role: "system",
                content: `KNOWLEDGE BASE CONTEXT: \n${kbContext}\n\nSTRICT INSTRUCTION: Use the above context to answer the user's question if relevant. If the context doesn't contain the answer, use your general knowledge but stay within the AI/Tech/RAG domain.`
            });
        }

        const completion = await groq.chat.completions.create({
            messages: finalMessages,
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            max_tokens: 300,
        });

        const assistantMessage = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

        // Add assistant response to history
        history.push({
            role: "assistant",
            content: assistantMessage
        });

        // SAVE: Wait for assistant message to save to Pinecone
        console.log(`💾 Attempting to save assistant message for session: ${session}`);
        await saveChatMessage(session, "assistant", assistantMessage);

        console.log("✅ General chat response generated.");

        return res.status(HTTP_STATUS_CODE.OK).json({
            success: true,
            data: assistantMessage,
            sessionId: session,
            serverId: global.SERVER_ID || "unknown"
        });

    } catch (error) {
        console.error("❌ General chat error:", error);
        return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Failed to process chat request",
            error: error.message
        });
    }
};

export const clearChatHistory = async (req, res) => {
    try {
        const { sessionId } = req.body;
        const session = sessionId || 'default';

        conversationHistory.delete(session);

        // Delete from Pinecone
        await deleteChatHistory(session);

        return res.status(HTTP_STATUS_CODE.OK).json({
            success: true,
            message: "Chat history cleared"
        });
    } catch (error) {
        console.error("❌ Clear history error:", error);
        return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Failed to clear chat history",
            error: error.message
        });
    }
};

export const fetchChatHistory = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = sessionId || 'default';

        // Check memory first
        if (conversationHistory.has(session)) {
            const history = conversationHistory.get(session);
            // Return without the system message
            return res.status(HTTP_STATUS_CODE.OK).json({
                success: true,
                data: history.slice(1)
            });
        }

        // Check Pinecone
        const savedMessages = await getChatHistory(session);
        if (savedMessages && savedMessages.length > 0) {
            return res.status(HTTP_STATUS_CODE.OK).json({
                success: true,
                data: savedMessages
            });
        }

        return res.status(HTTP_STATUS_CODE.OK).json({
            success: true,
            data: []
        });
    } catch (error) {
        console.error("❌ Fetch history error:", error);
        return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Failed to fetch chat history",
            error: error.message
        });
    }
};
