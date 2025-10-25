/**
 * Activity Logs Page
 * Xem lịch sử hoạt động và logs
 */

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectUser } from '../store/slices/authSlice';

const ActivityLogsPage = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Mock activity logs data
  const mockLogs = [
    {
      id: 1,
      user: user?.email || 'user@example.com',
      action: 'User login',
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'success'
    },
    {
      id: 2,
      user: user?.email || 'user@example.com',
      action: 'Profile viewed',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'success'
    },
    {
      id: 3,
      user: user?.email || 'user@example.com',
      action: 'Password change attempt',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'failed'
    },
    {
      id: 4,
      user: 'admin@example.com',
      action: 'Admin panel access',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      ip: '192.168.1.50',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'success'
    },
    {
      id: 5,
      user: 'admin@example.com',
      action: 'User management access',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      ip: '192.168.1.50',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'success'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLogs(mockLogs);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true;
    if (filter === 'my') return log.user === user?.email;
    if (filter === 'success') return log.status === 'success';
    if (filter === 'failed') return log.status === 'failed';
    return true;
  });

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('vi-VN');
  };

  const getStatusIcon = (status) => {
    return status === 'success' ? '✅' : '❌';
  };

  const getActionIcon = (action) => {
    if (action.includes('login')) return '🔑';
    if (action.includes('logout')) return '🚪';
    if (action.includes('profile')) return '👤';
    if (action.includes('admin')) return '👑';
    if (action.includes('password')) return '🔒';
    return '📝';
  };

  if (loading) {
    return (
      <div className="activity-logs-page">
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Đang tải logs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="activity-logs-page">
      <div className="logs-container">
        <div className="page-header">
          <h2>📊 Activity Logs</h2>
          <button onClick={() => navigate('/profile')} className="back-button">
            ← Quay lại Profile
          </button>
        </div>

        <div className="logs-controls">
          <div className="filter-section">
            <h3>🔍 Bộ lọc:</h3>
            <div className="filter-buttons">
              <button 
                className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
                onClick={() => setFilter('all')}
              >
                Tất cả ({logs.length})
              </button>
              <button 
                className={filter === 'my' ? 'filter-btn active' : 'filter-btn'}
                onClick={() => setFilter('my')}
              >
                Của tôi ({logs.filter(l => l.user === user?.email).length})
              </button>
              <button 
                className={filter === 'success' ? 'filter-btn active' : 'filter-btn'}
                onClick={() => setFilter('success')}
              >
                Thành công ({logs.filter(l => l.status === 'success').length})
              </button>
              <button 
                className={filter === 'failed' ? 'filter-btn active' : 'filter-btn'}
                onClick={() => setFilter('failed')}
              >
                Thất bại ({logs.filter(l => l.status === 'failed').length})
              </button>
            </div>
          </div>

          <div className="logs-stats">
            <div className="stat-card">
              <span className="stat-icon">📈</span>
              <div className="stat-info">
                <span className="stat-number">{logs.length}</span>
                <span className="stat-label">Tổng logs</span>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">✅</span>
              <div className="stat-info">
                <span className="stat-number">{logs.filter(l => l.status === 'success').length}</span>
                <span className="stat-label">Thành công</span>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">❌</span>
              <div className="stat-info">
                <span className="stat-number">{logs.filter(l => l.status === 'failed').length}</span>
                <span className="stat-label">Thất bại</span>
              </div>
            </div>
          </div>
        </div>

        <div className="logs-table">
          <div className="table-header">
            <div className="table-row header">
              <div className="table-cell">Trạng thái</div>
              <div className="table-cell">Hành động</div>
              <div className="table-cell">Người dùng</div>
              <div className="table-cell">Thời gian</div>
              <div className="table-cell">IP Address</div>
            </div>
          </div>
          
          <div className="table-body">
            {filteredLogs.map(log => (
              <div key={log.id} className={`table-row ${log.status}`}>
                <div className="table-cell status">
                  <span className="status-badge">
                    {getStatusIcon(log.status)} {log.status}
                  </span>
                </div>
                <div className="table-cell action">
                  <span className="action-text">
                    {getActionIcon(log.action)} {log.action}
                  </span>
                </div>
                <div className="table-cell user">
                  <span className="user-email">{log.user}</span>
                </div>
                <div className="table-cell timestamp">
                  {formatTimestamp(log.timestamp)}
                </div>
                <div className="table-cell ip">
                  <code>{log.ip}</code>
                </div>
              </div>
            ))}
          </div>
        </div>

        {filteredLogs.length === 0 && (
          <div className="empty-state">
            <p>📝 Không có logs nào khớp với bộ lọc hiện tại</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogsPage;