/**
 * Main App Component
 * Hoạt động 6: Redux & Protected Routes
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store from './store';
import { getUserProfile, selectIsAuthenticated, selectIsLoading } from './store/slices/authSlice';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import HomePage from './pages/HomePage';
import EditProfilePage from './pages/EditProfilePage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import AdvancedFeaturesPage from './pages/AdvancedFeaturesPage';
import ActivityLogsPage from './pages/ActivityLogsPage';
import RateLimitingPage from './pages/RateLimitingPage';

// Styles
import './App.css';
import './styles/redux-protected.css';

// App Router Component
const AppRouter = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);
  const token = localStorage.getItem('token');

  // Check authentication on app start
  useEffect(() => {
    console.log('🚀 App init:', { token: !!token, isAuthenticated, isLoading });
    if (token && !isAuthenticated && !isLoading) {
      console.log('📱 Fetching user profile...');
      dispatch(getUserProfile());
    }
  }, [dispatch, token, isAuthenticated, isLoading]);

  // Show loading while checking authentication
  if (token && !isAuthenticated && isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div className="spinner" style={{ margin: '0 auto 20px' }}></div>
          <p>Đang kiểm tra đăng nhập...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={<LoginPage />} 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/edit-profile" 
            element={
              <ProtectedRoute>
                <EditProfilePage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/change-password" 
            element={
              <ProtectedRoute>
                <ChangePasswordPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/advanced-features" 
            element={
              <ProtectedRoute>
                <AdvancedFeaturesPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/activity-logs" 
            element={
              <ProtectedRoute>
                <ActivityLogsPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/rate-limiting" 
            element={
              <ProtectedRoute>
                <RateLimitingPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Home Route - Always show login/welcome page */}
          <Route 
            path="/" 
            element={<HomePage />} 
          />
          
          {/* Default route for authenticated users */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch all - redirect to home */}
          <Route 
            path="*" 
            element={<Navigate to="/" replace />} 
          />
        </Routes>
      </div>
    </Router>
  );
};

function App() {
  return (
    <Provider store={store}>
      <AppRouter />
    </Provider>
  );
}

export default App;
