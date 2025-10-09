// backend/controllers/profileController.js
const User = require('../models/User');

// Xem thông tin cá nhân (View Profile) - GET /api/profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin người dùng' });
    }

    res.json({
      message: 'Lấy thông tin thành công',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Lỗi lấy profile:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật thông tin cá nhân (Update Profile) - PUT /api/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user._id;

    // Validation input
    if (!name || !email) {
      return res.status(400).json({ message: 'Tên và email là bắt buộc' });
    }

    // Kiểm tra email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Email không hợp lệ' });
    }

    // Kiểm tra email đã được sử dụng bởi user khác chưa
    const existingUser = await User.findOne({ 
      email: email, 
      _id: { $ne: userId } // Loại trừ user hiện tại
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email đã được sử dụng bởi tài khoản khác' });
    }

    // Cập nhật thông tin
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        name: name.trim(),
        email: email.toLowerCase().trim()
      },
      { 
        new: true, // Trả về document sau khi update
        runValidators: true // Chạy validation
      }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.json({
      message: 'Cập nhật thông tin thành công',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      }
    });

  } catch (error) {
    console.error('Lỗi cập nhật profile:', error);
    
    // Xử lý lỗi validation của MongoDB
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors });
    }

    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Đổi mật khẩu (Change Password) - PUT /api/profile/password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // Validation input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Mật khẩu hiện tại và mật khẩu mới là bắt buộc' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }

    // Lấy thông tin user (bao gồm password để verify)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Kiểm tra mật khẩu hiện tại
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
    }

    // Cập nhật mật khẩu mới
    user.password = newPassword;
    await user.save(); // Middleware sẽ tự động hash password

    res.json({ message: 'Đổi mật khẩu thành công' });

  } catch (error) {
    console.error('Lỗi đổi mật khẩu:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};