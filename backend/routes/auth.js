// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const { logActivity, logAuthenticatedActivity } = require('../middleware/activityLogger');
const { loginRateLimit, forgotPasswordRateLimit, signupRateLimit } = require('../middleware/rateLimiter');

// Route công khai (không cần token)
router.post('/signup', signupRateLimit, logActivity('SIGNUP'), authController.signup);
// Login with rate limiting handled in controller
router.post('/login', authController.login);
router.post('/logout', logActivity('LOGOUT'), authController.logout);
router.post('/forgot-password', forgotPasswordRateLimit, logActivity('FORGOT_PASSWORD'), authController.forgotPassword);
router.post('/reset-password/:token', logActivity('RESET_PASSWORD'), authController.resetPassword);

// Route yêu cầu xác thực (cần token)
router.get('/profile', authMiddleware, logAuthenticatedActivity('VIEW_PROFILE'), authController.getProfile);

module.exports = router;