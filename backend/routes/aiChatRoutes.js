/**
 * AI Chat API Routes (v1)
 * 
 * All routes for the new AI Chat API with built-in rules
 * Located at: /api/v1/ai-chat/*
 */

import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { 
    aiChatAPI, 
    clearChatHistoryAPI, 
    getChatHistoryAPI,
    getAPIRulesAPI 
} from '../controllers/aiChatAPI.js';

export const aiChatRouter = express.Router();

// ═══════════════════════════════════════════════════════════════════════════
// AI CHAT API ROUTES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * POST /api/v1/ai-chat
 * Send a message to AI and get response
 * 
 * Auth: Required (JWT)
 * Body: { message: string, sessionId?: string }
 * Response: { success: true, data: string, sessionId: string, metadata: object }
 */
aiChatRouter.post('/', authenticate, aiChatAPI);

/**
 * POST /api/v1/ai-chat/clear
 * Clear conversation history for a session
 * 
 * Auth: Required (JWT)
 * Body: { sessionId: string }
 * Response: { success: true, message: string, sessionId: string }
 */
aiChatRouter.post('/clear', authenticate, clearChatHistoryAPI);

/**
 * GET /api/v1/ai-chat/history/:sessionId
 * Get conversation history for a session
 * 
 * Auth: Required (JWT)
 * Params: { sessionId: string }
 * Response: { success: true, data: array, sessionId: string, count: number }
 */
aiChatRouter.get('/history/:sessionId', authenticate, getChatHistoryAPI);

/**
 * GET /api/v1/ai-chat/rules
 * Get API rules and configuration
 * 
 * Auth: Not required
 * Response: { success: true, rules: object, version: string }
 */
aiChatRouter.get('/rules', getAPIRulesAPI);

// ═══════════════════════════════════════════════════════════════════════════
// Health Check for AI Chat API
// ═══════════════════════════════════════════════════════════════════════════

aiChatRouter.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        service: 'AI Chat API',
        version: '1.0.0',
        status: 'operational',
        timestamp: new Date().toISOString()
    });
});

console.log('✅ AI Chat API routes initialized');
console.log('   POST   /api/v1/ai-chat');
console.log('   POST   /api/v1/ai-chat/clear');
console.log('   GET    /api/v1/ai-chat/history/:sessionId');
console.log('   GET    /api/v1/ai-chat/rules');
console.log('   GET    /api/v1/ai-chat/health');

