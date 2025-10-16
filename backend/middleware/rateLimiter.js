// backend/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');
const { logUserActivity } = require('../services/activityLogService');

// Get client IP helper
const getClientIP = (req) => {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         req.headers['x-forwarded-for']?.split(',')[0] ||
         req.headers['x-real-ip'] ||
         'unknown';
};

/**
 * Rate limiter cho login - chống brute force
 * Cho phép 5 lần thử trong 15 phút
 */
const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // Tối đa 5 lần thử
  message: {
    error: 'Too many login attempts',
    message: 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  
  // Custom key generator - sử dụng IP
  keyGenerator: (req) => {
    return getClientIP(req);
  },

  // Handler khi bị rate limit
  handler: async (req, res) => {
    const ipAddress = getClientIP(req);
    
    // Log rate limit event
    await logUserActivity({
      userId: null,
      action: 'RATE_LIMITED',
      ipAddress: ipAddress,
      userAgent: req.headers['user-agent'] || 'Unknown',
      details: {
        method: req.method,
        path: req.path,
        email: req.body?.email,
        limitType: 'LOGIN_RATE_LIMIT',
        windowMs: 15 * 60 * 1000,
        maxAttempts: 5
      },
      success: false,
      errorMessage: 'Rate limit exceeded for login attempts'
    });

    console.log(`🚫 Login rate limit exceeded for IP: ${ipAddress}`);

    res.status(429).json({
      error: 'Too many login attempts',
      message: 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút.',
      retryAfter: '15 minutes'
    });
  },

  // Skip rate limiting in development cho localhost
  skip: (req) => {
    if (process.env.NODE_ENV === 'development') {
      const ip = getClientIP(req);
      return ip === '127.0.0.1' || ip === '::1' || ip === 'localhost';
    }
    return false;
  }
});

/**
 * Rate limiter cho forgot password
 * Cho phép 3 lần trong 60 phút
 */
const forgotPasswordRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 phút
  max: 3, // Tối đa 3 lần
  message: {
    error: 'Too many forgot password requests',
    message: 'Quá nhiều yêu cầu quên mật khẩu. Vui lòng thử lại sau 1 giờ.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  
  keyGenerator: (req) => {
    return getClientIP(req);
  },

  handler: async (req, res) => {
    const ipAddress = getClientIP(req);
    
    await logUserActivity({
      userId: null,
      action: 'RATE_LIMITED',
      ipAddress: ipAddress,
      userAgent: req.headers['user-agent'] || 'Unknown',
      details: {
        method: req.method,
        path: req.path,
        email: req.body?.email,
        limitType: 'FORGOT_PASSWORD_RATE_LIMIT',
        windowMs: 60 * 60 * 1000,
        maxAttempts: 3
      },
      success: false,
      errorMessage: 'Rate limit exceeded for forgot password requests'
    });

    console.log(`🚫 Forgot password rate limit exceeded for IP: ${ipAddress}`);

    res.status(429).json({
      error: 'Too many forgot password requests',
      message: 'Quá nhiều yêu cầu quên mật khẩu. Vui lòng thử lại sau 1 giờ.',
      retryAfter: '1 hour'
    });
  },

  skip: (req) => {
    if (process.env.NODE_ENV === 'development') {
      const ip = getClientIP(req);
      return ip === '127.0.0.1' || ip === '::1' || ip === 'localhost';
    }
    return false;
  }
});

/**
 * Rate limiter cho signup
 * Cho phép 3 lần trong 60 phút
 */
const signupRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 phút
  max: 3, // Tối đa 3 lần
  message: {
    error: 'Too many signup attempts',
    message: 'Quá nhiều lần đăng ký. Vui lòng thử lại sau 1 giờ.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  
  keyGenerator: (req) => {
    return getClientIP(req);
  },

  handler: async (req, res) => {
    const ipAddress = getClientIP(req);
    
    await logUserActivity({
      userId: null,
      action: 'RATE_LIMITED',
      ipAddress: ipAddress,
      userAgent: req.headers['user-agent'] || 'Unknown',
      details: {
        method: req.method,
        path: req.path,
        email: req.body?.email,
        limitType: 'SIGNUP_RATE_LIMIT',
        windowMs: 60 * 60 * 1000,
        maxAttempts: 3
      },
      success: false,
      errorMessage: 'Rate limit exceeded for signup attempts'
    });

    console.log(`🚫 Signup rate limit exceeded for IP: ${ipAddress}`);

    res.status(429).json({
      error: 'Too many signup attempts',
      message: 'Quá nhiều lần đăng ký. Vui lòng thử lại sau 1 giờ.',
      retryAfter: '1 hour'
    });
  },

  skip: (req) => {
    if (process.env.NODE_ENV === 'development') {
      const ip = getClientIP(req);
      return ip === '127.0.0.1' || ip === '::1' || ip === 'localhost';
    }
    return false;
  }
});

/**
 * General API rate limiter
 * Cho phép 100 requests trong 15 phút
 */
const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100, // Tối đa 100 requests
  message: {
    error: 'Too many requests',
    message: 'Quá nhiều requests. Vui lòng thử lại sau.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  
  keyGenerator: (req) => {
    return getClientIP(req);
  },

  handler: async (req, res) => {
    const ipAddress = getClientIP(req);
    
    await logUserActivity({
      userId: req.user?.id || req.user?._id || null,
      action: 'RATE_LIMITED',
      ipAddress: ipAddress,
      userAgent: req.headers['user-agent'] || 'Unknown',
      details: {
        method: req.method,
        path: req.path,
        limitType: 'GENERAL_RATE_LIMIT',
        windowMs: 15 * 60 * 1000,
        maxAttempts: 100
      },
      success: false,
      errorMessage: 'Rate limit exceeded for general API'
    });

    console.log(`🚫 General rate limit exceeded for IP: ${ipAddress}`);

    res.status(429).json({
      error: 'Too many requests',
      message: 'Quá nhiều requests. Vui lòng thử lại sau.',
      retryAfter: '15 minutes'
    });
  },

  skip: (req) => {
    if (process.env.NODE_ENV === 'development') {
      const ip = getClientIP(req);
      return ip === '127.0.0.1' || ip === '::1' || ip === 'localhost';
    }
    return false;
  }
});

module.exports = {
  loginRateLimit,
  forgotPasswordRateLimit,
  signupRateLimit,
  generalRateLimit
};