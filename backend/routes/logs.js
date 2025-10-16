// backend/routes/logs.js
const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const authMiddleware = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');
const { logAuthenticatedActivity } = require('../middleware/activityLogger');

// Routes cho user thường (xem logs của chính mình)
router.get('/my-logs', 
  authMiddleware, 
  logAuthenticatedActivity('VIEW_MY_LOGS'), 
  logController.getUserLogs
);

router.get('/my-stats', 
  authMiddleware, 
  logAuthenticatedActivity('VIEW_MY_STATS'), 
  logController.getUserStats
);

// Routes cho Admin (xem tất cả logs)
router.get('/all', 
  authMiddleware, 
  requireAdmin, 
  logAuthenticatedActivity('VIEW_ALL_LOGS'), 
  logController.getAllLogs
);

router.get('/stats', 
  authMiddleware, 
  requireAdmin, 
  logAuthenticatedActivity('VIEW_SYSTEM_STATS'), 
  logController.getActivityStats
);

module.exports = router;