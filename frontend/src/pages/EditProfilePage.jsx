/**
 * Edit Profile Page Component
 * Chỉnh sửa thông tin cá nhân
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  selectUser, 
  selectIsLoading, 
  selectError,
  clearError 
} from '../store/slices/authSlice';

const EditProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const user = useSelector(selectUser);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    fullName: '',
    department: ''
  });

  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || user.fullName || '',
        email: user.email || '',
        fullName: user.fullName || user.name || '',
        department: user.department || ''
      });
    }
  }, [user]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mock update profile (since we're using mock authentication)
    setMessage('✅ Cập nhật thông tin thành công! (Demo)');
    
    setTimeout(() => {
      navigate('/profile');
    }, 2000);
  };

  const handleCancel = () => {
    navigate('/profile');
  };

  return (
    <div className="edit-profile-page">
      <div className="edit-profile-container">
        <div className="page-header">
          <h2>✏️ Chỉnh sửa thông tin cá nhân</h2>
          <button onClick={handleCancel} className="back-button">
            ← Quay lại Profile
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="form-section">
            <h3>Thông tin cơ bản</h3>
            
            <div className="form-group">
              <label htmlFor="name">Tên hiển thị:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled
                title="Email không thể thay đổi"
              />
            </div>

            <div className="form-group">
              <label htmlFor="fullName">Họ và tên đầy đủ:</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="department">Phòng ban:</label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="Ví dụ: IT, Sales, Marketing..."
              />
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="save-button"
              disabled={isLoading}
            >
              {isLoading ? '🔄 Đang lưu...' : '💾 Lưu thay đổi'}
            </button>
            
            <button 
              type="button" 
              onClick={handleCancel}
              className="cancel-button"
            >
              ❌ Hủy bỏ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;