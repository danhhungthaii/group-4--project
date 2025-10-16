const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Định nghĩa schema cho User với authentication và role
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email không hợp lệ']
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    phoneNumber: {
        type: String,
        required: false,
        trim: true,
        match: [/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ']
    },
    dateOfBirth: {
        type: Date,
        required: false
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: false
    },
    avatar: {
        type: String,
        default: null
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String,
        default: null
    },
    resetPasswordToken: {
        type: String,
        default: null
    },
    resetPasswordExpires: {
        type: Date,
        default: null
    },
    lastLogin: {
        type: Date,
        default: null
    },
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date,
        default: null
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

// Indexes được tạo tự động từ unique: true trong schema definition

// Virtual field để check nếu account bị lock
userSchema.virtual('isLocked').get(function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware để hash password
userSchema.pre('save', async function(next) {
    // Chỉ hash password nếu nó được modify
    if (!this.isModified('password')) return next();
    
    try {
        // Hash password với salt rounds = 12
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method để compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

// Method để tăng login attempts
userSchema.methods.incLoginAttempts = function() {
    // Nếu có previous lock và đã hết hạn
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $unset: {
                lockUntil: 1
            },
            $set: {
                loginAttempts: 1
            }
        });
    }
    
    const updates = { $inc: { loginAttempts: 1 } };
    
    // Nếu đạt max attempts và chưa bị lock
    if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
        updates.$set = {
            lockUntil: Date.now() + 2 * 60 * 60 * 1000 // Lock 2 hours
        };
    }
    
    return this.updateOne(updates);
};

// Method để reset login attempts
userSchema.methods.resetLoginAttempts = function() {
    return this.updateOne({
        $unset: {
            loginAttempts: 1,
            lockUntil: 1
        }
    });
};

// Method để populate role information
userSchema.methods.populateRole = function() {
    return this.populate('role', 'name description permissions');
};

// Static method để find user by email hoặc username
userSchema.statics.findByEmailOrUsername = function(identifier) {
    return this.findOne({
        $or: [
            { email: identifier },
            { username: identifier }
        ]
    });
};

// Virtual reference đến RefreshTokens
userSchema.virtual('refreshTokens', {
    ref: 'RefreshToken',
    localField: '_id',
    foreignField: 'userId'
});

// Virtual để đếm số active refresh tokens
userSchema.virtual('activeRefreshTokensCount', {
    ref: 'RefreshToken',
    localField: '_id',
    foreignField: 'userId',
    count: true,
    match: { 
        isActive: true,
        expiresAt: { $gt: new Date() }
    }
});

// Đảm bảo virtuals được serialize
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

// Tạo model từ schema
const User = mongoose.model('User', userSchema);

module.exports = User;