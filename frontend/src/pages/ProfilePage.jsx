/**
 * Profile Page Component
 * Hoạt động 6: Redux & Protected Routes
 * Trang profile được bảo vệ - chỉ user đã đăng nhập mới truy cập được
 */

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  selectUser, 
  selectIsLoading, 
  logoutUser,
  getUserProfile 
} from '../store/slices/authSlice';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const user = useSelector(selectUser);
  const isLoading = useSelector(selectIsLoading);

  // Fetch user profile when component mounts
  useEffect(() => {
    if (!user) {
      dispatch(getUserProfile());
    }
  }, [dispatch, user]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải thông tin profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h2>👤 Profile của tôi</h2>
          <button onClick={handleLogout} className="logout-button">
            🚪 Đăng xuất
          </button>
        </div>

        <div className="profile-content">
          <div className="profile-card">
            <div className="profile-info">
              <h3>Thông tin cá nhân</h3>
              
              <div className="info-group">
                <label>📧 Email:</label>
                <span>{user?.email || 'Chưa có thông tin'}</span>
              </div>

              <div className="info-group">
                <label>👨‍💼 Tên:</label>
                <span>{user?.name || 'Chưa có thông tin'}</span>
              </div>

              <div className="info-group">
                <label>🔑 Vai trò:</label>
                <span className={`role-badge ${user?.role}`}>
                  {user?.role === 'admin' ? '👑 Admin' : '👤 User'}
                </span>
              </div>

              <div className="info-group">
                <label>🆔 ID:</label>
                <span className="user-id">{user?.id || user?._id}</span>
              </div>

              <div className="info-group">
                <label>📅 Ngày tạo:</label>
                <span>
                  {user?.createdAt 
                    ? new Date(user.createdAt).toLocaleDateString('vi-VN')
                    : 'Chưa có thông tin'
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="profile-actions">
            <h3>🛠️ Hành động</h3>
            
            <div className="action-buttons">
              <button 
                className="action-button edit"
                onClick={() => navigate('/edit-profile')}
              >
                ✏️ Chỉnh sửa thông tin
              </button>
              
              <button 
                className="action-button security"
                onClick={() => navigate('/change-password')}
              >
                🔒 Đổi mật khẩu
              </button>
              
              <button 
                className="action-button advanced"
                onClick={() => navigate('/advanced-features')}
              >
                🚀 Advanced Features
              </button>
              
              {user?.role === 'admin' && (
                <button 
                  className="action-button admin"
                  onClick={() => navigate('/admin')}
                >
                  👑 Trang Admin
                </button>
              )}
            </div>
          </div>

          <div className="profile-stats">
            <h3>📊 Thống kê</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Trạng thái</span>
                <span className="stat-value online">🟢 Online</span>
              </div>
              
              <div className="stat-item">
                <span className="stat-label">Lần đăng nhập cuối</span>
                <span className="stat-value">
                  {new Date().toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;