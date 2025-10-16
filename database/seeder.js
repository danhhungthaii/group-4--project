const mongoose = require('mongoose');
const { dbConnection } = require('../config/database');
const Role = require('../models/Role');
const User = require('../models/User');

// Default roles data
const defaultRoles = [
    {
        name: 'admin',
        description: 'Quản trị viên hệ thống',
        permissions: [
            'read_users', 'write_users', 'delete_users',
            'read_posts', 'write_posts', 'delete_posts',
            'manage_roles', 'manage_system'
        ],
        isActive: true
    },
    {
        name: 'moderator',
        description: 'Người kiểm duyệt nội dung',
        permissions: [
            'read_users', 'write_users',
            'read_posts', 'write_posts', 'delete_posts'
        ],
        isActive: true
    },
    {
        name: 'user',
        description: 'Người dùng thông thường',
        permissions: [
            'read_posts', 'write_posts'
        ],
        isActive: true
    },
    {
        name: 'guest',
        description: 'Khách truy cập',
        permissions: [
            'read_posts'
        ],
        isActive: true
    }
];

// Test users data
const testUsers = [
    {
        username: 'admin',
        email: 'admin@group4.com',
        password: 'admin123456',
        fullName: 'System Administrator',
        phoneNumber: '0123456789',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'male',
        isActive: true,
        isVerified: true
    },
    {
        username: 'moderator',
        email: 'moderator@group4.com',
        password: 'mod123456',
        fullName: 'Content Moderator',
        phoneNumber: '0987654321',
        dateOfBirth: new Date('1992-05-15'),
        gender: 'female',
        isActive: true,
        isVerified: true
    },
    {
        username: 'testuser1',
        email: 'user1@group4.com',
        password: 'user123456',
        fullName: 'Test User One',
        phoneNumber: '0111222333',
        dateOfBirth: new Date('1995-08-20'),
        gender: 'male',
        isActive: true,
        isVerified: true
    },
    {
        username: 'testuser2',
        email: 'user2@group4.com',
        password: 'user123456',
        fullName: 'Test User Two',
        phoneNumber: '0444555666',
        dateOfBirth: new Date('1998-12-10'),
        gender: 'female',
        isActive: true,
        isVerified: false
    }
];

class DatabaseSeeder {
    async seedRoles() {
        try {
            console.log('🌱 Bắt đầu seed roles...');
            
            // Xóa tất cả roles cũ
            await Role.deleteMany({});
            console.log('🗑️ Đã xóa roles cũ');
            
            // Tạo roles mới
            const createdRoles = await Role.insertMany(defaultRoles);
            console.log(`✅ Đã tạo ${createdRoles.length} roles:`);
            createdRoles.forEach(role => {
                console.log(`   - ${role.name}: ${role.description}`);
            });
            
            return createdRoles;
        } catch (error) {
            console.error('💥 Lỗi khi seed roles:', error.message);
            throw error;
        }
    }

    async seedUsers() {
        try {
            console.log('🌱 Bắt đầu seed users...');
            
            // Lấy roles để gán cho users
            const roles = await Role.find({});
            const roleMap = {};
            roles.forEach(role => {
                roleMap[role.name] = role._id;
            });

            // Xóa tất cả users cũ
            await User.deleteMany({});
            console.log('🗑️ Đã xóa users cũ');
            
            // Gán role cho từng user
            const usersWithRoles = testUsers.map((user, index) => {
                const roleNames = ['admin', 'moderator', 'user', 'user'];
                return {
                    ...user,
                    role: roleMap[roleNames[index]]
                };
            });

            // Tạo users mới
            const createdUsers = await User.insertMany(usersWithRoles);
            console.log(`✅ Đã tạo ${createdUsers.length} users:`);
            
            // Populate role để hiển thị thông tin
            for (const user of createdUsers) {
                await user.populateRole();
                console.log(`   - ${user.username} (${user.email}) - Role: ${user.role.name}`);
            }
            
            return createdUsers;
        } catch (error) {
            console.error('💥 Lỗi khi seed users:', error.message);
            throw error;
        }
    }

    async seedAll() {
        try {
            console.log('🚀 Bắt đầu seed database...\n');
            
            // Kết nối database
            await dbConnection.connect();
            
            // Seed roles trước
            await this.seedRoles();
            console.log('');
            
            // Seed users sau
            await this.seedUsers();
            console.log('');
            
            console.log('✅ Seed database hoàn tất!');
            
        } catch (error) {
            console.error('💥 Lỗi khi seed database:', error.message);
            throw error;
        }
    }

    async clearAll() {
        try {
            console.log('🧹 Bắt đầu xóa tất cả dữ liệu...');
            
            await dbConnection.connect();
            
            await User.deleteMany({});
            await Role.deleteMany({});
            
            console.log('✅ Đã xóa tất cả dữ liệu!');
        } catch (error) {
            console.error('💥 Lỗi khi xóa dữ liệu:', error.message);
            throw error;
        }
    }
}

// Export seeder instance
const seeder = new DatabaseSeeder();

// Nếu file được chạy trực tiếp
if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0] || 'seed';

    (async () => {
        try {
            switch (command) {
                case 'seed':
                case 'all':
                    await seeder.seedAll();
                    break;
                case 'roles':
                    await seeder.seedRoles();
                    break;
                case 'users':
                    await seeder.seedUsers();
                    break;
                case 'clear':
                    await seeder.clearAll();
                    break;
                default:
                    console.log('Các lệnh hợp lệ: seed, roles, users, clear');
            }
        } catch (error) {
            console.error('Script thất bại:', error.message);
        } finally {
            await dbConnection.disconnect();
            process.exit(0);
        }
    })();
}

module.exports = seeder;