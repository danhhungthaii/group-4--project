// backend/controllers/userController.js
const User = require('../models/User');

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
