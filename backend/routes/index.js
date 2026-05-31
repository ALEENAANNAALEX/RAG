import express from 'express'
import { getQueryResponse, uploadFile } from '../controllers/index.js'
import { generalChat, clearChatHistory, fetchChatHistory } from '../controllers/chat.js'
import { syncWebsiteContent } from '../controllers/scraper.js'
import { submitContact } from '../controllers/contact.js'
import { register, login, getProfile, logout } from '../controllers/auth.js'
import { getPackages, processPayment, getSubscription, cancelSubscription } from '../controllers/payment.js'
import { authenticate, optionalAuth, checkFeatureAccess } from '../middleware/auth.js'
import multer from 'multer'
import { fileFilter, HTTP_STATUS_CODE } from '../utils/helper.js'

export const router = express.Router()
const storage = multer.memoryStorage()
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    }
})

// Authentication routes
router.post('/auth/register', register)
router.post('/auth/login', login)
router.get('/auth/profile', authenticate, getProfile)
router.post('/auth/logout', authenticate, logout)

// Payment routes
router.get('/packages', getPackages)
router.post('/payment/process', authenticate, processPayment)
router.get('/subscription', authenticate, getSubscription)
router.post('/subscription/cancel', authenticate, cancelSubscription)

// Public routes
router.post('/sync', syncWebsiteContent)
router.post('/contact', submitContact)

// Protected/Limited routes
router.post('/chat', optionalAuth, generalChat)
router.post('/chat/clear', optionalAuth, clearChatHistory)
router.get('/chat/history/:sessionId', optionalAuth, fetchChatHistory)
router.post('/query', optionalAuth, getQueryResponse)
router.post('/upload', optionalAuth, (req, res, next) => {
    upload.single("file")(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(HTTP_STATUS_CODE.PAYLOAD_TOO_LARGE).json({
                    success: false,
                    message: "File too large. Maximum allowed size is 10MB.",
                    error: err.message ?? JSON.stringify(err),
                })
            }
            return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
                success: false,
                message: "File upload error",
                error: err?.message ?? JSON.stringify(err),
            });
        }
        else if (err) {
            return res.status(HTTP_STATUS_CODE.UNSUPPORTED_MEDIA_TYPE).json({
                success: false,
                message: "Unsupported file type",
                error: err?.message ?? JSON.stringify(err),
            });
        }
        next(); // No error, proceed to controller
    });
}, uploadFile)