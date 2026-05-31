import User from '../models/User.js';
import Subscription from '../models/Subscription.js';

// Available packages
const PACKAGES = {
    free: {
        name: 'Free',
        price: 0,
        duration: 365, // days
        features: {
            unlimitedChat: false,
            unlimitedDocuments: false,
            maxDocuments: 2,
            dailyChatLimit: 10,
            aiChatAccess: false,
            docChatAccess: false
        }
    },
    basic: {
        name: 'Basic',
        price: 9.99,
        duration: 30, // days
        features: {
            unlimitedChat: false,
            unlimitedDocuments: false,
            maxDocuments: 10,
            dailyChatLimit: 100,
            aiChatAccess: true,
            docChatAccess: true
        }
    },
    pro: {
        name: 'Pro',
        price: 29.99,
        duration: 30, // days
        features: {
            unlimitedChat: true,
            unlimitedDocuments: true,
            maxDocuments: -1, // unlimited
            dailyChatLimit: -1, // unlimited
            aiChatAccess: true,
            docChatAccess: true
        }
    },
    enterprise: {
        name: 'Enterprise',
        price: 99.99,
        duration: 30, // days
        features: {
            unlimitedChat: true,
            unlimitedDocuments: true,
            maxDocuments: -1, // unlimited
            dailyChatLimit: -1, // unlimited
            aiChatAccess: true,
            docChatAccess: true
        }
    }
};

// Get all available packages
export const getPackages = async (req, res) => {
    try {
        const packages = Object.keys(PACKAGES).map(key => ({
            id: key,
            ...PACKAGES[key]
        }));

        res.json({
            success: true,
            data: packages
        });
    } catch (error) {
        console.error('Get packages error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get packages'
        });
    }
};

// Dummy payment processing
export const processPayment = async (req, res) => {
    try {
        const { packageType, paymentDetails } = req.body;
        const userId = req.user._id;

        // Validate package type
        if (!PACKAGES[packageType]) {
            return res.status(400).json({
                success: false,
                message: 'Invalid package type'
            });
        }

        // Dummy payment validation
        if (!paymentDetails || !paymentDetails.cardNumber) {
            return res.status(400).json({
                success: false,
                message: 'Payment details required'
            });
        }

        // Simulate payment processing
        const paymentSuccess = simulatePaymentProcessing(paymentDetails);

        if (!paymentSuccess) {
            return res.status(400).json({
                success: false,
                message: 'Payment failed. Please check your card details.'
            });
        }

        // Generate dummy payment ID
        const paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // Create subscription
        const packageInfo = PACKAGES[packageType];
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + packageInfo.duration);

        // Check if user already has a subscription
        const existingSubscription = await Subscription.findOne({ userId });

        let subscription;
        if (existingSubscription) {
            // Update existing subscription
            existingSubscription.packageType = packageType;
            existingSubscription.status = 'active';
            existingSubscription.features = packageInfo.features;
            existingSubscription.price = packageInfo.price;
            existingSubscription.startDate = startDate;
            existingSubscription.endDate = endDate;
            existingSubscription.paymentId = paymentId;
            
            subscription = await existingSubscription.save();
        } else {
            // Create new subscription
            subscription = new Subscription({
                userId,
                packageType,
                status: 'active',
                features: packageInfo.features,
                price: packageInfo.price,
                startDate,
                endDate,
                paymentId
            });
            
            await subscription.save();
        }

        // Update user with subscription reference and role
        await User.findByIdAndUpdate(userId, {
            subscription: subscription._id,
            role: 'user'
        });

        res.json({
            success: true,
            message: 'Payment successful! Your subscription is now active.',
            data: {
                paymentId,
                subscription: {
                    id: subscription._id,
                    packageType: subscription.packageType,
                    features: subscription.features,
                    startDate: subscription.startDate,
                    endDate: subscription.endDate
                }
            }
        });
    } catch (error) {
        console.error('Payment processing error:', error);
        res.status(500).json({
            success: false,
            message: 'Payment processing failed'
        });
    }
};

// Simulate payment processing (dummy system)
function simulatePaymentProcessing(paymentDetails) {
    // Dummy validation - accepts any 16-digit card number except those starting with '0000'
    const { cardNumber, cvv, expiryMonth, expiryYear } = paymentDetails;
    
    if (!cardNumber || cardNumber.length < 16) {
        return false;
    }
    
    if (cardNumber.startsWith('0000')) {
        return false; // Simulate declined card
    }
    
    if (!cvv || cvv.length < 3) {
        return false;
    }
    
    if (!expiryMonth || !expiryYear) {
        return false;
    }
    
    // Simulate processing delay
    return true;
};

// Get user's current subscription
export const getSubscription = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const subscription = await Subscription.findOne({ userId });
        
        if (!subscription) {
            return res.json({
                success: true,
                data: null
            });
        }

        const isActive = subscription.isActive();

        res.json({
            success: true,
            data: {
                subscription: {
                    id: subscription._id,
                    packageType: subscription.packageType,
                    status: isActive ? 'active' : 'expired',
                    features: subscription.features,
                    startDate: subscription.startDate,
                    endDate: subscription.endDate,
                    isActive
                }
            }
        });
    } catch (error) {
        console.error('Get subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get subscription'
        });
    }
};

// Cancel subscription
export const cancelSubscription = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const subscription = await Subscription.findOne({ userId });
        
        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'No active subscription found'
            });
        }

        subscription.status = 'cancelled';
        await subscription.save();

        res.json({
            success: true,
            message: 'Subscription cancelled successfully'
        });
    } catch (error) {
        console.error('Cancel subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel subscription'
        });
    }
};

