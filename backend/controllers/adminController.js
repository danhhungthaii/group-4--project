// Admin controller for user management and role assignment
const jwt = require('jsonwebtoken');

// Import users data from authController (in production, use database)
// For now, we'll access the same data structure
let users = [
  { id: 1, username: 'admin', password: 'password123', email: 'admin@example.com', role: 'Admin', createdAt: new Date() },
  { id: 2, username: 'moderator', password: 'password456', email: 'moderator@example.com', role: 'Moderator', createdAt: new Date() },
  { id: 3, username: 'user1', password: 'password789', email: 'user1@example.com', role: 'User', createdAt: new Date() }
];

const VALID_ROLES = ['User', 'Moderator', 'Admin'];

// GET /admin/users - Get all users (Admin only)
exports.getAllUsers = (req, res) => {
  const usersWithoutPasswords = users.map(user => ({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  }));

  res.json({
    success: true,
    message: 'Users retrieved successfully',
    data: {
      users: usersWithoutPasswords,
      total: users.length,
      requestedBy: {
        id: req.user.id,
        username: req.user.username,
        role: req.user.role
      }
    }
  });
};

// GET /admin/users/:id - Get specific user (Admin only)
exports.getUserById = (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    message: 'User retrieved successfully',
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    }
  });
};

// POST /admin/users - Create new user (Admin only)
exports.createUser = (req, res) => {
  const { username, email, password, role = 'User' } = req.body;

  // Validation
  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username, email, and password are required'
    });
  }

  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({
      success: false,
      message: `Invalid role. Valid roles: ${VALID_ROLES.join(', ')}`
    });
  }

  // Check if username or email already exists
  const existingUser = users.find(u => u.username === username || u.email === email);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'Username or email already exists'
    });
  }

  // Create new user
  const newUser = {
    id: Math.max(...users.map(u => u.id)) + 1,
    username,
    email,
    password, // In production, hash this password
    role,
    createdAt: new Date()
  };

  users.push(newUser);

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: {
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt
      },
      createdBy: {
        id: req.user.id,
        username: req.user.username,
        role: req.user.role
      }
    }
  });
};

// PUT /admin/users/:id/role - Change user role (Admin only)
exports.changeUserRole = (req, res) => {
  const userId = parseInt(req.params.id);
  const { role } = req.body;

  if (!role) {
    return res.status(400).json({
      success: false,
      message: 'Role is required'
    });
  }

  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({
      success: false,
      message: `Invalid role. Valid roles: ${VALID_ROLES.join(', ')}`
    });
  }

  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Prevent admin from demoting themselves
  if (userId === req.user.id && role !== 'Admin') {
    return res.status(400).json({
      success: false,
      message: 'Cannot change your own admin role'
    });
  }

  const oldRole = users[userIndex].role;
  users[userIndex].role = role;

  res.json({
    success: true,
    message: 'User role updated successfully',
    data: {
      user: {
        id: users[userIndex].id,
        username: users[userIndex].username,
        email: users[userIndex].email,
        role: users[userIndex].role
      },
      changes: {
        oldRole,
        newRole: role
      },
      changedBy: {
        id: req.user.id,
        username: req.user.username,
        role: req.user.role
      }
    }
  });
};

// DELETE /admin/users/:id - Delete user (Admin only)
exports.deleteUser = (req, res) => {
  const userId = parseInt(req.params.id);

  // Prevent admin from deleting themselves
  if (userId === req.user.id) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete your own account'
    });
  }

  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const deletedUser = users[userIndex];
  users.splice(userIndex, 1);

  res.json({
    success: true,
    message: 'User deleted successfully',
    data: {
      deletedUser: {
        id: deletedUser.id,
        username: deletedUser.username,
        email: deletedUser.email,
        role: deletedUser.role
      },
      deletedBy: {
        id: req.user.id,
        username: req.user.username,
        role: req.user.role
      }
    }
  });
};

// GET /admin/roles - Get available roles and permissions (Admin/Moderator)
exports.getRoles = (req, res) => {
  const roleInfo = {
    'Admin': {
      level: 3,
      permissions: ['Full system access', 'User management', 'Role assignment', 'System configuration']
    },
    'Moderator': {
      level: 2,
      permissions: ['User content moderation', 'Limited user management', 'Read user data']
    },
    'User': {
      level: 1,
      permissions: ['Profile management', 'Basic user actions']
    }
  };

  res.json({
    success: true,
    message: 'Roles retrieved successfully',
    data: {
      roles: roleInfo,
      requestedBy: {
        id: req.user.id,
        username: req.user.username,
        role: req.user.role
      }
    }
  });
};