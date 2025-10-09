// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Route công khai (không cần token)
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Route yêu cầu xác thực (cần token)
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;