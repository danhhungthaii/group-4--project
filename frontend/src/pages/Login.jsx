// src/pages/Login.jsx
import React, { useState } from "react";
import axios from "../services/axiosInstance";
import { useDispatch } from "react-redux";
import { setCredentials } from "../store/slices/authSlice";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/auth/login", form, { withCredentials: true }); // withCredentials nếu backend set cookie
      // backend trả { accessToken, user } OR set refresh cookie
      const { accessToken, user } = res.data;
      dispatch(setCredentials({ user, accessToken }));
      alert("Đăng nhập thành công");
    } catch (err) {
      console.error(err);
      alert("Đăng nhập thất bại");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
      <input value={form.password} onChange={e=>setForm({...form,password:e.target.value})} />
      <button>Login</button>
    </form>
  );
}
