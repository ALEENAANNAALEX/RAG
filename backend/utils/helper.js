import 'dotenv/config'
import { pipeline } from '@xenova/transformers';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { TextLoader } from 'langchain/document_loaders/fs/text';
import Groq from "groq-sdk";

console.log("🔹 Loading helper.js - Version: LOCAL-GROQ-V2");

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || "").trim();
const GROQ_API_KEY = (process.env.GROQ_API_KEY || "").trim();

if (!GROQ_API_KEY) {
    console.error("❌ GROQ_API_KEY is missing! Chat will fail.");
} else {
    console.log("✅ GROQ_API_KEY loaded.");
}

const groq = new Groq({ apiKey: GROQ_API_KEY });

// Local Embeddings using Transformers.js (Runs on your CPU, No API needed)
// This avoids Google API 404 errors completely.
class LocalEmbeddings {
    constructor() {
        this.pipe = null;
        this.modelName = "Xenova/all-MiniLM-L6-v2";
    }
    async init() {
        if (!this.pipe) {
            console.log("📥 Loading local embedding model (feature-extraction)...");
            try {
                this.pipe = await pipeline('feature-extraction', this.modelName);
                console.log("✅ Local embedding model loaded successfully.");
            } catch (err) {
                console.error("❌ Failed to load local embedding model:", err);
                throw err;
            }
        }
    }
    async embedDocuments(texts) {
        console.log(`🧠 embedDocuments called with ${texts.length} texts`);
        await this.init();
        const results = [];
        for (const text of texts) {
            const output = await this.pipe(text, { pooling: 'mean', normalize: true });
            results.push(Array.from(output.data));
        }
        return results;
    }
    async embedQuery(text) {
        console.log(`🧠 embedQuery called for query: "${text.substring(0, 20)}..."`);
        await this.init();
        const output = await this.pipe(text, { pooling: 'mean', normalize: true });
        return Array.from(output.data);
    }
}

export const embeddings = new LocalEmbeddings();

// Groq LLM (Llama 3) for Fast Answering
export const llm = {
    async invoke(input) {
        const context = input.context || "";
        const question = input.question || "";

        if (!context || !question) return { content: "I need more information." };

        console.log("🤖 Sending query to Groq...");
        try {
            const completion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful assistant. Use the provided context to answer the user's question directly. If the answer is not in the context, say you don't know."
                    },
                    {
                        role: "user",
                        content: `Context: ${context}\n\nQuestion: ${question}`
                    }
                ],
                model: "llama-3.3-70b-versatile",
            });
            console.log("✅ Groq response received.");
            return { content: completion.choices[0]?.message?.content || "No response generated." };
        } catch (err) {
            console.error("❌ Groq Error:", err);
            return { content: `Groq Error: ${err.message || "Unknown error"}` };
        }
    }
};


// Load data
const loadData = async (file, extension) => {
    let loader
    switch (extension) {
        case '.pdf':
            loader = new PDFLoader(file)
            break;
        case '.csv':
            loader = new CSVLoader(file)
            break
        case '.txt':
            loader = new TextLoader(file)
            break
        default:
            throw Error('Unsupported file type')
    }
    const documents = await loader.load()
    return documents
}

// Split PDF text into chunks
const splitData = async (docs) => {
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 100,
    });
    const splittedDocs = await textSplitter.splitDocuments(docs);

    // Filter out chunks that are empty or only contain whitespace
    const filteredDocs = splittedDocs.filter(doc => doc.pageContent && doc.pageContent.trim().length > 0);

    console.log(`✂️ Split into ${splittedDocs.length} chunks, ${filteredDocs.length} remaining after filtering.`);
    return filteredDocs;
}

const fileFilter = (req, file, cb) => {
    // Accept PDF, CSV and TXT
    const allowedTypes = ['application/pdf', 'text/csv', 'text/plain'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, TXT, or CSV files are allowed.'), false);
    }
}

export const HTTP_STATUS_CODE = {
    BAD_REQUEST: 400,
    INTERNAL_SERVER_ERROR: 500,
    OK: 200,
    CREATED: 201,
    PAYLOAD_TOO_LARGE: 413,
    UNSUPPORTED_MEDIA_TYPE: 415,
    SERVICE_UNAVAILABLE: 503,
}
export {
    loadData,
    splitData,
    fileFilter,
}
