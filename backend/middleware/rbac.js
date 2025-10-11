// backend/middleware/rbac.js
const User = require('../models/User');

// Middleware kiểm tra quyền Admin
const requireAdmin = async (req, res, next) => {
  try {
    // Kiểm tra xem user đã được authenticate chưa (từ auth middleware)
    if (!req.user) {
      return res.status(401).json({ message: 'Vui lòng đăng nhập' });
    }

    // Lấy thông tin user từ database để có role mới nhất
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Kiểm tra quyền Admin
    if (user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Không có quyền truy cập. Chỉ Admin mới có thể thực hiện hành động này.' 
      });
    }

    // Thêm thông tin role vào req để sử dụng ở controller
    req.user.role = user.role;
    next();
  } catch (error) {
    console.error('Lỗi kiểm tra quyền Admin:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Middleware kiểm tra quyền User hoặc Admin
const requireUser = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Vui lòng đăng nhập' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // User hoặc Admin đều có thể truy cập
    if (user.role !== 'user' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    req.user.role = user.role;
    next();
  } catch (error) {
    console.error('Lỗi kiểm tra quyền User:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Middleware kiểm tra quyền xóa user (Admin hoặc chính user đó)
const canDeleteUser = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Vui lòng đăng nhập' });
    }

    const currentUser = await User.findById(req.user._id);
    if (!currentUser) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng hiện tại' });
    }

    const targetUserId = req.params.id;

    // Admin có thể xóa bất kỳ user nào
    if (currentUser.role === 'admin') {
      req.user.role = currentUser.role;
      return next();
    }

    // User chỉ có thể xóa chính mình
    if (currentUser._id.toString() === targetUserId) {
      req.user.role = currentUser.role;
      return next();
    }

    return res.status(403).json({ 
      message: 'Không có quyền xóa tài khoản này. Bạn chỉ có thể xóa tài khoản của chính mình.' 
    });

  } catch (error) {
    console.error('Lỗi kiểm tra quyền xóa user:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

module.exports = {
  requireAdmin,
  requireUser,
  canDeleteUser
};