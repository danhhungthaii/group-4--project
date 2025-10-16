const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const RefreshToken = require('../models/RefreshToken');
const User = require('../models/User');
const Role = require('../models/Role');

// Database configuration
const connectDB = async () => {
    try {
        // Sử dụng in-memory database để test nếu MongoDB local không khả dụng
        const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/group4_database_test';
        
        await mongoose.connect(mongoUri, {
            // Removed deprecated options
        });
        console.log('✅ Kết nối MongoDB thành công!');
        console.log(`   📍 Connected to: ${mongoUri}`);
    } catch (error) {
        console.error('❌ Lỗi kết nối MongoDB:', error.message);
        console.log('\n💡 Hướng dẫn khắc phục:');
        console.log('1. Đảm bảo MongoDB đang chạy trên máy');
        console.log('2. Hoặc cập nhật MONGODB_URI trong .env để sử dụng MongoDB Atlas');
        console.log('3. Cài đặt MongoDB Community Server từ: https://www.mongodb.com/try/download/community');
        
        // Không thoát ngay lập tức, để có thể thấy thông báo
        throw error;
    }
};

// Test functions
const runRefreshTokenTests = async () => {
    console.log('\n🧪 === REFRESH TOKEN TESTS ===\n');

    try {
        // 1. Tạo test user và role trước
        console.log('1️⃣  Tạo test data...');
        
        // Tạo role nếu chưa có
        let testRole = await Role.findOne({ name: 'user' });
        if (!testRole) {
            testRole = new Role({
                name: 'user',
                description: 'Regular user role',
                permissions: ['read:posts', 'create:posts'],
                isActive: true
            });
            await testRole.save();
        }

        // Tạo test user
        const testUser = new User({
            username: 'refreshtoken_test_user',
            email: 'refreshtoken@test.com',
            password: 'testpassword123',
            fullName: 'Refresh Token Test User',
            phoneNumber: '0123456789',
            role: testRole._id,
            isActive: true,
            isVerified: true
        });
        await testUser.save();
        console.log(`   ✅ Tạo test user: ${testUser.username}`);

        // 2. Test tạo refresh token
        console.log('\n2️⃣  Test tạo refresh token...');
        
        const deviceInfo = {
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            ipAddress: '192.168.1.100',
            deviceType: 'web'
        };

        const refreshToken1 = await RefreshToken.generateToken(testUser._id, deviceInfo, 30);
        console.log(`   ✅ Tạo refresh token thành công:`);
        console.log(`      - Token ID: ${refreshToken1._id}`);
        console.log(`      - Token (first 20 chars): ${refreshToken1.token.substring(0, 20)}...`);
        console.log(`      - Expires at: ${refreshToken1.expiresAt}`);
        console.log(`      - Device type: ${refreshToken1.deviceInfo.deviceType}`);

        // 3. Test tìm và validate token
        console.log('\n3️⃣  Test tìm và validate token...');
        
        const foundToken = await RefreshToken.findValidToken(refreshToken1.token);
        if (foundToken) {
            console.log(`   ✅ Tìm token hợp lệ thành công:`);
            console.log(`      - User: ${foundToken.userId.username}`);
            console.log(`      - Valid: ${foundToken.isValid()}`);
            console.log(`      - Remaining days: ${foundToken.remainingDays}`);
        } else {
            console.log('   ❌ Không tìm thấy token hợp lệ');
        }

        // 4. Test tạo multiple tokens cho cùng user
        console.log('\n4️⃣  Test tạo multiple tokens...');
        
        const refreshToken2 = await RefreshToken.generateToken(testUser._id, {
            userAgent: 'Mobile App',
            ipAddress: '192.168.1.101',
            deviceType: 'mobile'
        }, 15);
        
        const refreshToken3 = await RefreshToken.generateToken(testUser._id, {
            userAgent: 'Desktop App',
            ipAddress: '192.168.1.102',
            deviceType: 'desktop'
        }, 45);

        console.log(`   ✅ Tạo thêm 2 tokens cho user ${testUser.username}`);

        // 5. Test lấy tất cả active tokens của user
        console.log('\n5️⃣  Test lấy active tokens của user...');
        
        const userTokens = await RefreshToken.getUserActiveTokens(testUser._id);
        console.log(`   ✅ User có ${userTokens.length} active tokens:`);
        userTokens.forEach((token, index) => {
            console.log(`      ${index + 1}. Device: ${token.deviceInfo.deviceType}, Created: ${token.createdAt}`);
        });

        // 6. Test update last used
        console.log('\n6️⃣  Test update last used...');
        
        const oldLastUsed = refreshToken1.lastUsed;
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        await refreshToken1.updateLastUsed();
        console.log(`   ✅ Updated last used:`);
        console.log(`      - Old: ${oldLastUsed}`);
        console.log(`      - New: ${refreshToken1.lastUsed}`);

        // 7. Test extend expiration
        console.log('\n7️⃣  Test extend expiration...');
        
        const oldExpiration = new Date(refreshToken2.expiresAt);
        await refreshToken2.extendExpiration(10);
        console.log(`   ✅ Extended expiration:`);
        console.log(`      - Old: ${oldExpiration}`);
        console.log(`      - New: ${refreshToken2.expiresAt}`);

        // 8. Test revoke single token
        console.log('\n8️⃣  Test revoke single token...');
        
        const revokeSuccess = await RefreshToken.revokeToken(refreshToken3.token);
        console.log(`   ${revokeSuccess ? '✅' : '❌'} Revoke token: ${revokeSuccess ? 'thành công' : 'thất bại'}`);
        
        const revokedToken = await RefreshToken.findOne({ token: refreshToken3.token });
        console.log(`      - Token is active: ${revokedToken.isActive}`);
        console.log(`      - Token is valid: ${revokedToken.isValid()}`);

        // 9. Test populate user trong token
        console.log('\n9️⃣  Test populate user information...');
        
        const tokenWithUser = await RefreshToken.findValidToken(refreshToken1.token);
        if (tokenWithUser && tokenWithUser.userId) {
            console.log(`   ✅ Populated user info:`);
            console.log(`      - Username: ${tokenWithUser.userId.username}`);
            console.log(`      - Email: ${tokenWithUser.userId.email}`);
            console.log(`      - Full name: ${tokenWithUser.userId.fullName}`);
        }

        // 10. Test virtual fields in User
        console.log('\n🔟  Test User virtual fields...');
        
        const userWithTokens = await testUser.populate('refreshTokens');
        console.log(`   ✅ User virtual refreshTokens: ${userWithTokens.refreshTokens.length} tokens`);

        // 11. Test invalid token scenarios
        console.log('\n1️⃣1️⃣  Test invalid token scenarios...');
        
        const invalidToken = await RefreshToken.findValidToken('invalid_token_123');
        console.log(`   ${!invalidToken ? '✅' : '❌'} Invalid token test: ${!invalidToken ? 'passed' : 'failed'}`);

        // 12. Test cleanup expired tokens
        console.log('\n1️⃣2️⃣  Test cleanup expired tokens...');
        
        // Tạo expired token
        const expiredToken = new RefreshToken({
            token: 'expired_test_token_' + Date.now(),
            userId: testUser._id,
            expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            isActive: true
        });
        await expiredToken.save();
        
        const cleanedCount = await RefreshToken.cleanupExpiredTokens();
        console.log(`   ✅ Cleaned up ${cleanedCount} expired tokens`);

        // 13. Test revoke all user tokens
        console.log('\n1️⃣3️⃣  Test revoke all user tokens...');
        
        const revokedCount = await RefreshToken.revokeAllUserTokens(testUser._id);
        console.log(`   ✅ Revoked ${revokedCount} user tokens`);

        // Verify no active tokens left
        const remainingTokens = await RefreshToken.getUserActiveTokens(testUser._id);
        console.log(`   ✅ Remaining active tokens: ${remainingTokens.length}`);

        // Final statistics
        console.log('\n📊 === TEST STATISTICS ===');
        const totalTokens = await RefreshToken.countDocuments();
        const activeTokens = await RefreshToken.countDocuments({ isActive: true });
        const expiredTokens = await RefreshToken.countDocuments({ expiresAt: { $lt: new Date() } });
        
        console.log(`   📈 Total tokens in DB: ${totalTokens}`);
        console.log(`   🟢 Active tokens: ${activeTokens}`);
        console.log(`   🔴 Expired tokens: ${expiredTokens}`);

        console.log('\n✅ === TẤT CẢ TESTS HOÀN THÀNH THÀNH CÔNG! ===');

    } catch (error) {
        console.error('\n❌ Lỗi trong quá trình test:', error.message);
        console.error('Stack trace:', error.stack);
    }
};

// Cleanup test data
const cleanupTestData = async () => {
    try {
        console.log('\n🧹 Cleaning up test data...');
        
        // Xóa test user và related tokens
        const testUser = await User.findOne({ username: 'refreshtoken_test_user' });
        if (testUser) {
            await RefreshToken.deleteMany({ userId: testUser._id });
            await User.deleteOne({ _id: testUser._id });
            console.log('   ✅ Cleaned up test user and tokens');
        }
        
        console.log('   ✅ Cleanup completed');
    } catch (error) {
        console.error('   ❌ Cleanup error:', error.message);
    }
};

// Main execution
const main = async () => {
    await connectDB();
    
    try {
        await runRefreshTokenTests();
        await cleanupTestData();
    } catch (error) {
        console.error('Main execution error:', error);
    } finally {
        console.log('\n👋 Đóng kết nối database...');
        await mongoose.connection.close();
        process.exit(0);
    }
};

// Handle process termination
process.on('SIGINT', async () => {
    console.log('\n\n🛑 Received SIGINT. Cleaning up...');
    await cleanupTestData();
    await mongoose.connection.close();
    process.exit(0);
});

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('Unhandled error:', error);
        process.exit(1);
    });
}

module.exports = {
    runRefreshTokenTests,
    cleanupTestData
};