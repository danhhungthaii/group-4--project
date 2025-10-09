const express = require('express');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;

// JWT Secret for demo
const JWT_SECRET = 'demo-secret-key';

// Middleware để parse JSON
app.use(express.json());

// =============================================================================
// AUTHENTICATION MIDDLEWARE (Demo Mode)
// =============================================================================

// Demo authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access token required'
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = mockUsers.find(u => u._id === decoded.userId);
        
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or inactive user'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

// Role-based access control middleware
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const userRole = req.user.role.name;
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required roles: ${allowedRoles.join(', ')}. Your role: ${userRole}`
            });
        }

        next();
    };
};

const requireAdmin = requireRole('admin');

const requireSelfOrAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    const isAdmin = req.user.role.name === 'admin';
    const isSelf = req.user._id === req.params.userId || req.user._id === req.params.id;

    if (!isAdmin && !isSelf) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. You can only manage your own account or need admin privileges'
        });
    }

    next();
};

// Mock data
const mockRoles = [
    {
        _id: '507f1f77bcf86cd799439011',
        name: 'admin',
        description: 'Quản trị viên hệ thống',
        permissions: ['read_users', 'write_users', 'delete_users', 'manage_system'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        _id: '507f1f77bcf86cd799439012',
        name: 'user',
        description: 'Người dùng thông thường',
        permissions: ['read_posts', 'write_posts'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

const mockUsers = [
    {
        _id: '507f1f77bcf86cd799439021',
        username: 'admin',
        email: 'admin@group4.com',
        fullName: 'System Administrator',
        phoneNumber: '0123456789',
        dateOfBirth: new Date('1990-01-15'),
        gender: 'male',
        avatar: 'https://via.placeholder.com/150/0066CC/FFFFFF?text=AD',
        role: {
            _id: '507f1f77bcf86cd799439011',
            name: 'admin',
            description: 'Quản trị viên hệ thống',
            permissions: ['read_users', 'write_users', 'delete_users', 'manage_system']
        },
        isActive: true,
        isVerified: true,
        loginAttempts: 0,
        lastLogin: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365), // 1 year ago
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
    },
    {
        _id: '507f1f77bcf86cd799439022',
        username: 'testuser',
        email: 'user@group4.com',
        fullName: 'Nguyễn Văn Test',
        phoneNumber: '0987654321',
        dateOfBirth: new Date('1995-06-20'),
        gender: 'male',
        avatar: 'https://via.placeholder.com/150/009900/FFFFFF?text=TV',
        role: {
            _id: '507f1f77bcf86cd799439012',
            name: 'user',
            description: 'Người dùng thông thường',
            permissions: ['read_posts', 'write_posts']
        },
        isActive: true,
        isVerified: true,
        loginAttempts: 0,
        lastLogin: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180), // 6 months ago
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
    },
    {
        _id: '507f1f77bcf86cd799439023',
        username: 'moderator',
        email: 'mod@group4.com',
        fullName: 'Trần Thị Moderator',
        phoneNumber: '0111222333',
        dateOfBirth: new Date('1992-03-10'),
        gender: 'female',
        avatar: 'https://via.placeholder.com/150/FF6600/FFFFFF?text=TM',
        role: {
            _id: '507f1f77bcf86cd799439013',
            name: 'moderator',
            description: 'Người kiểm duyệt',
            permissions: ['read_users', 'write_users', 'read_posts', 'write_posts', 'delete_posts']
        },
        isActive: true,
        isVerified: true,
        loginAttempts: 0,
        lastLogin: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90), // 3 months ago
        updatedAt: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
    }
];

console.log('🚀 DEMO MODE: Server đang chạy với mock data (không cần MongoDB)');
console.log('📊 Database schema được demo với dữ liệu mẫu');

// =============================================================================
// AUTHENTICATION ROUTES (Demo Mode)
// =============================================================================

// Login endpoint for demo
app.post('/auth/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Username và password là bắt buộc'
        });
    }

    // Demo credentials
    const validCredentials = {
        'admin': 'admin123',
        'manager': 'manager123', 
        'user': 'user123'
    };

    if (!validCredentials[username] || validCredentials[username] !== password) {
        return res.status(401).json({
            success: false,
            message: 'Username hoặc password không chính xác'
        });
    }

    // Find user in mock data
    const user = mockUsers.find(u => u.username === username);
    if (!user || !user.isActive) {
        return res.status(401).json({
            success: false,
            message: 'Tài khoản không tồn tại hoặc đã bị khóa'
        });
    }

    // Create JWT token
    const token = jwt.sign(
        {
            userId: user._id,
            username: user.username,
            role: user.role.name
        },
        JWT_SECRET,
        { expiresIn: '24h' }
    );

    // Update last login (in real app, this would be saved to database)
    user.lastLogin = new Date();

    res.json({
        success: true,
        data: {
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                isActive: user.isActive,
                isVerified: user.isVerified,
                lastLogin: user.lastLogin
            },
            token: token
        },
        message: 'Đăng nhập thành công (Demo Mode)'
    });
});

// Verify token endpoint
app.post('/auth/verify', authenticateToken, (req, res) => {
    res.json({
        success: true,
        data: {
            user: {
                _id: req.user._id,
                username: req.user.username,
                email: req.user.email,
                fullName: req.user.fullName,
                role: req.user.role,
                isActive: req.user.isActive,
                isVerified: req.user.isVerified
            }
        },
        message: 'Token valid (Demo Mode)'
    });
});

// =============================================================================
// ROLE ROUTES
// =============================================================================

app.get('/roles', (req, res) => {
    res.json({
        success: true,
        data: mockRoles,
        message: '[DEMO] Lấy danh sách roles thành công'
    });
});

app.get('/roles/:id', (req, res) => {
    const role = mockRoles.find(r => r._id === req.params.id);
    if (!role) {
        return res.status(404).json({
            success: false,
            message: '[DEMO] Không tìm thấy role'
        });
    }
    
    res.json({
        success: true,
        data: role,
        message: '[DEMO] Lấy thông tin role thành công'
    });
});

app.post('/roles', (req, res) => {
    const { name, description, permissions } = req.body;
    
    const newRole = {
        _id: Date.now().toString(),
        name,
        description,
        permissions: permissions || [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    mockRoles.push(newRole);
    
    res.status(201).json({
        success: true,
        data: newRole,
        message: '[DEMO] Tạo role thành công'
    });
});

// =============================================================================
// PROFILE MANAGEMENT ROUTES
// =============================================================================

app.get('/profile/:userId', (req, res) => {
    const user = mockUsers.find(u => u._id === req.params.userId);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: '[DEMO] Không tìm thấy user profile'
        });
    }
    
    const profileStats = {
        accountAge: Math.floor((new Date() - user.createdAt) / (1000 * 60 * 60 * 24)),
        lastLoginFormatted: user.lastLogin ? user.lastLogin.toLocaleDateString('vi-VN') : 'Chưa đăng nhập',
        accountStatus: user.isActive ? (user.isVerified ? 'Hoạt động' : 'Chưa xác thực') : 'Bị khóa'
    };

    res.json({
        success: true,
        data: {
            profile: user,
            statistics: profileStats
        },
        message: '[DEMO] Lấy thông tin profile thành công'
    });
});

app.put('/profile/:userId', (req, res) => {
    const userIndex = mockUsers.findIndex(u => u._id === req.params.userId);
    if (userIndex === -1) {
        return res.status(404).json({
            success: false,
            message: '[DEMO] Không tìm thấy user để cập nhật'
        });
    }
    
    const { fullName, phoneNumber, dateOfBirth, gender, avatar } = req.body;
    
    // Update user data
    if (fullName) mockUsers[userIndex].fullName = fullName;
    if (phoneNumber) mockUsers[userIndex].phoneNumber = phoneNumber;
    if (dateOfBirth) mockUsers[userIndex].dateOfBirth = new Date(dateOfBirth);
    if (gender) mockUsers[userIndex].gender = gender;
    if (avatar) mockUsers[userIndex].avatar = avatar;
    
    mockUsers[userIndex].updatedAt = new Date();
    
    res.json({
        success: true,
        data: mockUsers[userIndex],
        message: '[DEMO] Cập nhật profile thành công'
    });
});

app.put('/profile/:userId/change-password', (req, res) => {
    const user = mockUsers.find(u => u._id === req.params.userId);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: '[DEMO] Không tìm thấy user'
        });
    }
    
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            success: false,
            message: '[DEMO] Mật khẩu hiện tại và mật khẩu mới là bắt buộc'
        });
    }
    
    // Mock password validation (always success in demo)
    res.json({
        success: true,
        message: '[DEMO] Đổi mật khẩu thành công'
    });
});

app.get('/profile/:userId/activity', (req, res) => {
    const user = mockUsers.find(u => u._id === req.params.userId);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: '[DEMO] Không tìm thấy user'
        });
    }
    
    const activities = [
        {
            action: 'profile_update',
            description: 'Cập nhật thông tin cá nhân',
            timestamp: user.updatedAt,
            status: 'success'
        },
        {
            action: 'login',
            description: 'Đăng nhập hệ thống',
            timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
            status: 'success'
        },
        {
            action: 'account_created',
            description: 'Tạo tài khoản',
            timestamp: user.createdAt,
            status: 'success'
        }
    ];
    
    res.json({
        success: true,
        data: activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
        message: '[DEMO] Lấy lịch sử hoạt động thành công'
    });
});

// =============================================================================
// USER ROUTES
// =============================================================================

app.get('/users', authenticateToken, requireAdmin, (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    
    res.json({
        success: true,
        data: mockUsers,
        pagination: {
            total: mockUsers.length,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(mockUsers.length / limit)
        },
        message: '[DEMO] Lấy danh sách users thành công'
    });
});

app.get('/users/:id', authenticateToken, requireSelfOrAdmin, (req, res) => {
    const user = mockUsers.find(u => u._id === req.params.id);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: '[DEMO] Không tìm thấy user'
        });
    }
    
    res.json({
        success: true,
        data: user,
        message: '[DEMO] Lấy thông tin user thành công'
    });
});

app.post('/users', authenticateToken, requireAdmin, (req, res) => {
    const { username, email, fullName, phoneNumber, role } = req.body;
    
    const roleObj = mockRoles.find(r => r._id === role || r.name === role);
    if (!roleObj) {
        return res.status(400).json({
            success: false,
            message: '[DEMO] Role không tồn tại'
        });
    }
    
    const newUser = {
        _id: Date.now().toString(),
        username,
        email,
        fullName,
        phoneNumber,
        role: roleObj,
        isActive: true,
        isVerified: false,
        loginAttempts: 0,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    mockUsers.push(newUser);
    
    res.status(201).json({
        success: true,
        data: newUser,
        message: '[DEMO] Tạo user thành công'
    });
});

// =============================================================================
// UTILITY ROUTES
// =============================================================================

app.get('/status', (req, res) => {
    res.json({
        success: true,
        data: {
            database: {
                isConnected: true,
                mode: 'DEMO_MODE',
                host: 'localhost',
                name: 'mock_database'
            },
            statistics: {
                totalUsers: mockUsers.length,
                totalRoles: mockRoles.length
            },
            server: {
                environment: 'demo',
                uptime: process.uptime(),
                timestamp: new Date().toISOString()
            }
        },
        message: '[DEMO] System status retrieved successfully'
    });
});

app.get('/statistics/users-by-role', (req, res) => {
    const statistics = mockRoles.map(role => {
        const usersWithRole = mockUsers.filter(user => user.role.name === role.name);
        return {
            _id: role.name,
            count: usersWithRole.length,
            activeUsers: usersWithRole.filter(u => u.isActive).length,
            verifiedUsers: usersWithRole.filter(u => u.isVerified).length
        };
    });
    
    res.json({
        success: true,
        data: statistics,
        message: '[DEMO] Thống kê users theo role thành công'
    });
});

// Route mặc định
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🚀 Group 4 Database Authentication API Server (DEMO MODE)',
        mode: 'DEMO - Using Mock Data (No MongoDB Required)',
        version: '1.0.0',
        endpoints: {
            // Role endpoints
            'GET /roles': 'Lấy tất cả roles',
            'GET /roles/:id': 'Lấy role theo ID',
            'POST /roles': 'Tạo role mới',
            
            // User endpoints
            'GET /users': 'Lấy tất cả users (có pagination)',
            'GET /users/:id': 'Lấy user theo ID',
            'POST /users': 'Tạo user mới',
            
            // Profile Management (NEW)
            'GET /profile/:userId': 'Xem thông tin profile',
            'PUT /profile/:userId': 'Cập nhật profile',
            'PUT /profile/:userId/change-password': 'Đổi mật khẩu',
            'GET /profile/:userId/activity': 'Lịch sử hoạt động',
            
            // Utility endpoints
            'GET /status': 'Trạng thái hệ thống',
            'GET /statistics/users-by-role': 'Thống kê users theo role'
        },
        database: {
            schema: 'Enhanced User & Role Management (Demo)',
            features: [
                'User Authentication with bcrypt (Ready)',
                'Role-based permissions (Demo)',
                'Account security (Ready for implementation)',
                'Data validation (Ready)',
                'Comprehensive API endpoints (Demo)',
                'MongoDB integration (Ready - need MongoDB running)'
            ]
        },
        nextSteps: [
            '1. Install MongoDB (run setup-mongodb.bat)',
            '2. Start MongoDB service',
            '3. Run: npm run seed (with real database)',
            '4. Run: npm start (connect to real database)'
        ]
    });
});

// =============================================================================
// ADMIN MANAGEMENT ROUTES (Demo Mode)
// =============================================================================

// Admin dashboard statistics
app.get('/admin/dashboard', authenticateToken, requireAdmin, (req, res) => {
    const totalUsers = mockUsers.length;
    const activeUsers = mockUsers.filter(u => u.isActive).length;
    const totalRoles = mockRoles.length;
    
    const usersByRole = mockRoles.map(role => {
        const usersWithRole = mockUsers.filter(u => u.role.name === role.name);
        return {
            _id: role.name,
            count: usersWithRole.length,
            activeCount: usersWithRole.filter(u => u.isActive).length
        };
    });

    res.json({
        success: true,
        data: {
            overview: {
                totalUsers,
                activeUsers,
                inactiveUsers: totalUsers - activeUsers,
                totalRoles,
                recentUsers: 1 // Mock data
            },
            usersByRole,
            systemInfo: {
                uptime: process.uptime(),
                timestamp: new Date().toISOString(),
                mode: 'DEMO'
            }
        },
        message: '[DEMO] Admin dashboard statistics retrieved successfully'
    });
});

// Toggle user status (demo)
app.put('/admin/users/:id/toggle-status', authenticateToken, requireAdmin, (req, res) => {
    const user = mockUsers.find(u => u._id === req.params.id);
    
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    // Prevent admin from deactivating themselves
    if (req.user._id === req.params.id) {
        return res.status(400).json({
            success: false,
            message: 'Không thể thay đổi status của chính mình'
        });
    }

    user.isActive = !user.isActive;

    res.json({
        success: true,
        data: user,
        message: `[DEMO] Đã ${user.isActive ? 'kích hoạt' : 'vô hiệu hóa'} tài khoản thành công`
    });
});

// Change user role (demo)
app.put('/admin/users/:id/role', authenticateToken, requireAdmin, (req, res) => {
    const { roleId } = req.body;
    const user = mockUsers.find(u => u._id === req.params.id);
    const role = mockRoles.find(r => r._id === roleId);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    if (!role) {
        return res.status(400).json({
            success: false,
            message: 'Role not found'
        });
    }

    // Prevent admin from changing their own role
    if (req.user._id === req.params.id) {
        return res.status(400).json({
            success: false,
            message: 'Không thể thay đổi role của chính mình'
        });
    }

    user.role = {
        _id: role._id,
        name: role.name,
        description: role.description,
        permissions: role.permissions
    };

    res.json({
        success: true,
        data: user,
        message: `[DEMO] Đã cập nhật role thành ${role.name} thành công`
    });
});

// Bulk delete users (demo)
app.post('/admin/users/bulk-delete', authenticateToken, requireAdmin, (req, res) => {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds)) {
        return res.status(400).json({
            success: false,
            message: 'userIds array is required'
        });
    }

    // Prevent deleting current admin
    if (userIds.includes(req.user._id)) {
        return res.status(400).json({
            success: false,
            message: 'Không thể xóa tài khoản admin hiện tại'
        });
    }

    // In demo mode, we just simulate deletion
    const deletedCount = userIds.length;

    res.json({
        success: true,
        data: {
            deletedCount
        },
        message: `[DEMO] Simulation: Đã xóa ${deletedCount} user(s) thành công`
    });
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`\n🎉 DEMO SERVER đang chạy trên port ${PORT}`);
    console.log(`🌐 Truy cập: http://localhost:${PORT}`);
    console.log(`📊 API Endpoints available với mock data`);
    console.log(`⚠️  Để sử dụng real database, cài đặt MongoDB và chạy 'npm start'\n`);
});

module.exports = app;