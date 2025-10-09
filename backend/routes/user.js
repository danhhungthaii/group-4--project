const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const { requireAdmin, canDeleteUser } = require('../middleware/rbac');

// Routes yêu cầu quyền Admin (thứ tự quan trọng: static routes trước dynamic routes)
router.get('/users/stats', authMiddleware, requireAdmin, userController.getUserStats);
router.get('/users', authMiddleware, requireAdmin, userController.getUsers);
router.get('/users/:id', authMiddleware, requireAdmin, userController.getUserById);
router.put('/users/:id/role', authMiddleware, requireAdmin, userController.updateUserRole);

// Route xóa user (Admin hoặc chính user đó)
router.delete('/users/:id', authMiddleware, canDeleteUser, userController.deleteUser);

module.exports = router;
