import fs from 'fs/promises';
import path from 'path';
import { Document } from '@langchain/core/documents';
import { storeDocs } from './utils/pinecone.js';

const PAGES_DIR = '../frontend/src/pages';

async function seedCompanyKnowledge() {
    try {
        console.log("🌱 Seeding Company Knowledge from Source Files...");
        const files = await fs.readdir(PAGES_DIR);
        const documents = [];

        for (const file of files) {
            if (file.endsWith('.jsx')) {
                console.log(`  📄 Processing ${file}...`);
                const content = await fs.readFile(path.join(PAGES_DIR, file), 'utf-8');

                // Clean up JSX to get text content (simple regex approach)
                const textOnly = content
                    .replace(/import.*?;/g, '') // Remove imports
                    .replace(/<.*?>/g, ' ') // Remove HTML tags
                    .replace(/\{.*?\}/g, ' ') // Remove JS objects
                    .replace(/\s+/g, ' ')
                    .trim();

                documents.push(new Document({
                    pageContent: textOnly,
                    metadata: {
                        source: `frontend/src/pages/${file}`,
                        title: file.replace('.jsx', ''),
                        type: 'project_source'
                    }
                }));
            }
        }

        if (documents.length > 0) {
            await storeDocs(documents, true); // Clear old KB and re-seed fresh
            console.log(`✅ Successfully indexed ${documents.length} project pages!`);
        }
    } catch (error) {
        console.error("❌ Seeding Failed:", error.message);
    }
}

seedCompanyKnowledge();
