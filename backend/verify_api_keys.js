/**
 * API KEY VERIFICATION SCRIPT
 * 
 * Run this to verify all your API keys are configured correctly
 * Usage: node verify_api_keys.js
 */

import 'dotenv/config';
import Groq from 'groq-sdk';
import { Pinecone } from '@pinecone-database/pinecone';

console.log('🔍 Verifying API Keys Configuration...\n');

// ══════════════════════════════════════════════════════════════
// 1. Check Environment Variables
// ══════════════════════════════════════════════════════════════

const requiredVars = [
    'GROQ_API_KEY',
    'PINECONE_API_KEY',
    'PINECONE_INDEX',
    'JWT_SECRET',
    'MONGODB_URI'
];

let missingVars = [];

console.log('📋 Checking .env file...');
requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
        console.log(`   ❌ ${varName} - MISSING`);
        missingVars.push(varName);
    } else {
        const preview = value.substring(0, 15) + '...';
        console.log(`   ✅ ${varName} - ${preview}`);
    }
});

if (missingVars.length > 0) {
    console.log('\n❌ ERROR: Missing required environment variables!');
    console.log('   Please add these to your .env file:');
    missingVars.forEach(v => console.log(`   - ${v}`));
    process.exit(1);
}

console.log('\n✅ All environment variables are present\n');

// ══════════════════════════════════════════════════════════════
// 2. Test Groq API
// ══════════════════════════════════════════════════════════════

console.log('🤖 Testing Groq API...');
try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: 'Say "API key works!"' }],
        model: 'llama-3.3-70b-versatile',
        max_tokens: 10
    });
    
    const response = completion.choices[0]?.message?.content;
    console.log(`   ✅ Groq API is working!`);
    console.log(`   📝 Test response: "${response}"`);
} catch (error) {
    console.log(`   ❌ Groq API Error: ${error.message}`);
    console.log('   🔧 Check your GROQ_API_KEY at https://console.groq.com');
}

console.log('');

// ══════════════════════════════════════════════════════════════
// 3. Test Pinecone API
// ══════════════════════════════════════════════════════════════

console.log('📊 Testing Pinecone API...');
try {
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    
    // List indexes
    const indexes = await pinecone.listIndexes();
    console.log(`   ✅ Pinecone API is working!`);
    console.log(`   📝 Found ${indexes.indexes?.length || 0} indexes`);
    
    // Check if our index exists
    const indexName = process.env.PINECONE_INDEX;
    const indexExists = indexes.indexes?.some(idx => idx.name === indexName);
    
    if (indexExists) {
        console.log(`   ✅ Index "${indexName}" exists`);
    } else {
        console.log(`   ⚠️  Index "${indexName}" not found`);
        console.log(`   🔧 Create it at https://app.pinecone.io`);
        console.log(`   📏 Dimension: 384 (for all-MiniLM-L6-v2 embeddings)`);
    }
} catch (error) {
    console.log(`   ❌ Pinecone API Error: ${error.message}`);
    console.log('   🔧 Check your PINECONE_API_KEY at https://app.pinecone.io');
}

console.log('');

// ══════════════════════════════════════════════════════════════
// 4. Check JWT Secret
// ══════════════════════════════════════════════════════════════

console.log('🔐 Checking JWT Secret...');
const jwtSecret = process.env.JWT_SECRET;

if (jwtSecret.length < 32) {
    console.log(`   ⚠️  JWT_SECRET is too short (${jwtSecret.length} chars)`);
    console.log('   🔧 Recommended: 64+ characters for security');
} else {
    console.log(`   ✅ JWT_SECRET length is good (${jwtSecret.length} chars)`);
}

console.log('');

// ══════════════════════════════════════════════════════════════
// 5. Summary
// ══════════════════════════════════════════════════════════════

console.log('═══════════════════════════════════════════════════════');
console.log('📊 VERIFICATION SUMMARY');
console.log('═══════════════════════════════════════════════════════');
console.log('');
console.log('If all checks passed ✅, your API is ready to use!');
console.log('');
console.log('🚀 Start your server:');
console.log('   cd backend && npm start');
console.log('');
console.log('📡 Test your new AI Chat API:');
console.log('   POST http://localhost:3000/api/v1/ai-chat');
console.log('');
console.log('📚 Documentation:');
console.log('   - AI_CHAT_NEW_API_DOCS.md');
console.log('   - QUICK_START_NEW_API.md');
console.log('');

