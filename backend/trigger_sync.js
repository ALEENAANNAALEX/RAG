import axios from 'axios';

const BASE_URL = 'http://localhost:5001';

const urls = [
    `${BASE_URL}/`,
    `${BASE_URL}/services`,
    `${BASE_URL}/about`,
    `${BASE_URL}/pricing`,
    `${BASE_URL}/contact`
];

async function startSync() {
    try {
        console.log("🚀 Triggering Website Content Sync...");
        const { data } = await axios.post(`${BASE_URL}/api/sync`, { urls });
        console.log("✅ Sync Complete:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("❌ Sync Failed:", error.response?.data || error.message);
        console.log("💡 Make sure both backend and ngrok are running!");
    }
}

startSync();
