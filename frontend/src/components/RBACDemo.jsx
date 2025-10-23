// frontend/src/components/RBACDemo.jsx
import React, { useState, useEffect } from 'react';
import authService from '../services/authService';

const RBACDemo = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: 'admin', password: 'password123' });
  const [selectedAccount, setSelectedAccount] = useState('admin');
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [settings, setSettings] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    department: '',
    role: 'User'
  });

  // Test accounts
  const testAccounts = [
    { username: 'admin', password: 'password123', role: 'Admin', description: 'Full access - all features' },
    { username: 'moderator', password: 'password456', role: 'Moderator', description: 'Limited management - view/edit users' },
    { username: 'user1', password: 'password789', role: 'User', description: 'Basic access - profile only' }
  ];

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
  };

  // Change API URL for RBAC server (use env var on Vercel)
  const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (authService.isAuthenticated()) {
      setIsLoggedIn(true);
      setUser(authService.getCurrentUser());
      addLog('✅ User already logged in', 'success');
    }
  }, []);

  const handleAccountSelect = (account) => {
    setSelectedAccount(account.username);
    setLoginForm({ username: account.username, password: account.password });
  };

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      // Clear previous data
      setDashboardData(null);
      setUsers([]);
      setAnalytics(null);
      setSettings(null);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });

      const data = await response.json();

      if (data.success) {
        const { user, accessToken, refreshToken } = data.data;
        
        // Save to authService
        authService.setTokens(accessToken, refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        
        setIsLoggedIn(true);
        setUser(user);
        addLog(`✅ Login successful as ${user.role}: ${user.username}`, 'success');
        addLog(`🔑 Permissions: ${user.permissions.join(', ')}`, 'info');

        // Auto-load appropriate data based on role
        await loadRoleBasedData(user, accessToken);
      } else {
        addLog(`❌ Login failed: ${data.message}`, 'error');
      }
    } catch (error) {
      addLog(`❌ Login error: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRoleBasedData = async (user, accessToken) => {
    const headers = { 'Authorization': `Bearer ${accessToken}` };

    // Load dashboard if user has permission
    if (user.permissions.includes('VIEW_DASHBOARD')) {
      try {
        const response = await fetch(`${API_URL}/dashboard`, { headers });
        const data = await response.json();
        if (data.success) {
          setDashboardData(data.data);
          addLog('📊 Dashboard data loaded', 'success');
        }
      } catch (error) {
        addLog('❌ Failed to load dashboard', 'error');
      }
    }

    // Load users if user has permission
    if (user.permissions.includes('VIEW_USERS')) {
      try {
        const response = await fetch(`${API_URL}/users`, { headers });
        const data = await response.json();
        if (data.success) {
          setUsers(data.data.users);
          addLog('👥 Users data loaded', 'success');
        }
      } catch (error) {
        addLog('❌ Failed to load users', 'error');
      }
    }

    // Load analytics if user has permission
    if (user.permissions.includes('VIEW_ANALYTICS')) {
      try {
        const response = await fetch(`${API_URL}/analytics`, { headers });
        const data = await response.json();
        if (data.success) {
          setAnalytics(data.data);
          addLog('📈 Analytics data loaded', 'success');
        }
      } catch (error) {
        addLog('❌ Failed to load analytics', 'error');
      }
    }

    // Load settings if user has permission (Admin only)
    if (user.permissions.includes('MANAGE_SETTINGS')) {
      try {
        const response = await fetch(`${API_URL}/settings`, { headers });
        const data = await response.json();
        if (data.success) {
          setSettings(data.data);
          addLog('⚙️ Settings loaded', 'success');
        }
      } catch (error) {
        addLog('❌ Failed to load settings', 'error');
      }
    }
  };

  const handleCreateUser = async () => {
    if (!user.permissions.includes('CREATE_USER')) {
      addLog('❌ Access denied: CREATE_USER permission required', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.accessToken}`
        },
        body: JSON.stringify(newUser)
      });

      const data = await response.json();
      if (data.success) {
        setUsers(prev => [...prev, data.data.user]);
        setNewUser({ username: '', email: '', password: '', fullName: '', department: '', role: 'User' });
        addLog(`✅ User created: ${data.data.user.username}`, 'success');
      } else {
        addLog(`❌ Create user failed: ${data.message}`, 'error');
      }
    } catch (error) {
      addLog(`❌ Create user error: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!user.permissions.includes('DELETE_USER')) {
      addLog('❌ Access denied: DELETE_USER permission required', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authService.accessToken}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        addLog(`✅ User deleted successfully`, 'success');
      } else {
        addLog(`❌ Delete user failed: ${data.message}`, 'error');
      }
    } catch (error) {
      addLog(`❌ Delete user error: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setIsLoggedIn(false);
    setUser(null);
    setDashboardData(null);
    setUsers([]);
    setAnalytics(null);
    setSettings(null);
    addLog('✅ Logged out successfully', 'success');
  };

  const clearLogs = () => setLogs([]);

  const hasPermission = (permission) => {
    return user && user.permissions && user.permissions.includes(permission);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔐 RBAC Demo - Role-Based Access Control</h1>

      {!isLoggedIn ? (
        <div style={{ border: '1px solid #ccc', padding: '20px', marginBottom: '20px' }}>
          <h3>Select Test Account</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px', marginBottom: '20px' }}>
            {testAccounts.map(account => (
              <div 
                key={account.username}
                onClick={() => handleAccountSelect(account)}
                style={{
                  border: selectedAccount === account.username ? '2px solid #007bff' : '1px solid #ddd',
                  padding: '15px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: selectedAccount === account.username ? '#f8f9fa' : 'white'
                }}
              >
                <h4 style={{ margin: '0 0 10px 0', color: '#007bff' }}>{account.role}</h4>
                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                  <strong>Username:</strong> {account.username}<br/>
                  <strong>Password:</strong> {account.password}
                </p>
                <p style={{ margin: '10px 0 0 0', fontSize: '13px', color: '#666' }}>
                  {account.description}
                </p>
              </div>
            ))}
          </div>

          <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
            <h4>Login Form</h4>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="Username"
                value={loginForm.username}
                onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                style={{ width: '200px', padding: '8px', marginRight: '10px' }}
              />
              <input
                type="password"
                placeholder="Password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                style={{ width: '200px', padding: '8px', marginRight: '10px' }}
              />
              <button 
                onClick={handleLogin} 
                disabled={isLoading}
                style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {/* User Header */}
          <div style={{ border: '1px solid #ddd', padding: '20px', marginBottom: '20px', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img src={user.avatar} alt={user.username} style={{ width: '60px', height: '60px', borderRadius: '50%', marginRight: '15px' }} />
                <div>
                  <h3 style={{ margin: '0 0 5px 0' }}>Welcome, {user.fullName || user.username}!</h3>
                  <p style={{ margin: '0', color: '#666' }}>
                    <strong>Role:</strong> {user.role} | <strong>Department:</strong> {user.department} | <strong>Email:</strong> {user.email}
                  </p>
                  <p style={{ margin: '5px 0 0 0', fontSize: '12px' }}>
                    <strong>Permissions:</strong> {user.permissions.join(', ')}
                  </p>
                </div>
              </div>
              <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>
                Logout
              </button>
            </div>
          </div>

          {/* Role-based Content */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
            
            {/* Dashboard - Admin & Moderator */}
            {hasPermission('VIEW_DASHBOARD') && dashboardData && (
              <div style={{ border: '1px solid #28a745', padding: '20px', borderRadius: '8px' }}>
                <h4 style={{ color: '#28a745', margin: '0 0 15px 0' }}>📊 Dashboard</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                  <div style={{ padding: '10px', backgroundColor: '#e7f3ff', borderRadius: '4px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>{dashboardData.totalUsers}</div>
                    <div style={{ fontSize: '12px' }}>Total Users</div>
                  </div>
                  <div style={{ padding: '10px', backgroundColor: '#fff3cd', borderRadius: '4px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#856404' }}>{dashboardData.totalAdmins}</div>
                    <div style={{ fontSize: '12px' }}>Admins</div>
                  </div>
                </div>
                <h5>Recent Activity:</h5>
                {dashboardData.recentActivity.map((activity, index) => (
                  <div key={index} style={{ fontSize: '12px', margin: '5px 0', padding: '5px', backgroundColor: '#f8f9fa', borderRadius: '3px' }}>
                    <strong>{activity.action}</strong> by {activity.user} - {activity.time}
                  </div>
                ))}
              </div>
            )}

            {/* User Management - Admin & Moderator */}
            {hasPermission('VIEW_USERS') && (
              <div style={{ border: '1px solid #17a2b8', padding: '20px', borderRadius: '8px' }}>
                <h4 style={{ color: '#17a2b8', margin: '0 0 15px 0' }}>👥 User Management</h4>
                
                {/* Create User Form - Admin Only */}
                {hasPermission('CREATE_USER') && (
                  <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#e1f5fe', borderRadius: '4px' }}>
                    <h5 style={{ margin: '0 0 10px 0' }}>Create New User (Admin Only)</h5>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                      <input
                        type="text"
                        placeholder="Username"
                        value={newUser.username}
                        onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                        style={{ padding: '5px' }}
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        style={{ padding: '5px' }}
                      />
                      <input
                        type="password"
                        placeholder="Password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                        style={{ padding: '5px' }}
                      />
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={newUser.fullName}
                        onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                        style={{ padding: '5px' }}
                      />
                      <input
                        type="text"
                        placeholder="Department"
                        value={newUser.department}
                        onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                        style={{ padding: '5px' }}
                      />
                      <select
                        value={newUser.role}
                        onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                        style={{ padding: '5px' }}
                      >
                        <option value="User">User</option>
                        <option value="Moderator">Moderator</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>
                    <button
                      onClick={handleCreateUser}
                      disabled={isLoading}
                      style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
                    >
                      {isLoading ? 'Creating...' : 'Create User'}
                    </button>
                  </div>
                )}

                {/* Users List */}
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {users.map(u => (
                    <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '10px 0', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <img src={u.avatar} alt={u.username} style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }} />
                        <div>
                          <div style={{ fontWeight: 'bold' }}>{u.fullName}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>{u.username} - {u.role} - {u.department}</div>
                        </div>
                      </div>
                      {hasPermission('DELETE_USER') && u.id !== user.id && (
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          style={{ padding: '4px 8px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', fontSize: '12px' }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analytics - Admin & Moderator */}
            {hasPermission('VIEW_ANALYTICS') && analytics && (
              <div style={{ border: '1px solid #ffc107', padding: '20px', borderRadius: '8px' }}>
                <h4 style={{ color: '#856404', margin: '0 0 15px 0' }}>📈 Analytics</h4>
                
                <h5>Role Distribution:</h5>
                <div style={{ marginBottom: '15px' }}>
                  {Object.entries(analytics.roleDistribution).map(([role, count]) => (
                    <div key={role} style={{ display: 'flex', justifyContent: 'space-between', margin: '5px 0' }}>
                      <span>{role}:</span>
                      <span style={{ fontWeight: 'bold' }}>{count}</span>
                    </div>
                  ))}
                </div>

                <h5>Department Stats:</h5>
                <div>
                  {Object.entries(analytics.departmentStats).map(([dept, count]) => (
                    <div key={dept} style={{ display: 'flex', justifyContent: 'space-between', margin: '5px 0' }}>
                      <span>{dept}:</span>
                      <span style={{ fontWeight: 'bold' }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settings - Admin Only */}
            {hasPermission('MANAGE_SETTINGS') && settings && (
              <div style={{ border: '1px solid #6f42c1', padding: '20px', borderRadius: '8px' }}>
                <h4 style={{ color: '#6f42c1', margin: '0 0 15px 0' }}>⚙️ Settings (Admin Only)</h4>
                <div>
                  <div style={{ margin: '10px 0' }}>
                    <strong>Site Name:</strong> {settings.siteName}
                  </div>
                  <div style={{ margin: '10px 0' }}>
                    <strong>Allow Registration:</strong> {settings.allowRegistration ? 'Yes' : 'No'}
                  </div>
                  <div style={{ margin: '10px 0' }}>
                    <strong>Default Role:</strong> {settings.defaultRole}
                  </div>
                  <div style={{ margin: '10px 0' }}>
                    <strong>Session Timeout:</strong> {settings.sessionTimeout} minutes
                  </div>
                  <div style={{ margin: '10px 0' }}>
                    <strong>Max Login Attempts:</strong> {settings.maxLoginAttempts}
                  </div>
                </div>
              </div>
            )}

            {/* Profile - All Users */}
            <div style={{ border: '1px solid #6c757d', padding: '20px', borderRadius: '8px' }}>
              <h4 style={{ color: '#6c757d', margin: '0 0 15px 0' }}>👤 My Profile</h4>
              <div>
                <div style={{ margin: '10px 0' }}>
                  <strong>Full Name:</strong> {user.fullName}
                </div>
                <div style={{ margin: '10px 0' }}>
                  <strong>Username:</strong> {user.username}
                </div>
                <div style={{ margin: '10px 0' }}>
                  <strong>Email:</strong> {user.email}
                </div>
                <div style={{ margin: '10px 0' }}>
                  <strong>Role:</strong> {user.role}
                </div>
                <div style={{ margin: '10px 0' }}>
                  <strong>Department:</strong> {user.department}
                </div>
                <div style={{ margin: '10px 0' }}>
                  <strong>Permissions:</strong>
                  <div style={{ fontSize: '12px', marginTop: '5px' }}>
                    {user.permissions.map(permission => (
                      <span key={permission} style={{ display: 'inline-block', margin: '2px', padding: '2px 6px', backgroundColor: '#e9ecef', borderRadius: '3px' }}>
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Logs */}
      <div style={{ border: '1px solid #ccc', padding: '15px', marginTop: '20px', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3>Activity Logs</h3>
          <button onClick={clearLogs} style={{ padding: '5px 10px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}>
            Clear Logs
          </button>
        </div>
        
        <div style={{ height: '200px', overflowY: 'scroll', border: '1px solid #dee2e6', padding: '10px', backgroundColor: '#f8f9fa', fontFamily: 'monospace', fontSize: '12px' }}>
          {logs.length === 0 ? (
            <p style={{ color: '#6c757d' }}>No logs yet...</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} style={{ marginBottom: '5px', color: log.type === 'error' ? '#dc3545' : log.type === 'success' ? '#28a745' : log.type === 'warning' ? '#ffc107' : '#495057' }}>
                <span style={{ color: '#6c757d' }}>[{log.timestamp}]</span> {log.message}
              </div>
            ))
          )}
        </div>
      </div>

      {/* RBAC Explanation */}
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e7f3ff', border: '1px solid #b3d9ff', borderRadius: '8px' }}>
        <h4>🔐 How RBAC Works:</h4>
        <ul style={{ fontSize: '14px' }}>
          <li><strong>Admin:</strong> Full access - Dashboard, User Management (CRUD), Analytics, Settings</li>
          <li><strong>Moderator:</strong> Limited management - Dashboard, View/Edit Users, Analytics</li>
          <li><strong>User:</strong> Basic access - Profile only</li>
          <li>UI components are dynamically shown/hidden based on user permissions</li>
          <li>API endpoints are protected with role-based middleware</li>
        </ul>
      </div>
    </div>
  );
};

export default RBACDemo;