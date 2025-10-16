const mongoose = require('mongoose');
const crypto = require('crypto');

// Định nghĩa schema cho RefreshToken để quản lý JWT refresh tokens
const refreshTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    deviceInfo: {
        userAgent: {
            type: String,
            default: null
        },
        ipAddress: {
            type: String,
            default: null
        },
        deviceType: {
            type: String,
            enum: ['web', 'mobile', 'desktop', 'tablet', 'other'],
            default: 'web'
        }
    },
    lastUsed: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes để tối ưu performance - loại bỏ duplicate indexes
refreshTokenSchema.index({ userId: 1, isActive: 1 });
refreshTokenSchema.index({ token: 1, isActive: 1 });

// Static methods
refreshTokenSchema.statics = {
    // Tạo refresh token mới
    async generateToken(userId, deviceInfo = {}, expirationDays = 30) {
        try {
            // Tạo random token
            const token = crypto.randomBytes(64).toString('hex');
            
            // Tính expiration time
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + expirationDays);
            
            const refreshToken = new this({
                token,
                userId,
                expiresAt,
                deviceInfo: {
                    userAgent: deviceInfo.userAgent || null,
                    ipAddress: deviceInfo.ipAddress || null,
                    deviceType: deviceInfo.deviceType || 'web'
                }
            });
            
            await refreshToken.save();
            return refreshToken;
        } catch (error) {
            throw new Error(`Lỗi tạo refresh token: ${error.message}`);
        }
    },

    // Tìm và validate refresh token
    async findValidToken(token) {
        try {
            const refreshToken = await this.findOne({
                token,
                isActive: true,
                expiresAt: { $gt: new Date() }
            }).populate('userId', 'username email fullName role');
            
            return refreshToken;
        } catch (error) {
            throw new Error(`Lỗi tìm refresh token: ${error.message}`);
        }
    },

    // Vô hiệu hóa token
    async revokeToken(token) {
        try {
            const result = await this.updateOne(
                { token },
                { 
                    isActive: false,
                    updatedAt: new Date()
                }
            );
            
            return result.modifiedCount > 0;
        } catch (error) {
            throw new Error(`Lỗi revoke token: ${error.message}`);
        }
    },

    // Vô hiệu hóa tất cả tokens của user
    async revokeAllUserTokens(userId) {
        try {
            const result = await this.updateMany(
                { userId, isActive: true },
                { 
                    isActive: false,
                    updatedAt: new Date()
                }
            );
            
            return result.modifiedCount;
        } catch (error) {
            throw new Error(`Lỗi revoke all tokens: ${error.message}`);
        }
    },

    // Cleanup expired tokens
    async cleanupExpiredTokens() {
        try {
            const result = await this.deleteMany({
                expiresAt: { $lt: new Date() }
            });
            
            return result.deletedCount;
        } catch (error) {
            throw new Error(`Lỗi cleanup expired tokens: ${error.message}`);
        }
    },

    // Lấy tất cả active tokens của user
    async getUserActiveTokens(userId) {
        try {
            return await this.find({
                userId,
                isActive: true,
                expiresAt: { $gt: new Date() }
            }).sort({ createdAt: -1 });
        } catch (error) {
            throw new Error(`Lỗi lấy user tokens: ${error.message}`);
        }
    }
};

// Instance methods
refreshTokenSchema.methods = {
    // Cập nhật thời gian sử dụng cuối
    async updateLastUsed() {
        try {
            this.lastUsed = new Date();
            this.updatedAt = new Date();
            await this.save();
            return this;
        } catch (error) {
            throw new Error(`Lỗi cập nhật last used: ${error.message}`);
        }
    },

    // Kiểm tra token có còn valid không
    isValid() {
        return this.isActive && this.expiresAt > new Date();
    },

    // Extend expiration time
    async extendExpiration(additionalDays = 30) {
        try {
            const newExpirationDate = new Date(this.expiresAt);
            newExpirationDate.setDate(newExpirationDate.getDate() + additionalDays);
            
            this.expiresAt = newExpirationDate;
            this.updatedAt = new Date();
            await this.save();
            
            return this;
        } catch (error) {
            throw new Error(`Lỗi extend expiration: ${error.message}`);
        }
    }
};

// Middleware to update updatedAt before save
refreshTokenSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Virtual để lấy thời gian còn lại
refreshTokenSchema.virtual('remainingTime').get(function() {
    if (!this.isValid()) return 0;
    return Math.max(0, this.expiresAt.getTime() - Date.now());
});

// Virtual để lấy thời gian còn lại theo ngày
refreshTokenSchema.virtual('remainingDays').get(function() {
    const remainingMs = this.remainingTime;
    return Math.floor(remainingMs / (1000 * 60 * 60 * 24));
});

// Đảm bảo virtuals được serialize
refreshTokenSchema.set('toJSON', { virtuals: true });
refreshTokenSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);