// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:  { type: String, required: true },
  email: { type: String, required: true, unique: true }
  // Xóa hoặc bỏ required cho password nếu không dùng
});

module.exports = mongoose.model('User', userSchema);
