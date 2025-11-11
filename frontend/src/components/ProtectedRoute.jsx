/**
 * Protected Route Component
 * Hoạt động 6: Redux & Protected Routes
 * Bảo vệ các routes yêu cầu authentication
 */

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { selectIsAuthenticated, selectIsLoading, getUserProfile } from '../store/slices/authSlice';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);
  const user = useSelector(state => state.auth.user);
  const localToken = localStorage.getItem('token');

  // Kiểm tra authentication khi component mount
  useEffect(() => {
    if (localToken && !user && !isLoading) {
      console.log('🔄 Fetching user profile...');
      dispatch(getUserProfile());
    }
  }, [dispatch, localToken, user, isLoading]);

  // Timeout để tránh loading vô hạn
  useEffect(() => {
    if (localToken && isLoading) {
      const timeout = setTimeout(() => {
        if (isLoading && !user) {
          console.log('⏰ Profile fetch timeout, clearing token');
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      }, 10000); // 10 seconds timeout

      return () => clearTimeout(timeout);
    }
  }, [localToken, isLoading, user]);

  // Debug logging
  console.log('🔒 ProtectedRoute check:', { 
    localToken: !!localToken, 
    isAuthenticated, 
    isLoading, 
    user: !!user,
    location: location.pathname 
  });

  // Chưa đăng nhập -> redirect đến login
  if (!localToken) {
    console.log('❌ No token, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Có token nhưng chưa authenticated và đang loading -> show loading
  if (localToken && !isAuthenticated && isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Có token nhưng authentication failed -> clear token và redirect
  if (localToken && !isAuthenticated && !isLoading && !user) {
    console.log('🚨 Token expired/invalid, clearing and redirecting');
    localStorage.removeItem('token');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Kiểm tra role nếu được yêu cầu
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="access-denied">
        <h2>Truy cập bị từ chối</h2>
        <p>Bạn không có quyền truy cập trang này.</p>
        <p>Yêu cầu quyền: <strong>{requiredRole}</strong></p>
        <p>Quyền của bạn: <strong>{user?.role || 'Không xác định'}</strong></p>
      </div>
    );
  }

  // Đã authenticated và có đủ quyền -> render children
  return children;
};

export default ProtectedRoute;