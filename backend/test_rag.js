import axios from 'axios';

const BASE_URL = 'http://localhost:5001';

async function testRag() {
    const questions = [
        "What is IntelAI?",
        "What services do you offer?",
        "How can I contact the team?"
    ];

    for (const q of questions) {
        try {
            console.log(`\n❓ Question: ${q}`);
            const { data } = await axios.post(`${BASE_URL}/api/query`, { query: q });
            console.log(`🤖 Answer: ${data.data}`);
        } catch (error) {
            console.error(`❌ Error:`, error.response?.data || error.message);
        }
    }
}

testRag();
