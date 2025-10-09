const express = require('express');
require('dotenv').config();
const { dbConnection } = require('./config/database');
const User = require('./models/User');
const Role = require('./models/Role');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware để parse JSON
app.use(express.json());

// Kết nối MongoDB sử dụng database config
dbConnection.connect()
    .catch((error) => {
        console.error('Không thể khởi động server do lỗi database:', error);
        process.exit(1);
    });

// =============================================================================
// ROLE ROUTES
// =============================================================================

// Route GET - Lấy tất cả roles
app.get('/roles', async (req, res) => {
    try {
        const { isActive } = req.query;
        const filter = {};
        if (isActive !== undefined) filter.isActive = isActive === 'true';
        
        const roles = await Role.find(filter).sort({ name: 1 });
        
        res.json({
            success: true,
            data: roles,
            message: 'Lấy danh sách roles thành công'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách roles',
            error: error.message
        });
    }
});

// Route GET - Lấy role theo ID
app.get('/roles/:id', async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);
        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy role'
            });
        }

        res.json({
            success: true,
            data: role,
            message: 'Lấy thông tin role thành công'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin role',
            error: error.message
        });
    }
});

// Route POST - Tạo role mới
app.post('/roles', async (req, res) => {
    try {
        const { name, description, permissions, isActive } = req.body;
        
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Tên role là bắt buộc'
            });
        }

        const newRole = new Role({
            name,
            description,
            permissions: permissions || [],
            isActive: isActive !== undefined ? isActive : true
        });

        const savedRole = await newRole.save();
        
        res.status(201).json({
            success: true,
            data: savedRole,
            message: 'Tạo role thành công'
        });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({
                success: false,
                message: 'Tên role đã tồn tại'
            });
        } else if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            res.status(400).json({
                success: false,
                message: 'Dữ liệu không hợp lệ',
                errors: messages
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi tạo role',
                error: error.message
            });
        }
    }
});

// Route PUT - Cập nhật role
app.put('/roles/:id', async (req, res) => {
    try {
        const { name, description, permissions, isActive } = req.body;
        
        const updatedRole = await Role.findByIdAndUpdate(
            req.params.id,
            { name, description, permissions, isActive },
            { new: true, runValidators: true }
        );

        if (!updatedRole) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy role'
            });
        }

        res.json({
            success: true,
            data: updatedRole,
            message: 'Cập nhật role thành công'
        });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({
                success: false,
                message: 'Tên role đã tồn tại'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi cập nhật role',
                error: error.message
            });
        }
    }
});

// Route DELETE - Xóa role
app.delete('/roles/:id', async (req, res) => {
    try {
        // Kiểm tra xem có user nào đang sử dụng role này không
        const usersWithRole = await User.countDocuments({ role: req.params.id });
        if (usersWithRole > 0) {
            return res.status(400).json({
                success: false,
                message: `Không thể xóa role vì còn ${usersWithRole} user đang sử dụng`
            });
        }

        const deletedRole = await Role.findByIdAndDelete(req.params.id);
        
        if (!deletedRole) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy role'
            });
        }

        res.json({
            success: true,
            message: 'Xóa role thành công'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa role',
            error: error.message
        });
    }
});

// =============================================================================
// PROFILE MANAGEMENT ROUTES
// =============================================================================

// Route GET - Xem thông tin profile của user hiện tại
app.get('/profile/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .populate('role', 'name description permissions')
            .select('-password -verificationToken -resetPasswordToken -loginAttempts -lockUntil');
            
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy user profile'
            });
        }

        // Thêm thống kê profile
        const profileStats = {
            accountAge: Math.floor((new Date() - user.createdAt) / (1000 * 60 * 60 * 24)), // days
            lastLoginFormatted: user.lastLogin ? user.lastLogin.toLocaleDateString('vi-VN') : 'Chưa đăng nhập',
            accountStatus: user.isActive ? (user.isVerified ? 'Hoạt động' : 'Chưa xác thực') : 'Bị khóa'
        };

        res.json({
            success: true,
            data: {
                profile: user,
                statistics: profileStats
            },
            message: 'Lấy thông tin profile thành công'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin profile',
            error: error.message
        });
    }
});

// Route PUT - Cập nhật thông tin profile
app.put('/profile/:userId', async (req, res) => {
    try {
        const { 
            fullName, 
            phoneNumber, 
            dateOfBirth, 
            gender, 
            avatar 
        } = req.body;

        // Validate dữ liệu đầu vào
        const updateData = {};
        if (fullName) updateData.fullName = fullName;
        if (phoneNumber) updateData.phoneNumber = phoneNumber;
        if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
        if (gender) updateData.gender = gender;
        if (avatar) updateData.avatar = avatar;

        const updatedUser = await User.findByIdAndUpdate(
            req.params.userId,
            updateData,
            { new: true, runValidators: true }
        ).populate('role', 'name description permissions')
         .select('-password -verificationToken -resetPasswordToken');

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy user để cập nhật'
            });
        }

        res.json({
            success: true,
            data: updatedUser,
            message: 'Cập nhật profile thành công'
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            res.status(400).json({
                success: false,
                message: 'Dữ liệu không hợp lệ',
                errors: messages
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi cập nhật profile',
                error: error.message
            });
        }
    }
});

// Route PUT - Đổi mật khẩu
app.put('/profile/:userId/change-password', async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu hiện tại và mật khẩu mới là bắt buộc'
            });
        }

        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy user'
            });
        }

        // Kiểm tra mật khẩu hiện tại
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu hiện tại không đúng'
            });
        }

        // Cập nhật mật khẩu mới
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Đổi mật khẩu thành công'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi đổi mật khẩu',
            error: error.message
        });
    }
});

// Route GET - Lịch sử hoạt động profile (mock data)
app.get('/profile/:userId/activity', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy user'
            });
        }

        // Mock activity data (trong thực tế sẽ từ activity log table)
        const activities = [
            {
                action: 'profile_update',
                description: 'Cập nhật thông tin cá nhân',
                timestamp: user.updatedAt,
                status: 'success'
            },
            {
                action: 'account_created',
                description: 'Tạo tài khoản',
                timestamp: user.createdAt,
                status: 'success'
            }
        ];

        if (user.lastLogin) {
            activities.unshift({
                action: 'login',
                description: 'Đăng nhập hệ thống',
                timestamp: user.lastLogin,
                status: 'success'
            });
        }

        res.json({
            success: true,
            data: activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
            message: 'Lấy lịch sử hoạt động thành công'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy lịch sử hoạt động',
            error: error.message
        });
    }
});

// =============================================================================
// USER ROUTES
// =============================================================================

// Route GET - Lấy tất cả users với role info
app.get('/users', async (req, res) => {
    try {
        const { page = 1, limit = 10, role, isActive } = req.query;
        
        // Build filter object
        const filter = {};
        if (role) filter.role = role;
        if (isActive !== undefined) filter.isActive = isActive === 'true';
        
        // Pagination
        const skip = (page - 1) * limit;
        
        const users = await User.find(filter)
            .populate('role', 'name description permissions')
            .select('-password -verificationToken -resetPasswordToken')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });
            
        const total = await User.countDocuments(filter);
        
        res.json({
            success: true,
            data: users,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            },
            message: 'Lấy danh sách users thành công'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách users',
            error: error.message
        });
    }
});

// Route GET - Lấy user theo ID
app.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('role', 'name description permissions')
            .select('-password -verificationToken -resetPasswordToken');
            
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy user'
            });
        }
        res.json({
            success: true,
            data: user,
            message: 'Lấy thông tin user thành công'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin user',
            error: error.message
        });
    }
});

// Route POST - Tạo user mới
app.post('/users', async (req, res) => {
    try {
        const { 
            username, 
            email, 
            password, 
            fullName, 
            phoneNumber, 
            dateOfBirth, 
            gender, 
            role 
        } = req.body;
        
        // Kiểm tra dữ liệu đầu vào
        if (!username || !email || !password || !fullName || !role) {
            return res.status(400).json({
                success: false,
                message: 'Username, email, password, fullName và role là bắt buộc'
            });
        }

        // Kiểm tra role có tồn tại không
        const roleExists = await Role.findById(role);
        if (!roleExists) {
            return res.status(400).json({
                success: false,
                message: 'Role không tồn tại'
            });
        }

        // Tạo user mới
        const newUser = new User({
            username,
            email,
            password,
            fullName,
            phoneNumber,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
            gender,
            role,
            isActive: true,
            isVerified: false
        });

        const savedUser = await newUser.save();
        
        // Populate role info và loại bỏ sensitive data
        await savedUser.populateRole();
        const userResponse = savedUser.toObject();
        delete userResponse.password;
        delete userResponse.verificationToken;
        delete userResponse.resetPasswordToken;
        
        res.status(201).json({
            success: true,
            data: userResponse,
            message: 'Tạo user thành công'
        });
    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            res.status(400).json({
                success: false,
                message: `${field === 'email' ? 'Email' : 'Username'} đã tồn tại`
            });
        } else if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            res.status(400).json({
                success: false,
                message: 'Dữ liệu không hợp lệ',
                errors: messages
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi tạo user',
                error: error.message
            });
        }
    }
});

// Route PUT - Cập nhật user
app.put('/users/:id', async (req, res) => {
    try {
        const { name, email } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { name, email },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy user'
            });
        }

        res.json({
            success: true,
            data: updatedUser,
            message: 'Cập nhật user thành công'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật user',
            error: error.message
        });
    }
});

// Route DELETE - Xóa user
app.delete('/users/:id', async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        
        if (!deletedUser) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy user'
            });
        }

        res.json({
            success: true,
            message: 'Xóa user thành công'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa user',
            error: error.message
        });
    }
});

// =============================================================================
// UTILITY ROUTES
// =============================================================================

// Route GET - Database status
app.get('/status', async (req, res) => {
    try {
        const dbStatus = dbConnection.getConnectionStatus();
        const userCount = await User.countDocuments();
        const roleCount = await Role.countDocuments();
        
        res.json({
            success: true,
            data: {
                database: dbStatus,
                statistics: {
                    totalUsers: userCount,
                    totalRoles: roleCount
                },
                server: {
                    environment: process.env.NODE_ENV || 'development',
                    uptime: process.uptime(),
                    timestamp: new Date().toISOString()
                }
            },
            message: 'System status retrieved successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy trạng thái hệ thống',
            error: error.message
        });
    }
});

// Route GET - User statistics by role
app.get('/statistics/users-by-role', async (req, res) => {
    try {
        const statistics = await User.aggregate([
            {
                $lookup: {
                    from: 'roles',
                    localField: 'role',
                    foreignField: '_id',
                    as: 'roleInfo'
                }
            },
            {
                $unwind: '$roleInfo'
            },
            {
                $group: {
                    _id: '$roleInfo.name',
                    count: { $sum: 1 },
                    activeUsers: {
                        $sum: { $cond: ['$isActive', 1, 0] }
                    },
                    verifiedUsers: {
                        $sum: { $cond: ['$isVerified', 1, 0] }
                    }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);
        
        res.json({
            success: true,
            data: statistics,
            message: 'Thống kê users theo role thành công'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thống kê',
            error: error.message
        });
    }
});

// Route mặc định
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Group 4 Database Authentication API Server 🚀',
        version: '1.0.0',
        endpoints: {
            // Role endpoints
            'GET /roles': 'Lấy tất cả roles',
            'GET /roles/:id': 'Lấy role theo ID',
            'POST /roles': 'Tạo role mới',
            'PUT /roles/:id': 'Cập nhật role',
            'DELETE /roles/:id': 'Xóa role',
            
            // User endpoints
            'GET /users': 'Lấy tất cả users (có pagination)',
            'GET /users/:id': 'Lấy user theo ID',
            'POST /users': 'Tạo user mới',
            'PUT /users/:id': 'Cập nhật user',
            'DELETE /users/:id': 'Xóa user',
            
            // Utility endpoints
            'GET /status': 'Trạng thái hệ thống',
            'GET /statistics/users-by-role': 'Thống kê users theo role'
        },
        database: {
            schema: 'Enhanced User & Role Management',
            features: [
                'User Authentication with bcrypt',
                'Role-based permissions',
                'Account security (login attempts, account locking)',
                'Data validation and indexing',
                'Comprehensive error handling'
            ]
        }
    });
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`Server đang chạy trên port ${PORT}`);
});

module.exports = app;