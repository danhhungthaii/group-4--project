const express = require('express');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const sharp = require('sharp');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// JWT Secret
const JWT_SECRET = 'avatar-upload-secret-key-2024';

// Cloudinary Configuration
cloudinary.config({
  cloud_name: 'demo', // Thay bằng cloud_name thực tế
  api_key: '123456789012345', // Thay bằng API key thực tế
  api_secret: 'abcdefghijklmnopqrstuvwxyz123456' // Thay bằng API secret thực tế
});

// Mock database
let users = [
  {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    password: '$2a$10$CwTycUXWue0Thq9StjUM0uJ8QfaQV4ydIKZPo8AhFGtKJEyZKYJmG', // password123
    avatar: null,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 2,
    username: 'john_doe',
    email: 'john@example.com',
    password: '$2a$10$CwTycUXWue0Thq9StjUM0uJ8QfaQV4ydIKZPo8AhFGtKJEyZKYJmG', // password123
    avatar: 'https://res.cloudinary.com/demo/image/upload/v1234567890/avatars/sample.jpg',
    createdAt: new Date('2024-01-15')
  }
];

// Multer configuration for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ cho phép upload file ảnh!'), false);
    }
  }
});

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
    req.user = user;
    next();
  });
};

// Helper function to upload to Cloudinary
const uploadToCloudinary = (buffer, folder = 'avatars') => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: folder,
        transformation: [
          { width: 200, height: 200, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    ).end(buffer);
  });
};

// Routes

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username và password là bắt buộc'
      });
    }

    // Find user
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không đúng'
      });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không đúng'
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username,
        email: user.email 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// Get current user profile
app.get('/api/auth/profile', authenticateToken, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// Upload avatar endpoint
app.post('/api/upload/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn file ảnh'
      });
    }

    console.log('📁 File received:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: `${(req.file.size / 1024).toFixed(2)} KB`
    });

    // Resize image using Sharp
    let processedBuffer;
    try {
      processedBuffer = await sharp(req.file.buffer)
        .resize(400, 400, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 85 })
        .toBuffer();

      console.log('🔄 Image resized successfully');
    } catch (sharpError) {
      console.error('Sharp processing error:', sharpError);
      // Fallback to original buffer if resize fails
      processedBuffer = req.file.buffer;
    }

    // Simulate Cloudinary upload (since we don't have real credentials)
    const mockCloudinaryResult = {
      secure_url: `https://res.cloudinary.com/demo/image/upload/v${Date.now()}/avatars/user_${req.user.id}_${Date.now()}.jpg`,
      public_id: `avatars/user_${req.user.id}_${Date.now()}`,
      width: 400,
      height: 400,
      format: 'jpg',
      bytes: processedBuffer.length
    };

    console.log('☁️ Simulated Cloudinary upload:', mockCloudinaryResult.secure_url);

    // For demo purposes, we'll simulate the upload
    // In real implementation, uncomment this:
    // const cloudinaryResult = await uploadToCloudinary(processedBuffer, 'avatars');

    // Update user avatar in database
    const userIndex = users.findIndex(u => u.id === req.user.id);
    if (userIndex !== -1) {
      users[userIndex].avatar = mockCloudinaryResult.secure_url;
    }

    res.json({
      success: true,
      message: 'Upload avatar thành công',
      avatar: {
        url: mockCloudinaryResult.secure_url,
        public_id: mockCloudinaryResult.public_id,
        width: mockCloudinaryResult.width,
        height: mockCloudinaryResult.height,
        format: mockCloudinaryResult.format,
        size: `${(mockCloudinaryResult.bytes / 1024).toFixed(2)} KB`
      },
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        avatar: mockCloudinaryResult.secure_url
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi upload avatar: ' + error.message
    });
  }
});

// Delete avatar endpoint
app.delete('/api/upload/avatar', authenticateToken, async (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    if (!user.avatar) {
      return res.status(400).json({
        success: false,
        message: 'Người dùng chưa có avatar'
      });
    }

    // In real implementation, delete from Cloudinary:
    // const publicId = extractPublicIdFromUrl(user.avatar);
    // await cloudinary.uploader.destroy(publicId);

    console.log('🗑️ Simulated avatar deletion for user:', req.user.username);

    // Update user avatar in database
    const userIndex = users.findIndex(u => u.id === req.user.id);
    if (userIndex !== -1) {
      users[userIndex].avatar = null;
    }

    res.json({
      success: true,
      message: 'Xóa avatar thành công',
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        avatar: null
      }
    });

  } catch (error) {
    console.error('Delete avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa avatar: ' + error.message
    });
  }
});

// Get all users (for demo purposes)
app.get('/api/users', authenticateToken, (req, res) => {
  try {
    const userList = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt
    }));

    res.json({
      success: true,
      users: userList
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File quá lớn. Kích thước tối đa là 5MB'
      });
    }
  }
  
  res.status(500).json({
    success: false,
    message: error.message || 'Lỗi server'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Avatar Upload Server is running',
    timestamp: new Date().toISOString(),
    endpoints: {
      login: 'POST /api/auth/login',
      profile: 'GET /api/auth/profile',
      upload: 'POST /api/upload/avatar',
      delete: 'DELETE /api/upload/avatar',
      users: 'GET /api/users'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Avatar Upload Server running on http://localhost:${PORT}`);
  console.log(`📋 API Endpoints:`);
  console.log(`   POST /api/auth/login - Đăng nhập`);
  console.log(`   GET  /api/auth/profile - Thông tin người dùng`);
  console.log(`   POST /api/upload/avatar - Upload avatar`);
  console.log(`   DELETE /api/upload/avatar - Xóa avatar`);
  console.log(`   GET  /api/users - Danh sách người dùng`);
  console.log(`\n👤 Test Account: testuser / password123`);
  console.log(`🌐 Demo URL: http://localhost:3001/demo-avatar.html`);
});

module.exports = app;