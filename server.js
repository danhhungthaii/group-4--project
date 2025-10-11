const express = require('express');
require('dotenv').config();
const { dbConnection } = require('./config/database');
const User = require('./models/User');
const Role = require('./models/Role');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Import Cloudinary và Email services
const { 
    uploadAvatar: cloudinaryUploadAvatar, 
    uploadDocument,
    deleteImage,
    getOptimizedUrl,
    validateFile 
} = require('./config/cloudinary');
const { 
    sendResetPasswordEmail, 
    sendVerificationEmail,
    testEmailConnection 
} = require('./config/emailService');
const { uploadAvatar, uploadImages, uploadSingle } = require('./middleware/upload');

const app = express();
const PORT = process.env.PORT || 3000;

// JWT Secret for demo (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware để parse JSON
app.use(express.json());

// =============================================================================
// AUTHENTICATION & AUTHORIZATION MIDDLEWARE
// =============================================================================

// Middleware xác thực JWT token
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token required'
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId)
            .populate('role', 'name permissions')
            .select('-password');

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

// Middleware kiểm tra role (RBAC)
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

// Middleware kiểm tra quyền admin
const requireAdmin = requireRole('admin');

// Middleware kiểm tra user có thể tự quản lý hoặc là admin
const requireSelfOrAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    const isAdmin = req.user.role.name === 'admin';
    const isSelf = req.user._id.toString() === req.params.userId || req.user._id.toString() === req.params.id;

    if (!isAdmin && !isSelf) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. You can only manage your own account or need admin privileges'
        });
    }

    next();
};

// Kết nối MongoDB sử dụng database config
dbConnection.connect()
    .catch((error) => {
        console.error('Không thể khởi động server do lỗi database:', error);
        process.exit(1);
    });

// =============================================================================
// AUTHENTICATION ROUTES
// =============================================================================

// Route POST - Login (tạo JWT token)
app.post('/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username và password là bắt buộc'
            });
        }

        // Tìm user theo username hoặc email
        const user = await User.findOne({
            $or: [
                { username: username },
                { email: username }
            ]
        }).populate('role', 'name description permissions');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Username hoặc password không chính xác'
            });
        }

        // Kiểm tra password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Username hoặc password không chính xác'
            });
        }

        // Kiểm tra account active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Tài khoản đã bị khóa'
            });
        }

        // Tạo JWT token
        const token = jwt.sign(
            { 
                userId: user._id,
                username: user.username,
                role: user.role.name
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Cập nhật lastLogin
        await User.findByIdAndUpdate(user._id, { 
            lastLogin: new Date() 
        });

        // Trả về thông tin user và token (không bao gồm password)
        const userResponse = {
            _id: user._id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            isActive: user.isActive,
            isVerified: user.isVerified,
            lastLogin: new Date()
        };

        res.json({
            success: true,
            data: {
                user: userResponse,
                token: token
            },
            message: 'Đăng nhập thành công'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi đăng nhập',
            error: error.message
        });
    }
});

// Route POST - Verify token
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
        message: 'Token valid'
    });
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

// Route GET - Lấy tất cả users với role info (chỉ Admin)
app.get('/users', authenticateToken, requireAdmin, async (req, res) => {
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

// Route GET - Lấy user theo ID (Admin hoặc chính user đó)
app.get('/users/:id', authenticateToken, requireSelfOrAdmin, async (req, res) => {
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

// Route POST - Tạo user mới (chỉ Admin)
app.post('/users', authenticateToken, requireAdmin, async (req, res) => {
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

// Route PUT - Cập nhật user (Admin hoặc chính user đó)
app.put('/users/:id', authenticateToken, requireSelfOrAdmin, async (req, res) => {
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

// Route DELETE - Xóa user (Admin hoặc tự xóa tài khoản)
app.delete('/users/:id', authenticateToken, requireSelfOrAdmin, async (req, res) => {
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
// ADMIN MANAGEMENT ROUTES
// =============================================================================

// Route POST - Bulk delete users (chỉ Admin)
app.post('/admin/users/bulk-delete', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { userIds } = req.body;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'userIds array is required'
            });
        }

        // Không cho phép admin xóa chính mình
        const currentAdminId = req.user._id.toString();
        if (userIds.includes(currentAdminId)) {
            return res.status(400).json({
                success: false,
                message: 'Không thể xóa tài khoản admin hiện tại'
            });
        }

        const result = await User.deleteMany({
            _id: { $in: userIds }
        });

        res.json({
            success: true,
            data: {
                deletedCount: result.deletedCount
            },
            message: `Đã xóa ${result.deletedCount} user(s) thành công`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa users',
            error: error.message
        });
    }
});

// Route PUT - Thay đổi role user (chỉ Admin)
app.put('/admin/users/:id/role', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { roleId } = req.body;

        if (!roleId) {
            return res.status(400).json({
                success: false,
                message: 'roleId is required'
            });
        }

        // Kiểm tra role có tồn tại không
        const role = await Role.findById(roleId);
        if (!role) {
            return res.status(400).json({
                success: false,
                message: 'Role không tồn tại'
            });
        }

        // Không cho phép admin thay đổi role của chính mình
        const currentAdminId = req.user._id.toString();
        if (req.params.id === currentAdminId) {
            return res.status(400).json({
                success: false,
                message: 'Không thể thay đổi role của chính mình'
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { role: roleId },
            { new: true, runValidators: true }
        ).populate('role', 'name description permissions')
         .select('-password -verificationToken -resetPasswordToken');

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy user'
            });
        }

        res.json({
            success: true,
            data: updatedUser,
            message: `Đã cập nhật role thành ${role.name} thành công`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật role',
            error: error.message
        });
    }
});

// Route PUT - Toggle user status (active/inactive) - chỉ Admin
app.put('/admin/users/:id/toggle-status', authenticateToken, requireAdmin, async (req, res) => {
    try {
        // Không cho phép admin thay đổi status của chính mình
        const currentAdminId = req.user._id.toString();
        if (req.params.id === currentAdminId) {
            return res.status(400).json({
                success: false,
                message: 'Không thể thay đổi status của chính mình'
            });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy user'
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { isActive: !user.isActive },
            { new: true, runValidators: true }
        ).populate('role', 'name description permissions')
         .select('-password -verificationToken -resetPasswordToken');

        res.json({
            success: true,
            data: updatedUser,
            message: `Đã ${updatedUser.isActive ? 'kích hoạt' : 'vô hiệu hóa'} tài khoản thành công`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật status',
            error: error.message
        });
    }
});

// Route GET - Admin dashboard statistics
app.get('/admin/dashboard', authenticateToken, requireAdmin, async (req, res) => {
    try {
        // Thống kê tổng quan
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const totalRoles = await Role.countDocuments();

        // Thống kê theo role
        const usersByRole = await User.aggregate([
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
                    activeCount: {
                        $sum: { $cond: ['$isActive', 1, 0] }
                    }
                }
            }
        ]);

        // Users đăng ký gần đây (7 ngày)
        const recentUsers = await User.find({
            createdAt: {
                $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
        }).countDocuments();

        res.json({
            success: true,
            data: {
                overview: {
                    totalUsers,
                    activeUsers,
                    inactiveUsers: totalUsers - activeUsers,
                    totalRoles,
                    recentUsers
                },
                usersByRole,
                systemInfo: {
                    uptime: process.uptime(),
                    timestamp: new Date().toISOString()
                }
            },
            message: 'Admin dashboard statistics retrieved successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thống kê admin',
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

// =============================================================================
// CLOUDINARY IMAGE UPLOAD ENDPOINTS
// =============================================================================

// Route POST - Upload avatar
app.post('/users/:id/avatar', authenticateToken, requireSelfOrAdmin, uploadAvatar, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Không có file avatar được upload'
            });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy user'
            });
        }

        // Upload avatar lên Cloudinary
        const cloudinaryResult = await cloudinaryUploadAvatar(req.file.buffer, user._id);
        
        // Update user với avatar mới
        await user.updateAvatar(cloudinaryResult);
        
        // Populate user data để trả về
        const updatedUser = await User.findById(user._id)
            .populate('role', 'name description permissions')
            .select('-password -resetPasswordToken -emailVerificationToken');

        res.json({
            success: true,
            data: {
                user: updatedUser,
                avatar: {
                    url: cloudinaryResult.secure_url,
                    publicId: cloudinaryResult.public_id,
                    thumbnail: user.getAvatarThumbnail()
                }
            },
            message: 'Upload avatar thành công'
        });
    } catch (error) {
        console.error('Avatar upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi upload avatar',
            error: error.message
        });
    }
});

// Route POST - Upload images to gallery
app.post('/users/:id/images', authenticateToken, requireSelfOrAdmin, uploadImages, async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Không có images được upload'
            });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy user'
            });
        }

        const uploadResults = [];
        
        // Upload từng file lên Cloudinary
        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            const description = req.body.descriptions ? req.body.descriptions[i] || '' : '';
            
            try {
                const cloudinaryResult = await uploadDocument(file.buffer, user._id, file.originalname);
                await user.addImage(cloudinaryResult, description);
                
                uploadResults.push({
                    url: cloudinaryResult.secure_url,
                    publicId: cloudinaryResult.public_id,
                    description: description,
                    originalName: file.originalname
                });
            } catch (uploadError) {
                console.error(`Error uploading file ${file.originalname}:`, uploadError);
                // Continue with other files
            }
        }

        const updatedUser = await User.findById(user._id)
            .populate('role', 'name description permissions')
            .select('-password -resetPasswordToken -emailVerificationToken');

        res.json({
            success: true,
            data: {
                user: updatedUser,
                uploadedImages: uploadResults,
                totalImages: user.images.length
            },
            message: `Upload thành công ${uploadResults.length}/${req.files.length} images`
        });
    } catch (error) {
        console.error('Images upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi upload images',
            error: error.message
        });
    }
});

// Route DELETE - Remove image from gallery
app.delete('/users/:userId/images/:imageId', authenticateToken, requireSelfOrAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy user'
            });
        }

        await user.removeImage(req.params.imageId);

        res.json({
            success: true,
            data: {
                remainingImages: user.images.length
            },
            message: 'Xóa image thành công'
        });
    } catch (error) {
        console.error('Remove image error:', error);
        
        if (error.message === 'Image không tồn tại') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa image',
            error: error.message
        });
    }
});

// Route GET - Get optimized avatar URL
app.get('/users/:id/avatar/optimized', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('avatar avatarPublicId');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy user'
            });
        }

        const { width, height, quality } = req.query;
        const options = {};
        
        if (width) options.width = parseInt(width);
        if (height) options.height = parseInt(height);
        if (quality) options.quality = quality;

        const optimizedUrl = user.getOptimizedAvatar(options);
        const thumbnailUrl = user.getAvatarThumbnail();

        res.json({
            success: true,
            data: {
                original: user.avatar,
                optimized: optimizedUrl,
                thumbnail: thumbnailUrl,
                publicId: user.avatarPublicId
            },
            message: 'Lấy avatar URLs thành công'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy avatar URLs',
            error: error.message
        });
    }
});

// =============================================================================
// PASSWORD RESET ENDPOINTS
// =============================================================================

// Route POST - Request password reset
app.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email là bắt buộc'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            // Không tiết lộ thông tin user có tồn tại hay không (security)
            return res.json({
                success: true,
                message: 'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được email hướng dẫn đặt lại mật khẩu'
            });
        }

        // Tạo reset token
        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        try {
            // Gửi email reset password
            await sendResetPasswordEmail(user.email, resetToken, user.fullName);

            res.json({
                success: true,
                message: 'Email hướng dẫn đặt lại mật khẩu đã được gửi'
            });
        } catch (emailError) {
            // Xóa reset token nếu gửi email thất bại
            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;
            await user.save({ validateBeforeSave: false });

            console.error('Email sending error:', emailError);
            res.status(500).json({
                success: false,
                message: 'Có lỗi khi gửi email. Vui lòng thử lại sau'
            });
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi xử lý yêu cầu',
            error: error.message
        });
    }
});

// Route POST - Reset password with token
app.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword, confirmPassword } = req.body;

        if (!token || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Token, mật khẩu mới và xác nhận mật khẩu là bắt buộc'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu mới và xác nhận mật khẩu không khớp'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu mới phải có ít nhất 6 ký tự'
            });
        }

        // Tìm user với token hợp lệ
        const crypto = require('crypto');
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Token không hợp lệ hoặc đã hết hạn'
            });
        }

        // Reset password
        await user.resetPassword(newPassword);

        res.json({
            success: true,
            message: 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập với mật khẩu mới'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi đặt lại mật khẩu',
            error: error.message
        });
    }
});

// Route POST - Resend verification email
app.post('/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email là bắt buộc'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy user với email này'
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'Tài khoản đã được xác thực'
            });
        }

        // Tạo verification token mới
        const verificationToken = user.createEmailVerificationToken();
        await user.save({ validateBeforeSave: false });

        try {
            await sendVerificationEmail(user.email, verificationToken, user.fullName);

            res.json({
                success: true,
                message: 'Email xác thực đã được gửi lại'
            });
        } catch (emailError) {
            console.error('Verification email error:', emailError);
            res.status(500).json({
                success: false,
                message: 'Có lỗi khi gửi email xác thực'
            });
        }
    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi gửi lại email xác thực'
        });
    }
});

// Route POST - Verify email with token
app.post('/verify-email', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token xác thực là bắt buộc'
            });
        }

        const crypto = require('crypto');
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Token xác thực không hợp lệ hoặc đã hết hạn'
            });
        }

        await user.verifyEmail();

        res.json({
            success: true,
            message: 'Xác thực email thành công'
        });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xác thực email'
        });
    }
});

// Route POST - Test email service connection
app.post('/test-email', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const isConnected = await testEmailConnection();
        
        if (isConnected) {
            res.json({
                success: true,
                message: 'Email service connection successful'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Email service connection failed'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error testing email service',
            error: error.message
        });
    }
});

// Route mặc định
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Group 4 Database Authentication API Server 🚀',
        version: '2.0.0',
        endpoints: {
            // Authentication endpoints
            'POST /register': 'Đăng ký user mới',
            'POST /login': 'Đăng nhập',
            'POST /forgot-password': 'Yêu cầu reset password',
            'POST /reset-password': 'Reset password với token',
            'POST /verify-email': 'Xác thực email với token',
            'POST /resend-verification': 'Gửi lại email xác thực',
            
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
            
            // Image upload endpoints
            'POST /users/:id/avatar': 'Upload avatar cho user',
            'POST /users/:id/images': 'Upload images vào gallery',
            'DELETE /users/:userId/images/:imageId': 'Xóa image từ gallery',
            'GET /users/:id/avatar/optimized': 'Lấy optimized avatar URLs',
            
            // Utility endpoints
            'GET /status': 'Trạng thái hệ thống',
            'GET /statistics/users-by-role': 'Thống kê users theo role',
            'POST /test-email': 'Test email service (Admin only)'
        },
        database: {
            schema: 'Enhanced User & Role Management with Cloudinary Integration',
            features: [
                'User Authentication with bcrypt',
                'Role-based permissions',
                'Account security (login attempts, account locking)',
                'Data validation and indexing',
                'Comprehensive error handling',
                'Cloudinary image upload & management',
                'Email-based password reset',
                'Email verification system',
                'Image optimization & thumbnails'
            ]
        }
    });
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`Server đang chạy trên port ${PORT}`);
});

module.exports = app;