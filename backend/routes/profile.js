// backend/routes/profile.js
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/auth');

// Tất cả routes profile đều yêu cầu authentication
router.use(authMiddleware);

// GET /api/profile - Xem thông tin cá nhân
router.get('/', profileController.getProfile);

// PUT /api/profile - Cập nhật thông tin cá nhân
router.put('/', profileController.updateProfile);

// PUT /api/profile/password - Đổi mật khẩu
router.put('/password', profileController.changePassword);

module.exports = router;