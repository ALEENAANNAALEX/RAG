import axios from 'axios';
import * as cheerio from 'cheerio';
import { Document } from '@langchain/core/documents';

/**
 * Scrapes a URL and returns a LangChain Document
 */
export const scrapeUrl = async (url) => {
    try {
        console.log(`🌐 Scraping URL: ${url}`);
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);

        // Remove script and style elements
        $('script, style, nav, footer').remove();

        // Get meaningful content
        const title = $('title').text() || $('h1').first().text();
        const content = $('body').text()
            .replace(/\s+/g, ' ')
            .trim();

        console.log(`✅ Scraped: ${title} (${content.length} chars)`);

        return new Document({
            pageContent: content,
            metadata: {
                source: url,
                title: title,
                type: 'web_scrape'
            }
        });
    } catch (error) {
        console.error(`❌ Error scraping ${url}:`, error.message);
        return null;
    }
};

/**
 * Scrapes multiple URLs and returns an array of Documents
 */
export const scrapeMultipleUrls = async (urls) => {
    const documents = [];
    for (const url of urls) {
        const doc = await scrapeUrl(url);
        if (doc) documents.push(doc);
    }
    return documents;
};
