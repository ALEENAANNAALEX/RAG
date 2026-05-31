import 'dotenv/config'
import { storeVector, createIndex } from './utils/pinecone.js';
import express from 'express'
import { router as Routes } from './routes/index.js';
import { aiChatRouter } from './routes/aiChatRoutes.js'; // NEW AI Chat API
import cors from 'cors'
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()
const PINECONE_INDEX = process.env.PINECONE_INDEX
const PORT = process.env.PORT || 3000

async function setup() {
    console.log("📋 Starting setup...");
    try {
        // 🍃 MongoDB Connection
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/intelai-db';
        await mongoose.connect(MONGODB_URI);
        console.log("🍃 Connected to MongoDB Compass successfully...");

        // ✅ Create index only once (if it doesn't exist)
        await createIndex(PINECONE_INDEX)
        console.log("🚀 Setup complete successfully...")
    }
    catch (err) {
        console.log("⚠️ Setup caught error:", err.name);
        if (err.name === "PineconeConflictError") {
            console.log("✅ Pinecone index already exists. Using existing index.");
            console.log("🚀 Setup complete successfully...");
        }
        else {
            console.error("❌ Setup failed:", err.message)
            console.log("⚠️ Server running, but RAG setup failed. Check your API keys.");
        }
    }
}

// Prevent unhandled promise rejections from crashing the server
process.on('unhandledRejection', (reason, promise) => {
    console.error('⚠️ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('⚠️ Uncaught Exception:', error);
});

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); // for parsing JSON

// Request Logging Middleware
app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
        console.log(`📡 [${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    }
    next();
});

global.SERVER_ID = new Date().toISOString();
app.get('/health', (req, res) => {
    res.status(200).json({ status: "healthy", serverId: global.SERVER_ID });
});

// API Routes
app.use('/api', Routes);

// ✨ NEW AI Chat API (v1) with built-in rules
app.use('/api/v1/ai-chat', aiChatRouter);
console.log('✨ New AI Chat API mounted at: /api/v1/ai-chat');

// Serve Static Frontend Files
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

// Handle React Routing (Catch-all for non-API routes)
// Express 5 requires regex or named parameters for wildcard
// Express 5 requires regex or named parameters for wildcard
// Using app.use() as a catch-all for any request method
app.use((req, res) => {
    // console.log("⚠️ Catch-all hit:", req.method, req.url);
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// 404 Handler (Removed as catch-all handles usage)
// app.use((req, res) => { ... });

// Global Error Handler (MUST BE LAST)
app.use((err, req, res, next) => {
    console.error("🔥 Global Error Handler:", err);

    // Ensure CORS headers are present even on errors
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
        error: err.name || "Error"
    });
});

app.listen(PORT, async () => {
    console.log(`🚀 Server started successfully at port no. ${PORT}...`)
    console.log(`🆔 Process ID: ${process.pid} | 🕒 Start Time: ${global.SERVER_ID}`);
    await setup().catch(err => {
        console.error("❌ Setup error:", err.message);
    });
})