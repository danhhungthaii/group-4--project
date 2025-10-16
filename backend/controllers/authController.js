// backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendResetPasswordEmail } = require('../services/emailService');
const { logManualActivity } = require('../middleware/activityLogger');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

// Tạo JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Đăng ký (Sign Up)
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Kiểm tra xem email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    // Kiểm tra độ dài mật khẩu
    if (password.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }

    // Tạo user mới
    const user = new User({
      name,
      email,
      password,
      role: role || 'user' // Mặc định là 'user' nếu không chỉ định
    });

    await user.save();

    // Tạo token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Đăng ký thành công',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Đăng nhập (Login)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra email có tồn tại không
    const user = await User.findOne({ email });
    if (!user) {
      // Log failed login attempt
      await logManualActivity(req, 'LOGIN_FAILED', { 
        email: email,
        reason: 'User not found'
      });
      return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      // Log failed login
      await logManualActivity(req, 'LOGIN_FAILED', { 
        email: email,
        reason: 'Invalid password'
      });
      return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    // Tạo token
    const token = generateToken(user._id);

    // Log successful login
    await logManualActivity(req, 'LOGIN_SUCCESS', { 
      email: user.email,
      role: user.role
    });

    res.json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Đăng xuất (Logout)
exports.logout = async (req, res) => {
  try {
    // Với JWT, việc đăng xuất chủ yếu được xử lý phía client
    // Phía server chỉ cần trả về response thông báo thành công
    res.json({ message: 'Đăng xuất thành công' });
  } catch (error) {
    console.error('Lỗi đăng xuất:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy thông tin user hiện tại
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Lỗi lấy profile:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Quên mật khẩu - Gửi email reset
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Vui lòng nhập email' });
    }

    // Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) {
      // Vì lý do bảo mật, không tiết lộ email có tồn tại hay không
      return res.json({ 
        message: 'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được email hướng dẫn đặt lại mật khẩu' 
      });
    }

    // Tạo reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token trước khi lưu vào database
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Lưu token và thời gian hết hạn (1 giờ)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 giờ
    await user.save();

    // Gửi email
    const emailResult = await sendResetPasswordEmail(email, resetToken);
    
    if (emailResult.success) {
      console.log(`✅ Reset password email sent to ${email}`);
      res.json({ 
        message: 'Email hướng dẫn đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.',
        messageId: emailResult.messageId
      });
    } else {
      // Xóa token nếu gửi email thất bại
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();
      
      console.error(`❌ Failed to send reset email to ${email}:`, emailResult.error);
      res.status(500).json({ 
        message: 'Có lỗi xảy ra khi gửi email. Vui lòng thử lại sau.',
        error: emailResult.error
      });
    }

  } catch (error) {
    console.error('Lỗi forgot password:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Đặt lại mật khẩu với token
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    // Validate input
    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'Vui lòng nhập mật khẩu mới và xác nhận mật khẩu' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Mật khẩu xác nhận không khớp' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }

    // Hash token để so sánh với database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Tìm user với token hợp lệ và chưa hết hạn
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Token không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu mới.' 
      });
    }

    // Cập nhật mật khẩu mới
    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    console.log(`✅ Password reset successful for user: ${user.email}`);

    res.json({ 
      message: 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập với mật khẩu mới.',
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    console.error('Lỗi reset password:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};