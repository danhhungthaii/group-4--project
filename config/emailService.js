// =============================================================================
// EMAIL SERVICE CONFIGURATION
// File: config/emailService.js
// =============================================================================

const nodemailer = require('nodemailer');
require('dotenv').config();

// Cấu hình transporter cho Gmail (có thể thay đổi provider)
const createTransporter = () => {
    return nodemailer.createTransporter({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER || 'group4project@gmail.com',
            pass: process.env.EMAIL_PASS || 'your-app-password'
        },
        // Hoặc sử dụng SMTP settings khác
        // host: process.env.SMTP_HOST || 'smtp.gmail.com',
        // port: process.env.SMTP_PORT || 587,
        // secure: false, // true for 465, false for other ports
    });
};

/**
 * Gửi email reset password
 * @param {string} email - Email người nhận
 * @param {string} resetToken - Reset token
 * @param {string} userName - Tên người dùng
 * @returns {Promise<Object>} - Send result
 */
const sendResetPasswordEmail = async (email, resetToken, userName = 'User') => {
    try {
        const transporter = createTransporter();
        
        // URL reset password (có thể customize)
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
        
        const mailOptions = {
            from: {
                name: 'Group 4 Project',
                address: process.env.EMAIL_USER || 'group4project@gmail.com'
            },
            to: email,
            subject: '🔐 Đặt lại mật khẩu - Group 4 Project',
            html: generateResetPasswordHTML(userName, resetUrl, resetToken),
            text: generateResetPasswordText(userName, resetUrl, resetToken)
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Reset password email sent successfully:', result.messageId);
        
        return {
            success: true,
            messageId: result.messageId,
            message: 'Email reset password đã được gửi thành công'
        };
    } catch (error) {
        console.error('Error sending reset password email:', error);
        throw new Error('Không thể gửi email reset password: ' + error.message);
    }
};

/**
 * Gửi email xác thực tài khoản
 * @param {string} email - Email người nhận
 * @param {string} verificationToken - Verification token
 * @param {string} userName - Tên người dùng
 * @returns {Promise<Object>} - Send result
 */
const sendVerificationEmail = async (email, verificationToken, userName = 'User') => {
    try {
        const transporter = createTransporter();
        
        const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
        
        const mailOptions = {
            from: {
                name: 'Group 4 Project',
                address: process.env.EMAIL_USER || 'group4project@gmail.com'
            },
            to: email,
            subject: '✅ Xác thực tài khoản - Group 4 Project',
            html: generateVerificationHTML(userName, verificationUrl, verificationToken),
            text: generateVerificationText(userName, verificationUrl, verificationToken)
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully:', result.messageId);
        
        return {
            success: true,
            messageId: result.messageId,
            message: 'Email xác thực đã được gửi thành công'
        };
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Không thể gửi email xác thực: ' + error.message);
    }
};

/**
 * Gửi email thông báo chung
 * @param {string} email - Email người nhận
 * @param {string} subject - Tiêu đề email
 * @param {string} message - Nội dung
 * @param {string} userName - Tên người dùng
 * @returns {Promise<Object>} - Send result
 */
const sendNotificationEmail = async (email, subject, message, userName = 'User') => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: {
                name: 'Group 4 Project',
                address: process.env.EMAIL_USER || 'group4project@gmail.com'
            },
            to: email,
            subject: `📢 ${subject} - Group 4 Project`,
            html: generateNotificationHTML(userName, subject, message),
            text: `Xin chào ${userName},\n\n${message}\n\nTrân trọng,\nGroup 4 Project Team`
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Notification email sent successfully:', result.messageId);
        
        return {
            success: true,
            messageId: result.messageId,
            message: 'Email thông báo đã được gửi thành công'
        };
    } catch (error) {
        console.error('Error sending notification email:', error);
        throw new Error('Không thể gửi email thông báo: ' + error.message);
    }
};

/**
 * Test email connection
 * @returns {Promise<boolean>} - Connection test result
 */
const testEmailConnection = async () => {
    try {
        const transporter = createTransporter();
        await transporter.verify();
        console.log('Email service connection successful');
        return true;
    } catch (error) {
        console.error('Email service connection failed:', error);
        return false;
    }
};

// =============================================================================
// HTML EMAIL TEMPLATES
// =============================================================================

const generateResetPasswordHTML = (userName, resetUrl, resetToken) => {
    return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Đặt lại mật khẩu</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .button:hover { background: #5a67d8; }
            .token-box { background: #e2e8f0; padding: 15px; border-radius: 5px; margin: 15px 0; font-family: monospace; word-break: break-all; }
            .warning { background: #fed7d7; color: #c53030; padding: 15px; border-radius: 5px; margin: 15px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 Đặt lại mật khẩu</h1>
                <p>Group 4 Project - User Management System</p>
            </div>
            <div class="content">
                <h2>Xin chào ${userName}!</h2>
                <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
                
                <p>Để đặt lại mật khẩu, vui lòng click vào nút bên dưới:</p>
                <div style="text-align: center;">
                    <a href="${resetUrl}" class="button">Đặt lại mật khẩu</a>
                </div>
                
                <p>Hoặc copy và paste link sau vào trình duyệt:</p>
                <div class="token-box">
                    ${resetUrl}
                </div>
                
                <p>Mã xác thực của bạn:</p>
                <div class="token-box">
                    ${resetToken}
                </div>
                
                <div class="warning">
                    <strong>⚠️ Lưu ý quan trọng:</strong><br>
                    • Link này chỉ có hiệu lực trong 15 phút<br>
                    • Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này<br>
                    • Không chia sẻ link hoặc mã này với người khác
                </div>
                
                <p>Nếu bạn gặp vấn đề, hãy liên hệ với chúng tôi qua email hỗ trợ.</p>
                
                <p>Trân trọng,<br>
                <strong>Group 4 Project Team</strong></p>
            </div>
            <div class="footer">
                <p>Email này được gửi tự động từ hệ thống Group 4 Project</p>
                <p>© 2024 Group 4 Project. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

const generateVerificationHTML = (userName, verificationUrl, verificationToken) => {
    return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Xác thực tài khoản</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #48bb78; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .button:hover { background: #38a169; }
            .token-box { background: #e2e8f0; padding: 15px; border-radius: 5px; margin: 15px 0; font-family: monospace; word-break: break-all; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✅ Xác thực tài khoản</h1>
                <p>Chào mừng đến với Group 4 Project!</p>
            </div>
            <div class="content">
                <h2>Xin chào ${userName}!</h2>
                <p>Cảm ơn bạn đã đăng ký tài khoản tại Group 4 Project.</p>
                <p>Để hoàn tất quá trình đăng ký, vui lòng xác thực email của bạn:</p>
                
                <div style="text-align: center;">
                    <a href="${verificationUrl}" class="button">Xác thực tài khoản</a>
                </div>
                
                <p>Hoặc copy link sau vào trình duyệt:</p>
                <div class="token-box">
                    ${verificationUrl}
                </div>
                
                <p>Sau khi xác thực thành công, bạn sẽ có thể sử dụng đầy đủ các tính năng của hệ thống.</p>
                
                <p>Trân trọng,<br>
                <strong>Group 4 Project Team</strong></p>
            </div>
            <div class="footer">
                <p>Email này được gửi tự động từ hệ thống Group 4 Project</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

const generateNotificationHTML = (userName, subject, message) => {
    return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📢 ${subject}</h1>
                <p>Group 4 Project</p>
            </div>
            <div class="content">
                <h2>Xin chào ${userName}!</h2>
                <div>${message}</div>
                <p>Trân trọng,<br>
                <strong>Group 4 Project Team</strong></p>
            </div>
            <div class="footer">
                <p>Email này được gửi từ hệ thống Group 4 Project</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

// =============================================================================
// TEXT EMAIL TEMPLATES (fallback)
// =============================================================================

const generateResetPasswordText = (userName, resetUrl, resetToken) => {
    return `
Đặt lại mật khẩu - Group 4 Project

Xin chào ${userName}!

Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.

Để đặt lại mật khẩu, vui lòng truy cập link sau:
${resetUrl}

Mã xác thực: ${resetToken}

LƯU Ý QUAN TRỌNG:
- Link này chỉ có hiệu lực trong 15 phút
- Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này
- Không chia sẻ link hoặc mã này với người khác

Trân trọng,
Group 4 Project Team
    `;
};

const generateVerificationText = (userName, verificationUrl, verificationToken) => {
    return `
Xác thực tài khoản - Group 4 Project

Xin chào ${userName}!

Cảm ơn bạn đã đăng ký tài khoản tại Group 4 Project.

Để hoàn tất quá trình đăng ký, vui lòng truy cập link sau để xác thực email:
${verificationUrl}

Sau khi xác thực thành công, bạn sẽ có thể sử dụng đầy đủ các tính năng của hệ thống.

Trân trọng,
Group 4 Project Team
    `;
};

module.exports = {
    sendResetPasswordEmail,
    sendVerificationEmail,
    sendNotificationEmail,
    testEmailConnection,
    createTransporter
};