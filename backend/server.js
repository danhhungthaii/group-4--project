const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Kết nối MongoDB Atlas
mongoose
  .connect(
    "mongodb+srv://danhhungthao_db_user:u9PaNiwyAVyquN3a@cluster0.wu9qtho.mongodb.net/mydb?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => console.log("✅ MongoDB Connected to Atlas"))
  .catch((err) => console.log("❌ MongoDB connection error:", err));

// ✅ Schema User
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});
const User = mongoose.model("User", UserSchema);

// ✅ API: Đăng ký tài khoản
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Kiểm tra email trùng
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    const newUser = new User({ name, email, password });
    await newUser.save();

    res.status(201).json({ message: "Đăng ký thành công", user: newUser });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server: " + err.message });
  }
});

// ✅ API: Đăng nhập
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(400).json({ message: "Sai email hoặc mật khẩu" });
    }

    res.json({
      message: "Đăng nhập thành công",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server: " + err.message });
  }
});

// ✅ API: Lấy tất cả user
app.get("/api/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// ✅ API: Thêm user (tùy chọn)
app.post("/api/users", async (req, res) => {
  const { name, email } = req.body;
  const newUser = new User({ name, email });
  await newUser.save();
  res.json(newUser);
});

app.listen(5000, () => {
  console.log("🚀 Backend running at http://localhost:5000");
});
