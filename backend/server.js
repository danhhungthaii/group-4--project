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

// API: lấy tất cả user
app.get("/api/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// API: thêm user
app.post("/api/users", async (req, res) => {
  const { name, email } = req.body;
  const newUser = new User({ name, email });
  await newUser.save();
  res.json(newUser);
});

app.listen(5000, () => {
  console.log("🚀 Backend running at http://localhost:5000");
});
