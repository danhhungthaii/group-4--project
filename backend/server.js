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
    message: "🚀 Group 4 Database Authentication API Server 🔐",
    status: "healthy",
    version: "2.0.0 - Advanced Features",
    
    // 🔥 ADVANCED FEATURES OVERVIEW
    features: {
      "Authentication System": {
        "JWT Tokens": "✅ 7-day expiry with refresh capability",
        "Password Security": "✅ bcrypt hashing with salt rounds",
        "Password Reset": "✅ Email-based reset with crypto tokens", 
        "Email Verification": "✅ Account verification system"
      },
      "Authorization (RBAC)": {
        "Role Management": "✅ User/Admin role separation",
        "Permission Control": "✅ Endpoint-level authorization",
        "Access Control": "✅ Self-or-admin resource access"
      },
      "Advanced Security": {
        "Rate Limiting": "✅ Login attempt protection",
        "Account Locking": "✅ Brute force prevention", 
        "Token Verification": "✅ JWT middleware protection",
        "Input Validation": "✅ Comprehensive data validation"
      },
      "File Management": {
        "Cloudinary Upload": "✅ Avatar image processing",
        "Image Optimization": "✅ Auto-resize and compression",
        "Storage Management": "✅ Cloud-based file storage"
      },
      "Email Services": {
        "Password Reset": "✅ Automated email notifications",
        "Account Verification": "✅ Email confirmation system",
        "SMTP Integration": "✅ Gmail/SMTP support"
      }
    },

    // 📋 API ENDPOINTS
    endpoints: {
      // 🔐 Authentication & Authorization
      "auth_login": "POST /api/auth/login - JWT login with bcrypt",
      "auth_register": "POST /api/auth/register - Secure user registration", 
      "auth_logout": "POST /api/auth/logout - Session termination",
      "auth_profile": "GET /api/auth/profile - Protected user profile",
      "auth_forgot": "POST /api/auth/forgot-password - Email reset token",
      "auth_reset": "POST /api/auth/reset-password - Token-based reset",
      
      // 👤 Profile Management (Protected)
      "profile_update": "PUT /api/auth/profile - Update user info",
      "profile_password": "POST /api/auth/change-password - Secure password change",
      "profile_avatar_upload": "POST /api/auth/upload-avatar - Cloudinary image upload",
      "profile_avatar_delete": "DELETE /api/auth/delete-avatar - Remove avatar",
      
      // 👥 User Management (Admin/Protected)
      "users_list": "GET /api/users - List all users (Admin only)",
      "users_create": "POST /api/users - Create user (Admin only)", 
      "users_get": "GET /api/users/:id - Get user details (Auth required)",
      "users_update": "PUT /api/users/:id - Update user (Self/Admin)",
      "users_delete": "DELETE /api/users/:id - Delete user (Admin only)",
      
      // 🔍 System Health
      "health": "GET /api/health - System status check"
    },

    // 🛡️ SECURITY FEATURES
    security: {
      "Password Hashing": "bcrypt with 10 salt rounds",
      "JWT Tokens": "7-day expiry with secure signing",
      "Rate Limiting": "5 attempts per 15 minutes",
      "CORS": "Cross-origin resource sharing enabled",
      "Input Validation": "MongoDB injection protection",
      "File Upload": "Secure Cloudinary integration"
    },

    // 🏗️ TECHNICAL STACK
    technology: {
      "Backend": "Node.js + Express.js",
      "Database": "MongoDB Atlas (Cloud)",
      "Authentication": "JWT + bcrypt",
      "File Storage": "Cloudinary",
      "Email Service": "Nodemailer + Gmail SMTP",
      "Security": "Express Rate Limit + CORS"
    },

    // 🔗 Documentation & Links
    documentation: {
      "GitHub Repository": "https://github.com/danhhungthaii/group-4--project",
      "Frontend Demo": "https://group4-project-vercel-v2.vercel.app",
      "API Base URL": "https://group4-backend-api.onrender.com",
      "Postman Collection": "Available in repository"
    },

    // 📊 Database Schema
    database: {
      "Collections": ["users", "roles", "activity_logs"],
      "User Fields": ["name", "email", "password", "avatar", "role", "resetTokens"],
      "Indexing": "Email uniqueness, role references",
      "Connection": "MongoDB Atlas with connection pooling"
    }
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
