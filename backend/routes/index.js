import express from 'express'
import { getQueryResponse, uploadFile } from '../controllers/index.js'
import multer from 'multer'
import { fileFilter, HTTP_STATUS_CODE } from '../utils/helper.js'

export const router = express.Router()
const storage = multer.memoryStorage()
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    }
})

router.post('/query', getQueryResponse)
router.post('/upload', (req, res, next) => {
    upload.single("file")(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(HTTP_STATUS_CODE.PAYLOAD_TOO_LARGE).json({
                    success: false,
                    message: "File too large. Maximum allowed size is 10MB.",
                    error: err.message ?? JSON.stringify(err),
                })
            }
            return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
                success: false,
                message: "File upload error",
                error: err?.message ?? JSON.stringify(err),
            });
        } 
        else if (err) {
            return res.status(HTTP_STATUS_CODE.UNSUPPORTED_MEDIA_TYPE).json({
                success: false,
                message: "Unsupported file type",
                error: err?.message ?? JSON.stringify(err),
            });
        }
        next(); // No error, proceed to controller
    });
}, uploadFile)