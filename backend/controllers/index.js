import { HTTP_STATUS_CODE } from "../utils/helper.js";
import { retrieveVector, storeVector } from "../utils/pinecone.js";
import User from '../models/User.js';
import path from 'path'
import fs from 'fs/promises'
import os from 'os'

export const getQueryResponse = async (req, res) => {
    const query = req.body.query?.trim();
    const user = req.user; // From optionalAuth middleware

    if (!query) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
            success: false,
            data: null,
            message: 'Bad request. Query is required.',
            error: 'ValidationError',
        })
    }

    // Check if user is logged in
    if (!user) {
        return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({
            success: false,
            data: null,
            message: 'Please login to use Doc Chat.',
            requiresAuth: true
        });
    }

    // Allow queries for all logged-in users (free and paid)
    // Check if they have documents uploaded
    if (user.documentsUploaded === 0) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
            success: false,
            data: null,
            message: 'Please upload a document first before querying.',
            error: 'No documents uploaded'
        });
    }

    try {
        const response = await retrieveVector(query, user._id.toString())
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
    const user = req.user; // From optionalAuth middleware

    if (!req.file) {
        console.log("❌ No file in request");
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
            success: false,
            message: 'No file provided',
            error: 'ValidationError',
        });
    }

    // Check document upload limits
    let maxDocuments = 2; // Default for free users
    let hasFullAccess = false;

    if (user) {
        const subscription = user.subscription;
        if (subscription && subscription.isActive && subscription.isActive()) {
            maxDocuments = subscription.features.maxDocuments;
            hasFullAccess = subscription.features.unlimitedDocuments;
        }
        // Free users get 2 documents by default

        // Check if user exceeded document limit
        if (!hasFullAccess && maxDocuments !== -1 && user.documentsUploaded >= maxDocuments) {
            return res.status(HTTP_STATUS_CODE.FORBIDDEN).json({
                success: false,
                message: `Document upload limit reached (${maxDocuments} documents). Please upgrade your subscription for more uploads.`,
                requiresUpgrade: true
            });
        }
    } else {
        // Guest users cannot upload - must be logged in
        return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({
            success: false,
            message: "Please login to upload documents. Create a free account to get started!",
            requiresAuth: true
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
        await storeVector(tempFilePath, extension, user._id.toString())
        console.log("✅ Vector storage complete");

        // Increment user's document count
        if (user) {
            user.documentsUploaded += 1;
            await user.save();
        }

        // Clean up
        await fs.unlink(tempFilePath);
        console.log("🧹 Temp file removed");

        res.status(HTTP_STATUS_CODE.CREATED).json({
            success: true,
            message: 'File uploaded successfully',
            documentsUploaded: user ? user.documentsUploaded : 0,
            maxDocuments: maxDocuments === -1 ? 'unlimited' : maxDocuments,
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