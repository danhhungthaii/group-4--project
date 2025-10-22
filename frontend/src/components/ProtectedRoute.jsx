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
  const token = useSelector(state => state.auth.token);

  // Kiểm tra authentication khi component mount
  useEffect(() => {
    if (token && !user && !isLoading) {
      // Có token nhưng chưa có user info, fetch profile
      dispatch(getUserProfile());
    }
  }, [dispatch, token, user, isLoading]);

  // Hiển thị loading khi đang fetch user profile
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Chưa đăng nhập -> redirect đến login
  if (!isAuthenticated || !token) {
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