const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require('dotenv').config();

// Import controllers and middleware
const authController = require('./controllers/authController');
const userController = require('./controllers/userController');
const profileController = require('./controllers/profileController');
const authMiddleware = require('./middleware/auth');
const { upload } = require('./middleware/upload');

const app = express();
app.use(cors());
app.use(express.json());

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

// ✅ Kết nối MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://danhhungthao_db_user:u9PaNiwyAVyquN3a@cluster0.wu9qtho.mongodb.net/mydb?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected to Atlas"))
  .catch(err => console.log("❌ MongoDB connection error:", err));

// Import User model with advanced features
const User = require('./models/User');

// ✅ Route chính cho trang chủ
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Group 4 Backend API is running!",
    status: "healthy",
    version: "1.0.0",
    endpoints: {
      // User Management (Protected)
      getAllUsers: "GET /api/users (Admin only)",
      createUser: "POST /api/users (Admin only)",
      getUserById: "GET /api/users/:id (Authenticated)",
      updateUser: "PUT /api/users/:id (Self/Admin)",
      deleteUser: "DELETE /api/users/:id (Admin only)",
      
      // Authentication
      login: "POST /api/auth/login",
      register: "POST /api/auth/register",
      logout: "POST /api/auth/logout",
      getProfile: "GET /api/auth/profile (Authenticated)",
      forgotPassword: "POST /api/auth/forgot-password",
      resetPassword: "POST /api/auth/reset-password",
      
      // Profile Management (Protected)
      updateProfile: "PUT /api/auth/profile (Authenticated)",
      changePassword: "POST /api/auth/change-password (Authenticated)",
      uploadAvatar: "POST /api/auth/upload-avatar (Authenticated)",
      deleteAvatar: "DELETE /api/auth/delete-avatar (Authenticated)",
      
      // Health Check
      health: "GET /api/health"
    },
    documentation: "https://github.com/danhhungthaii/group-4--project"
  });
});

// API: lấy tất cả user (chỉ admin)
app.get("/api/users", authMiddleware, userController.getAllUsers);

// API: thêm user (chỉ admin)
app.post("/api/users", authMiddleware, userController.createUser);

// API: lấy user theo ID
app.get("/api/users/:id", authMiddleware, userController.getUserById);

// API: cập nhật user
app.put("/api/users/:id", authMiddleware, userController.updateUser);

// API: xóa user
app.delete("/api/users/:id", authMiddleware, userController.deleteUser);

// ✅ Authentication APIs với JWT và bcrypt
app.post("/api/auth/login", authController.login);

app.post("/api/auth/register", authController.signup);

app.get("/api/auth/profile", authMiddleware, profileController.getProfile);

app.post("/api/auth/logout", (req, res) => {
  res.json({
    success: true,
    message: "Đăng xuất thành công"
  });
});

// ✅ Advanced Authentication Features
app.post("/api/auth/forgot-password", authController.forgotPassword);
app.post("/api/auth/reset-password", authController.resetPassword);

// ✅ Profile Management với Authentication
app.put("/api/auth/profile", authMiddleware, profileController.updateProfile);
app.post("/api/auth/change-password", authMiddleware, profileController.changePassword);

// ✅ Avatar Upload với Cloudinary
app.post("/api/auth/upload-avatar", authMiddleware, upload.single('avatar'), userController.uploadAvatar);
app.delete("/api/auth/delete-avatar", authMiddleware, userController.deleteAvatar);

// ✅ Health Check API
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend API đang hoạt động bình thường",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: "1.0.0"
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});
