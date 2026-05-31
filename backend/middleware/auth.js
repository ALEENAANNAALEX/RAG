import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT token
export const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId).populate('subscription');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

// Optional authentication - allows both guest and logged-in users
export const optionalAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (token) {
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await User.findById(decoded.userId).populate('subscription');
            req.user = user;
        } else {
            req.user = null; // Guest user
        }
        
        next();
    } catch (error) {
        req.user = null; // Treat as guest if token is invalid
        next();
    }
};

// Check if user has active subscription
export const requireSubscription = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Login required to access this feature'
            });
        }

        const subscription = req.user.subscription;
        
        if (!subscription || !subscription.isActive()) {
            return res.status(403).json({
                success: false,
                message: 'Active subscription required',
                requiresSubscription: true
            });
        }

        req.subscription = subscription;
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error checking subscription status'
        });
    }
};

// Check feature access based on subscription
export const checkFeatureAccess = (feature) => {
    return async (req, res, next) => {
        try {
            // If not logged in, apply guest limitations
            if (!req.user) {
                req.accessLevel = 'guest';
                return next();
            }

            const subscription = req.user.subscription;
            
            if (!subscription || !subscription.isActive()) {
                req.accessLevel = 'guest';
                return next();
            }

            // Check if user has access to the feature
            if (!subscription.features[feature]) {
                return res.status(403).json({
                    success: false,
                    message: `Your subscription does not include ${feature}`,
                    requiresUpgrade: true
                });
            }

            req.accessLevel = 'premium';
            next();
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error checking feature access'
            });
        }
    };
};

// Generate JWT token
export const generateToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

