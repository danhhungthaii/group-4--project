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
        role: {
            _id: '507f1f77bcf86cd799439011',
            name: 'admin',
            description: 'Quản trị viên hệ thống',
            permissions: ['read_users', 'write_users', 'delete_users', 'manage_system']
        },
        isActive: true,
        isVerified: true,
        loginAttempts: 0,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        _id: '507f1f77bcf86cd799439022',
        username: 'testuser',
        email: 'user@group4.com',
        fullName: 'Test User',
        phoneNumber: '0987654321',
        role: {
            _id: '507f1f77bcf86cd799439012',
            name: 'user',
            description: 'Người dùng thông thường',
            permissions: ['read_posts', 'write_posts']
        },
        isActive: true,
        isVerified: true,
        loginAttempts: 0,
        createdAt: new Date(),
        updatedAt: new Date()
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