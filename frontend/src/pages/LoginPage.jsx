/**
 * Login Page Component
 * Hoạt động 6: Redux & Protected Routes
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  loginUser,
  registerUser, 
  selectIsLoading, 
  selectError, 
  clearError 
} from '../store/slices/authSlice';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });

  // Clear error khi component unmount
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
    
    if (isRegister) {
      // Validation cho đăng ký
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        alert('Vui lòng điền đầy đủ thông tin');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        alert('Mật khẩu xác nhận không khớp');
        return;
      }
      if (formData.password.length < 6) {
        alert('Mật khẩu phải có ít nhất 6 ký tự');
        return;
      }
      
      const registerData = {
        name: formData.name,
        email: formData.email,
        password: formData.password
      };
      const result = await dispatch(registerUser(registerData));
      
      // Redirect on successful registration
      if (result.type === 'auth/registerUser/fulfilled') {
        navigate('/profile', { replace: true });
      }
    } else {
      // Login
      if (formData.email && formData.password) {
        const result = await dispatch(loginUser({
          email: formData.email,
          password: formData.password
        }));
        
        // Redirect on successful login
        if (result.type === 'auth/loginUser/fulfilled') {
          const from = location.state?.from?.pathname || '/profile';
          navigate(from, { replace: true });
        }
      }
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setFormData({
      email: '',
      password: '',
      name: '',
      confirmPassword: ''
    });
    dispatch(clearError());
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <h2>{isRegister ? 'Đăng ký tài khoản' : 'Đăng nhập'}</h2>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            {isRegister && (
              <div className="form-group">
                <label htmlFor="name">Họ và tên:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nhập họ và tên"
                  required
                />
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
                placeholder="Nhập email của bạn"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mật khẩu:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
                placeholder={isRegister ? "Nhập mật khẩu (ít nhất 6 ký tự)" : "Nhập mật khẩu"}
              />
            </div>

            {isRegister && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Xác nhận mật khẩu:</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  placeholder="Nhập lại mật khẩu"
                />
              </div>
            )}

            <button 
              type="submit" 
              className="login-button"
              disabled={isLoading}
            >
              {isLoading 
                ? (isRegister ? 'Đang đăng ký...' : 'Đang đăng nhập...') 
                : (isRegister ? 'Đăng ký' : 'Đăng nhập')
              }
            </button>
          </form>

          <div className="login-links" style={{ marginTop: '20px', textAlign: 'center' }}>
            <p style={{ marginBottom: '10px', color: '#666' }}>
              {isRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}
            </p>
            <button 
              type="button" 
              className="link-button" 
              onClick={toggleMode}
              disabled={isLoading}
              style={{ 
                background: 'none',
                border: '2px solid #007bff',
                color: '#007bff', 
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#007bff';
                e.target.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'none';
                e.target.style.color = '#007bff';
              }}
            >
              {isRegister ? '🔐 Đăng nhập ngay' : '📝 Đăng ký ngay'}
            </button>
          </div>

          {!isRegister && (
            <div className="test-accounts">
              <h4>Tài khoản test:</h4>
              <p><strong>Admin:</strong> admin@test.com / password123</p>
              <p><strong>User:</strong> user@test.com / password123</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;