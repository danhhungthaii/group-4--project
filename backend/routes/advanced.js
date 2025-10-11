// backend/routes/advanced.js
const express = require('express');
const router = express.Router();
const advancedController = require('../controllers/advancedController');
const authMiddleware = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

// Routes công khai (không cần đăng nhập)
router.post('/forgot-password', advancedController.forgotPassword);
router.post('/reset-password', advancedController.resetPassword);

// Routes yêu cầu đăng nhập
router.post('/upload-avatar', 
  authMiddleware, 
  upload.single('avatar'), 
  handleUploadError,
  advancedController.uploadAvatar
);

router.delete('/delete-avatar', 
  authMiddleware, 
  advancedController.deleteAvatar
);

module.exports = router;