// test-email-config.js - Test Email Configuration
require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmailConfig() {
  console.log('🧪 Testing Email Configuration...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('EMAIL_USER:', process.env.EMAIL_USER || '❌ NOT SET');
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ SET' : '❌ NOT SET');
  console.log('EMAIL_FROM:', process.env.EMAIL_FROM || '❌ NOT SET');
  console.log('FRONTEND_URL:', process.env.FRONTEND_URL || '❌ NOT SET');
  console.log();

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('❌ Email configuration incomplete!');
    console.log('Please update .env file with valid EMAIL_USER and EMAIL_PASS');
    return;
  }

  try {
    console.log('🔧 Creating SMTP transporter...');
    
    const transporter = nodemailer.createTransporter({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    console.log('✅ Transporter created successfully');

    console.log('📧 Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!');

    console.log('📤 Sending test email...');
    
    const testEmail = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USER, // Send to self for testing
      subject: '🧪 Test Email - Forgot Password System',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; background-color: #f8f9fa;">
          <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #007bff; text-align: center; margin-bottom: 30px;">
              🎉 Email Configuration Test Successful!
            </h2>
            
            <p style="color: #333; line-height: 1.6;">
              <strong>Congratulations!</strong> Your email configuration is working perfectly.
            </p>
            
            <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #28a745; margin: 0 0 10px 0;">✅ Test Results:</h3>
              <ul style="margin: 0; color: #155724;">
                <li>SMTP connection: <strong>Success</strong></li>
                <li>Email delivery: <strong>Success</strong></li>
                <li>HTML template: <strong>Rendering correctly</strong></li>
              </ul>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px; text-align: center;">
              Sent from Group 4 Project - Hoạt động 4<br>
              ${new Date().toLocaleString('vi-VN')}
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log('📬 Message ID:', result.messageId);
    console.log('📧 Check your inbox at:', process.env.EMAIL_USER);
    
    console.log('\n🎉 Email configuration test completed successfully!');
    console.log('🚀 Ready to implement forgot password feature!');

  } catch (error) {
    console.error('❌ Email configuration test failed:');
    console.error('Error:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n💡 Possible solutions:');
      console.log('1. Check if EMAIL_USER and EMAIL_PASS are correct');
      console.log('2. Make sure you\'re using Gmail App Password (not regular password)');
      console.log('3. Enable 2-Factor Authentication on Gmail');
      console.log('4. Create new App Password: https://myaccount.google.com/apppasswords');
    }
  }
}

// Run test
testEmailConfig();