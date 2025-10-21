// test-mock-email.js - Test forgot password system with mock email service
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'group4-forgot-password-secret-key-2024';

// Middleware
app.use(cors());
app.use(express.json());

// Mock email service for testing
class MockEmailService {
  constructor() {
    this.sentEmails = [];
  }

  async sendResetPasswordEmail(to, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/reset-password.html?token=${resetToken}`;
    
    const emailData = {
      to,
      subject: '🔑 Đặt lại mật khẩu - Group 4 Project',
      resetUrl,
      resetToken,
      sentAt: new Date().toISOString(),
      messageId: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    // Store email for testing
    this.sentEmails.push(emailData);

    console.log('📧 Mock Email Sent:');
    console.log(`   To: ${to}`);
    console.log(`   Reset URL: ${resetUrl}`);
    console.log(`   Message ID: ${emailData.messageId}`);

    return {
      success: true,
      messageId: emailData.messageId,
      resetUrl
    };
  }

  getLastEmail() {
    return this.sentEmails[this.sentEmails.length - 1];
  }

  getAllEmails() {
    return this.sentEmails;
  }

  clearEmails() {
    this.sentEmails = [];
  }
}

const mockEmailService = new MockEmailService();

// Mock database
let users = [
  {
    id: 1,
    name: 'Test User',
    email: 'testuser@example.com',
    password: '$2a$10$N9qo8uLOickgx2ZMRZoMye7vQa9RRF3cz7T.ZMJz8Y8YV5kXe6fju', // password123
    resetPasswordToken: null,
    resetPasswordExpires: null
  },
  {
    id: 2,
    name: 'Demo User',
    email: 'demo@example.com',
    password: '$2a$10$N9qo8uLOickgx2ZMRZoMye7vQa9RRF3cz7T.ZMJz8Y8YV5kXe6fju', // password123
    resetPasswordToken: null,
    resetPasswordExpires: null
  }
];

// Helper functions
const findUserByEmail = (email) => {
  return users.find(user => user.email.toLowerCase() === email.toLowerCase());
};

const findUserByResetToken = (token) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  return users.find(user => 
    user.resetPasswordToken === hashedToken && 
    user.resetPasswordExpires > Date.now()
  );
};

// Routes

// Health check with email service info
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Mock Forgot Password Server is running',
    emailService: 'Mock Email Service (for testing)',
    emailsSent: mockEmailService.getAllEmails().length,
    lastEmail: mockEmailService.getLastEmail(),
    timestamp: new Date().toISOString()
  });
});

// Get sent emails (for testing)
app.get('/api/test/emails', (req, res) => {
  res.json({
    success: true,
    totalEmails: mockEmailService.getAllEmails().length,
    emails: mockEmailService.getAllEmails()
  });
});

// Clear sent emails
app.delete('/api/test/emails', (req, res) => {
  mockEmailService.clearEmails();
  res.json({
    success: true,
    message: 'All mock emails cleared'
  });
});

// Forgot password
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    console.log('📧 Forgot password request for:', email);

    if (!email) {
      return res.status(400).json({ message: 'Vui lòng nhập email' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Email không hợp lệ' });
    }

    const user = findUserByEmail(email);
    
    if (!user) {
      console.log('❌ User not found for email:', email);
      return res.json({ 
        success: true,
        message: 'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được email hướng dẫn đặt lại mật khẩu'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    
    console.log('🔑 Generated reset token for:', email);

    // Send mock email
    const emailResult = await mockEmailService.sendResetPasswordEmail(email, resetToken);
    
    res.json({ 
      success: true,
      message: 'Email hướng dẫn đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.',
      messageId: emailResult.messageId,
      // For testing, include reset URL
      testData: {
        resetUrl: emailResult.resetUrl,
        resetToken: resetToken,
        userFound: !!user
      }
    });

  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server', 
      error: error.message 
    });
  }
});

// Reset password
app.post('/api/auth/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    console.log('🔑 Reset password request with token');

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ 
        message: 'Vui lòng nhập mật khẩu mới và xác nhận mật khẩu' 
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        message: 'Mật khẩu xác nhận không khớp' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: 'Mật khẩu phải có ít nhất 6 ký tự' 
      });
    }

    const user = findUserByResetToken(token);

    if (!user) {
      console.log('❌ Invalid or expired token');
      return res.status(400).json({ 
        message: 'Token không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu mới.' 
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    console.log('✅ Password reset successful for user:', user.email);

    res.json({ 
      success: true,
      message: 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập với mật khẩu mới.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server', 
      error: error.message 
    });
  }
});

// Login for testing
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email và password là bắt buộc' });
    }

    const user = findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Email hoặc password không đúng' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email hoặc password không đúng' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mock Forgot Password Server running on http://localhost:${PORT}`);
  console.log(`📧 Email Service: Mock (for testing without real SMTP)`);
  console.log(`\n📱 Test the system:`);
  console.log(`   1. Go to http://localhost:8080/forgot-password.html`);
  console.log(`   2. Enter: testuser@example.com`);
  console.log(`   3. Check /api/test/emails for mock email data`);
  console.log(`   4. Use the reset URL from email data`);
  console.log(`\n🧪 API Endpoints:`);
  console.log(`   GET  /api/health - System status`);
  console.log(`   GET  /api/test/emails - View sent emails`);
  console.log(`   POST /api/auth/forgot-password`);
  console.log(`   POST /api/auth/reset-password/:token`);
  console.log(`   POST /api/auth/login`);
});

module.exports = app;