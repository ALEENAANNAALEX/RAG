import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['guest', 'user', 'admin'],
        default: 'guest'
    },
    subscription: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription',
        default: null
    },
    documentsUploaded: {
        type: Number,
        default: 0
    },
    dailyChatCount: {
        type: Number,
        default: 0
    },
    lastChatReset: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Reset daily chat count
userSchema.methods.resetDailyChatIfNeeded = function() {
    const now = new Date();
    const lastReset = this.lastChatReset;
    
    // Reset if it's a new day
    if (now.toDateString() !== lastReset.toDateString()) {
        this.dailyChatCount = 0;
        this.lastChatReset = now;
        return true;
    }
    return false;
};

const User = mongoose.model('User', userSchema);

export default User;

