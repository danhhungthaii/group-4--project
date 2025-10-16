const mongoose = require('mongoose');

// Định nghĩa schema cho Role
const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        enum: ['admin', 'user', 'moderator', 'guest'] // Các role được phép
    },
    description: {
        type: String,
        required: false,
        trim: true
    },
    permissions: [{
        type: String,
        enum: [
            'read_users',
            'write_users', 
            'delete_users',
            'read_posts',
            'write_posts',
            'delete_posts',
            'manage_roles',
            'manage_system'
        ]
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

// Index được tạo tự động từ unique: true trong schema definition

// Tạo model từ schema
const Role = mongoose.model('Role', roleSchema);

module.exports = Role;