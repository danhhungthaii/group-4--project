const express = require('express');
const mongoose = require('mongoose');
const User = require('./User');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware để parse JSON
app.use(express.json());

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/group4_database', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Kết nối MongoDB thành công!');
})
.catch((error) => {
    console.error('Lỗi kết nối MongoDB:', error);
});

// Route GET - Lấy tất cả users
app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json({
            success: true,
            data: users,
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
        const user = await User.findById(req.params.id);
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
        const { name, email } = req.body;
        
        // Kiểm tra dữ liệu đầu vào
        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: 'Name và email là bắt buộc'
            });
        }

        // Tạo user mới
        const newUser = new User({
            name,
            email
        });

        const savedUser = await newUser.save();
        
        res.status(201).json({
            success: true,
            data: savedUser,
            message: 'Tạo user thành công'
        });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({
                success: false,
                message: 'Email đã tồn tại'
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

// Route mặc định
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Group 4 API Server đang hoạt động!',
        endpoints: {
            'GET /users': 'Lấy tất cả users',
            'GET /users/:id': 'Lấy user theo ID',
            'POST /users': 'Tạo user mới',
            'PUT /users/:id': 'Cập nhật user',
            'DELETE /users/:id': 'Xóa user'
        }
    });
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`Server đang chạy trên port ${PORT}`);
});

module.exports = app;