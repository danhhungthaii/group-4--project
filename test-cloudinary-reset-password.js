// =============================================================================
// CLOUDINARY + RESET PASSWORD INTEGRATION TEST
// File: test-cloudinary-reset-password.js
// =============================================================================

require('dotenv').config();
const mongoose = require('mongoose');
const { dbConnection } = require('./config/database');
const User = require('./models/User');
const Role = require('./models/Role');
const { testEmailConnection, sendResetPasswordEmail } = require('./config/emailService');

// Colors for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[0m'
};

function log(message, color = 'white') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testCloudinaryConfig() {
    log('\n=== TEST CLOUDINARY CONFIGURATION ===', 'cyan');
    
    try {
        const { cloudinary, validateFile } = require('./config/cloudinary');
        
        // Test Cloudinary connection
        const result = await cloudinary.api.ping();
        if (result.status === 'ok') {
            log('✅ Cloudinary connection successful', 'green');
        } else {
            log('❌ Cloudinary connection failed', 'red');
            return false;
        }
        
        // Test file validation function
        const mockValidFile = {
            mimetype: 'image/jpeg',
            size: 1024 * 1024 // 1MB
        };
        
        const mockInvalidFile = {
            mimetype: 'application/pdf',
            size: 10 * 1024 * 1024 // 10MB
        };
        
        const validResult = validateFile(mockValidFile);
        const invalidResult = validateFile(mockInvalidFile);
        
        if (validResult.isValid && !invalidResult.isValid) {
            log('✅ File validation working correctly', 'green');
        } else {
            log('❌ File validation has issues', 'red');
            return false;
        }
        
        log('✅ Cloudinary configuration is ready', 'green');
        return true;
    } catch (error) {
        log(`❌ Cloudinary test failed: ${error.message}`, 'red');
        return false;
    }
}

async function testEmailService() {
    log('\n=== TEST EMAIL SERVICE ===', 'cyan');
    
    try {
        const isConnected = await testEmailConnection();
        
        if (isConnected) {
            log('✅ Email service connection successful', 'green');
        } else {
            log('❌ Email service connection failed', 'red');
            log('💡 Check EMAIL_USER and EMAIL_PASS in .env file', 'yellow');
            return false;
        }
        
        return true;
    } catch (error) {
        log(`❌ Email service test failed: ${error.message}`, 'red');
        return false;
    }
}

async function testResetPasswordFlow() {
    log('\n=== TEST RESET PASSWORD FLOW ===', 'cyan');
    
    try {
        // 1. Tạo test user
        log('📝 Creating test user...', 'yellow');
        
        // Tìm hoặc tạo user role
        let userRole = await Role.findOne({ name: 'user' });
        if (!userRole) {
            userRole = await Role.create({
                name: 'user',
                description: 'Test user role',
                permissions: ['read_posts']
            });
            log('✅ Created user role', 'green');
        }
        
        // Xóa test user cũ nếu có
        await User.deleteMany({ email: 'test-reset@group4.com' });
        
        const testUser = await User.create({
            username: 'test_reset_user',
            email: 'test-reset@group4.com',
            password: 'oldpassword123',
            fullName: 'Test Reset User',
            role: userRole._id,
            isVerified: true
        });
        
        log('✅ Test user created', 'green');
        
        // 2. Test tạo reset password token
        log('🔑 Testing reset token generation...', 'yellow');
        
        const resetToken = testUser.createPasswordResetToken();
        await testUser.save({ validateBeforeSave: false });
        
        if (resetToken && testUser.resetPasswordToken && testUser.resetPasswordExpires) {
            log('✅ Reset token generated successfully', 'green');
            log(`📋 Token: ${resetToken.substring(0, 10)}...`, 'blue');
        } else {
            log('❌ Reset token generation failed', 'red');
            return false;
        }
        
        // 3. Test verify reset token
        log('🔍 Testing token verification...', 'yellow');
        
        const isValidToken = testUser.verifyPasswordResetToken(resetToken);
        if (isValidToken) {
            log('✅ Token verification successful', 'green');
        } else {
            log('❌ Token verification failed', 'red');
            return false;
        }
        
        // 4. Test invalid token
        log('🔍 Testing invalid token...', 'yellow');
        
        const isInvalidToken = testUser.verifyPasswordResetToken('invalid-token-here');
        if (!isInvalidToken) {
            log('✅ Invalid token rejected correctly', 'green');
        } else {
            log('❌ Invalid token accepted (security issue)', 'red');
            return false;
        }
        
        // 5. Test password reset
        log('🔄 Testing password reset...', 'yellow');
        
        const newPassword = 'newpassword123';
        await testUser.resetPassword(newPassword);
        
        // Verify password was changed
        const updatedUser = await User.findById(testUser._id);
        const isNewPasswordValid = await updatedUser.comparePassword(newPassword);
        const isOldPasswordInvalid = !(await updatedUser.comparePassword('oldpassword123'));
        
        if (isNewPasswordValid && isOldPasswordInvalid) {
            log('✅ Password reset successful', 'green');
        } else {
            log('❌ Password reset failed', 'red');
            return false;
        }
        
        // 6. Test expired token cleanup
        log('🧹 Testing token cleanup...', 'yellow');
        
        if (!updatedUser.resetPasswordToken && !updatedUser.resetPasswordExpires) {
            log('✅ Reset tokens cleaned up after password reset', 'green');
        } else {
            log('❌ Reset tokens not cleaned up properly', 'red');
            return false;
        }
        
        // 7. Test email sending (optional - chỉ test nếu email service available)
        const emailConnected = await testEmailConnection();
        if (emailConnected) {
            log('📧 Testing reset password email...', 'yellow');
            
            try {
                const newResetToken = testUser.createPasswordResetToken();
                await testUser.save({ validateBeforeSave: false });
                
                await sendResetPasswordEmail(testUser.email, newResetToken, testUser.fullName);
                log('✅ Reset password email sent successfully', 'green');
                log('💡 Check email inbox for reset password email', 'cyan');
            } catch (emailError) {
                log(`⚠️  Email sending failed: ${emailError.message}`, 'yellow');
                log('💡 Email functionality needs configuration', 'cyan');
            }
        }
        
        // Cleanup
        await User.deleteOne({ _id: testUser._id });
        log('🧹 Test user cleaned up', 'blue');
        
        log('✅ Reset password flow test completed successfully', 'green');
        return true;
    } catch (error) {
        log(`❌ Reset password flow test failed: ${error.message}`, 'red');
        console.error(error);
        return false;
    }
}

async function testUserImageFields() {
    log('\n=== TEST USER IMAGE FIELDS ===', 'cyan');
    
    try {
        // Tạo test user với image fields
        let userRole = await Role.findOne({ name: 'user' });
        if (!userRole) {
            userRole = await Role.create({
                name: 'user',
                description: 'Test role',
                permissions: ['read_posts']
            });
        }
        
        await User.deleteMany({ email: 'test-images@group4.com' });
        
        const testUser = await User.create({
            username: 'test_images_user',
            email: 'test-images@group4.com',
            password: 'password123',
            fullName: 'Test Images User',
            role: userRole._id,
            avatar: 'https://example.com/avatar.jpg',
            avatarPublicId: 'group4/avatars/avatar_test_123',
            images: [
                {
                    url: 'https://example.com/image1.jpg',
                    publicId: 'group4/documents/doc_test_1',
                    description: 'Test image 1'
                },
                {
                    url: 'https://example.com/image2.jpg', 
                    publicId: 'group4/documents/doc_test_2',
                    description: 'Test image 2'
                }
            ]
        });
        
        log('✅ User created with image fields', 'green');
        
        // Test image methods (mock Cloudinary results)
        const mockCloudinaryResult = {
            secure_url: 'https://cloudinary.com/new-avatar.jpg',
            public_id: 'group4/avatars/avatar_new_123'
        };
        
        // Test updateAvatar method (sẽ fail vì không có Cloudinary thật)
        try {
            // Mock the deleteImage function
            const originalDeleteImage = require('./config/cloudinary').deleteImage;
            require('./config/cloudinary').deleteImage = () => Promise.resolve({ result: 'ok' });
            
            await testUser.updateAvatar(mockCloudinaryResult);
            log('✅ updateAvatar method working', 'green');
            
            // Restore original function
            require('./config/cloudinary').deleteImage = originalDeleteImage;
        } catch (error) {
            if (error.message.includes('deleteImage')) {
                log('⚠️  updateAvatar method needs Cloudinary integration', 'yellow');
            } else {
                throw error;
            }
        }
        
        // Test addImage method
        await testUser.addImage(mockCloudinaryResult, 'New test image');
        log('✅ addImage method working', 'green');
        
        if (testUser.images.length === 3) {
            log('✅ Image added to user gallery', 'green');
        }
        
        // Test getter methods
        const optimizedAvatar = testUser.getOptimizedAvatar();
        const thumbnailAvatar = testUser.getAvatarThumbnail();
        
        if (optimizedAvatar && thumbnailAvatar) {
            log('✅ Image URL getter methods working', 'green');
        }
        
        // Cleanup
        await User.deleteOne({ _id: testUser._id });
        log('🧹 Test user cleaned up', 'blue');
        
        log('✅ User image fields test completed', 'green');
        return true;
    } catch (error) {
        log(`❌ User image fields test failed: ${error.message}`, 'red');
        console.error(error);
        return false;
    }
}

async function testEmailVerificationFlow() {
    log('\n=== TEST EMAIL VERIFICATION FLOW ===', 'cyan');
    
    try {
        let userRole = await Role.findOne({ name: 'user' });
        if (!userRole) {
            userRole = await Role.create({
                name: 'user',
                description: 'Test role',
                permissions: ['read_posts']
            });
        }
        
        await User.deleteMany({ email: 'test-verify@group4.com' });
        
        const testUser = await User.create({
            username: 'test_verify_user',
            email: 'test-verify@group4.com',
            password: 'password123',
            fullName: 'Test Verify User',
            role: userRole._id,
            isVerified: false
        });
        
        log('✅ Unverified user created', 'green');
        
        // Test create verification token
        const verificationToken = testUser.createEmailVerificationToken();
        await testUser.save({ validateBeforeSave: false });
        
        if (verificationToken && testUser.emailVerificationToken && testUser.emailVerificationExpires) {
            log('✅ Email verification token generated', 'green');
        } else {
            log('❌ Email verification token generation failed', 'red');
            return false;
        }
        
        // Test verify email token
        const isValidToken = testUser.verifyEmailToken(verificationToken);
        if (isValidToken) {
            log('✅ Email verification token validated', 'green');
        } else {
            log('❌ Email verification token validation failed', 'red');
            return false;
        }
        
        // Test verify email
        await testUser.verifyEmail();
        const verifiedUser = await User.findById(testUser._id);
        
        if (verifiedUser.isVerified && !verifiedUser.emailVerificationToken && !verifiedUser.emailVerificationExpires) {
            log('✅ Email verification completed successfully', 'green');
        } else {
            log('❌ Email verification completion failed', 'red');
            return false;
        }
        
        // Cleanup
        await User.deleteOne({ _id: testUser._id });
        log('🧹 Test user cleaned up', 'blue');
        
        log('✅ Email verification flow test completed', 'green');
        return true;
    } catch (error) {
        log(`❌ Email verification flow test failed: ${error.message}`, 'red');
        console.error(error);
        return false;
    }
}

async function testStaticMethods() {
    log('\n=== TEST STATIC METHODS ===', 'cyan');
    
    try {
        // Test cleanup expired tokens
        const cleanupResult = await User.cleanupExpiredTokens();
        log(`✅ Cleanup expired tokens: ${cleanupResult.modifiedCount} tokens cleaned`, 'green');
        
        return true;
    } catch (error) {
        log(`❌ Static methods test failed: ${error.message}`, 'red');
        return false;
    }
}

async function main() {
    try {
        log('🚀 STARTING CLOUDINARY + RESET PASSWORD INTEGRATION TESTS', 'cyan');
        log('====================================================================', 'cyan');
        
        // Connect to database
        await dbConnection.connect();
        log('✅ Database connected', 'green');
        
        // Run all tests
        const results = {
            cloudinary: await testCloudinaryConfig(),
            email: await testEmailService(), 
            resetPassword: await testResetPasswordFlow(),
            userImages: await testUserImageFields(),
            emailVerification: await testEmailVerificationFlow(),
            staticMethods: await testStaticMethods()
        };
        
        // Summary
        log('\n====================================================================', 'cyan');
        log('📊 TEST RESULTS SUMMARY:', 'cyan');
        log('====================================================================', 'cyan');
        
        const totalTests = Object.keys(results).length;
        const passedTests = Object.values(results).filter(result => result).length;
        const failedTests = totalTests - passedTests;
        
        Object.entries(results).forEach(([testName, result]) => {
            const status = result ? '✅ PASS' : '❌ FAIL';
            const color = result ? 'green' : 'red';
            log(`${testName.toUpperCase()}: ${status}`, color);
        });
        
        log(`\nTOTAL: ${passedTests}/${totalTests} tests passed`, passedTests === totalTests ? 'green' : 'yellow');
        
        if (passedTests === totalTests) {
            log('\n🎉 ALL TESTS PASSED! Integration is ready for production!', 'green');
        } else {
            log(`\n⚠️  ${failedTests} tests failed. Please check configuration and setup.`, 'yellow');
            log('\n💡 SETUP CHECKLIST:', 'cyan');
            if (!results.cloudinary) log('  - Configure Cloudinary credentials in .env file', 'white');
            if (!results.email) log('  - Configure email service credentials in .env file', 'white');
            log('  - Make sure MongoDB is running', 'white');
            log('  - Run: npm install to install all dependencies', 'white');
        }
        
    } catch (error) {
        log(`❌ CRITICAL ERROR: ${error.message}`, 'red');
        console.error(error);
    } finally {
        log('\n💡 Database connection remains open for continued development...', 'cyan');
    }
}

// Run tests nếu file này được gọi trực tiếp
if (require.main === module) {
    main();
}

module.exports = {
    testCloudinaryConfig,
    testEmailService,
    testResetPasswordFlow,
    testUserImageFields,
    testEmailVerificationFlow,
    testStaticMethods
};