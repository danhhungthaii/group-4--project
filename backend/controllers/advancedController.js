// backend/controllers/advancedController.js
const User = require('../models/User');
const crypto = require('crypto');
const { sendResetPasswordEmail } = require('../services/emailService');
const cloudinary = require('../config/cloudinary');

// Quên mật khẩu - Gửi token reset
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email là bắt buộc' });
    }

    // Kiểm tra user có tồn tại không
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ 
        message: 'Không tìm thấy tài khoản với email này' 
      });
    }

    // Tạo reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 giờ

    // Lưu token vào database
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // Gửi email (tạm thời disabled để demo)
    console.log('📧 Email would be sent to:', email);
    console.log('🔑 Reset token:', resetToken);
    
    // TODO: Enable email sending later
    // const emailResult = await sendResetPasswordEmail(email, resetToken);

    res.json({
      message: 'Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.',
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined // Chỉ show trong dev mode
    });

  } catch (error) {
    console.error('Lỗi forgot password:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Đặt lại mật khẩu với token
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ 
        message: 'Token và mật khẩu mới là bắt buộc' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự' 
      });
    }

    // Tìm user với token hợp lệ và chưa hết hạn
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() } // Token chưa hết hạn
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Token không hợp lệ hoặc đã hết hạn' 
      });
    }

    // Cập nhật mật khẩu mới
    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

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

// Upload avatar
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn file ảnh để upload' });
    }

    const userId = req.user._id;

    // Upload lên Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'avatars', // Thư mục trên Cloudinary
          public_id: `user_${userId}_${Date.now()}`, // Tên file unique
          transformation: [
            { width: 200, height: 200, crop: 'fill', gravity: 'face' }, // Resize và crop
            { quality: 'auto', format: 'auto' } // Tối ưu chất lượng và format
          ]
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      
      uploadStream.end(req.file.buffer);
    });

    // Lấy thông tin user hiện tại để xóa avatar cũ (nếu có)
    const user = await User.findById(userId);
    const oldAvatarUrl = user.avatar;

    // Cập nhật avatar URL vào database
    user.avatar = uploadResult.secure_url;
    await user.save();

    // Xóa avatar cũ từ Cloudinary (nếu có)
    if (oldAvatarUrl) {
      try {
        // Extract public_id từ URL
        const publicId = oldAvatarUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`avatars/${publicId}`);
      } catch (deleteError) {
        console.log('Không thể xóa avatar cũ:', deleteError.message);
        // Không throw error vì avatar mới đã upload thành công
      }
    }

    res.json({
      message: 'Upload avatar thành công',
      avatar: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        bytes: uploadResult.bytes
      },
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error('Lỗi upload avatar:', error);
    
    // Xử lý lỗi cụ thể từ Cloudinary
    if (error.http_code) {
      return res.status(400).json({ 
        message: 'Lỗi upload ảnh lên Cloudinary',
        error: error.message 
      });
    }
    
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa avatar
exports.deleteAvatar = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user.avatar) {
      return res.status(400).json({ message: 'Bạn chưa có avatar để xóa' });
    }

    // Xóa avatar từ Cloudinary
    try {
      const publicId = user.avatar.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`avatars/${publicId}`);
    } catch (deleteError) {
      console.log('Không thể xóa avatar từ Cloudinary:', deleteError.message);
    }

    // Xóa avatar URL từ database
    user.avatar = null;
    await user.save();

    res.json({
      message: 'Xóa avatar thành công',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error('Lỗi xóa avatar:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};