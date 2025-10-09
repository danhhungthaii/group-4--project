const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware để parse JSON
app.use(express.json());

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

app.get('/users', (req, res) => {
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

app.get('/users/:id', (req, res) => {
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

app.post('/users', (req, res) => {
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

// Khởi động server
app.listen(PORT, () => {
    console.log(`\n🎉 DEMO SERVER đang chạy trên port ${PORT}`);
    console.log(`🌐 Truy cập: http://localhost:${PORT}`);
    console.log(`📊 API Endpoints available với mock data`);
    console.log(`⚠️  Để sử dụng real database, cài đặt MongoDB và chạy 'npm start'\n`);
});

module.exports = app;