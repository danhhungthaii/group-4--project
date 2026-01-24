// server-forgot-password.js - Backend server for forgot password feature
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendResetPasswordEmail } = require('./backend/services/emailService');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'group4-forgot-password-secret-key-2024';

// Middleware
app.use(cors());
app.use(express.json());

// Mock database for demo purposes
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

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Find user by email
const findUserByEmail = (email) => {
  return users.find(user => user.email.toLowerCase() === email.toLowerCase());
};

// Find user by reset token
const findUserByResetToken = (token) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  return users.find(user => 
    user.resetPasswordToken === hashedToken && 
    user.resetPasswordExpires > Date.now()
  );
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Forgot Password Server is running',
    timestamp: new Date().toISOString(),
    endpoints: {
      forgotPassword: 'POST /api/auth/forgot-password',
      resetPassword: 'POST /api/auth/reset-password/:token',
      login: 'POST /api/auth/login',
      testEmail: 'POST /api/test/email'
    },
    emailConfig: {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      user: process.env.EMAIL_USER || 'NOT_SET',
      configured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS)
    }
  });
});

// Login endpoint for testing
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

    const token = generateToken(user.id);

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

// Forgot password endpoint
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    console.log('📧 Forgot password request for:', email);

    if (!email) {
      return res.status(400).json({ message: 'Vui lòng nhập email' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Email không hợp lệ' });
    }

    // Find user
    const user = findUserByEmail(email);
    
    // For security, always return success message
    const successMessage = 'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được email hướng dẫn đặt lại mật khẩu';
    
    if (!user) {
      console.log('❌ User not found for email:', email);
      return res.json({ 
        success: true,
        message: successMessage 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Set token and expiry (1 hour)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    
    console.log('🔑 Generated reset token for:', email);

    // Send email
    try {
      const emailResult = await sendResetPasswordEmail(email, resetToken);
      
      if (emailResult.success) {
        console.log('✅ Reset password email sent successfully to:', email);
        console.log('📬 Message ID:', emailResult.messageId);
        
        res.json({ 
          success: true,
          message: 'Email hướng dẫn đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.',
          messageId: emailResult.messageId,
          // For testing purposes, include token in response (remove in production)
          debugInfo: process.env.NODE_ENV === 'development' ? {
            token: resetToken,
            resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
          } : undefined
        });
      } else {
        console.error('❌ Failed to send email to:', email, emailResult.error);
        
        // Clear token if email failed
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        
        res.status(500).json({ 
          success: false,
          message: 'Có lỗi xảy ra khi gửi email. Vui lòng thử lại sau.',
          error: emailResult.error
        });
      }
    } catch (emailError) {
      console.error('❌ Email service error:', emailError);
      
      // Clear token if email failed
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      
      res.status(500).json({ 
        success: false,
        message: 'Dịch vụ email đang gặp sự cố. Vui lòng thử lại sau.',
        error: emailError.message
      });
    }

  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server', 
      error: error.message 
    });
  }
});

// Reset password endpoint
app.post('/api/auth/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    console.log('🔑 Reset password request with token');

    // Validate input
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

    // Find user with valid token
    const user = findUserByResetToken(token);

    if (!user) {
      console.log('❌ Invalid or expired token');
      return res.status(400).json({ 
        message: 'Token không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu mới.' 
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update user password and clear reset token
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

// Test email endpoint
app.post('/api/test/email', async (req, res) => {
  try {
    const { email } = req.body;
    const testEmail = email || process.env.EMAIL_USER;

    if (!testEmail) {
      return res.status(400).json({ 
        message: 'Vui lòng cung cấp email để test' 
      });
    }

    console.log('🧪 Testing email service with:', testEmail);

    // Generate test token
    const testToken = crypto.randomBytes(32).toString('hex');
    
    const emailResult = await sendResetPasswordEmail(testEmail, testToken);
    
    if (emailResult.success) {
      res.json({
        success: true,
        message: 'Test email đã được gửi thành công!',
        messageId: emailResult.messageId,
        testEmail,
        resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${testToken}`
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Gửi test email thất bại',
        error: emailResult.error
      });
    }

  } catch (error) {
    console.error('❌ Test email error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi test email', 
      error: error.message 
    });
  }
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('❌ Global error:', error);
  res.status(500).json({
    success: false,
    message: 'Lỗi server không xác định',
    error: error.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Forgot Password Server running on http://localhost:${PORT}`);
  console.log(`📋 API Endpoints:`);
  console.log(`   GET  /api/health - Health check`);
  console.log(`   POST /api/auth/login - Login`);
  console.log(`   POST /api/auth/forgot-password - Request reset`);
  console.log(`   POST /api/auth/reset-password/:token - Reset password`);
  console.log(`   POST /api/test/email - Test email service`);
  console.log(`\n📧 Email Configuration:`);
  console.log(`   Host: ${process.env.EMAIL_HOST || 'NOT_SET'}`);
  console.log(`   User: ${process.env.EMAIL_USER || 'NOT_SET'}`);
  console.log(`   From: ${process.env.EMAIL_FROM || 'NOT_SET'}`);
  console.log(`   Frontend URL: ${process.env.FRONTEND_URL || 'NOT_SET'}`);
  console.log(`\n👤 Test Accounts:`);
  console.log(`   testuser@example.com / password123`);
  console.log(`   demo@example.com / password123`);
  console.log(`\n🌐 Frontend: http://localhost:8080`);
});

module.exports = app;