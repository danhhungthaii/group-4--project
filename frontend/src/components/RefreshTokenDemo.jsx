// frontend/src/components/RefreshTokenDemo.jsx
import React, { useState, useEffect } from 'react';
import authService from '../services/authService';

const RefreshTokenDemo = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: 'admin', password: 'password123' });
  const [profile, setProfile] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Thêm log vào danh sách
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
  };

  // Kiểm tra trạng thái đăng nhập khi component mount
  useEffect(() => {
    const checkAuthStatus = () => {
      if (authService.isAuthenticated()) {
        setIsLoggedIn(true);
        setUser(authService.getCurrentUser());
        addLog('✅ User already logged in', 'success');
      }
    };
    checkAuthStatus();
  }, []);

  // Xử lý login
  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await authService.login(loginForm.username, loginForm.password);
      setIsLoggedIn(true);
      setUser(result.user);
      addLog(`✅ Login successful for ${result.user.username}`, 'success');
      addLog(`🔑 Access Token: ${result.accessToken.substring(0, 20)}...`, 'info');
      addLog(`🔄 Refresh Token: ${result.refreshToken.substring(0, 20)}...`, 'info');
    } catch (error) {
      addLog(`❌ Login failed: ${error.response?.data?.message || error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý logout
  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setIsLoggedIn(false);
      setUser(null);
      setProfile(null);
      addLog('✅ Logout successful', 'success');
    } catch (error) {
      addLog(`❌ Logout failed: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Test API call (sẽ tự động refresh token nếu cần)
  const testApiCall = async () => {
    setIsLoading(true);
    try {
      addLog('🔍 Making API call to get profile...', 'info');
      const response = await authService.getProfile();
      setProfile(response.data.user);
      addLog('✅ Profile fetched successfully', 'success');
    } catch (error) {
      addLog(`❌ API call failed: ${error.response?.data?.message || error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate token expiry (sẽ trigger auto refresh)
  const simulateTokenExpiry = () => {
    // Xóa access token để simulate hết hạn
    localStorage.removeItem('accessToken');
    authService.accessToken = null;
    addLog('⚠️ Simulated access token expiry', 'warning');
    addLog('🔄 Next API call will trigger automatic token refresh', 'info');
  };

  // Manual refresh token
  const manualRefresh = async () => {
    setIsLoading(true);
    try {
      addLog('🔄 Manually refreshing token...', 'info');
      const newToken = await authService.refreshAccessToken();
      addLog(`✅ Token refreshed: ${newToken.substring(0, 20)}...`, 'success');
    } catch (error) {
      addLog(`❌ Manual refresh failed: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear logs
  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔄 Refresh Token Demo</h1>
      
      {!isLoggedIn ? (
        <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
          <h3>Login</h3>
          <div style={{ marginBottom: '10px' }}>
            <label>Username: </label>
            <input
              type="text"
              value={loginForm.username}
              onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
              style={{ marginLeft: '10px', padding: '5px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Password: </label>
            <input
              type="password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
              style={{ marginLeft: '10px', padding: '5px' }}
            />
          </div>
          <button 
            onClick={handleLogin} 
            disabled={isLoading}
            style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      ) : (
        <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
          <h3>Welcome, {user?.username}!</h3>
          <p><strong>Role:</strong> {user?.role}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          
          <div style={{ marginTop: '15px' }}>
            <button 
              onClick={testApiCall}
              disabled={isLoading}
              style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer', marginRight: '10px' }}
            >
              {isLoading ? 'Loading...' : 'Test API Call (Get Profile)'}
            </button>
            
            <button 
              onClick={simulateTokenExpiry}
              style={{ padding: '8px 16px', backgroundColor: '#ffc107', color: 'black', border: 'none', cursor: 'pointer', marginRight: '10px' }}
            >
              Simulate Token Expiry
            </button>
            
            <button 
              onClick={manualRefresh}
              disabled={isLoading}
              style={{ padding: '8px 16px', backgroundColor: '#17a2b8', color: 'white', border: 'none', cursor: 'pointer', marginRight: '10px' }}
            >
              {isLoading ? 'Refreshing...' : 'Manual Refresh'}
            </button>
            
            <button 
              onClick={handleLogout}
              disabled={isLoading}
              style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', cursor: 'pointer' }}
            >
              {isLoading ? 'Logging out...' : 'Logout'}
            </button>
          </div>
          
          {profile && (
            <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6' }}>
              <h4>Profile Data (from API):</h4>
              <pre>{JSON.stringify(profile, null, 2)}</pre>
            </div>
          )}
        </div>
      )}

      <div style={{ border: '1px solid #ccc', padding: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3>Activity Logs</h3>
          <button 
            onClick={clearLogs}
            style={{ padding: '5px 10px', backgroundColor: '#6c757d', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            Clear Logs
          </button>
        </div>
        
        <div style={{ 
          height: '300px', 
          overflowY: 'scroll', 
          border: '1px solid #dee2e6', 
          padding: '10px',
          backgroundColor: '#f8f9fa',
          fontFamily: 'monospace'
        }}>
          {logs.length === 0 ? (
            <p style={{ color: '#6c757d' }}>No logs yet...</p>
          ) : (
            logs.map((log, index) => (
              <div 
                key={index} 
                style={{ 
                  marginBottom: '5px',
                  color: log.type === 'error' ? '#dc3545' : 
                         log.type === 'success' ? '#28a745' : 
                         log.type === 'warning' ? '#ffc107' : '#495057'
                }}
              >
                <span style={{ color: '#6c757d' }}>[{log.timestamp}]</span> {log.message}
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e7f3ff', border: '1px solid #b3d9ff' }}>
        <h4>How it works:</h4>
        <ul>
          <li>1. Login với username/password để nhận access token và refresh token</li>
          <li>2. Access token được tự động thêm vào header của mọi API request</li>
          <li>3. Khi access token hết hạn (401 error), hệ thống tự động dùng refresh token để lấy access token mới</li>
          <li>4. Các request bị fail sẽ được retry với token mới</li>
          <li>5. Nếu refresh token cũng hết hạn, user sẽ bị logout tự động</li>
        </ul>
      </div>
    </div>
  );
};

export default RefreshTokenDemo;