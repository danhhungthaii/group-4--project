const mongoose = require('mongoose');

// Định nghĩa schema cho User
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
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

// Tạo model từ schema
const User = mongoose.model('User', userSchema);

module.exports = User;