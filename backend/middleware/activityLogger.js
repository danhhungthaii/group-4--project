// backend/middleware/activityLogger.js
const { logUserActivity } = require('../services/activityLogService');

/**
 * Middleware để ghi log hoạt động của user
 * @param {String} action - Tên hành động
 * @param {Object} options - Tùy chọn thêm
 * @returns {Function} Express middleware
 */
const logActivity = (action, options = {}) => {
  return async (req, res, next) => {
    // Lấy thông tin từ request
    const getClientIP = (req) => {
      return req.ip || 
             req.connection.remoteAddress || 
             req.socket.remoteAddress ||
             (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
             req.headers['x-forwarded-for']?.split(',')[0] ||
             req.headers['x-real-ip'] ||
             'unknown';
    };

    const logData = {
      userId: req.user?.id || req.user?._id || null,
      action: action,
      ipAddress: getClientIP(req),
      userAgent: req.headers['user-agent'] || 'Unknown',
      details: {
        method: req.method,
        path: req.path,
        query: req.query,
        timestamp: new Date().toISOString(),
        ...options.details
      },
      success: true // Default, sẽ được update nếu có lỗi
    };

    // Store original res.json và res.status để intercept response
    const originalJson = res.json;
    const originalStatus = res.status;
    let statusCode = 200;
    let responseData = null;

    // Override res.status để capture status code
    res.status = function(code) {
      statusCode = code;
      return originalStatus.call(this, code);
    };

    // Override res.json để capture response và log sau khi response
    res.json = function(data) {
      responseData = data;
      
      // Xác định success/failure dựa trên status code
      logData.success = statusCode < 400;
      if (!logData.success) {
        logData.errorMessage = data?.message || `HTTP ${statusCode}`;
      }

      // Log specific details based on action
      switch (action) {
        case 'LOGIN_SUCCESS':
          logData.details.email = responseData?.user?.email;
          logData.details.role = responseData?.user?.role;
          break;
        case 'LOGIN_FAILED':
          logData.details.email = req.body?.email;
          logData.success = false;
          break;
        case 'SIGNUP':
          logData.details.email = responseData?.user?.email || req.body?.email;
          logData.details.role = responseData?.user?.role;
          break;
        case 'FORGOT_PASSWORD':
          logData.details.email = req.body?.email;
          break;
        case 'RESET_PASSWORD':
          logData.details.tokenUsed = !!req.params?.token;
          break;
        case 'UPLOAD_AVATAR':
          logData.details.fileSize = req.file?.size;
          logData.details.fileType = req.file?.mimetype;
          break;
        default:
          // Keep default details
          break;
      }

      // Log the activity asynchronously
      setImmediate(() => {
        logUserActivity(logData);
      });

      // Call original json method
      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Middleware để log activity cho các route cần authentication
 * Sử dụng sau auth middleware
 */
const logAuthenticatedActivity = (action, options = {}) => {
  return logActivity(action, {
    ...options,
    requireAuth: true
  });
};

/**
 * Middleware để log lỗi
 */
const logError = (action = 'ERROR') => {
  return (err, req, res, next) => {
    const getClientIP = (req) => {
      return req.ip || 
             req.connection.remoteAddress || 
             req.socket.remoteAddress ||
             (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
             req.headers['x-forwarded-for']?.split(',')[0] ||
             req.headers['x-real-ip'] ||
             'unknown';
    };

    const logData = {
      userId: req.user?.id || req.user?._id || null,
      action: action,
      ipAddress: getClientIP(req),
      userAgent: req.headers['user-agent'] || 'Unknown',
      details: {
        method: req.method,
        path: req.path,
        query: req.query,
        error: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString()
      },
      success: false,
      errorMessage: err.message
    };

    // Log the error asynchronously
    setImmediate(() => {
      logUserActivity(logData);
    });

    next(err);
  };
};

/**
 * Helper function để log activity manually trong controllers
 */
const logManualActivity = async (req, action, details = {}) => {
  const getClientIP = (req) => {
    return req.ip || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
           req.headers['x-forwarded-for']?.split(',')[0] ||
           req.headers['x-real-ip'] ||
           'unknown';
  };

  const logData = {
    userId: req.user?.id || req.user?._id || null,
    action: action,
    ipAddress: getClientIP(req),
    userAgent: req.headers['user-agent'] || 'Unknown',
    details: {
      method: req.method,
      path: req.path,
      timestamp: new Date().toISOString(),
      ...details
    },
    success: true
  };

  return await logUserActivity(logData);
};

module.exports = {
  logActivity,
  logAuthenticatedActivity,
  logError,
  logManualActivity
};