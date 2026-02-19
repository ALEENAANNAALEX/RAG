import { scrapeMultipleUrls } from '../utils/scraper.js';
import { storeDocs } from '../utils/pinecone.js';
import { HTTP_STATUS_CODE } from '../utils/helper.js';

export const syncWebsiteContent = async (req, res) => {
    try {
        const { urls } = req.body;

        if (!urls || !Array.isArray(urls) || urls.length === 0) {
            return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
                success: false,
                message: "A list of URLs is required"
            });
        }

        console.log(`📡 Starting Website Content Sync for ${urls.length} URLs...`);

        // 1. Scrape Content
        const documents = await scrapeMultipleUrls(urls);

        if (documents.length === 0) {
            return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Failed to scrape any content from the provided URLs"
            });
        }

        // 2. Store in Pinecone (Namespace: qa-bot-namespace)
        // We set second param to true to clear existing doc knowledge if it's a full refresh
        // For now, let's just append or let storeDocs clear as configured.
        await storeDocs(documents, false);

        return res.status(HTTP_STATUS_CODE.OK).json({
            success: true,
            message: `Successfully scraped and indexed ${documents.length} pages`,
            count: documents.length
        });

    } catch (error) {
        console.error("❌ Website Sync Error:", error);
        return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Failed to sync website content",
            error: error.message
        });
    }
};
