/**
 * Admin Page Component  
 * Hoạt động 6: Redux & Protected Routes
 * Trang admin được bảo vệ - chỉ admin mới truy cập được
 */

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  selectUser, 
  selectIsLoading, 
  logoutUser 
} from '../store/slices/authSlice';

const AdminPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const user = useSelector(selectUser);
  const isLoading = useSelector(selectIsLoading);
  
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    totalRegularUsers: 0
  });

  // Mock data cho demo
  useEffect(() => {
    // Simulate API call
    const mockUsers = [
      {
        id: '1',
        name: 'Admin User',
        email: 'admin@test.com',
        role: 'admin',
        createdAt: new Date('2024-01-01'),
        lastLogin: new Date()
      },
      {
        id: '2', 
        name: 'Test User',
        email: 'user@test.com',
        role: 'user',
        createdAt: new Date('2024-02-01'),
        lastLogin: new Date(Date.now() - 86400000) // 1 day ago
      },
      {
        id: '3',
        name: 'John Doe',
        email: 'john@example.com', 
        role: 'user',
        createdAt: new Date('2024-03-01'),
        lastLogin: new Date(Date.now() - 172800000) // 2 days ago
      }
    ];
    
    setUsers(mockUsers);
    setStats({
      totalUsers: mockUsers.length,
      totalAdmins: mockUsers.filter(u => u.role === 'admin').length,
      totalRegularUsers: mockUsers.filter(u => u.role === 'user').length
    });
  }, []);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const handleViewLogs = () => {
    // Open admin logs in new tab
    window.open('/frontend/src/pages/admin-logs/index.html', '_blank');
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải trang admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        {/* Header */}
        <div className="admin-header">
          <div className="header-left">
            <h1>👑 Admin Dashboard</h1>
            <p>Chào mừng, {user?.name}!</p>
          </div>
          <div className="header-right">
            <button 
              onClick={() => navigate('/profile')}
              className="nav-button profile"
            >
              👤 Profile
            </button>
            <button onClick={handleLogout} className="nav-button logout">
              🚪 Đăng xuất
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card total">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>{stats.totalUsers}</h3>
              <p>Tổng người dùng</p>
            </div>
          </div>

          <div className="stat-card admins">
            <div className="stat-icon">👑</div>
            <div className="stat-content">
              <h3>{stats.totalAdmins}</h3>
              <p>Quản trị viên</p>
            </div>
          </div>

          <div className="stat-card users">
            <div className="stat-icon">👤</div>
            <div className="stat-content">
              <h3>{stats.totalRegularUsers}</h3>
              <p>Người dùng thường</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="admin-actions">
          <h3>🛠️ Hành động nhanh</h3>
          <div className="action-buttons">
            <button className="action-btn primary" onClick={handleViewLogs}>
              📊 Xem Activity Logs
            </button>
            <button className="action-btn secondary">
              ➕ Thêm người dùng
            </button>
            <button className="action-btn secondary">
              🔧 Cài đặt hệ thống
            </button>
            <button className="action-btn secondary">
              📈 Báo cáo
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="users-section">
          <h3>👥 Quản lý người dùng</h3>
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Ngày tạo</th>
                  <th>Đăng nhập cuối</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role === 'admin' ? '👑 Admin' : '👤 User'}
                      </span>
                    </td>
                    <td>{user.createdAt.toLocaleDateString('vi-VN')}</td>
                    <td>{user.lastLogin.toLocaleDateString('vi-VN')}</td>
                    <td>
                      <div className="action-buttons-small">
                        <button className="btn-small edit">✏️</button>
                        <button className="btn-small delete">🗑️</button>
                        <button className="btn-small view">👁️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Info */}
        <div className="system-info">
          <h3>ℹ️ Thông tin hệ thống</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Phiên bản:</span>
              <span className="info-value">1.0.0</span>
            </div>
            <div className="info-item">
              <span className="info-label">Server:</span>
              <span className="info-value online">🟢 Online</span>
            </div>
            <div className="info-item">
              <span className="info-label">Database:</span>
              <span className="info-value online">🟢 Connected</span>
            </div>
            <div className="info-item">
              <span className="info-label">Redis:</span>
              <span className="info-value online">🟢 Connected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;