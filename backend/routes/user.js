const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, checkRole, checkOwnershipOrAdmin } = require('../middleware/rbacMiddleware');

// Public user routes (no authentication required)
router.get('/users', userController.getUsers); // Anyone can view user list

// Protected user routes
router.post('/users', authenticateToken, checkRole('Moderator'), userController.createUser); // Moderator+ can create
router.put('/users/:id', authenticateToken, checkOwnershipOrAdmin, userController.updateUser); // Own data or admin
router.delete('/users/:id', authenticateToken, checkRole('Admin'), userController.deleteUser); // Admin only

module.exports = router;
