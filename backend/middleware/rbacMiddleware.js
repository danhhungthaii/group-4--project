const jwt = require('jsonwebtoken');

// JWT Secret (should match with authController)
const ACCESS_TOKEN_SECRET = 'your-access-token-secret-key';

// Define roles hierarchy (higher number = more permissions)
const ROLE_HIERARCHY = {
  'User': 1,
  'Moderator': 2,
  'Admin': 3
};

// Middleware to verify Access Token and add user info to request
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
    req.user = decoded; // Add user info to request object
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

// Middleware to check if user has required role
const checkRole = (requiredRole) => {
  return (req, res, next) => {
    // This middleware should be used after authenticateToken
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRole = req.user.role;
    const userRoleLevel = ROLE_HIERARCHY[userRole];
    const requiredRoleLevel = ROLE_HIERARCHY[requiredRole];

    if (!userRoleLevel) {
      return res.status(403).json({
        success: false,
        message: 'Invalid user role'
      });
    }

    if (!requiredRoleLevel) {
      return res.status(500).json({
        success: false,
        message: 'Invalid required role configuration'
      });
    }

    // Check if user's role level is sufficient
    if (userRoleLevel < requiredRoleLevel) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${requiredRole}, Your role: ${userRole}`,
        required: requiredRole,
        current: userRole
      });
    }

    next();
  };
};

// Middleware to check if user has specific roles (exact match)
const checkExactRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRole = req.user.role;
    
    // Allow array or single role
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Allowed roles: ${roles.join(', ')}, Your role: ${userRole}`,
        allowed: roles,
        current: userRole
      });
    }

    next();
  };
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
      req.user = null;
    }
  }
  
  next();
};

// Middleware to check if user can access their own data or is admin
const checkOwnershipOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  const userId = parseInt(req.params.id);
  const currentUserId = req.user.id;
  const userRole = req.user.role;

  // Allow if user is admin or accessing their own data
  if (userRole === 'Admin' || currentUserId === userId) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your own data or need admin privileges.'
    });
  }
};

module.exports = {
  authenticateToken,
  checkRole,
  checkExactRole,
  optionalAuth,
  checkOwnershipOrAdmin,
  ROLE_HIERARCHY
};