import { Pinecone } from "@pinecone-database/pinecone";
import 'dotenv/config'
import { PineconeStore } from "@langchain/pinecone";
import { loadData, splitData, llm, embeddings } from "./helper.js";

let client = null

const getPineconeClient = () => {
    if (!client) {
        const apiKey = process.env.PINECONE_API_KEY?.trim();
        if (!apiKey) {
            throw new Error("❌ PINECONE_API_KEY is missing in .env file");
        }
        client = new Pinecone({
            apiKey: apiKey,
        });
    }
    return client;
}

const getIndex = () => {
    const client = getPineconeClient()
    const pineconeIndex = client.Index(process.env.PINECONE_INDEX);
    return pineconeIndex
}

const createIndex = async (name) => {
    const pc = getPineconeClient()

    try {
        const description = await pc.describeIndex(name);
        // Force dimension 384 for Local Embeddings
        if (description.dimension !== 384) {
            console.log(`⚠️ Dimension mismatch: Index has ${description.dimension}, but model requires 384. Recreating index...`);
            await pc.deleteIndex(name);
            // Wait a moment for deletion to propagate
            await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
            console.log('✅ Index exists with correct dimension (384).');
            return pc.Index(name);
        }
    } catch (e) {
        console.log(`ℹ️ Index "${name}" does not exist or error checking. Creating...`);
    }

    const pineconeIndex = await pc.createIndex({
        name,
        dimension: 384,
        metric: 'cosine',
        spec: {
            serverless: {
                cloud: 'aws',
                region: 'us-east-1'
            }
        },
        deletionProtection: 'disabled',
        tags: { environment: 'development' },
    })
    console.log('✅ Index created successfully...')
    return pineconeIndex
}

const storeDocs = async (docs, clearNamespace = false) => {
    console.log(`📄 Processing ${docs.length} documents.`);
    const splittedDocs = await splitData(docs)
    console.log(`✂️ Data split into ${splittedDocs.length} chunks.`);

    if (splittedDocs.length === 0) {
        console.warn("⚠️ No chunks generated from documents.");
        return;
    }

    const pineconeIndex = getIndex()
    const namespace = process.env.PINECONE_NAMESPACE || 'qa-bot-namespace';

    if (clearNamespace) {
        console.log(`🧹 Clearing namespace: ${namespace}`);
        try {
            await pineconeIndex.namespace(namespace).deleteAll()
        } catch (e) {
            console.log("⚠️ Namespace clear skipped");
        }
    }

    console.log(`📤 Storing to Pinecone (Namespace: ${namespace})...`);
    await PineconeStore.fromDocuments(splittedDocs, embeddings, {
        pineconeIndex,
        namespace: namespace,
    })
    console.log('✅ Documents stored successfully...')
}

const storeVector = async (file, extension) => {
    console.log(`� Starting vector storage for ${extension} file...`);
    const docs = await loadData(file, extension)
    await storeDocs(docs, true); // Clear namespace on file upload
}

const getRelevantContext = async (userQuery) => {
    try {
        const pineconeIndex = getIndex()
        const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
            pineconeIndex,
            namespace: process.env.PINECONE_NAMESPACE || 'qa-bot-namespace',
        })

        const retriever = vectorStore.asRetriever({ k: 3 })
        console.log(`🔍 Searching Knowledge Base for: "${userQuery}"`);
        const docs = await retriever.invoke(userQuery);
        return docs.map(d => d.pageContent).join("\n\n");
    } catch (error) {
        console.error("⚠️ Error fetching context from Knowledge Base:", error);
        return ""; // Return empty context on error
    }
}

const retrieveVector = async (userQuery) => {
    const context = await getRelevantContext(userQuery);

    console.log(`🤖 Generating Groq response...`);
    const response = await llm.invoke({
        question: userQuery,
        context: context || "No specific background knowledge found. Use your general knowledge.",
    });

    // Handle both mock object response and real string response
    return response.content || response;
}

const saveChatMessage = async (sessionId, role, content) => {
    try {
        const pineconeIndex = getIndex();
        const namespace = process.env.CHAT_NAMESPACE || 'chat-history';
        const timestamp = Date.now();
        const id = `${sessionId}_${timestamp}_${Math.random().toString(36).substring(7)}`;

        console.log(`🧩 Preparing vector for ID: ${id} in namespace: ${namespace}`);

        // Truncate only for the embedding vector (model limit), but keep full metadata
        const storageLimit = 500;
        const vectorContent = content.length > storageLimit ? content.substring(0, storageLimit) : content;
        const vector = await embeddings.embedQuery(vectorContent);

        console.log(`📤 Upserting to Pinecone...`);
        await pineconeIndex.namespace(namespace).upsert([{
            id,
            values: vector,
            metadata: {
                sessionId,
                role,
                content, // FULL content stored here
                timestamp
            }
        }]);
        console.log(`✅ [${role.toUpperCase()}] ID ${id} saved successfully.`);
    } catch (error) {
        console.error(`❌ Error in saveChatMessage:`, error);
        throw error;
    }
}

const getChatHistory = async (sessionId) => {
    const pineconeIndex = getIndex();
    const namespace = process.env.CHAT_NAMESPACE || 'chat-history';

    console.log(`📡 Fetching chat history from Pinecone (Session: ${sessionId})`);

    // We use a zero vector for query if we just want metadata filtering
    // and don't care about semantic similarity here
    const zeroVector = new Array(384).fill(0);

    const queryResponse = await pineconeIndex.namespace(namespace).query({
        vector: zeroVector,
        filter: { sessionId: { "$eq": sessionId } },
        topK: 100,
        includeMetadata: true
    });

    const messages = queryResponse.matches
        .map(match => match.metadata)
        .sort((a, b) => a.timestamp - b.timestamp)
        .map(meta => ({ role: meta.role, content: meta.content }));

    return messages;
}

const deleteChatHistory = async (sessionId) => {
    const pineconeIndex = getIndex();
    const namespace = process.env.CHAT_NAMESPACE || 'chat-history';

    console.log(`🧹 Deleting chat history from Pinecone (Session: ${sessionId})`);

    // In serverless, we can delete by filter
    try {
        await pineconeIndex.namespace(namespace).deleteMany({
            sessionId: { "$eq": sessionId }
        });
    } catch (e) {
        console.error("❌ Delete historical chat error:", e.message);
    }
}

export { createIndex, storeVector, storeDocs, getPineconeClient, getIndex, retrieveVector, saveChatMessage, getChatHistory, deleteChatHistory, getRelevantContext };
