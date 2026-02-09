import 'dotenv/config'
import { storeVector, createIndex } from './utils/pinecone.js';
import express from 'express'
import { router as Routes } from './routes/index.js';
import cors from 'cors'

const app = express()
const PINECONE_INDEX = process.env.PINECONE_INDEX
const PORT = process.env.PORT || 3000

async function setup() {
    console.log("📋 Starting setup...");
    try {
        console.log("🔧 Creating/checking Pinecone index:", PINECONE_INDEX);
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

// CRITICAL: Set CORS headers on EVERY response (even errors)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); // for parsing JSON

// Health Check Route
app.get('/', (req, res) => {
    res.status(200).json({ status: "healthy", message: "RAG Backend is running" });
});

app.use('/api', Routes)

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
        error: "NotFound"
    });
});

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
    await setup().catch(err => {
        console.error("❌ Setup error:", err.message);
    });
})