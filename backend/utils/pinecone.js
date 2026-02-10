import { Pinecone } from "@pinecone-database/pinecone";
import 'dotenv/config'
import { PineconeStore } from "@langchain/pinecone";
import { loadData, splitData, llm, embeddings } from "./helper.js";
import { StringOutputParser } from "@langchain/core/output_parsers"
import { PromptTemplate } from "@langchain/core/prompts";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";

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
        if (description.dimension !== 768) {
            console.log(`⚠️ Dimension mismatch: Index has ${description.dimension}, but model requires 768. Recreating index...`);
            await pc.deleteIndex(name);
            // Wait a moment for deletion to propagate
            await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
            console.log('✅ Index exists with correct dimension.');
            return pc.Index(name);
        }
    } catch (e) {
        console.log(`ℹ️ Index "${name}" does not exist or error checking. Creating...`);
    }

    const pineconeIndex = await pc.createIndex({
        name,
        dimension: 768,
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

const storeVector = async (file, extension) => {
    console.log(`📂 Starting vector storage for ${extension} file...`);
    const docs = await loadData(file, extension)
    console.log(`📄 Data loaded: ${docs.length} documents.`);
    const splittedDocs = await splitData(docs)
    console.log(`✂️ Data split into ${splittedDocs.length} chunks.`);

    if (splittedDocs.length === 0) {
        throw new Error("No valid text content could be extracted from the file. Please check if the file is empty or contains only images/scanned text.");
    }

    const pineconeIndex = getIndex()

    const namespace = process.env.PINECONE_NAMESPACE || 'default';
    console.log(`🧹 Clearing namespace: ${namespace}`);
    try {
        await pineconeIndex.namespace(namespace).deleteAll()
    } catch (e) {
        console.log("⚠️ Namespace clear skipped (might be empty or new)");
    }

    console.log(`📤 Generating embeddings for ${splittedDocs.length} chunks...`);
    // Generate embeddings manually to verify they are not empty
    const documentTexts = splittedDocs.map(doc => doc.pageContent);
    const generatedEmbeddings = await embeddings.embedDocuments(documentTexts);

    console.log(`✅ Generated ${generatedEmbeddings.length} embeddings.`);

    if (generatedEmbeddings.length === 0 || generatedEmbeddings[0].length === 0) {
        throw new Error(`Embedding generation returned empty vectors (dimension 0). This usually indicates an API issue or invalid model name "${embeddings.modelName}".`);
    }

    if (generatedEmbeddings[0].length !== 768) {
        throw new Error(`Embedding dimension mismatch: Model returned ${generatedEmbeddings[0].length} but index expects 768.`);
    }

    console.log(`📤 Storing to Pinecone index: ${process.env.PINECONE_INDEX}...`);
    const vectorStore = await PineconeStore.fromDocuments(splittedDocs, embeddings, {
        pineconeIndex,
        namespace: namespace,
    })
    console.log('✅ Vectors stored successfully...')
}

const retrieveVector = async (userQuery) => {
    const pineconeIndex = getIndex()

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex,
        namespace: process.env.PINECONE_NAMESPACE,
    })

    const retriever = vectorStore.asRetriever({
        k: 3,
    })

    console.log(`🔍 Retrieving context for: "${userQuery}"`);
    const docs = await retriever.invoke(userQuery);
    const context = docs.map(d => d.pageContent).join("\n\n");

    console.log(`🤖 Generating local response...`);
    const response = await llm.invoke({
        question: userQuery,
        context: context,
    });

    // Handle both mock object response and real string response
    return response.content || response;
}

export { createIndex, storeVector, getPineconeClient, getIndex, retrieveVector };
