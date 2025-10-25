/* 
 * Enhanced Activity Logs Server - Hoạt động 5 & 6
 * Server hỗ trợ Redux authentication và Protected Routes
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const app = express();

// JWT Secret
const JWT_SECRET = 'your_jwt_secret_key_here_for_testing_only';

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

app.use(express.json());
app.use(express.static('.'));

// Get client IP helper
const getClientIP = (req) => {
    return req.ip || 
           req.connection.remoteAddress || 
           req.headers['x-forwarded-for']?.split(',')[0] ||
           req.headers['x-real-ip'] ||
           '127.0.0.1';
};

// Rate limiters
const loginRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 5, // 5 attempts
    message: {
        error: 'Too many login attempts',
        message: 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => getClientIP(req),
    handler: (req, res) => {
        console.log(`🚫 Login rate limit exceeded for IP: ${getClientIP(req)}`);
        res.status(429).json({
            error: 'Too many login attempts',
            message: 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút.'
        });
    }
});

const generalRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 100, // 100 requests
    message: {
        error: 'Too many requests',
        message: 'Quá nhiều requests. Vui lòng thử lại sau.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => getClientIP(req),
    handler: (req, res) => {
        console.log(`🚫 General rate limit exceeded for IP: ${getClientIP(req)}`);
        res.status(429).json({
            error: 'Too many requests',
            message: 'Quá nhiều requests. Vui lòng thử lại sau.'
        });
    }
});

// Apply general rate limiting
app.use(generalRateLimit);

// Mock Users
const mockUsers = [
    {
        id: '1',
        email: 'admin@test.com',
        name: 'Admin User',
        role: 'admin',
        password: '$2b$10$LK00xxmANes1XKzIkfpTOOS61ysaWaazx6O1IAO6hiUPCEW0TtxMu' // password123
    },
    {
        id: '2',
        email: 'user@test.com',
        name: 'Test User', 
        role: 'user',
        password: '$2b$10$LK00xxmANes1XKzIkfpTOOS61ysaWaazx6O1IAO6hiUPCEW0TtxMu' // password123
    }
];

// Mock Activity Logs
let activityLogs = [];

// Helper to log activity
const logActivity = (userId, action, ipAddress, userAgent, details = {}, success = true, errorMessage = null) => {
    const log = {
        _id: Math.random().toString(36).substr(2, 9),
        userId: userId,
        action: action,
        ipAddress: ipAddress,
        userAgent: userAgent || 'Unknown',
        timestamp: new Date(),
        details: details,
        success: success,
        errorMessage: errorMessage
    };
    
    activityLogs.unshift(log); // Add to beginning
    
    // Keep only last 1000 logs
    if (activityLogs.length > 1000) {
        activityLogs = activityLogs.slice(0, 1000);
    }
    
    console.log(`📝 Activity logged: ${action} - ${ipAddress} - Success: ${success}`);
    return log;
};

// Create some sample logs
const createSampleLogs = () => {
    const actions = ['LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'UPLOAD_AVATAR', 'UPDATE_PROFILE', 'RATE_LIMITED'];
    const ips = ['192.168.1.100', '10.0.0.1', '172.16.0.1', '203.0.113.1'];
    
    for (let i = 0; i < 50; i++) {
        const randomUser = Math.random() > 0.3 ? mockUsers[Math.floor(Math.random() * mockUsers.length)] : null;
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        const randomIP = ips[Math.floor(Math.random() * ips.length)];
        const randomSuccess = Math.random() > 0.2;
        
        logActivity(
            randomUser?.id || null,
            randomAction,
            randomIP,
            'Mozilla/5.0 (Test Browser)',
            { method: 'POST', path: '/api/test' },
            randomSuccess,
            randomSuccess ? null : 'Test error message'
        );
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
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = mockUsers.find(u => u.id === decoded.userId);
        
        if (!user) {
            return res.status(403).json({ message: 'Invalid token - user not found' });
        }
        
        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid token' });
    }
};

// Routes

// Login với rate limiting
app.post('/api/auth/login', loginRateLimit, async (req, res) => {
    try {
        const { email, password } = req.body;
        const ip = getClientIP(req);
        const userAgent = req.headers['user-agent'];
        
        console.log(`🔐 Login attempt: ${email} from ${ip}`);
        
        const user = mockUsers.find(u => u.email === email);
        
        if (!user) {
            logActivity(null, 'LOGIN_FAILED', ip, userAgent, 
                { email, reason: 'User not found' }, false, 'Invalid email or password');
            
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            logActivity(user.id, 'LOGIN_FAILED', ip, userAgent,
                { email, reason: 'Invalid password' }, false, 'Invalid email or password');
            
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        // Success
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        logActivity(user.id, 'LOGIN_SUCCESS', ip, userAgent,
            { email, role: user.role }, true);
        
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
});

// Logout
app.post('/api/auth/logout', authenticateToken, (req, res) => {
    const ip = getClientIP(req);
    const userAgent = req.headers['user-agent'];
    
    logActivity(req.user.id, 'LOGOUT', ip, userAgent, { email: req.user.email }, true);
    
    res.json({ message: 'Logout successful' });
});

// Get user profile
app.get('/api/auth/profile', authenticateToken, (req, res) => {
    const ip = getClientIP(req);
    const userAgent = req.headers['user-agent'];
    
    logActivity(req.user.id, 'GET_PROFILE', ip, userAgent, { email: req.user.email }, true);
    
    res.json({
        message: 'Profile retrieved successfully',
        user: {
            id: req.user.id,
            email: req.user.email,
            name: req.user.name,
            role: req.user.role
        }
    });
});

// Test rate limiting
app.post('/api/test/rate-limit', (req, res) => {
    const ip = getClientIP(req);
    
    logActivity(null, 'API_REQUEST', ip, req.headers['user-agent'], 
        { endpoint: '/api/test/rate-limit' }, true);
    
    res.json({ 
        message: 'Request successful',
        timestamp: new Date().toISOString(),
        ip: ip
    });
});

// Get all logs (Admin only)
app.get('/api/logs/all', authenticateToken, (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }
        
        const ip = getClientIP(req);
        logActivity(req.user.id, 'VIEW_ALL_LOGS', ip, req.headers['user-agent'], {}, true);
        
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        
        let filteredLogs = [...activityLogs];
        
        // Apply filters
        if (req.query.action) {
            filteredLogs = filteredLogs.filter(log => log.action === req.query.action);
        }
        if (req.query.userId) {
            filteredLogs = filteredLogs.filter(log => log.userId === req.query.userId);
        }
        if (req.query.ip) {
            filteredLogs = filteredLogs.filter(log => log.ipAddress === req.query.ip);
        }
        
        const total = filteredLogs.length;
        const logs = filteredLogs.slice(skip, skip + limit);
        
        // Add user info to logs
        const logsWithUsers = logs.map(log => ({
            ...log,
            user: log.userId ? mockUsers.find(u => u.id === log.userId) : null
        }));
        
        res.json({
            message: 'Logs retrieved successfully',
            data: logsWithUsers,
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
});

// Get stats
app.get('/api/logs/stats', authenticateToken, (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }
        
        const ip = getClientIP(req);
        logActivity(req.user.id, 'VIEW_SYSTEM_STATS', ip, req.headers['user-agent'], {}, true);
        
        // Calculate stats from logs
        const actionStats = {};
        const ipStats = {};
        const dailyStats = {};
        
        activityLogs.forEach(log => {
            // Action stats
            if (!actionStats[log.action]) {
                actionStats[log.action] = { count: 0, success: 0, failed: 0 };
            }
            actionStats[log.action].count++;
            if (log.success) {
                actionStats[log.action].success++;
            } else {
                actionStats[log.action].failed++;
            }
            
            // IP stats
            if (!ipStats[log.ipAddress]) {
                ipStats[log.ipAddress] = { count: 0, actions: new Set() };
            }
            ipStats[log.ipAddress].count++;
            ipStats[log.ipAddress].actions.add(log.action);
            
            // Daily stats
            const date = log.timestamp.toISOString().split('T')[0];
            if (!dailyStats[date]) {
                dailyStats[date] = { count: 0, success: 0, failed: 0 };
            }
            dailyStats[date].count++;
            if (log.success) {
                dailyStats[date].success++;
            } else {
                dailyStats[date].failed++;
            }
        });
        
        // Convert to arrays and sort
        const actionStatsArray = Object.entries(actionStats).map(([action, stats]) => ({
            _id: action,
            ...stats
        })).sort((a, b) => b.count - a.count);
        
        const topIPs = Object.entries(ipStats).map(([ip, stats]) => ({
            _id: ip,
            count: stats.count,
            actions: Array.from(stats.actions)
        })).sort((a, b) => b.count - a.count).slice(0, 10);
        
        const dailyStatsArray = Object.entries(dailyStats).map(([date, stats]) => ({
            _id: date,
            ...stats
        })).sort((a, b) => a._id.localeCompare(b._id));
        
        const stats = {
            summary: {
                totalLogs: activityLogs.length,
                uniqueUsers: new Set(activityLogs.filter(l => l.userId).map(l => l.userId)).size,
                uniqueIPs: new Set(activityLogs.map(l => l.ipAddress)).size
            },
            actionStats: actionStatsArray,
            dailyStats: dailyStatsArray,
            topIPs: topIPs
        };
        
        res.json({
            message: 'Stats retrieved successfully',
            data: stats
        });
        
    } catch (error) {
        console.error('❌ Error getting stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Real-time logs
app.get('/api/logs/realtime', authenticateToken, (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }
        
        // Get recent logs (last 5 minutes)
        const since = new Date(Date.now() - 5 * 60 * 1000);
        const recentLogs = activityLogs
            .filter(log => log.timestamp > since)
            .slice(0, 10)
            .map(log => ({
                ...log,
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
});

const PORT = 5002;
app.listen(PORT, () => {
    console.log(`
🚀 Simple Activity Logs Test Server Started on http://localhost:${PORT}

📊 Test Endpoints:
   POST /api/auth/login         - Test login với rate limiting
   POST /api/auth/logout        - Test logout logging  
   GET  /api/logs/all           - Admin: Get all activity logs
   GET  /api/logs/stats         - Admin: Get activity statistics
   GET  /api/logs/realtime      - Admin: Get real-time logs
   POST /api/test/rate-limit    - Test general rate limiting

🔐 Test Accounts:
   Admin: admin@test.com / password123 (token: admin-token)
   User:  user@test.com / password123  (token: user-token)

🌐 Frontend:
   Test Interface: http://localhost:${PORT}/test-rate-limiting.html
   Admin Dashboard: http://localhost:${PORT}/frontend/src/pages/admin-logs/index.html

⚡ Rate Limits:
   Login: 5 attempts per 15 minutes per IP
   General: 100 requests per 15 minutes per IP

📝 Activity Logs: ${activityLogs.length} sample logs created
`);
});

module.exports = app;