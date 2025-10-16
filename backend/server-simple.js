const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken');

const app = express();

// ----------------- Middleware -----------------
app.use(cors());
app.use(express.json());

// ----------------- Mock Data -----------------
let users = [
  { id: 1, username: 'admin', password: 'password123', email: 'admin@example.com', role: 'Admin' },
  { id: 2, username: 'moderator', password: 'password456', email: 'moderator@example.com', role: 'Moderator' },
  { id: 3, username: 'user1', password: 'password789', email: 'user1@example.com', role: 'User' }
];
let refreshTokens = []; // Store valid refresh tokens

// ----------------- JWT Config -----------------
const ACCESS_TOKEN_SECRET = 'your-access-token-secret-key';
const REFRESH_TOKEN_SECRET = 'your-refresh-token-secret-key';
const ACCESS_TOKEN_EXPIRE = '15m'; // Access token expires in 15 minutes
const REFRESH_TOKEN_EXPIRE = '7d'; // Refresh token expires in 7 days

// ----------------- Helper Functions -----------------
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

// Middleware to verify Access Token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
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
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid access token',
        error: 'INVALID_TOKEN'
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: 'Token verification failed',
        error: error.message
      });
    }
  }
};

// ----------------- Routes -----------------

// POST /api/auth/login - Login and get tokens
app.post('/api/auth/login', (req, res) => {
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
});

// POST /api/auth/refresh - Refresh access token using refresh token
app.post('/api/auth/refresh', (req, res) => {
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
});

// POST /api/auth/logout - Logout and revoke tokens
app.post('/api/auth/logout', (req, res) => {
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
});

// GET /api/auth/profile - Get user profile (protected route)
app.get('/api/auth/profile', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Profile retrieved successfully',
    data: {
      user: req.user
    }
  });
});

// ----------------- Test Routes -----------------
app.get("/", (req, res) => {
  res.send("✅ Backend API đang hoạt động!");
});

// Route để kiểm tra tất cả users (for testing)
app.get('/api/users', (req, res) => {
  res.json({
    success: true,
    data: {
      users: users.map(u => ({ id: u.id, username: u.username, email: u.email, role: u.role }))
    }
  });
});

// Route để kiểm tra refresh tokens hiện tại (for testing)
app.get('/api/tokens', (req, res) => {
  res.json({
    success: true,
    data: {
      refreshTokens: refreshTokens.length,
      tokens: refreshTokens
    }
  });
});

// ----------------- Start Server -----------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log('✅ Available test users:');
  users.forEach(user => {
    console.log(`   - ${user.username} / ${user.password} (${user.role})`);
  });
  console.log('📋 Available endpoints:');
  console.log('   - POST /api/auth/login');
  console.log('   - POST /api/auth/refresh');
  console.log('   - POST /api/auth/logout');
  console.log('   - GET /api/auth/profile (protected)');
});