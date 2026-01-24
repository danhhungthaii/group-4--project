/* 
 * Test Full Forgot Password Workflow - Hoạt động 4
 * Test complete flow: Request → Email → Reset → Verify
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mockEmailService = require('./mock-email-service');

const app = express();
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

app.use(express.static('.'));

// Mock User Database
const users = [
    {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        password: '$2a$10$rOzJc5cJzv6oL8nMvE5q0eK5nX8tC8wE8sGgNq5vL5fE5mE5qE5cO',
        resetToken: null,
        resetTokenExpiry: null
    }
];

// Forgot Password Endpoint
app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        console.log('\n🔍 Forgot Password Request:', req.body);
        
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email là bắt buộc'
            });
        }

        // Find user
        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tài khoản với email này'
            });
        }

        // Generate reset token
        const resetToken = jwt.sign(
            { userId: user.id, email: user.email },
            'reset-secret',
            { expiresIn: '1h' }
        );

        // Save token to user (in real app, save to database)
        user.resetToken = resetToken;
        user.resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        // Send email
        const resetLink = `http://localhost:8080/frontend/src/pages/forgot-password/reset.html?token=${resetToken}`;
        
        const mailOptions = {
            from: 'Group 4 Project <group4.project.demo@gmail.com>',
            to: email,
            subject: 'Khôi phục mật khẩu - Group 4 Project',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Khôi phục mật khẩu</h2>
                    <p>Xin chào ${user.name},</p>
                    <p>Bạn đã yêu cầu khôi phục mật khẩu. Vui lòng click vào link bên dưới để đặt lại mật khẩu:</p>
                    <a href="${resetLink}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                        Đặt lại mật khẩu
                    </a>
                    <p><strong>Link sẽ hết hạn sau 1 giờ</strong></p>
                    <p>Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này.</p>
                </div>
            `
        };

        await mockEmailService.sendMail(mailOptions);

        console.log(`✅ Reset token generated: ${resetToken.substring(0, 20)}...`);
        console.log(`📧 Email sent to: ${email}`);

        res.json({
            success: true,
            message: 'Email khôi phục mật khẩu đã được gửi',
            resetToken: resetToken // For testing only
        });

    } catch (error) {
        console.error('❌ Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
});

// Reset Password Endpoint
app.post('/api/auth/reset-password', async (req, res) => {
    try {
        console.log('\n🔒 Reset Password Request:', req.body);
        
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Token và mật khẩu mới là bắt buộc'
            });
        }

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, 'reset-secret');
        } catch (err) {
            return res.status(400).json({
                success: false,
                message: 'Token không hợp lệ hoặc đã hết hạn'
            });
        }

        // Find user with token
        const user = users.find(u => u.id === decoded.userId && u.resetToken === token);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Token không tìm thấy'
            });
        }

        // Check token expiry
        if (new Date() > user.resetTokenExpiry) {
            return res.status(400).json({
                success: false,
                message: 'Token đã hết hạn'
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Update user password
        user.password = hashedPassword;
        user.resetToken = null;
        user.resetTokenExpiry = null;

        console.log(`✅ Password reset successful for: ${user.email}`);

        res.json({
            success: true,
            message: 'Mật khẩu đã được đổi thành công'
        });

    } catch (error) {
        console.error('❌ Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
});

// Test endpoints
app.get('/api/test/last-email', (req, res) => {
    const lastEmail = mockEmailService.getLastEmail();
    if (lastEmail) {
        const resetToken = mockEmailService.extractResetToken(lastEmail);
        res.json({
            success: true,
            email: lastEmail,
            resetToken: resetToken
        });
    } else {
        res.json({
            success: false,
            message: 'No emails sent yet'
        });
    }
});

app.get('/api/test/users', (req, res) => {
    res.json(users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        hasResetToken: !!u.resetToken
    })));
});

const PORT = 5001;
app.listen(PORT, () => {
    console.log(`
🚀 Test Server Started on http://localhost:${PORT}

📧 Mock Email Service Ready
👤 Test User: test@example.com  
🔑 Password: password123

🧪 Test Endpoints:
   POST /api/auth/forgot-password  - Request password reset
   POST /api/auth/reset-password   - Reset password with token
   GET  /api/test/last-email       - Get last sent email
   GET  /api/test/users            - List all users

🌐 Frontend URLs:
   http://localhost:${PORT}/frontend/src/pages/forgot-password/index.html
   http://localhost:${PORT}/frontend/src/pages/forgot-password/reset.html
`);
});

module.exports = app;