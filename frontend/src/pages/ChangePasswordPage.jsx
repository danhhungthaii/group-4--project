/**
 * Change Password Page Component
 * Đổi mật khẩu
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

const ChangePasswordPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const user = useSelector(selectUser);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [formError, setFormError] = useState('');
  const [message, setMessage] = useState('');

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
    
    // Clear form errors when user types
    if (formError) {
      setFormError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.newPassword !== formData.confirmPassword) {
      setFormError('Mật khẩu mới và xác nhận mật khẩu không khớp');
      return;
    }

    if (formData.newPassword.length < 6) {
      setFormError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    // Mock password change (since we're using mock authentication)
    setMessage('✅ Đổi mật khẩu thành công! Vui lòng đăng nhập lại. (Demo)');
    
    setTimeout(() => {
      navigate('/profile');
    }, 3000);
  };

  const handleCancel = () => {
    navigate('/profile');
  };

  return (
    <div className="change-password-page">
      <div className="change-password-container">
        <div className="page-header">
          <h2>🔒 Đổi mật khẩu</h2>
          <button onClick={handleCancel} className="back-button">
            ← Quay lại Profile
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {formError && (
          <div className="error-message">
            {formError}
          </div>
        )}

        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="change-password-form">
          <div className="form-section">
            <h3>Thông tin xác thực</h3>
            
            <div className="form-group">
              <label htmlFor="currentPassword">Mật khẩu hiện tại:</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                required
                placeholder="Nhập mật khẩu hiện tại"
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">Mật khẩu mới:</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                required
                placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                minLength="6"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu mới:</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Nhập lại mật khẩu mới"
                minLength="6"
              />
            </div>
          </div>

          <div className="password-requirements">
            <h4>🛡️ Yêu cầu mật khẩu:</h4>
            <ul>
              <li className={formData.newPassword.length >= 6 ? 'valid' : ''}>
                ✓ Ít nhất 6 ký tự
              </li>
              <li className={formData.newPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword ? 'valid' : ''}>
                ✓ Mật khẩu xác nhận phải khớp
              </li>
            </ul>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="save-button"
              disabled={isLoading || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
            >
              {isLoading ? '🔄 Đang cập nhật...' : '🔒 Đổi mật khẩu'}
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

export default ChangePasswordPage;