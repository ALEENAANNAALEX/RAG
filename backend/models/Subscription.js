import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    packageType: {
        type: String,
        enum: ['free', 'basic', 'pro', 'enterprise'],
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'expired', 'cancelled'],
        default: 'active'
    },
    features: {
        unlimitedChat: {
            type: Boolean,
            default: false
        },
        unlimitedDocuments: {
            type: Boolean,
            default: false
        },
        maxDocuments: {
            type: Number,
            default: 2
        },
        dailyChatLimit: {
            type: Number,
            default: 10
        },
        aiChatAccess: {
            type: Boolean,
            default: false
        },
        docChatAccess: {
            type: Boolean,
            default: false
        }
    },
    price: {
        type: Number,
        required: true
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: true
    },
    paymentId: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Method to check if subscription is active
subscriptionSchema.methods.isActive = function() {
    const now = new Date();
    return this.status === 'active' && this.endDate > now;
};

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;

