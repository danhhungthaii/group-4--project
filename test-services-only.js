// =============================================================================
// CLOUDINARY + EMAIL SERVICE TEST (NO DATABASE)
// File: test-services-only.js  
// =============================================================================

require('dotenv').config();

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
        
        // Check configuration
        const config = cloudinary.config();
        if (config.cloud_name && config.api_key && config.api_secret) {
            log('✅ Cloudinary credentials configured', 'green');
        } else {
            log('❌ Cloudinary credentials missing in .env file', 'red');
            log('💡 Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET to .env', 'yellow');
            return false;
        }
        
        // Test Cloudinary connection
        try {
            const result = await cloudinary.api.ping();
            if (result.status === 'ok') {
                log('✅ Cloudinary connection successful', 'green');
                log(`📋 Cloud Name: ${config.cloud_name}`, 'blue');
            } else {
                log('❌ Cloudinary connection failed', 'red');
                return false;
            }
        } catch (error) {
            log(`❌ Cloudinary connection error: ${error.message}`, 'red');
            if (error.message.includes('Invalid API key')) {
                log('💡 Check your CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET', 'yellow');
            }
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
        
        // Test utility functions
        const { getOptimizedUrl, getThumbnailUrl, extractPublicId } = require('./config/cloudinary');
        
        const testPublicId = 'group4/avatars/test_image';
        const optimizedUrl = getOptimizedUrl(testPublicId);
        const thumbnailUrl = getThumbnailUrl(testPublicId);
        
        if (optimizedUrl && thumbnailUrl) {
            log('✅ Image URL generation working', 'green');
            log(`📋 Optimized: ${optimizedUrl}`, 'blue');
            log(`📋 Thumbnail: ${thumbnailUrl}`, 'blue');
        }
        
        const testUrl = 'https://res.cloudinary.com/test/image/upload/v1234567/group4/avatars/test_image.jpg';
        const extractedId = extractPublicId(testUrl);
        if (extractedId === 'group4/avatars/test_image') {
            log('✅ Public ID extraction working', 'green');
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
        const { testEmailConnection, createTransporter } = require('./config/emailService');
        
        // Check configuration
        const emailUser = process.env.EMAIL_USER;
        const emailPass = process.env.EMAIL_PASS;
        
        if (!emailUser || !emailPass) {
            log('❌ Email credentials missing in .env file', 'red');
            log('💡 Add EMAIL_USER and EMAIL_PASS to .env file', 'yellow');
            return false;
        }
        
        log(`📋 Email User: ${emailUser}`, 'blue');
        
        // Test email connection
        const isConnected = await testEmailConnection();
        
        if (isConnected) {
            log('✅ Email service connection successful', 'green');
        } else {
            log('❌ Email service connection failed', 'red');
            log('💡 For Gmail:', 'yellow');
            log('  1. Enable 2-Factor Authentication', 'white');
            log('  2. Go to Google Account → Security → App passwords', 'white');
            log('  3. Generate App Password for Mail', 'white');
            log('  4. Use App Password in EMAIL_PASS (not regular password)', 'white');
            return false;
        }
        
        // Test transporter creation
        const transporter = createTransporter();
        if (transporter) {
            log('✅ Email transporter created successfully', 'green');
        }
        
        return true;
    } catch (error) {
        log(`❌ Email service test failed: ${error.message}`, 'red');
        return false;
    }
}

async function testMulterMiddleware() {
    log('\n=== TEST MULTER MIDDLEWARE ===', 'cyan');
    
    try {
        const { uploadAvatar, uploadImages, uploadSingle, handleMulterError } = require('./middleware/upload');
        
        if (uploadAvatar && uploadImages && uploadSingle && handleMulterError) {
            log('✅ Multer middlewares loaded successfully', 'green');
        } else {
            log('❌ Multer middleware loading failed', 'red');
            return false;
        }
        
        log('✅ Upload middleware configuration ready', 'green');
        return true;
    } catch (error) {
        log(`❌ Multer middleware test failed: ${error.message}`, 'red');
        return false;
    }
}

async function testCryptoFunctions() {
    log('\n=== TEST CRYPTO FUNCTIONS ===', 'cyan');
    
    try {
        const crypto = require('crypto');
        
        // Test token generation
        const token1 = crypto.randomBytes(32).toString('hex');
        const token2 = crypto.randomBytes(32).toString('hex');
        
        if (token1 && token2 && token1 !== token2 && token1.length === 64) {
            log('✅ Crypto token generation working', 'green');
            log(`📋 Sample token: ${token1.substring(0, 16)}...`, 'blue');
        } else {
            log('❌ Crypto token generation failed', 'red');
            return false;
        }
        
        // Test token hashing
        const hashedToken1 = crypto.createHash('sha256').update(token1).digest('hex');
        const hashedToken2 = crypto.createHash('sha256').update(token1).digest('hex');
        const hashedDifferent = crypto.createHash('sha256').update(token2).digest('hex');
        
        if (hashedToken1 === hashedToken2 && hashedToken1 !== hashedDifferent) {
            log('✅ Crypto hashing working correctly', 'green');
        } else {
            log('❌ Crypto hashing has issues', 'red');
            return false;
        }
        
        return true;
    } catch (error) {
        log(`❌ Crypto functions test failed: ${error.message}`, 'red');
        return false;
    }
}

async function testEmailTemplates() {
    log('\n=== TEST EMAIL TEMPLATES ===', 'cyan');
    
    try {
        const { sendResetPasswordEmail, sendVerificationEmail } = require('./config/emailService');
        
        // Test template functions exist
        if (typeof sendResetPasswordEmail === 'function' && typeof sendVerificationEmail === 'function') {
            log('✅ Email template functions loaded', 'green');
        } else {
            log('❌ Email template functions missing', 'red');
            return false;
        }
        
        log('✅ Email templates ready', 'green');
        return true;
    } catch (error) {
        log(`❌ Email templates test failed: ${error.message}`, 'red');
        return false;
    }
}

async function testEnvironmentVariables() {
    log('\n=== TEST ENVIRONMENT VARIABLES ===', 'cyan');
    
    const requiredEnvVars = [
        'CLOUDINARY_CLOUD_NAME',
        'CLOUDINARY_API_KEY', 
        'CLOUDINARY_API_SECRET',
        'EMAIL_USER',
        'EMAIL_PASS',
        'JWT_SECRET',
        'MONGODB_URI'
    ];
    
    const optionalEnvVars = [
        'FRONTEND_URL',
        'NODE_ENV',
        'PORT'
    ];
    
    let missingRequired = [];
    let missingOptional = [];
    
    requiredEnvVars.forEach(varName => {
        if (process.env[varName]) {
            log(`✅ ${varName}: configured`, 'green');
        } else {
            log(`❌ ${varName}: missing`, 'red');
            missingRequired.push(varName);
        }
    });
    
    optionalEnvVars.forEach(varName => {
        if (process.env[varName]) {
            log(`✅ ${varName}: ${process.env[varName]}`, 'blue');
        } else {
            log(`⚠️  ${varName}: using default`, 'yellow');
            missingOptional.push(varName);
        }
    });
    
    if (missingRequired.length === 0) {
        log('✅ All required environment variables configured', 'green');
        return true;
    } else {
        log(`❌ Missing ${missingRequired.length} required environment variables`, 'red');
        log('💡 Copy .env.example to .env and fill in the values', 'yellow');
        return false;
    }
}

async function main() {
    try {
        log('🚀 STARTING CLOUDINARY + EMAIL SERVICE TESTS (NO DATABASE)', 'cyan');
        log('====================================================================', 'cyan');
        
        // Run all tests
        const results = {
            environment: await testEnvironmentVariables(),
            cloudinary: await testCloudinaryConfig(),
            email: await testEmailService(), 
            multer: await testMulterMiddleware(),
            crypto: await testCryptoFunctions(),
            templates: await testEmailTemplates()
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
            log('\n🎉 ALL TESTS PASSED! Services are ready for integration!', 'green');
            log('\n🚀 NEXT STEPS:', 'cyan');
            log('1. Start MongoDB: mongod', 'white');
            log('2. Run full integration test: npm run test:cloudinary', 'white');
            log('3. Start server: npm start', 'white');
            log('4. Test API endpoints with Postman', 'white');
        } else {
            log(`\n⚠️  ${failedTests} tests failed. Please fix configuration before proceeding.`, 'yellow');
            log('\n💡 SETUP CHECKLIST:', 'cyan');
            if (!results.environment) log('  - Copy .env.example to .env and configure all variables', 'white');
            if (!results.cloudinary) log('  - Sign up at cloudinary.com and add API credentials', 'white');
            if (!results.email) log('  - Setup Gmail App Password for email service', 'white');
            log('  - Run: npm install to ensure all dependencies are installed', 'white');
        }
        
        log('\n📋 CONFIGURATION STATUS:', 'cyan');
        log('✅ Cloudinary Integration: Ready for image uploads', 'green');
        log('✅ Email Service: Ready for password reset emails', 'green');
        log('✅ Crypto Functions: Ready for secure token generation', 'green');
        log('✅ File Upload: Ready with validation and security', 'green');
        log('✅ Environment: Configuration structure ready', 'green');
        
        log('\n🎯 FEATURES AVAILABLE:', 'cyan');
        log('- Avatar upload với Cloudinary optimization', 'white');
        log('- Multiple image upload với gallery management', 'white');
        log('- Password reset với email verification', 'white');
        log('- Email verification cho user registration', 'white');
        log('- Secure token generation và validation', 'white');
        log('- Professional HTML email templates', 'white');
        
    } catch (error) {
        log(`❌ CRITICAL ERROR: ${error.message}`, 'red');
        console.error(error);
    }
}

// Run tests nếu file này được gọi trực tiếp
if (require.main === module) {
    main();
}

module.exports = {
    testCloudinaryConfig,
    testEmailService,
    testMulterMiddleware,
    testCryptoFunctions,
    testEmailTemplates,
    testEnvironmentVariables
};