import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

// Pages
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import UploadAvatar from "./pages/UploadAvatar";
import UserList from "./pages/UserList";

// Components
import ProtectedRoute from "./components/ProtectedRoute";

// ----------------- App -----------------
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {/* Thanh điều hướng */}
        <nav className="bg-blue-600 p-4 text-white shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">Hệ thống Quản lý Người dùng</h1>
            <ul className="flex space-x-6">
              <li>
                <Link to="/" className="hover:underline">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:underline">
                  Hồ sơ cá nhân
                </Link>
              </li>
              <li>
                <Link to="/upload-avatar" className="hover:underline">
                  Upload Avatar
                </Link>
              </li>
              <li>
                <Link to="/forgot-password" className="hover:underline">
                  Quên mật khẩu
                </Link>
              </li>
              <li>
                <Link to="/reset-password" className="hover:underline">
                  Đổi mật khẩu
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:underline">
                  Admin
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        {/* Nội dung trang */}
        <div className="container mx-auto p-6">
          <Routes>
            {/* Trang chủ */}
            <Route
              path="/"
              element={
                <div className="text-center mt-10">
                  <h2 className="text-3xl font-semibold mb-4 text-blue-700">
                    Chào mừng đến hệ thống quản lý người dùng!
                  </h2>
                  <p className="text-gray-700">
                    Sử dụng thanh menu để truy cập các chức năng như hồ sơ cá nhân, upload avatar, hoặc trang admin.
                  </p>
                </div>
              }
            />

            {/* Đăng nhập */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/upload-avatar"
              element={
                <ProtectedRoute>
                  <UploadAvatar />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <UserList />
                </ProtectedRoute>
              }
            />

            {/* Public Routes */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
