import 'dotenv/config';
import { Pinecone } from "@pinecone-database/pinecone";

const client = new Pinecone({ apiKey: process.env.PINECONE_API_KEY?.trim() });
const pineconeIndex = client.Index(process.env.PINECONE_INDEX);

async function clearAll() {
    try {
        const chatNamespace = process.env.CHAT_NAMESPACE || 'chat-history';
        const kbNamespace = process.env.PINECONE_NAMESPACE || 'qa-bot-namespace';

        console.log(`🧹 Clearing chat-history namespace: ${chatNamespace}`);
        await pineconeIndex.namespace(chatNamespace).deleteAll();
        console.log(`✅ Chat history cleared!`);

        console.log(`🧹 Clearing KB namespace: ${kbNamespace}`);
        await pineconeIndex.namespace(kbNamespace).deleteAll();
        console.log(`✅ KB namespace cleared!`);

        console.log(`🎉 All Pinecone data wiped. Old names are gone!`);
    } catch (e) {
        console.error('❌ Error:', e.message);
    }
    process.exit(0);
}

clearAll();
