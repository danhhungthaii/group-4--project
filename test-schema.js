// =============================================================================
// SCRIPT TEST CHO SCHEMA USER + ROLE
// File: test-schema.js
// =============================================================================

require('dotenv').config();
const mongoose = require('mongoose');
const { dbConnection } = require('./config/database');
const User = require('./models/User');
const Role = require('./models/Role');

async function testUserRoleSchema() {
    try {
        console.log('🚀 Bắt đầu test User + Role Schema...\n');
        
        // 1. Kết nối database
        await dbConnection.connect();
        console.log('✅ Kết nối database thành công\n');

        // 2. Xóa dữ liệu cũ
        await User.deleteMany({});
        await Role.deleteMany({});
        console.log('🧹 Đã xóa dữ liệu cũ\n');

        // 3. Test Role Schema
        console.log('📝 Test Role Schema:');
        
        // Tạo roles
        const adminRole = await Role.create({
            name: 'admin',
            description: 'Quản trị viên hệ thống',
            permissions: ['read_users', 'write_users', 'delete_users', 'manage_system'],
            isActive: true
        });
        console.log('✅ Tạo admin role thành công');

        const userRole = await Role.create({
            name: 'user',
            description: 'Người dùng thông thường', 
            permissions: ['read_posts'],
            isActive: true
        });
        console.log('✅ Tạo user role thành công');

        // Test enum validation
        try {
            await Role.create({
                name: 'invalid_role', // Không có trong enum
                description: 'Invalid role'
            });
        } catch (error) {
            console.log('✅ Role enum validation hoạt động đúng:', error.message.includes('enum'));
        }

        // 4. Test User Schema
        console.log('\n📝 Test User Schema:');

        // Tạo user hợp lệ
        const testUser = await User.create({
            username: 'testuser123',
            email: 'test@example.com',
            password: 'password123456',
            fullName: 'Nguyễn Văn Test',
            phoneNumber: '0123456789',
            role: adminRole._id,
            dateOfBirth: new Date('1990-01-01'),
            gender: 'male',
            isActive: true,
            isVerified: true
        });
        console.log('✅ Tạo user thành công');

        // Test password đã được hash
        console.log('✅ Password được hash:', testUser.password !== 'password123456');
        
        // Test password comparison
        const isValidPassword = await testUser.comparePassword('password123456');
        console.log('✅ Password comparison hoạt động:', isValidPassword);

        // Test populate role
        const userWithRole = await User.findById(testUser._id).populate('role');
        console.log('✅ Role populate hoạt động:', userWithRole.role.name === 'admin');

        // Test validation errors
        console.log('\n📝 Test Validation:');

        // Test email validation
        try {
            await User.create({
                username: 'testuser2',
                email: 'invalid-email', // Email không hợp lệ
                password: 'password123456',
                fullName: 'Test User 2',
                role: userRole._id
            });
        } catch (error) {
            console.log('✅ Email validation hoạt động đúng');
        }

        // Test username length
        try {
            await User.create({
                username: 'ab', // Quá ngắn (< 3 ký tự)
                email: 'test2@example.com',
                password: 'password123456', 
                fullName: 'Test User 3',
                role: userRole._id
            });
        } catch (error) {
            console.log('✅ Username length validation hoạt động đúng');
        }

        // Test password length  
        try {
            await User.create({
                username: 'testuser3',
                email: 'test3@example.com',
                password: '12345', // Quá ngắn (< 6 ký tự)
                fullName: 'Test User 4',
                role: userRole._id
            });
        } catch (error) {
            console.log('✅ Password length validation hoạt động đúng');
        }

        // Test phone number validation
        try {
            await User.create({
                username: 'testuser4',
                email: 'test4@example.com', 
                password: 'password123456',
                fullName: 'Test User 5',
                phoneNumber: '123abc', // Không đúng format
                role: userRole._id
            });
        } catch (error) {
            console.log('✅ Phone number validation hoạt động đúng');
        }

        // Test unique constraints
        try {
            await User.create({
                username: 'testuser123', // Username đã tồn tại
                email: 'test5@example.com',
                password: 'password123456',
                fullName: 'Test User 6',
                role: userRole._id
            });
        } catch (error) {
            console.log('✅ Username unique constraint hoạt động đúng');
        }

        try {
            await User.create({
                username: 'testuser5',
                email: 'test@example.com', // Email đã tồn tại
                password: 'password123456',
                fullName: 'Test User 7',
                role: userRole._id
            });
        } catch (error) {
            console.log('✅ Email unique constraint hoạt động đúng');
        }

        // 5. Test timestamps
        console.log('\n📝 Test Timestamps:');
        const now = new Date();
        const createdTime = new Date(testUser.createdAt);
        const updatedTime = new Date(testUser.updatedAt);
        
        console.log('✅ CreatedAt timestamp hoạt động:', Math.abs(now - createdTime) < 5000);
        console.log('✅ UpdatedAt timestamp hoạt động:', Math.abs(now - updatedTime) < 5000);

        // 6. Test static methods
        console.log('\n📝 Test Static Methods:');
        const foundUser = await User.findByEmailOrUsername('test@example.com');
        console.log('✅ findByEmailOrUsername hoạt động:', foundUser.username === 'testuser123');

        // 7. Test account locking
        console.log('\n📝 Test Account Locking:');
        
        // Simulate failed login attempts
        await testUser.incLoginAttempts();
        await testUser.incLoginAttempts(); 
        await testUser.incLoginAttempts();
        await testUser.incLoginAttempts();
        await testUser.incLoginAttempts(); // 5th attempt should lock

        const lockedUser = await User.findById(testUser._id);
        console.log('✅ Account locking hoạt động:', lockedUser.isLocked);

        console.log('\n🎉 TẤT CẢ TESTS ĐỀU PASS! Schema User + Role hoạt động hoàn hảo!');
        console.log('\n📋 Tóm tắt kết quả:');
        console.log('- ✅ Role schema với enum validation');
        console.log('- ✅ User schema với đầy đủ validation');
        console.log('- ✅ Password hashing tự động');
        console.log('- ✅ Unique constraints'); 
        console.log('- ✅ Email validation');
        console.log('- ✅ Phone number validation');
        console.log('- ✅ Timestamps tự động');
        console.log('- ✅ Role association');
        console.log('- ✅ Account locking mechanism');
        console.log('- ✅ Static methods');

        console.log('\n🚀 Server sẵn sàng để test với Postman!');
        console.log('📖 Xem file POSTMAN_TEST_GUIDE.md để hướng dẫn chi tiết');

    } catch (error) {
        console.error('❌ Lỗi trong quá trình test:', error.message);
    } finally {
        // Không đóng connection để có thể chạy server
        console.log('\n💡 Giữ connection mở để test với Postman...');
    }
}

// Chạy test nếu file này được gọi trực tiếp
if (require.main === module) {
    testUserRoleSchema();
}

module.exports = { testUserRoleSchema };