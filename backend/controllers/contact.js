import Contact from '../models/Contact.js';
import { HTTP_STATUS_CODE } from '../utils/helper.js';

export const submitContact = async (req, res) => {
    try {
        const { firstName, lastName, email, subject, message } = req.body;

        if (!firstName || !lastName || !email || !message) {
            return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
                success: false,
                message: "Missing required fields"
            });
        }

        const newContact = new Contact({
            firstName,
            lastName,
            email,
            subject: subject || "General Inquiry",
            message
        });

        await newContact.save();

        console.log(`📩 New Contact Submission from ${email}`);

        return res.status(HTTP_STATUS_CODE.CREATED).json({
            success: true,
            message: "Contact form submitted and saved to MongoDB successfully"
        });
    } catch (error) {
        console.error("❌ MongoDB Contact Error:", error);
        return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
