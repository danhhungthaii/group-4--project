// backend/services/emailService.js
const nodemailer = require('nodemailer');

// Tạo transporter cho Gmail
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS // App password, không phải password thường
    }
  });
};

// Gửi email reset password
const sendResetPasswordEmail = async (email, resetToken) => {
  try {
    const transporter = createTransporter();
    
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Yêu cầu đặt lại mật khẩu',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #333; text-align: center;">Đặt lại mật khẩu</h2>
          
          <p>Chào bạn,</p>
          
          <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Đặt lại mật khẩu
            </a>
          </div>
          
          <p>Hoặc copy và paste link này vào trình duyệt:</p>
          <p style="word-break: break-all; color: #007bff;">${resetUrl}</p>
          
          <p style="color: #666; font-size: 14px;">
            <strong>Lưu ý:</strong> Link này sẽ hết hạn sau 1 giờ.
          </p>
          
          <p style="color: #666; font-size: 14px;">
            Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
          </p>
          
          <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            Email này được gửi tự động, vui lòng không trả lời.
          </p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email gửi thành công:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('Lỗi gửi email:', error);
    return { success: false, error: error.message };
  }
};

// Test email configuration
const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email configuration is valid');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error.message);
    return false;
  }
};

module.exports = {
  sendResetPasswordEmail,
  testEmailConfig
};