// src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { forgotPassword } from "../api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    forgotPassword({ email })
      .then((res) => alert("Token đã được gửi đến email!"))
      .catch((err) => alert("Lỗi: " + err));
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-2xl shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Quên mật khẩu</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Gửi token
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
