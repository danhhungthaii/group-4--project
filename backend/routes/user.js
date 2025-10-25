const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const { requireAdmin, canDeleteUser } = require('../middleware/rbac');
const { upload, resizeAvatar, handleUploadError } = require('../middleware/upload');

// Routes yêu cầu quyền Admin (thứ tự quan trọng: static routes trước dynamic routes)
router.get('/users/stats', authMiddleware, requireAdmin, userController.getUserStats);
router.get('/users', authMiddleware, requireAdmin, userController.getUsers);
router.get('/users/:id', authMiddleware, requireAdmin, userController.getUserById);
router.put('/users/:id/role', authMiddleware, requireAdmin, userController.updateUserRole);

// Route xóa user (Admin hoặc chính user đó)
router.delete('/users/:id', authMiddleware, canDeleteUser, userController.deleteUser);

// Avatar upload routes (Authenticated users)
router.post('/users/avatar', 
  authMiddleware, 
  upload.single('avatar'), 
  handleUploadError,
  resizeAvatar, 
  userController.uploadAvatar
);

router.delete('/users/avatar', 
  authMiddleware, 
  userController.deleteAvatar
);

module.exports = router;
