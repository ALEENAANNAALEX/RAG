import { HTTP_STATUS_CODE } from "../utils/helper.js";
import { retrieveVector, storeVector } from "../utils/pinecone.js";
import path from 'path'
import fs from 'fs/promises'
import os from 'os'

export const getQueryResponse = async (req, res) => {
    const query = req.body.query?.trim();

    if (!query) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
            success: false,
            data: null,
            message: 'Bad request. Query is required.',
            error: 'ValidationError',
        })
    }

    try {
        const response = await retrieveVector(query)
        res.status(HTTP_STATUS_CODE.OK).json({
            success: true,
            data: response,
            message: 'Response fetched successfully',
            error: null,
        })
    }
    catch (error) {
        console.error("❌ Query Error:", error);
        res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
            success: false,
            data: null,
            message: `Error fetching response`,
            error: error?.message ?? JSON.stringify(error),
        })
    }
}

export const uploadFile = async (req, res) => {
    console.log("📥 Received upload request:", req.file?.originalname);

    if (!req.file) {
        console.log("❌ No file in request");
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
            success: false,
            message: 'No file provided',
            error: 'ValidationError',
        });
    }

    let tempFilePath = null;
    try {
        const buffer = req.file.buffer;
        const extension = path.extname(req.file.originalname)
        console.log("📄 File extension:", extension);
        console.log("📦 Buffer size:", buffer.length, "bytes");

        // Save to temp file for better LangChain compatibility
        tempFilePath = path.join(os.tmpdir(), `upload_${Date.now()}${extension}`);
        console.log("💾 Saving to temp file:", tempFilePath);
        await fs.writeFile(tempFilePath, buffer);
        console.log("✅ Temp file created successfully");

        console.log("🔄 Starting vector storage...");
        await storeVector(tempFilePath, extension)
        console.log("✅ Vector storage complete");

        // Clean up
        await fs.unlink(tempFilePath);
        console.log("🧹 Temp file removed");

        res.status(HTTP_STATUS_CODE.CREATED).json({
            success: true,
            message: 'File uploaded successfully',
            error: null,
        });
    }
    catch (err) {
        console.error("❌ Controller Upload Error:", err);
        console.error("❌ Error stack:", err.stack);
        if (tempFilePath) {
            try {
                await fs.unlink(tempFilePath);
                console.log("🧹 Cleaned up temp file after error");
            } catch (e) {
                console.log("⚠️ Could not clean up temp file");
            }
        }
        res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: `Error uploading file: ${err.message}`,
            error: err?.message ?? JSON.stringify(err),
        });
    }
}