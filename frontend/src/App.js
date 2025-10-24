/**
 * Main App Component
 * Hoạt động 6: Redux & Protected Routes
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store from './store';
import { getUserProfile, selectIsAuthenticated } from './store/slices/authSlice';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import HomePage from './pages/HomePage';

// Styles
import './App.css';
import './styles/redux-protected.css';

// App Router Component
const AppRouter = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const token = localStorage.getItem('token');

  // Check authentication on app start
  useEffect(() => {
    if (token && !isAuthenticated) {
      dispatch(getUserProfile());
    }
  }, [dispatch, token, isAuthenticated]);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Home Route */}
          <Route 
            path="/" 
            element={<HomePage />} 
          />
          
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
            path="/admin" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Default redirect */}
          <Route 
            path="/" 
            element={
              isAuthenticated ? (
                <Navigate to="/profile" replace />
              ) : (
                <Navigate to="/login" replace />
              )
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
