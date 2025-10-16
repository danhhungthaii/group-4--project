// RefreshToken Schema Demo - Không cần MongoDB để xem cấu trúc
const mongoose = require('mongoose');

// Import models để kiểm tra cấu trúc
const RefreshToken = require('../models/RefreshToken');
const User = require('../models/User');
const Role = require('../models/Role');

console.log('🔍 === REFRESH TOKEN SCHEMA ANALYSIS ===\n');

// Kiểm tra schema structure
console.log('1️⃣  RefreshToken Schema Fields:');
const refreshTokenPaths = RefreshToken.schema.paths;
Object.keys(refreshTokenPaths).forEach(field => {
    const path = refreshTokenPaths[field];
    console.log(`   📝 ${field}: ${path.instance || path.constructor.name}`);
});

console.log('\n2️⃣  RefreshToken Schema Indexes:');
const refreshTokenIndexes = RefreshToken.schema.indexes();
refreshTokenIndexes.forEach((index, i) => {
    console.log(`   🔍 Index ${i + 1}: ${JSON.stringify(index[0])}`);
});

console.log('\n3️⃣  RefreshToken Static Methods:');
const refreshTokenStatics = Object.getOwnPropertyNames(RefreshToken.schema.statics);
refreshTokenStatics.forEach(method => {
    console.log(`   ⚡ ${method}()`);
});

console.log('\n4️⃣  RefreshToken Instance Methods:');
const refreshTokenMethods = Object.getOwnPropertyNames(RefreshToken.schema.methods);
refreshTokenMethods.forEach(method => {
    console.log(`   🎯 ${method}()`);
});

console.log('\n5️⃣  RefreshToken Virtual Fields:');
const refreshTokenVirtuals = RefreshToken.schema.virtuals;
Object.keys(refreshTokenVirtuals).forEach(virtual => {
    if (!virtual.startsWith('_')) {
        console.log(`   ✨ ${virtual}`);
    }
});

console.log('\n6️⃣  User Model - RefreshToken Relations:');
const userVirtuals = User.schema.virtuals;
Object.keys(userVirtuals).forEach(virtual => {
    if (virtual.includes('refreshToken') || virtual.includes('RefreshToken')) {
        console.log(`   🔗 User.${virtual}`);
    }
});

console.log('\n7️⃣  Sample RefreshToken Document Structure:');
const sampleToken = {
    token: "a1b2c3d4e5f6...64_character_hex_string",
    userId: "60d5ecb54b24a13b4c8b4567",
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    isActive: true,
    deviceInfo: {
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        ipAddress: "192.168.1.100",
        deviceType: "web"
    },
    lastUsed: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
};

console.log('   📋 Sample Document:');
console.log(JSON.stringify(sampleToken, null, 6));

console.log('\n8️⃣  Typical Usage Examples:');
console.log('   🔨 Create Token:');
console.log('      const token = await RefreshToken.generateToken(userId, deviceInfo, 30);');

console.log('\n   🔍 Find Valid Token:');
console.log('      const token = await RefreshToken.findValidToken(tokenString);');

console.log('\n   ❌ Revoke Token:');
console.log('      await RefreshToken.revokeToken(tokenString);');

console.log('\n   🧹 Cleanup Expired:');
console.log('      const count = await RefreshToken.cleanupExpiredTokens();');

console.log('\n   👤 Get User Tokens:');
console.log('      const tokens = await RefreshToken.getUserActiveTokens(userId);');

console.log('\n9️⃣  Security Features:');
console.log('   🔒 Secure token generation với crypto.randomBytes(64)');
console.log('   ⏰ Automatic expiration checking');
console.log('   🔍 Compound indexes để tối ưu performance');
console.log('   📱 Device tracking và management');
console.log('   🚫 Token revocation system');
console.log('   🧹 Automatic cleanup expired tokens');

console.log('\n🔟  Database Operations Available:');
console.log('   ✅ CREATE - Generate new refresh tokens');
console.log('   ✅ READ - Find valid tokens, get user tokens');
console.log('   ✅ UPDATE - Update last used, extend expiration');
console.log('   ✅ DELETE - Revoke tokens, cleanup expired');
console.log('   ✅ SEARCH - Find by token, user, device type');

console.log('\n📊 Schema Summary:');
console.log('   📋 Total Fields: 9 main fields + subdocuments');
console.log('   🔍 Indexes: 4 compound indexes cho performance');
console.log('   ⚡ Static Methods: 6 methods cho class-level operations');
console.log('   🎯 Instance Methods: 3 methods cho document-level operations');
console.log('   ✨ Virtual Fields: 2 computed fields');
console.log('   🔗 Relations: Linked với User model');

console.log('\n✅ === SCHEMA ANALYSIS COMPLETED ===');
console.log('\n💡 Để test với MongoDB thật:');
console.log('   1. Cài đặt MongoDB: https://www.mongodb.com/try/download/community');
console.log('   2. Hoặc sử dụng MongoDB Atlas (cloud)');
console.log('   3. Chạy: npm run test:refresh-token');

console.log('\n📝 Schema đã được tạo và sẵn sàng sử dụng!');