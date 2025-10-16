const jwt = require('jsonwebtoken');

// JWT Secret (should match with authController)
const ACCESS_TOKEN_SECRET = 'your-access-token-secret-key';

// Middleware to verify Access Token
const authenticateToken = (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token is required' 
    });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    req.user = decoded; // Add user info to request object
    next(); // Continue to next middleware/route handler
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

// Optional middleware - verify token if present, but don't require it
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    try {
      const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
      req.user = decoded;
    } catch (error) {
      // Token invalid but we don't block the request
      req.user = null;
    }
  }
  
  next();
};

module.exports = {
  authenticateToken,
  optionalAuth
};