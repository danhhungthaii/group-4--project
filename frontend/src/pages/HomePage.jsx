import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/slices/authSlice';

function HomePage() {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (isAuthenticated) {
    // Nếu đã đăng nhập, hiển thị dashboard link
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '15px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <h1 style={{ color: '#333', marginBottom: '20px' }}>🎉 Chào mừng trở lại!</h1>
          <p style={{ color: '#666', marginBottom: '30px' }}>Bạn đã đăng nhập thành công</p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/profile" style={{ 
              display: 'inline-block', 
              padding: '12px 24px', 
              background: '#007bff', 
              color: 'white', 
              textDecoration: 'none', 
              borderRadius: '8px',
              fontWeight: '500'
            }}>
              👤 Profile
            </Link>
            <Link to="/admin" style={{ 
              display: 'inline-block', 
              padding: '12px 24px', 
              background: '#28a745', 
              color: 'white', 
              textDecoration: 'none', 
              borderRadius: '8px',
              fontWeight: '500'
            }}>
              ⚙️ Admin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Chưa đăng nhập - hiển thị welcome page
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '15px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        <h1 style={{ color: '#333', marginBottom: '10px' }}>🚀 Group 4 Project</h1>
        <h2 style={{ color: '#667eea', marginBottom: '20px' }}>Authentication & User Management</h2>
        <p style={{ color: '#666', marginBottom: '30px', lineHeight: '1.6' }}>
          Hệ thống quản lý người dùng hoàn chỉnh với xác thực, phân quyền và quản trị viên
        </p>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/login" style={{ 
            display: 'inline-block', 
            padding: '12px 24px', 
            background: '#007bff', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '8px',
            fontWeight: '500'
          }}>
            🔐 Đăng nhập
          </Link>
        </div>
        <div style={{ marginTop: '20px', fontSize: '14px', color: '#999' }}>
          <p>✅ React + Redux | ✅ JWT Auth | ✅ MongoDB</p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;