// frontend/src/api.js
import axios from "axios";

const API_URL = "http://localhost:5000/api"; // ✅ Phải có /api

// ---------------- Auth ----------------
export const signup = (data) => axios.post(`${API_URL}/signup`, data);
export const login = (data) => axios.post(`${API_URL}/login`, data);

// ---------------- Profile ----------------
export const getProfile = () => axios.get(`${API_URL}/profile`);
export const updateProfile = (data) => axios.put(`${API_URL}/profile`, data);

// ---------------- Users (Admin) ----------------
export const getUsers = () => axios.get(`${API_URL}/users`);
export const createUser = (data) => axios.post(`${API_URL}/users`, data);
export const updateUser = (id, data) => axios.put(`${API_URL}/users/${id}`, data);
export const deleteUser = (id) => axios.delete(`${API_URL}/users/${id}`);

// ---------------- Forgot Password & Reset Password ----------------
export const forgotPassword = (data) => axios.post(`${API_URL}/forgot-password`, data);
export const resetPassword = (data) => axios.post(`${API_URL}/reset-password`, data);

// ---------------- Upload Avatar ----------------
export const uploadAvatar = (formData) =>
  axios.post(`${API_URL}/upload-avatar`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
