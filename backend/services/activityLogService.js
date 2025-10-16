// backend/services/activityLogService.js
const UserActivityLog = require('../models/UserActivityLog');

/**
 * Ghi log hoạt động của user
 * @param {Object} logData - Dữ liệu log
 * @param {String} logData.userId - ID của user (có thể null)
 * @param {String} logData.action - Hành động thực hiện
 * @param {String} logData.ipAddress - Địa chỉ IP
 * @param {String} logData.userAgent - User agent
 * @param {Object} logData.details - Chi tiết thêm
 * @param {Boolean} logData.success - Thành công hay không
 * @param {String} logData.errorMessage - Thông báo lỗi nếu có
 * @returns {Promise<Object>} - Log record đã tạo
 */
const logUserActivity = async (logData) => {
  try {
    const log = new UserActivityLog({
      userId: logData.userId || null,
      action: logData.action,
      ipAddress: logData.ipAddress,
      userAgent: logData.userAgent || 'Unknown',
      details: logData.details || {},
      success: logData.success !== false, // Default true
      errorMessage: logData.errorMessage || null,
      timestamp: new Date()
    });

    const savedLog = await log.save();
    console.log(`📝 Activity logged: ${logData.action} - ${logData.ipAddress}`);
    return savedLog;
  } catch (error) {
    console.error('❌ Error logging activity:', error);
    // Không throw error để tránh ảnh hưởng đến flow chính
    return null;
  }
};

/**
 * Lấy logs theo user
 */
const getUserLogs = async (userId, options = {}) => {
  const { limit = 50, skip = 0, action } = options;
  
  try {
    const query = { userId };
    if (action) query.action = action;

    const logs = await UserActivityLog.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip)
      .populate('userId', 'name email')
      .lean();

    const total = await UserActivityLog.countDocuments(query);
    
    return {
      logs,
      total,
      page: Math.floor(skip / limit) + 1,
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error('❌ Error getting user logs:', error);
    throw error;
  }
};

/**
 * Lấy tất cả logs (Admin only)
 */
const getAllLogs = async (options = {}) => {
  const { limit = 50, skip = 0, action, userId, ipAddress, startDate, endDate } = options;
  
  try {
    const query = {};
    if (action) query.action = action;
    if (userId) query.userId = userId;
    if (ipAddress) query.ipAddress = ipAddress;
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const logs = await UserActivityLog.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip)
      .populate('userId', 'name email role')
      .lean();

    const total = await UserActivityLog.countDocuments(query);
    
    return {
      logs,
      total,
      page: Math.floor(skip / limit) + 1,
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error('❌ Error getting all logs:', error);
    throw error;
  }
};

/**
 * Lấy thống kê hoạt động
 */
const getActivityStats = async (options = {}) => {
  const { startDate, endDate, userId } = options;
  
  try {
    const matchStage = {};
    if (userId) matchStage.userId = userId;
    
    if (startDate || endDate) {
      matchStage.timestamp = {};
      if (startDate) matchStage.timestamp.$gte = new Date(startDate);
      if (endDate) matchStage.timestamp.$lte = new Date(endDate);
    }

    // Thống kê theo action
    const actionStats = await UserActivityLog.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
          success: { $sum: { $cond: ['$success', 1, 0] } },
          failed: { $sum: { $cond: ['$success', 0, 1] } }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Thống kê theo ngày (7 ngày gần nhất)
    const dailyStats = await UserActivityLog.aggregate([
      { 
        $match: {
          ...matchStage,
          timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$timestamp" }
          },
          count: { $sum: 1 },
          success: { $sum: { $cond: ['$success', 1, 0] } },
          failed: { $sum: { $cond: ['$success', 0, 1] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top IP addresses
    const topIPs = await UserActivityLog.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$ipAddress',
          count: { $sum: 1 },
          actions: { $addToSet: '$action' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    return {
      actionStats,
      dailyStats,
      topIPs,
      summary: {
        totalLogs: await UserActivityLog.countDocuments(matchStage),
        uniqueUsers: await UserActivityLog.distinct('userId', matchStage).then(users => users.filter(u => u).length),
        uniqueIPs: await UserActivityLog.distinct('ipAddress', matchStage).then(ips => ips.length)
      }
    };
  } catch (error) {
    console.error('❌ Error getting activity stats:', error);
    throw error;
  }
};

/**
 * Kiểm tra số lần login failed từ IP trong khoảng thời gian
 */
const checkFailedLoginAttempts = async (ipAddress, timeWindow = 15 * 60 * 1000) => {
  try {
    const since = new Date(Date.now() - timeWindow);
    
    const failedCount = await UserActivityLog.countDocuments({
      ipAddress,
      action: 'LOGIN_FAILED',
      timestamp: { $gte: since }
    });

    return failedCount;
  } catch (error) {
    console.error('❌ Error checking failed login attempts:', error);
    return 0;
  }
};

/**
 * Clean up old logs (để tránh database quá lớn)
 */
const cleanupOldLogs = async (daysToKeep = 90) => {
  try {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    
    const result = await UserActivityLog.deleteMany({
      timestamp: { $lt: cutoffDate }
    });

    console.log(`🧹 Cleaned up ${result.deletedCount} old activity logs`);
    return result.deletedCount;
  } catch (error) {
    console.error('❌ Error cleaning up old logs:', error);
    throw error;
  }
};

module.exports = {
  logUserActivity,
  getUserLogs,
  getAllLogs,
  getActivityStats,
  checkFailedLoginAttempts,
  cleanupOldLogs
};