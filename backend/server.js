const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ----------------- Kết nối MongoDB -----------------
mongoose
  .connect(
    "mongodb+srv://danhhungthao_db_user:u9PaNiwyAVyquN3a@cluster0.wu9qtho.mongodb.net/mydb?retryWrites=true&w=majority"
  )
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB connection error:", err));

// ----------------- Schema User -----------------
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: String,
});

const User = mongoose.model("User", UserSchema);

// ----------------- Routes Auth -----------------

// Signup
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email đã tồn tại" });

    const newUser = new User({ name, email, password, phone });
    await newUser.save();
    res.status(201).json({ message: "Đăng ký thành công", user: newUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.password !== password)
      return res.status(400).json({ message: "Sai email hoặc mật khẩu" });

    res.json({
      message: "Đăng nhập thành công",
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------- Routes Profile -----------------

// GET profile (lấy user đầu tiên để demo)
app.get("/api/profile", async (req, res) => {
  try {
    const user = await User.findOne();
    if (!user) return res.status(404).json({ message: "User không tồn tại" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT profile (cập nhật user đầu tiên)
app.put("/api/profile", async (req, res) => {
  try {
    const user = await User.findOne();
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    user.name = req.body.name;
    user.email = req.body.email;
    user.phone = req.body.phone;
    await user.save();

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------- Start Server -----------------
app.listen(5000, () => console.log("🚀 Backend running at http://localhost:5000"));
