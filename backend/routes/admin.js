const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, checkRole, checkExactRole } = require('../middleware/rbacMiddleware');

// All admin routes require authentication
router.use(authenticateToken);

// GET /admin/roles - Get available roles (Admin and Moderator can view)
router.get('/admin/roles', checkRole('Moderator'), adminController.getRoles);

// User management routes (Admin only)
router.get('/admin/users', checkExactRole('Admin'), adminController.getAllUsers);
router.get('/admin/users/:id', checkExactRole('Admin'), adminController.getUserById);
router.post('/admin/users', checkExactRole('Admin'), adminController.createUser);
router.delete('/admin/users/:id', checkExactRole('Admin'), adminController.deleteUser);

// Role management routes (Admin only)
router.put('/admin/users/:id/role', checkExactRole('Admin'), adminController.changeUserRole);

module.exports = router;