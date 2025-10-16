// backend/controllers/logController.js
const { getUserLogs, getAllLogs, getActivityStats } = require('../services/activityLogService');

/**
 * Lấy logs của user hiện tại
 */
exports.getUserLogs = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const action = req.query.action;

    const result = await getUserLogs(userId, { limit, skip, action });

    res.json({
      message: 'Lấy logs thành công',
      data: result.logs,
      pagination: {
        currentPage: page,
        totalPages: result.totalPages,
        totalLogs: result.total,
        hasNextPage: page < result.totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Lỗi lấy user logs:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * Lấy tất cả logs (Admin only)
 */
exports.getAllLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    const filters = {
      action: req.query.action,
      userId: req.query.userId,
      ipAddress: req.query.ip,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });

    const result = await getAllLogs({ limit, skip, ...filters });

    res.json({
      message: 'Lấy tất cả logs thành công',
      data: result.logs,
      pagination: {
        currentPage: page,
        totalPages: result.totalPages,
        totalLogs: result.total,
        hasNextPage: page < result.totalPages,
        hasPrevPage: page > 1
      },
      filters: filters
    });

  } catch (error) {
    console.error('Lỗi lấy all logs:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * Lấy thống kê hoạt động
 */
exports.getActivityStats = async (req, res) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      userId: req.query.userId
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });

    const stats = await getActivityStats(filters);

    res.json({
      message: 'Lấy thống kê thành công',
      data: stats
    });

  } catch (error) {
    console.error('Lỗi lấy stats:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * Lấy thống kê của user hiện tại
 */
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const filters = {
      userId: userId,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const stats = await getActivityStats(filters);

    res.json({
      message: 'Lấy thống kê user thành công',
      data: stats
    });

  } catch (error) {
    console.error('Lỗi lấy user stats:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};