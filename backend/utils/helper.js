import 'dotenv/config'
import { pipeline } from '@xenova/transformers';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { TextLoader } from 'langchain/document_loaders/fs/text';

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || "").trim()
if (!GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY is missing in helper.js!");
} else {
    console.log("✅ GEMINI_API_KEY loaded in helper.js");
}

import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

// Initialize APIs
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Google Gemini Embeddings
class GeminiEmbeddings {
    constructor() {
        this.model = genAI.getGenerativeModel({ model: "embedding-001" });
    }

    async embedDocuments(texts) {
        const embeddings = [];
        for (const text of texts) {
            const result = await this.model.embedContent(text);
            const embedding = result.embedding;
            embeddings.push(embedding.values);
        }
        return embeddings;
    }

    async embedQuery(text) {
        const result = await this.model.embedContent(text);
        const embedding = result.embedding;
        return embedding.values;
    }
}

export const embeddings = new GeminiEmbeddings();

// Groq LLM (Llama 3) for Fast Answering
export const llm = {
    async invoke(input) {
        const context = input.context || "";
        const question = input.question || "";

        if (!context || !question) return { content: "I need more information." };

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
                model: "llama3-8b-8192",
            });

            return { content: completion.choices[0]?.message?.content || "No response generated." };
        } catch (err) {
            console.error("❌ Groq Error:", err);
            return { content: "Error generating answer." };
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
    // const loader = new PDFLoader(file);
    const documents = await loader.load()
    // console.log(documents)
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
