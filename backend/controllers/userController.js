// backend/controllers/userController.js
const User = require('../models/User');
const { uploadAvatar, deleteImage, extractPublicId } = require('../config/cloudinary');

// Lấy danh sách user (Admin only)
exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Lấy danh sách users (không bao gồm password)
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Đếm tổng số users
    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      message: 'Lấy danh sách người dùng thành công',
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách users:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy thông tin một user cụ thể (Admin only)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.json({
      message: 'Lấy thông tin người dùng thành công',
      user
    });
  } catch (error) {
    console.error('Lỗi lấy thông tin user:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa user (Admin hoặc chính user đó)
exports.deleteUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id.toString();
    const currentUserRole = req.user.role;

    // Tìm user cần xóa
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng cần xóa' });
    }

    // Không cho phép admin xóa admin khác (chỉ có thể tự xóa)
    if (targetUser.role === 'admin' && currentUserId !== targetUserId) {
      return res.status(403).json({ 
        message: 'Không thể xóa tài khoản Admin khác. Admin chỉ có thể tự xóa tài khoản của mình.' 
      });
    }

    // Thực hiện xóa
    await User.findByIdAndDelete(targetUserId);

    // Log action
    const actionBy = currentUserRole === 'admin' ? 'Admin' : 'User';
    const actionTarget = currentUserId === targetUserId ? 'chính mình' : `user ${targetUser.email}`;
    
    res.json({ 
      message: `Xóa tài khoản thành công. ${actionBy} đã xóa tài khoản ${actionTarget}`,
      deletedUser: {
        id: targetUser._id,
        email: targetUser.email,
        name: targetUser.name
      }
    });

  } catch (error) {
    console.error('Lỗi xóa user:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật role user (Admin only)
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const targetUserId = req.params.id;
    const currentUserId = req.user._id.toString();

    // Validation
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role phải là "user" hoặc "admin"' });
    }

    // Không cho phép admin thay đổi role của chính mình
    if (currentUserId === targetUserId) {
      return res.status(400).json({ 
        message: 'Bạn không thể thay đổi quyền của chính mình' 
      });
    }

    // Tìm và cập nhật user
    const updatedUser = await User.findByIdAndUpdate(
      targetUserId,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.json({
      message: `Cập nhật quyền thành công. ${updatedUser.email} hiện là ${role}`,
      user: updatedUser
    });

  } catch (error) {
    console.error('Lỗi cập nhật role:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Thống kê users (Admin only)
exports.getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalRegularUsers = await User.countDocuments({ role: 'user' });
    
    // Users đăng ký trong 30 ngày qua
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = await User.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });

    res.json({
      message: 'Thống kê người dùng',
      stats: {
        totalUsers,
        totalAdmins,
        totalRegularUsers,
        recentUsers,
        percentageNewUsers: totalUsers > 0 ? ((recentUsers / totalUsers) * 100).toFixed(2) : 0
      }
    });

  } catch (error) {
    console.error('Lỗi thống kê users:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Upload avatar (Authenticated users)
exports.uploadAvatar = async (req, res) => {
  try {
    // Kiểm tra file có được upload không
    if (!req.file) {
      return res.status(400).json({ 
        message: 'Vui lòng chọn file ảnh để upload' 
      });
    }

    const userId = req.user._id;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    try {
      // Xóa avatar cũ trên Cloudinary nếu có
      if (user.avatar) {
        const oldPublicId = extractPublicId(user.avatar);
        if (oldPublicId) {
          await deleteImage(oldPublicId);
          console.log('Đã xóa avatar cũ:', oldPublicId);
        }
      }

      // Upload ảnh mới lên Cloudinary
      const cloudinaryResult = await uploadAvatar(req.file.buffer, userId);

      // Cập nhật URL avatar trong database
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { avatar: cloudinaryResult.secure_url },
        { new: true, runValidators: true }
      ).select('-password');

      res.json({
        message: 'Upload avatar thành công',
        user: updatedUser,
        avatarInfo: {
          url: cloudinaryResult.secure_url,
          publicId: cloudinaryResult.public_id,
          width: cloudinaryResult.width,
          height: cloudinaryResult.height,
          format: cloudinaryResult.format,
          size: cloudinaryResult.bytes
        }
      });

    } catch (cloudinaryError) {
      console.error('Lỗi upload lên Cloudinary:', cloudinaryError);
      res.status(500).json({ 
        message: 'Lỗi upload ảnh lên cloud storage', 
        error: cloudinaryError.message 
      });
    }

  } catch (error) {
    console.error('Lỗi upload avatar:', error);
    res.status(500).json({ 
      message: 'Lỗi server khi upload avatar', 
      error: error.message 
    });
  }
};

// Xóa avatar (Authenticated users)
exports.deleteAvatar = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    if (!user.avatar) {
      return res.status(400).json({ message: 'Người dùng chưa có avatar để xóa' });
    }

    try {
      // Xóa ảnh trên Cloudinary
      const publicId = extractPublicId(user.avatar);
      if (publicId) {
        await deleteImage(publicId);
        console.log('Đã xóa avatar trên Cloudinary:', publicId);
      }

      // Cập nhật database - xóa URL avatar
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { avatar: null },
        { new: true, runValidators: true }
      ).select('-password');

      res.json({
        message: 'Xóa avatar thành công',
        user: updatedUser
      });

    } catch (cloudinaryError) {
      console.error('Lỗi xóa ảnh trên Cloudinary:', cloudinaryError);
      // Vẫn cập nhật database ngay cả khi lỗi Cloudinary
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { avatar: null },
        { new: true, runValidators: true }
      ).select('-password');

      res.json({
        message: 'Xóa avatar thành công (có thể còn lưu trên cloud)',
        user: updatedUser,
        warning: 'Có lỗi khi xóa ảnh trên cloud storage'
      });
    }

  } catch (error) {
    console.error('Lỗi xóa avatar:', error);
    res.status(500).json({ 
      message: 'Lỗi server khi xóa avatar', 
      error: error.message 
    });
  }
};
