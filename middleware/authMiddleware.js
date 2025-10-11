// Backend Authentication Middleware Enhancement
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Enhanced authentication middleware với logging và performance improvements
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ 
            success: false,
            message: 'Access token required',
            code: 'TOKEN_REQUIRED'
        });
    }

    try {
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Fetch user với populate roles (for RBAC)
        const user = await User.findById(decoded.userId)
            .populate('role', 'name permissions')
            .select('-password'); // Exclude password từ response

        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: 'User not found',
                code: 'USER_NOT_FOUND'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({ 
                success: false,
                message: 'Account deactivated',
                code: 'ACCOUNT_DEACTIVATED'
            });
        }

        // Check email verification for sensitive operations
        if (!user.isEmailVerified && req.path.includes('/sensitive/')) {
            return res.status(403).json({ 
                success: false,
                message: 'Email verification required',
                code: 'EMAIL_NOT_VERIFIED'
            });
        }

        // Add user info to request
        req.user = user;
        req.userId = user._id;
        req.userRole = user.role;
        
        // Log authentication success (for monitoring)
        console.log(`Auth success: ${user.email} - ${req.method} ${req.path}`);
        
        next();
        
    } catch (error) {
        let errorMessage = 'Invalid token';
        let errorCode = 'INVALID_TOKEN';
        
        if (error.name === 'TokenExpiredError') {
            errorMessage = 'Token expired';
            errorCode = 'TOKEN_EXPIRED';
        } else if (error.name === 'JsonWebTokenError') {
            errorMessage = 'Malformed token';
            errorCode = 'MALFORMED_TOKEN';
        }
        
        console.log(`Auth failed: ${error.message} - ${req.method} ${req.path}`);
        
        return res.status(401).json({ 
            success: false,
            message: errorMessage,
            code: errorCode
        });
    }
};

// Role-based authorization middleware
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                message: 'Authentication required',
                code: 'AUTH_REQUIRED'
            });
        }

        const userRole = req.user.role?.name || req.user.role;
        
        if (!allowedRoles.includes(userRole)) {
            console.log(`Access denied: ${req.user.email} tried to access ${req.path} with role ${userRole}`);
            
            return res.status(403).json({ 
                success: false,
                message: 'Insufficient permissions',
                code: 'INSUFFICIENT_PERMISSIONS',
                required: allowedRoles,
                current: userRole
            });
        }

        console.log(`Access granted: ${req.user.email} - ${userRole} - ${req.method} ${req.path}`);
        next();
    };
};

// Permission-based authorization middleware (more granular)
const authorizePermissions = (...requiredPermissions) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                message: 'Authentication required',
                code: 'AUTH_REQUIRED'
            });
        }

        const userPermissions = req.user.role?.permissions || [];
        
        // Check if user has ALL required permissions
        const hasAllPermissions = requiredPermissions.every(permission => 
            userPermissions.includes(permission)
        );

        if (!hasAllPermissions) {
            console.log(`Permission denied: ${req.user.email} missing permissions ${requiredPermissions} - has ${userPermissions}`);
            
            return res.status(403).json({ 
                success: false,
                message: 'Missing required permissions',
                code: 'MISSING_PERMISSIONS',
                required: requiredPermissions,
                current: userPermissions
            });
        }

        next();
    };
};

// Optional authentication (user might not be logged in)
const optionalAuth = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId)
            .populate('role', 'name permissions')
            .select('-password');

        req.user = user;
        req.userId = user?._id;
        req.userRole = user?.role;
        
    } catch (error) {
        // Ignore token errors for optional auth
        req.user = null;
    }

    next();
};

// Rate limiting middleware for sensitive endpoints
const rateLimit = (windowMs = 15 * 60 * 1000, maxRequests = 5) => {
    const requests = new Map();
    
    return (req, res, next) => {
        const identifier = req.ip + (req.user?.email || 'anonymous');
        const now = Date.now();
        const windowStart = now - windowMs;
        
        // Clean old requests
        if (requests.has(identifier)) {
            const userRequests = requests.get(identifier).filter(time => time > windowStart);
            requests.set(identifier, userRequests);
        }
        
        const currentRequests = requests.get(identifier) || [];
        
        if (currentRequests.length >= maxRequests) {
            return res.status(429).json({ 
                success: false,
                message: 'Too many requests',
                code: 'RATE_LIMITED',
                retryAfter: Math.ceil((currentRequests[0] + windowMs - now) / 1000)
            });
        }
        
        currentRequests.push(now);
        requests.set(identifier, currentRequests);
        
        next();
    };
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
    // Prevent XSS attacks
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // HTTPS enforcement
    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    
    next();
};

// API key authentication (for external integrations)
const authenticateApiKey = async (req, res, next) => {
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;
    
    if (!apiKey) {
        return res.status(401).json({ 
            success: false,
            message: 'API key required',
            code: 'API_KEY_REQUIRED'
        });
    }
    
    // In production, store API keys in database với hashing
    const validApiKeys = process.env.VALID_API_KEYS?.split(',') || [];
    
    if (!validApiKeys.includes(apiKey)) {
        return res.status(401).json({ 
            success: false,
            message: 'Invalid API key',
            code: 'INVALID_API_KEY'
        });
    }
    
    // Set API user context
    req.apiAuth = true;
    req.apiKey = apiKey;
    
    next();
};

module.exports = {
    authenticateToken,
    authorizeRoles,
    authorizePermissions,
    optionalAuth,
    rateLimit,
    securityHeaders,
    authenticateApiKey
};