/* 
 * Test Activity Logs Server - Hoạt động 5
 * Server để test rate limiting và activity logging
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Import middleware
const { loginRateLimit, generalRateLimit } = require('./backend/middleware/rateLimiter');
const { logActivity } = require('./backend/middleware/activityLogger');

// Import models  
const UserActivityLog = require('./backend/models/UserActivityLog');

const app = express();

// CORS middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5001', 'http://localhost:8080'],
    credentials: true
}));

app.use(express.json());
app.use(express.static('.'));

// Apply general rate limiting to all routes
app.use(generalRateLimit);

// Connect to MongoDB (sử dụng in-memory hoặc test database)
mongoose.connect('mongodb://localhost:27017/group4_activity_logs_test', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✅ Connected to MongoDB for Activity Logs Testing');
}).catch(err => {
    console.log('❌ MongoDB connection error:', err.message);
    console.log('💡 Continuing with mock data...');
});

// Mock Users Database
const mockUsers = [
    {
        id: '1',
        email: 'admin@test.com',
        name: 'Admin User',
        role: 'admin',
        password: '$2a$10$rOzJc5cJzv6oL8nMvE5q0eK5nX8tC8wE8sGgNq5vL5fE5mE5qE5cO' // password123
    },
    {
        id: '2', 
        email: 'user@test.com',
        name: 'Test User',
        role: 'user',
        password: '$2a$10$rOzJc5cJzv6oL8nMvE5q0eK5nX8tC8wE8sGgNq5vL5fE5mE5qE5cO' // password123
    }
];

// Mock Activity Logs để test (nếu MongoDB không available)
let mockActivityLogs = [];

// Tạo sample logs
const createSampleLogs = () => {
    const actions = ['LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'UPLOAD_AVATAR', 'UPDATE_PROFILE', 'RATE_LIMITED'];
    const ips = ['192.168.1.100', '10.0.0.1', '172.16.0.1', '203.0.113.1'];
    
    for (let i = 0; i < 50; i++) {
        const log = {
            userId: Math.random() > 0.3 ? mockUsers[Math.floor(Math.random() * mockUsers.length)].id : null,
            action: actions[Math.floor(Math.random() * actions.length)],
            ipAddress: ips[Math.floor(Math.random() * ips.length)],
            userAgent: 'Mozilla/5.0 (Test Browser)',
            timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
            success: Math.random() > 0.2,
            details: { method: 'POST', path: '/api/test' }
        };
        mockActivityLogs.push(log);
    }
};

createSampleLogs();

// Auth middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }
    
    // Mock token verification
    if (token === 'admin-token') {
        req.user = mockUsers[0]; // Admin user
    } else if (token === 'user-token') {
        req.user = mockUsers[1]; // Regular user
    } else {
        return res.status(403).json({ message: 'Invalid token' });
    }
    
    next();
};

// Routes

// Login endpoint với rate limiting
app.post('/api/auth/login', 
    loginRateLimit,
    logActivity('LOGIN_SUCCESS'),
    async (req, res) => {
        try {
            const { email, password } = req.body;
            
            console.log(`🔐 Login attempt: ${email}`);
            
            const user = mockUsers.find(u => u.email === email);
            
            if (!user) {
                // Log failed login
                await logUserActivity({
                    userId: null,
                    action: 'LOGIN_FAILED',
                    ipAddress: getClientIP(req),
                    userAgent: req.headers['user-agent'],
                    details: { email, reason: 'User not found' },
                    success: false,
                    errorMessage: 'Invalid email or password'
                });
                
                return res.status(401).json({ 
                    message: 'Invalid email or password' 
                });
            }
            
            // Verify password
            const validPassword = await bcrypt.compare(password, user.password);
            
            if (!validPassword) {
                // Log failed login
                await logUserActivity({
                    userId: user.id,
                    action: 'LOGIN_FAILED', 
                    ipAddress: getClientIP(req),
                    userAgent: req.headers['user-agent'],
                    details: { email, reason: 'Invalid password' },
                    success: false,
                    errorMessage: 'Invalid email or password'
                });
                
                return res.status(401).json({ 
                    message: 'Invalid email or password' 
                });
            }
            
            // Success - generate token
            const token = user.role === 'admin' ? 'admin-token' : 'user-token';
            
            res.json({
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                }
            });
            
        } catch (error) {
            console.error('❌ Login error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// Logout endpoint
app.post('/api/auth/logout',
    authenticateToken,
    logActivity('LOGOUT'),
    (req, res) => {
        res.json({ message: 'Logout successful' });
    }
);

// Admin: Get all logs
app.get('/api/logs/all',
    authenticateToken,
    logActivity('VIEW_ALL_LOGS'),
    async (req, res) => {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Admin access required' });
            }
            
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const skip = (page - 1) * limit;
            
            // Try MongoDB first, fallback to mock data
            let logs, total;
            
            try {
                const query = {};
                if (req.query.action) query.action = req.query.action;
                if (req.query.userId) query.userId = req.query.userId;
                if (req.query.ip) query.ipAddress = req.query.ip;
                
                logs = await UserActivityLog.find(query)
                    .sort({ timestamp: -1 })
                    .limit(limit)
                    .skip(skip)
                    .lean();
                    
                total = await UserActivityLog.countDocuments(query);
                
                // Add user info to logs
                logs = logs.map(log => ({
                    ...log,
                    user: log.userId ? mockUsers.find(u => u.id === log.userId.toString()) : null
                }));
                
            } catch (dbError) {
                console.log('📊 Using mock data for logs');
                // Use mock data
                let filteredLogs = [...mockActivityLogs];
                
                if (req.query.action) {
                    filteredLogs = filteredLogs.filter(log => log.action === req.query.action);
                }
                if (req.query.userId) {
                    filteredLogs = filteredLogs.filter(log => log.userId === req.query.userId);
                }
                if (req.query.ip) {
                    filteredLogs = filteredLogs.filter(log => log.ipAddress === req.query.ip);
                }
                
                filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                
                total = filteredLogs.length;
                logs = filteredLogs.slice(skip, skip + limit);
                
                // Add user info
                logs = logs.map(log => ({
                    ...log,
                    _id: Math.random().toString(36).substr(2, 9),
                    user: log.userId ? mockUsers.find(u => u.id === log.userId) : null
                }));
            }
            
            res.json({
                message: 'Logs retrieved successfully',
                data: logs,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalLogs: total,
                    hasNextPage: page < Math.ceil(total / limit),
                    hasPrevPage: page > 1
                }
            });
            
        } catch (error) {
            console.error('❌ Error getting logs:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// Admin: Get activity stats
app.get('/api/logs/stats',
    authenticateToken,
    logActivity('VIEW_SYSTEM_STATS'),
    async (req, res) => {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Admin access required' });
            }
            
            // Mock stats data
            const stats = {
                summary: {
                    totalLogs: mockActivityLogs.length,
                    uniqueUsers: new Set(mockActivityLogs.filter(l => l.userId).map(l => l.userId)).size,
                    uniqueIPs: new Set(mockActivityLogs.map(l => l.ipAddress)).size
                },
                actionStats: [
                    { _id: 'LOGIN_SUCCESS', count: 15, success: 15, failed: 0 },
                    { _id: 'LOGIN_FAILED', count: 8, success: 0, failed: 8 },
                    { _id: 'LOGOUT', count: 12, success: 12, failed: 0 },
                    { _id: 'UPLOAD_AVATAR', count: 5, success: 5, failed: 0 },
                    { _id: 'RATE_LIMITED', count: 3, success: 0, failed: 3 }
                ],
                dailyStats: [
                    { _id: '2024-10-21', count: 25, success: 20, failed: 5 },
                    { _id: '2024-10-20', count: 18, success: 15, failed: 3 },
                    { _id: '2024-10-19', count: 22, success: 19, failed: 3 }
                ],
                topIPs: [
                    { _id: '192.168.1.100', count: 15, actions: ['LOGIN_SUCCESS', 'LOGOUT'] },
                    { _id: '10.0.0.1', count: 12, actions: ['LOGIN_FAILED', 'RATE_LIMITED'] },
                    { _id: '172.16.0.1', count: 8, actions: ['LOGIN_SUCCESS'] }
                ]
            };
            
            res.json({
                message: 'Stats retrieved successfully',
                data: stats
            });
            
        } catch (error) {
            console.error('❌ Error getting stats:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// Test rate limiting endpoint
app.post('/api/test/rate-limit', (req, res) => {
    res.json({ 
        message: 'Request successful', 
        timestamp: new Date().toISOString(),
        ip: getClientIP(req)
    });
});

// Real-time logs endpoint (mock WebSocket với polling)
app.get('/api/logs/realtime',
    authenticateToken,
    async (req, res) => {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Admin access required' });
            }
            
            // Get recent logs (last 5 minutes)
            const since = new Date(Date.now() - 5 * 60 * 1000);
            
            const recentLogs = mockActivityLogs
                .filter(log => new Date(log.timestamp) > since)
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, 10)
                .map(log => ({
                    ...log,
                    _id: Math.random().toString(36).substr(2, 9),
                    user: log.userId ? mockUsers.find(u => u.id === log.userId) : null
                }));
            
            res.json({
                message: 'Real-time logs retrieved',
                data: recentLogs,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('❌ Error getting real-time logs:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// Helper functions
const getClientIP = (req) => {
    return req.ip || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
           req.headers['x-forwarded-for']?.split(',')[0] ||
           req.headers['x-real-ip'] ||
           'unknown';
};

const logUserActivity = async (logData) => {
    try {
        // Try to save to MongoDB
        const log = new UserActivityLog(logData);
        await log.save();
        console.log(`📝 Activity logged: ${logData.action}`);
    } catch (error) {
        // Fallback to mock logs
        mockActivityLogs.unshift({
            ...logData,
            _id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date()
        });
        console.log(`📝 Activity logged (mock): ${logData.action}`);
    }
};

const PORT = 5002;
app.listen(PORT, () => {
    console.log(`
🚀 Activity Logs Test Server Started on http://localhost:${PORT}

📊 Test Endpoints:
   POST /api/auth/login         - Test login with rate limiting
   POST /api/auth/logout        - Test logout logging
   GET  /api/logs/all           - Admin: Get all activity logs
   GET  /api/logs/stats         - Admin: Get activity statistics
   GET  /api/logs/realtime      - Admin: Get real-time logs
   POST /api/test/rate-limit    - Test general rate limiting

🔐 Test Accounts:
   Admin: admin@test.com / password123 (token: admin-token)
   User:  user@test.com / password123  (token: user-token)

🌐 Frontend:
   Admin Dashboard: http://localhost:${PORT}/frontend/src/pages/admin-logs/index.html

⚡ Rate Limits:
   Login: 5 attempts per 15 minutes
   General: 100 requests per 15 minutes
`);
});

module.exports = app;
