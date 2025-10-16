const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public routes (no authentication required)
router.post('/auth/login', authController.login);
router.post('/auth/refresh', authController.refresh);
router.post('/auth/logout', authController.logout);

// Protected routes (authentication required)
router.get('/auth/profile', authenticateToken, authController.getProfile);

module.exports = router;