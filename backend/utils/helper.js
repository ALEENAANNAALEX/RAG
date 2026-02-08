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

// Local Embeddings using Transformers.js (Runs on your CPU, No API needed)
class LocalEmbeddings {
    constructor() {
        this.pipe = null;
    }
    async init() {
        if (!this.pipe) {
            console.log("📥 Loading local embedding model (feature-extraction)...");
            this.pipe = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
            console.log("✅ Local embedding model loaded.");
        }
    }
    async embedDocuments(texts) {
        await this.init();
        const results = [];
        for (const text of texts) {
            const output = await this.pipe(text, { pooling: 'mean', normalize: true });
            results.push(Array.from(output.data));
        }
        return results;
    }
    async embedQuery(text) {
        await this.init();
        const output = await this.pipe(text, { pooling: 'mean', normalize: true });
        return Array.from(output.data);
    }
}

export const embeddings = new LocalEmbeddings();

// Local QA using Transformers.js (Extracts specific answers from document chunks)
let qaPipe = null;
export const llm = {
    async invoke(input) {
        const context = input.context || "";
        const question = input.question || "";

        if (!context || !question) return { content: "I couldn't find relevant information." };

        try {
            if (!qaPipe) {
                console.log("📥 Loading local model...");
                qaPipe = await pipeline('question-answering', 'Xenova/distilbert-base-cased-distilled-squad');
                console.log("✅ Ready.");
            }

            // Limit context to avoid model truncation
            const limitedContext = context.substring(0, 1500);

            console.log("🧠 Processing...");
            const result = await qaPipe(question, limitedContext);

            // If we have a reasonably confident answer, return it with a bit of surrounding context
            if (result && result.answer && result.score > 0.001) {
                const answer = result.answer.trim();
                // Find where the answer is in the context to show more surrounding text
                const startIdx = Math.max(0, context.indexOf(answer) - 100);
                const endIdx = Math.min(context.length, context.indexOf(answer) + answer.length + 300);
                const enrichedAnswer = context.substring(startIdx, endIdx).trim();

                return { content: enrichedAnswer + "..." };
            }

            // Fallback: Return a larger chunk of the relevant text
            return { content: context.substring(0, 1200).trim() + "..." };
        } catch (err) {
            console.error("❌ Local Error:", err);
            return { content: "I found the document but couldn't extract the exact answer." };
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
