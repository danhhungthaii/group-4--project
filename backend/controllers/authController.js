const jwt = require('jsonwebtoken');

// Temporary storage for users and refresh tokens (in production, use database)
let users = [
  { id: 1, username: 'admin', password: 'password123', email: 'admin@example.com', role: 'Admin' },
  { id: 2, username: 'moderator', password: 'password456', email: 'moderator@example.com', role: 'Moderator' },
  { id: 3, username: 'user1', password: 'password789', email: 'user1@example.com', role: 'User' }
];
let refreshTokens = []; // Store valid refresh tokens

// Define roles and their permissions
const ROLES = {
  ADMIN: 'Admin',
  MODERATOR: 'Moderator', 
  USER: 'User'
};

const PERMISSIONS = {
  [ROLES.ADMIN]: ['READ_USERS', 'CREATE_USERS', 'UPDATE_USERS', 'DELETE_USERS', 'MANAGE_ROLES'],
  [ROLES.MODERATOR]: ['READ_USERS', 'UPDATE_USERS'],
  [ROLES.USER]: ['READ_PROFILE', 'UPDATE_PROFILE']
};

// JWT Secrets (in production, use environment variables)
const ACCESS_TOKEN_SECRET = 'your-access-token-secret-key';
const REFRESH_TOKEN_SECRET = 'your-refresh-token-secret-key';
const ACCESS_TOKEN_EXPIRE = '15m'; // Access token expires in 15 minutes
const REFRESH_TOKEN_EXPIRE = '7d'; // Refresh token expires in 7 days

// Helper function to generate tokens
const generateTokens = (user) => {
  const payload = { 
    id: user.id, 
    username: user.username, 
    email: user.email,
    role: user.role 
  };
  
  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRE
  });
  
  const refreshToken = jwt.sign({ id: user.id }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRE
  });
  
  return { accessToken, refreshToken };
};

// POST /auth/login - Login and get tokens
exports.login = (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Username and password are required' 
    });
  }
  
  // Find user
  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid credentials' 
    });
  }
  
  // Check password (in production, use bcrypt)
  if (user.password !== password) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid credentials' 
    });
  }
  
  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user);
  
  // Store refresh token
  refreshTokens.push(refreshToken);
  
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        role: user.role 
      },
      accessToken,
      refreshToken
    }
  });
};

// POST /auth/refresh - Refresh access token using refresh token
exports.refresh = (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(401).json({ 
      success: false, 
      message: 'Refresh token is required' 
    });
  }
  
  // Check if refresh token exists in our storage
  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid refresh token' 
    });
  }
  
  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    
    // Find user
    const user = users.find(u => u.id === decoded.id);
    if (!user) {
      return res.status(403).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Generate new access token
    const payload = { 
      id: user.id, 
      username: user.username, 
      email: user.email,
      role: user.role 
    };
    const newAccessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRE
    });
    
    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken
      }
    });
    
  } catch (error) {
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid or expired refresh token' 
    });
  }
};

// POST /auth/logout - Logout and revoke tokens
exports.logout = (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({ 
      success: false, 
      message: 'Refresh token is required' 
    });
  }
  
  // Remove refresh token from storage
  refreshTokens = refreshTokens.filter(token => token !== refreshToken);
  
  res.json({
    success: true,
    message: 'Logout successful'
  });
};

// GET /auth/profile - Get user profile (protected route)
exports.getProfile = (req, res) => {
  // This will be called after authentication middleware
  res.json({
    success: true,
    message: 'Profile retrieved successfully',
    data: {
      user: req.user
    }
  });
};