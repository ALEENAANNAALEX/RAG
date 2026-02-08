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

app.use(cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: '*',
    credentials: true,
    optionsSuccessStatus: 200
}));

// Explicit OPTIONS handler for all routes
app.options('*', cors());

app.use(express.json()); // for parsing JSON

// Health Check Route
app.get('/', (req, res) => {
    res.status(200).json({ status: "healthy", message: "RAG Backend is running" });
});

app.use('/api', Routes)

app.listen(PORT, async () => {
    console.log(`🚀 Server started successfully at port no. ${PORT}...`)
    await setup().catch(err => {
        console.error("❌ Setup error:", err.message);
    });
})