import React, { useState } from "react";
import { signup } from "../api";

function SignupForm() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await signup(form);
      console.log("Phản hồi backend:", res.data);
      setMessage("✅ Đăng ký thành công!");
      setForm({ name: "", email: "", password: "" });
    } catch (err) {
      console.error("Lỗi đăng ký:", err);
      // Hiển thị thông báo lỗi rõ ràng hơn
      const backendMsg = err.response?.data?.message || err.message;
      setMessage("❌ Đăng ký thất bại: " + backendMsg);
    }
  };

  return (
    <div>
      <h2>Đăng ký tài khoản</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Tên"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button type="submit">Đăng ký</button>
      </form>
      <p>{message}</p>
    </div>
  );
}

export default SignupForm;
