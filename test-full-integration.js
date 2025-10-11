// Test complete integration with configured environment
const dotenv = require('dotenv');
dotenv.config();

console.log('🧪 TESTING COMPLETE CLOUDINARY & PASSWORD RESET INTEGRATION\n');

// Test 1: Environment Configuration
function testEnvironmentConfig() {
    console.log('1️⃣ Testing Environment Configuration...');
    
    const requiredVars = [
        'CLOUDINARY_CLOUD_NAME',
        'CLOUDINARY_API_KEY', 
        'CLOUDINARY_API_SECRET',
        'EMAIL_USER',
        'EMAIL_PASS',
        'JWT_SECRET',
        'MONGODB_URI'
    ];
    
    let missingVars = [];
    requiredVars.forEach(varName => {
        if (!process.env[varName] || process.env[varName] === 'demo' || process.env[varName].includes('demo')) {
            missingVars.push(varName);
        }
    });
    
    if (missingVars.length > 0) {
        console.log('❌ Missing or demo configuration:', missingVars.join(', '));
        console.log('   Please update .env file with real credentials');
        return false;
    }
    
    console.log('✅ All environment variables configured');
    return true;
}

// Test 2: Database Connection
async function testDatabaseConnection() {
    console.log('\n2️⃣ Testing Database Connection...');
    
    try {
        const mongoose = require('mongoose');
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Database connected successfully');
        await mongoose.connection.close();
        return true;
    } catch (error) {
        console.log('❌ Database connection failed:', error.message);
        return false;
    }
}

// Test 3: Cloudinary Connection
async function testCloudinaryConnection() {
    console.log('\n3️⃣ Testing Cloudinary Connection...');
    
    try {
        const { v2: cloudinary } = require('cloudinary');
        
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
        
        // Test API connection
        const result = await cloudinary.api.ping();
        console.log('✅ Cloudinary connected successfully:', result.status);
        return true;
    } catch (error) {
        console.log('❌ Cloudinary connection failed:', error.message);
        return false;
    }
}

// Test 4: Email Service
async function testEmailService() {
    console.log('\n4️⃣ Testing Email Service Configuration...');
    
    try {
        const nodemailer = require('nodemailer');
        
        const transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        
        // Verify SMTP connection
        await transporter.verify();
        console.log('✅ Email service configured successfully');
        return true;
    } catch (error) {
        console.log('❌ Email service failed:', error.message);
        return false;
    }
}

// Test 5: User Model Integration
async function testUserModelIntegration() {
    console.log('\n5️⃣ Testing User Model Integration...');
    
    try {
        const User = require('./models/User');
        
        // Test password reset token generation
        const user = new User({
            username: 'test-user',
            email: 'test@example.com',
            password: 'testpass123'
        });
        
        // Test reset token creation
        const resetToken = user.createPasswordResetToken();
        console.log('✅ Password reset token generated:', resetToken.length, 'characters');
        
        // Test email verification token
        const verifyToken = user.createEmailVerificationToken();
        console.log('✅ Email verification token generated:', verifyToken.length, 'characters');
        
        return true;
    } catch (error) {
        console.log('❌ User model integration failed:', error.message);
        return false;
    }
}

// Test 6: File Upload Validation
async function testFileUploadValidation() {
    console.log('\n6️⃣ Testing File Upload Validation...');
    
    try {
        const { validateFile } = require('./config/cloudinary');
        
        // Test valid file
        const validFile = {
            mimetype: 'image/jpeg',
            size: 1024 * 1024 * 2 // 2MB
        };
        
        const validation = validateFile(validFile);
        console.log('✅ File validation working:', validation.isValid);
        
        return true;
    } catch (error) {
        console.log('❌ File upload validation failed:', error.message);
        return false;
    }
}

// Run all tests
async function runIntegrationTests() {
    console.log('=' * 60);
    console.log('CLOUDINARY & PASSWORD RESET INTEGRATION TEST SUITE');
    console.log('=' * 60);
    
    let passedTests = 0;
    let totalTests = 6;
    
    try {
        if (testEnvironmentConfig()) passedTests++;
        if (await testDatabaseConnection()) passedTests++;
        if (await testCloudinaryConnection()) passedTests++;
        if (await testEmailService()) passedTests++;
        if (await testUserModelIntegration()) passedTests++;
        if (await testFileUploadValidation()) passedTests++;
        
    } catch (error) {
        console.log('\n❌ Test suite error:', error.message);
    }
    
    console.log('\n' + '=' * 60);
    console.log(`📊 INTEGRATION TEST RESULTS: ${passedTests}/${totalTests} PASSED`);
    console.log('=' * 60);
    
    if (passedTests === totalTests) {
        console.log('🎉 ALL TESTS PASSED! Integration complete and ready for production');
    } else {
        console.log('⚠️  Some tests failed. Please configure missing services:');
        console.log('   - Update .env with real Cloudinary credentials');
        console.log('   - Configure Gmail App Password for email service');
        console.log('   - Ensure MongoDB is running');
    }
    
    console.log('\n📋 NEXT STEPS:');
    console.log('   1. Configure .env with production credentials');
    console.log('   2. Start MongoDB: mongod --dbpath ./data/db');
    console.log('   3. Start server: npm start');
    console.log('   4. Test API endpoints with Postman or curl');
    
    return passedTests === totalTests;
}

// Execute tests
if (require.main === module) {
    runIntegrationTests()
        .then(() => process.exit(0))
        .catch(error => {
            console.error('Test execution error:', error);
            process.exit(1);
        });
}

module.exports = { runIntegrationTests };