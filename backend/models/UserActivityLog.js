// backend/models/UserActivityLog.js
const mongoose = require('mongoose');

const userActivityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Có thể null cho các hoạt động không cần đăng nhập
  },
  action: {
    type: String,
    required: true,
    enum: [
      'LOGIN_SUCCESS',
      'LOGIN_FAILED',
      'SIGNUP',
      'SIGNUP_SUCCESS',
      'LOGOUT',
      'FORGOT_PASSWORD',
      'RESET_PASSWORD',
      'UPLOAD_AVATAR',
      'DELETE_AVATAR',
      'UPDATE_PROFILE',
      'VIEW_PROFILE',
      'CREATE_USER',
      'UPDATE_USER',
      'DELETE_USER',
      'VIEW_USERS',
      'VIEW_MY_LOGS',
      'VIEW_ALL_LOGS',
      'VIEW_MY_STATS',
      'VIEW_SYSTEM_STATS',
      'RATE_LIMITED'
    ]
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: false
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed, // Lưu thêm thông tin chi tiết
    required: false
  },
  success: {
    type: Boolean,
    default: true
  },
  errorMessage: {
    type: String,
    required: false
  }
}, {
  timestamps: true,
  // Index để tối ưu query
  indexes: [
    { userId: 1, timestamp: -1 },
    { action: 1, timestamp: -1 },
    { ipAddress: 1, timestamp: -1 },
    { timestamp: -1 }
  ]
});

// Method để lấy logs theo user
userActivityLogSchema.statics.getLogsByUser = async function(userId, limit = 50, skip = 0) {
  return this.find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(skip)
    .populate('userId', 'name email')
    .lean();
};

// Method để lấy logs theo action
userActivityLogSchema.statics.getLogsByAction = async function(action, limit = 50, skip = 0) {
  return this.find({ action })
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(skip)
    .populate('userId', 'name email')
    .lean();
};

// Method để lấy logs theo IP
userActivityLogSchema.statics.getLogsByIP = async function(ipAddress, limit = 50, skip = 0) {
  return this.find({ ipAddress })
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(skip)
    .populate('userId', 'name email')
    .lean();
};

// Method để lấy thống kê
userActivityLogSchema.statics.getStats = async function(startDate, endDate) {
  const matchStage = {};
  if (startDate || endDate) {
    matchStage.timestamp = {};
    if (startDate) matchStage.timestamp.$gte = new Date(startDate);
    if (endDate) matchStage.timestamp.$lte = new Date(endDate);
  }

  return this.aggregate([
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
};

// Method để đếm số lần login failed trong khoảng thời gian
userActivityLogSchema.statics.countFailedLogins = async function(ipAddress, timeWindow = 15 * 60 * 1000) {
  const since = new Date(Date.now() - timeWindow);
  
  return this.countDocuments({
    ipAddress,
    action: 'LOGIN_FAILED',
    timestamp: { $gte: since }
  });
};

module.exports = mongoose.model('UserActivityLog', userActivityLogSchema);