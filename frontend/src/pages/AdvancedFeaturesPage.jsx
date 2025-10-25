/**
 * Advanced Features Page
 * Tập hợp tất cả tính năng nâng cao
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/slices/authSlice';

const AdvancedFeaturesPage = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  
  const [activeDemo, setActiveDemo] = useState(null);

  const features = [
    {
      id: 'activity-logs',
      title: '📊 Activity Logs',
      description: 'Xem lịch sử hoạt động và logs hệ thống',
      icon: '📋',
      color: 'blue',
      route: '/activity-logs'
    },
    {
      id: 'rate-limiting', 
      title: '🛡️ Rate Limiting Tests',
      description: 'Test bảo mật và rate limiting',
      icon: '🔒',
      color: 'red',
      route: '/rate-limiting'
    },
    {
      id: 'user-management',
      title: '👥 User Management',
      description: 'Quản lý người dùng (Admin only)',
      icon: '👑',
      color: 'purple',
      route: '/admin',
      requireAdmin: true
    },
    {
      id: 'profile-advanced',
      title: '⚙️ Advanced Profile',
      description: 'Cài đặt profile nâng cao',
      icon: '🔧',
      color: 'green',
      route: '/profile-advanced'
    },
    {
      id: 'api-testing',
      title: '🧪 API Testing',
      description: 'Test các API endpoints',
      icon: '📡',
      color: 'orange',
      route: '/api-testing'
    },
    {
      id: 'security-audit',
      title: '🔍 Security Audit',
      description: 'Kiểm tra bảo mật hệ thống',
      icon: '🛡️',
      color: 'dark',
      route: '/security-audit'
    }
  ];

  const handleFeatureClick = (feature) => {
    if (feature.requireAdmin && user?.role !== 'Admin') {
      alert('Tính năng này chỉ dành cho Admin!');
      return;
    }
    
    if (feature.route) {
      navigate(feature.route);
    } else {
      setActiveDemo(feature.id);
    }
  };

  const stats = [
    { label: 'Total Users', value: '156', icon: '👥', color: 'blue' },
    { label: 'Active Sessions', value: '23', icon: '🟢', color: 'green' },
    { label: 'Failed Logins', value: '7', icon: '❌', color: 'red' },
    { label: 'Security Alerts', value: '2', icon: '⚠️', color: 'orange' }
  ];

  const recentActivities = [
    { user: 'admin@example.com', action: 'Logged in', time: '2 minutes ago', icon: '🔑' },
    { user: 'user@example.com', action: 'Updated profile', time: '5 minutes ago', icon: '✏️' },
    { user: 'admin@example.com', action: 'Accessed admin panel', time: '10 minutes ago', icon: '👑' },
    { user: 'user@example.com', action: 'Changed password', time: '15 minutes ago', icon: '🔒' }
  ];

  return (
    <div className="advanced-features-page">
      <div className="features-container">
        <div className="page-header">
          <h2>🚀 Advanced Features Dashboard</h2>
          <button onClick={() => navigate('/profile')} className="back-button">
            ← Quay lại Profile
          </button>
        </div>

        <div className="welcome-section">
          <div className="welcome-card">
            <h3>Chào mừng, {user?.fullName || user?.name || 'User'}! 👋</h3>
            <p>Đây là trang tập hợp tất cả các tính năng nâng cao của hệ thống.</p>
            <div className="user-badge">
              <span className={`role-badge ${user?.role?.toLowerCase()}`}>
                {user?.role === 'Admin' ? '👑 Admin' : '👤 User'}
              </span>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className={`stat-card ${stat.color}`}>
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-content">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="features-grid">
          {features.map(feature => (
            <div 
              key={feature.id} 
              className={`feature-card ${feature.color} ${feature.requireAdmin && user?.role !== 'Admin' ? 'disabled' : ''}`}
              onClick={() => handleFeatureClick(feature)}
            >
              <div className="feature-icon">{feature.icon}</div>
              <div className="feature-content">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                {feature.requireAdmin && (
                  <span className="admin-badge">👑 Admin Only</span>
                )}
              </div>
              <div className="feature-arrow">→</div>
            </div>
          ))}
        </div>

        <div className="activity-section">
          <h3>📈 Recent Activities</h3>
          <div className="activity-list">
            {recentActivities.map((activity, index) => (
              <div key={index} className="activity-item">
                <span className="activity-icon">{activity.icon}</span>
                <div className="activity-content">
                  <span className="activity-user">{activity.user}</span>
                  <span className="activity-action">{activity.action}</span>
                </div>
                <span className="activity-time">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="demo-section">
          <h3>🎮 Interactive Demos</h3>
          <div className="demo-grid">
            <div className="demo-card" onClick={() => setActiveDemo('redux-demo')}>
              <h4>🔄 Redux State Demo</h4>
              <p>Xem Redux state management hoạt động</p>
            </div>
            <div className="demo-card" onClick={() => setActiveDemo('routing-demo')}>
              <h4>🛤️ Protected Routes Demo</h4>
              <p>Test protected routes và permissions</p>
            </div>
            <div className="demo-card" onClick={() => setActiveDemo('auth-demo')}>
              <h4>🔐 Authentication Demo</h4>
              <p>Mô phỏng luồng authentication</p>
            </div>
          </div>
        </div>

        {activeDemo && (
          <div className="demo-modal">
            <div className="demo-content">
              <div className="demo-header">
                <h3>🎯 {activeDemo} is running...</h3>
                <button onClick={() => setActiveDemo(null)}>✕</button>
              </div>
              <div className="demo-body">
                <p>🎪 Demo "{activeDemo}" đang chạy!</p>
                <p>Đây là nơi hiển thị demo tương ứng.</p>
                {activeDemo === 'redux-demo' && (
                  <div className="redux-state">
                    <h4>🔍 Current Redux State:</h4>
                    <pre>{JSON.stringify({ user, isAuthenticated: !!user }, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedFeaturesPage;