const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  role: { type: String, enum: ["User", "Moderator", "Admin"], default: "User" },
});

module.exports = mongoose.model("User", userSchema);
