// test-email-simple.js - Simple email configuration test
require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmailConfig() {
  console.log('🧪 Testing Email Configuration...\n');
  
  // Check environment variables
  console.log('📧 Environment Variables:');
  console.log(`   EMAIL_HOST: ${process.env.EMAIL_HOST || 'NOT_SET'}`);
  console.log(`   EMAIL_USER: ${process.env.EMAIL_USER || 'NOT_SET'}`);
  console.log(`   EMAIL_PASS: ${process.env.EMAIL_PASS ? '***SET***' : 'NOT_SET'}`);
  console.log(`   EMAIL_FROM: ${process.env.EMAIL_FROM || 'NOT_SET'}\n`);

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('❌ Email credentials not configured in .env file');
    console.log('📝 Please create .env file with:');
    console.log('   EMAIL_HOST=smtp.gmail.com');
    console.log('   EMAIL_USER=your_email@gmail.com');
    console.log('   EMAIL_PASS=your_app_password');
    console.log('   EMAIL_FROM=your_email@gmail.com');
    return;
  }

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    console.log('📡 Testing SMTP connection...');
    
    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');

    // Send test email
    console.log('📤 Sending test email...');
    
    const testEmail = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USER, // Send to yourself for testing
      subject: '🧪 Email Configuration Test - Group 4 Project',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; color: white; margin-bottom: 20px;">
            <h1 style="margin: 0; font-size: 28px;">✅ Email Test Successful!</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">🎉 Congratulations!</h2>
            <p style="color: #666; line-height: 1.6;">
              Your email configuration is working perfectly. The forgot password feature is ready to use.
            </p>
          </div>

          <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1976d2; margin-top: 0;">📧 Configuration Details</h3>
            <ul style="color: #666; line-height: 1.6;">
              <li><strong>Host:</strong> ${process.env.EMAIL_HOST}</li>
              <li><strong>From:</strong> ${process.env.EMAIL_FROM}</li>
              <li><strong>Test Time:</strong> ${new Date().toLocaleString()}</li>
            </ul>
          </div>

          <div style="text-align: center; padding: 20px;">
            <p style="color: #666; margin: 0;">
              <strong>Group 4 Project</strong> - Forgot Password Feature
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(testEmail);
    
    console.log('✅ Test email sent successfully!');
    console.log(`📬 Message ID: ${result.messageId}`);
    console.log(`📧 Sent to: ${process.env.EMAIL_USER}`);
    console.log('\n🎉 Email configuration is working perfectly!');
    console.log('📝 You can now use the forgot password feature.');

  } catch (error) {
    console.log('❌ Email configuration test failed:');
    console.error(error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n💡 Authentication failed. Common solutions:');
      console.log('   1. Enable 2-factor authentication in Gmail');
      console.log('   2. Generate App Password in Gmail Security settings');
      console.log('   3. Use App Password instead of regular password');
      console.log('   4. Check EMAIL_USER and EMAIL_PASS in .env file');
    } else if (error.code === 'ECONNECTION') {
      console.log('\n💡 Connection failed. Check:');
      console.log('   1. Internet connection');
      console.log('   2. SMTP host and port settings');
      console.log('   3. Firewall/antivirus blocking connections');
    }
  }
}

// Run test
testEmailConfig().catch(console.error);