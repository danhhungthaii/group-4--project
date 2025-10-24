const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken');

const app = express();

// ----------------- Middleware -----------------
app.use(cors());
app.use(express.json());

// ----------------- RBAC System -----------------
const ROLES = {
  ADMIN: 'Admin',
  MODERATOR: 'Moderator',
  USER: 'User'
};

const PERMISSIONS = {
  // Admin permissions - full access
  [ROLES.ADMIN]: [
    'VIEW_DASHBOARD',
    'MANAGE_USERS',
    'CREATE_USER',
    'UPDATE_USER', 
    'DELETE_USER',
    'VIEW_USERS',
    'VIEW_ANALYTICS',
    'MANAGE_SETTINGS',
    'VIEW_LOGS',
    'EXPORT_DATA',
    'VIEW_PROFILE',
    'UPDATE_PROFILE'
  ],
  
  // Moderator permissions - limited management
  [ROLES.MODERATOR]: [
    'VIEW_DASHBOARD',
    'VIEW_USERS',
    'UPDATE_USER',
    'VIEW_ANALYTICS',
    'VIEW_PROFILE',
    'UPDATE_PROFILE'
  ],
  
  // User permissions - basic access
  [ROLES.USER]: [
    'VIEW_PROFILE',
    'UPDATE_PROFILE'
  ]
};

// ----------------- Mock Data với nhiều users -----------------
let users = [
  { 
    id: 1, 
    username: 'admin', 
    password: 'password123', 
    email: 'admin@example.com', 
    role: 'Admin',
    fullName: 'System Administrator',
    department: 'IT',
    avatar: 'https://via.placeholder.com/100/007bff/ffffff?text=AD'
  },
  { 
    id: 2, 
    username: 'moderator', 
    password: 'password456', 
    email: 'moderator@example.com', 
    role: 'Moderator',
    fullName: 'Content Moderator',
    department: 'Content',
    avatar: 'https://via.placeholder.com/100/28a745/ffffff?text=MOD'
  },
  { 
    id: 3, 
    username: 'user1', 
    password: 'password789', 
    email: 'user1@example.com', 
    role: 'User',
    fullName: 'John Doe',
    department: 'Sales',
    avatar: 'https://via.placeholder.com/100/6c757d/ffffff?text=USR'
  },
  {
    id: 4,
    username: 'alice',
    password: 'password111',
    email: 'alice@example.com',
    role: 'User',
    fullName: 'Alice Johnson',
    department: 'Marketing',
    avatar: 'https://via.placeholder.com/100/6c757d/ffffff?text=ALI'
  },
  {
    id: 5,
    username: 'bob',
    password: 'password222',
    email: 'bob@example.com',
    role: 'User', 
    fullName: 'Bob Smith',
    department: 'Finance',
    avatar: 'https://via.placeholder.com/100/6c757d/ffffff?text=BOB'
  }
];

let refreshTokens = [];

// ----------------- JWT Config -----------------
const ACCESS_TOKEN_SECRET = 'your-access-token-secret-key';
const REFRESH_TOKEN_SECRET = 'your-refresh-token-secret-key';
const ACCESS_TOKEN_EXPIRE = '15m';
const REFRESH_TOKEN_EXPIRE = '7d';

// ----------------- Helper Functions -----------------
const generateTokens = (user) => {
  const payload = { 
    id: user.id, 
    username: user.username, 
    email: user.email,
    role: user.role,
    permissions: PERMISSIONS[user.role] || []
  };
  
  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRE
  });
  
  const refreshToken = jwt.sign({ id: user.id }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRE
  });
  
  return { accessToken, refreshToken };
};

// Check if user has specific permission
const hasPermission = (userPermissions, requiredPermission) => {
  return userPermissions && userPermissions.includes(requiredPermission);
};

// ----------------- Auth Middleware -----------------
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token is required' 
    });
  }
  
  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token expired',
        error: 'TOKEN_EXPIRED'
      });
    }
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid access token'
    });
  }
};

// RBAC Middleware - check permissions
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!hasPermission(req.user.permissions, permission)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required permission: ${permission}`,
        requiredPermission: permission,
        userRole: req.user.role
      });
    }

    next();
  };
};

// ----------------- Auth Routes -----------------
app.post('/api/auth/login', (req, res) => {
  const { username, email, password } = req.body;
  
  // Chấp nhận cả username và email
  const loginField = username || email;
  
  if (!loginField || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Username/Email and password are required' 
    });
  }
  
  // Tìm user bằng username hoặc email
  const user = users.find(u => u.username === loginField || u.email === loginField);
  if (!user || user.password !== password) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid credentials' 
    });
  }
  
  const { accessToken, refreshToken } = generateTokens(user);
  refreshTokens.push(refreshToken);
  
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        department: user.department,
        avatar: user.avatar,
        permissions: PERMISSIONS[user.role] || []
      },
      accessToken,
      refreshToken
    }
  });
});

app.post('/api/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken || !refreshTokens.includes(refreshToken)) {
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid refresh token' 
    });
  }
  
  try {
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    const user = users.find(u => u.id === decoded.id);
    
    if (!user) {
      return res.status(403).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    const payload = { 
      id: user.id, 
      username: user.username, 
      email: user.email,
      role: user.role,
      permissions: PERMISSIONS[user.role] || []
    };
    
    const newAccessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRE
    });
    
    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: { accessToken: newAccessToken }
    });
    
  } catch (error) {
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid or expired refresh token' 
    });
  }
});

app.post('/api/auth/logout', (req, res) => {
  const { refreshToken } = req.body;
  refreshTokens = refreshTokens.filter(token => token !== refreshToken);
  
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// ----------------- RBAC Protected Routes -----------------

// Profile routes (all roles)
app.get('/api/auth/profile', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Profile retrieved successfully',
    data: { user: req.user }
  });
});

// Dashboard (Admin, Moderator)
app.get('/api/dashboard', 
  authenticateToken, 
  requirePermission('VIEW_DASHBOARD'),
  (req, res) => {
    const dashboardData = {
      totalUsers: users.length,
      totalAdmins: users.filter(u => u.role === 'Admin').length,
      totalModerators: users.filter(u => u.role === 'Moderator').length,
      totalRegularUsers: users.filter(u => u.role === 'User').length,
      recentActivity: [
        { action: 'User login', user: 'alice', time: '2 minutes ago' },
        { action: 'Profile updated', user: 'bob', time: '5 minutes ago' },
        { action: 'New user created', user: 'admin', time: '10 minutes ago' }
      ]
    };

    res.json({
      success: true,
      message: 'Dashboard data retrieved',
      data: dashboardData
    });
  }
);

// Users management (Admin only for full CRUD, Moderator for read/update)
app.get('/api/users', 
  authenticateToken, 
  requirePermission('VIEW_USERS'),
  (req, res) => {
    const safeUsers = users.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role,
      fullName: u.fullName,
      department: u.department,
      avatar: u.avatar
    }));

    res.json({
      success: true,
      message: 'Users retrieved successfully',
      data: { users: safeUsers }
    });
  }
);

app.post('/api/users',
  authenticateToken,
  requirePermission('CREATE_USER'),
  (req, res) => {
    const { username, email, password, role, fullName, department } = req.body;
    
    if (users.find(u => u.username === username)) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }

    const newUser = {
      id: Math.max(...users.map(u => u.id)) + 1,
      username,
      email,
      password,
      role: role || 'User',
      fullName,
      department,
      avatar: `https://via.placeholder.com/100/6c757d/ffffff?text=${username.charAt(0).toUpperCase()}`
    };

    users.push(newUser);

    res.json({
      success: true,
      message: 'User created successfully',
      data: { 
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          fullName: newUser.fullName,
          department: newUser.department,
          avatar: newUser.avatar
        }
      }
    });
  }
);

app.put('/api/users/:id',
  authenticateToken,
  requirePermission('UPDATE_USER'),
  (req, res) => {
    const userId = parseInt(req.params.id);
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { email, role, fullName, department } = req.body;
    
    users[userIndex] = {
      ...users[userIndex],
      ...(email && { email }),
      ...(role && { role }),
      ...(fullName && { fullName }),
      ...(department && { department })
    };

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { 
        user: {
          id: users[userIndex].id,
          username: users[userIndex].username,
          email: users[userIndex].email,
          role: users[userIndex].role,
          fullName: users[userIndex].fullName,
          department: users[userIndex].department,
          avatar: users[userIndex].avatar
        }
      }
    });
  }
);

app.delete('/api/users/:id',
  authenticateToken,
  requirePermission('DELETE_USER'),
  (req, res) => {
    const userId = parseInt(req.params.id);
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (users[userIndex].id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    users.splice(userIndex, 1);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  }
);

// Analytics (Admin, Moderator)
app.get('/api/analytics',
  authenticateToken,
  requirePermission('VIEW_ANALYTICS'),
  (req, res) => {
    const analytics = {
      userGrowth: [
        { month: 'Jan', users: 10 },
        { month: 'Feb', users: 15 },
        { month: 'Mar', users: 12 },
        { month: 'Apr', users: 20 },
        { month: 'May', users: 18 }
      ],
      roleDistribution: {
        Admin: users.filter(u => u.role === 'Admin').length,
        Moderator: users.filter(u => u.role === 'Moderator').length,
        User: users.filter(u => u.role === 'User').length
      },
      departmentStats: {
        IT: users.filter(u => u.department === 'IT').length,
        Content: users.filter(u => u.department === 'Content').length,
        Sales: users.filter(u => u.department === 'Sales').length,
        Marketing: users.filter(u => u.department === 'Marketing').length,
        Finance: users.filter(u => u.department === 'Finance').length
      }
    };

    res.json({
      success: true,
      message: 'Analytics data retrieved',
      data: analytics
    });
  }
);

// Settings (Admin only)
app.get('/api/settings',
  authenticateToken,
  requirePermission('MANAGE_SETTINGS'),
  (req, res) => {
    const settings = {
      siteName: 'RBAC Demo System',
      allowRegistration: true,
      defaultRole: 'User',
      sessionTimeout: 15,
      maxLoginAttempts: 5
    };

    res.json({
      success: true,
      message: 'Settings retrieved',
      data: settings
    });
  }
);

// Get user permissions
app.get('/api/permissions',
  authenticateToken,
  (req, res) => {
    res.json({
      success: true,
      message: 'Permissions retrieved',
      data: {
        role: req.user.role,
        permissions: req.user.permissions
      }
    });
  }
);

// ----------------- Base Routes -----------------
app.get("/", (req, res) => {
  res.send("✅ RBAC Backend API đang hoạt động!");
});

app.get('/api/roles', (req, res) => {
  res.json({
    success: true,
    data: {
      roles: Object.values(ROLES),
      permissions: PERMISSIONS
    }
  });
});

// ----------------- Start Server -----------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 RBAC Server running at http://localhost:${PORT}`);
  console.log('✅ Available test accounts:');
  users.forEach(user => {
    console.log(`   - ${user.username} / ${user.password} (${user.role})`);
  });
  console.log('📋 RBAC endpoints:');
  console.log('   - POST /api/auth/login');
  console.log('   - GET  /api/dashboard (Admin, Moderator)');
  console.log('   - GET  /api/users (Admin, Moderator)');
  console.log('   - POST /api/users (Admin only)');
  console.log('   - PUT  /api/users/:id (Admin, Moderator)');
  console.log('   - DELETE /api/users/:id (Admin only)');
  console.log('   - GET  /api/analytics (Admin, Moderator)');
  console.log('   - GET  /api/settings (Admin only)');
});