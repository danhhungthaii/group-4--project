const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Kết nối MongoDB Atlas
mongoose.connect("mongodb+srv://danhhungthao_db_user:u9PaNiwyAVyquN3a@cluster0.wu9qtho.mongodb.net/mydb?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("✅ MongoDB Connected to Atlas"))
  .catch(err => console.log("❌ MongoDB connection error:", err));

// Schema User
const UserSchema = new mongoose.Schema({
  name: String,
  email: String
});
const User = mongoose.model("User", UserSchema);

// ✅ Route chính cho trang chủ
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Group 4 Backend API is running!",
    status: "healthy",
    version: "1.0.0",
    endpoints: {
      // User Management
      getAllUsers: "GET /api/users",
      createUser: "POST /api/users",
      getUserById: "GET /api/users/:id",
      updateUser: "PUT /api/users/:id",
      deleteUser: "DELETE /api/users/:id",
      
      // Authentication
      login: "POST /api/auth/login",
      register: "POST /api/auth/register",
      logout: "POST /api/auth/logout",
      getProfile: "GET /api/auth/profile",
      
      // Health Check
      health: "GET /api/health"
    },
    documentation: "https://github.com/danhhungthaii/group-4--project"
  });
});

// API: lấy tất cả user
app.get("/api/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// API: thêm user
app.post("/api/users", async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ 
        success: false, 
        message: "Name và email là bắt buộc" 
      });
    }
    const newUser = new User({ name, email });
    await newUser.save();
    res.status(201).json({
      success: true,
      message: "Tạo user thành công",
      data: newUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message
    });
  }
});

// API: lấy user theo ID
app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy user"
      });
    }
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message
    });
  }
});

// API: cập nhật user
app.put("/api/users/:id", async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email },
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy user"
      });
    }
    res.json({
      success: true,
      message: "Cập nhật user thành công",
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message
    });
  }
});

// API: xóa user
app.delete("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy user"
      });
    }
    res.json({
      success: true,
      message: "Xóa user thành công"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message
    });
  }
});

// ✅ Authentication APIs (Simple demo)
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  
  // Demo login - trong thực tế cần hash password và check database
  if (email === "admin@example.com" && password === "admin123") {
    res.json({
      success: true,
      message: "Đăng nhập thành công",
      token: "demo_token_123",
      user: {
        id: "1",
        name: "Admin User",
        email: "admin@example.com",
        role: "admin"
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: "Email hoặc mật khẩu không đúng"
    });
  }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Tất cả các trường là bắt buộc"
      });
    }
    
    // Trong thực tế cần check email đã tồn tại và hash password
    const newUser = new User({ name, email });
    await newUser.save();
    
    res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      token: "demo_token_456",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: "user"
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message
    });
  }
});

app.get("/api/auth/profile", (req, res) => {
  // Demo - trong thực tế cần verify JWT token
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ"
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  if (token === "demo_token_123") {
    res.json({
      success: true,
      data: {
        user: {
          id: "1",
          name: "Admin User",
          email: "admin@example.com",
          role: "admin"
        }
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: "Token không hợp lệ"
    });
  }
});

app.post("/api/auth/logout", (req, res) => {
  res.json({
    success: true,
    message: "Đăng xuất thành công"
  });
});

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
