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
    avatarPublicId: {
        type: String,
        default: null
    },
    images: [{
        url: {
            type: String,
            required: true
        },
        publicId: {
            type: String,
            required: true
        },
        description: {
            type: String,
            default: ''
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
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
    emailVerificationToken: {
        type: String,
        default: null
    },
    emailVerificationExpires: {
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

// Method để tạo reset password token
userSchema.methods.createPasswordResetToken = function() {
    const crypto = require('crypto');
    
    // Tạo random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token và lưu vào database
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Token expires sau 15 phút
    this.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    
    // Trả về plain text token để gửi qua email
    return resetToken;
};

// Method để verify reset password token
userSchema.methods.verifyPasswordResetToken = function(token) {
    const crypto = require('crypto');
    
    // Hash token từ request
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    // So sánh với token trong database và check expiry
    return this.resetPasswordToken === hashedToken && 
           this.resetPasswordExpires > Date.now();
};

// Method để reset password
userSchema.methods.resetPassword = async function(newPassword) {
    this.password = newPassword; // Sẽ được hash bởi pre-save middleware
    this.resetPasswordToken = null;
    this.resetPasswordExpires = null;
    this.loginAttempts = 0; // Reset login attempts
    this.lockUntil = null; // Unlock account
    
    await this.save();
};

// Method để tạo email verification token
userSchema.methods.createEmailVerificationToken = function() {
    const crypto = require('crypto');
    
    const verificationToken = crypto.randomBytes(32).toString('hex');
    this.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    
    return verificationToken;
};

// Method để verify email token
userSchema.methods.verifyEmailToken = function(token) {
    const crypto = require('crypto');
    
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    return this.emailVerificationToken === hashedToken && 
           this.emailVerificationExpires > Date.now();
};

// Method để verify email
userSchema.methods.verifyEmail = async function() {
    this.isVerified = true;
    this.emailVerificationToken = null;
    this.emailVerificationExpires = null;
    
    await this.save();
};

// Method để update avatar với Cloudinary
userSchema.methods.updateAvatar = async function(cloudinaryResult) {
    // Xóa avatar cũ từ Cloudinary nếu có
    if (this.avatarPublicId) {
        try {
            const { deleteImage } = require('../config/cloudinary');
            await deleteImage(this.avatarPublicId);
        } catch (error) {
            console.error('Error deleting old avatar:', error);
        }
    }
    
    // Update với avatar mới
    this.avatar = cloudinaryResult.secure_url;
    this.avatarPublicId = cloudinaryResult.public_id;
    
    await this.save();
    return this;
};

// Method để thêm image vào gallery
userSchema.methods.addImage = async function(cloudinaryResult, description = '') {
    this.images.push({
        url: cloudinaryResult.secure_url,
        publicId: cloudinaryResult.public_id,
        description: description,
        uploadedAt: new Date()
    });
    
    await this.save();
    return this;
};

// Method để xóa image từ gallery
userSchema.methods.removeImage = async function(imageId) {
    const image = this.images.id(imageId);
    if (!image) {
        throw new Error('Image không tồn tại');
    }
    
    // Xóa từ Cloudinary
    try {
        const { deleteImage } = require('../config/cloudinary');
        await deleteImage(image.publicId);
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
    }
    
    // Xóa từ database
    this.images.pull(imageId);
    await this.save();
    
    return this;
};

// Method để get optimized avatar URL
userSchema.methods.getOptimizedAvatar = function(options = {}) {
    if (!this.avatarPublicId) return this.avatar;
    
    const { getOptimizedUrl } = require('../config/cloudinary');
    return getOptimizedUrl(this.avatarPublicId, options);
};

// Method để get thumbnail avatar
userSchema.methods.getAvatarThumbnail = function() {
    if (!this.avatarPublicId) return this.avatar;
    
    const { getThumbnailUrl } = require('../config/cloudinary');
    return getThumbnailUrl(this.avatarPublicId);
};

// Static method để cleanup expired reset tokens
userSchema.statics.cleanupExpiredTokens = async function() {
    const result = await this.updateMany(
        {
            $or: [
                { resetPasswordExpires: { $lt: Date.now() } },
                { emailVerificationExpires: { $lt: Date.now() } }
            ]
        },
        {
            $unset: {
                resetPasswordToken: 1,
                resetPasswordExpires: 1,
                emailVerificationToken: 1,
                emailVerificationExpires: 1
            }
        }
    );
    
    console.log(`Cleaned up ${result.modifiedCount} expired tokens`);
    return result;
};

// Tạo model từ schema
const User = mongoose.model('User', userSchema);

module.exports = User;