/**
 * Auth Slice - Quản lý trạng thái authentication
 * Hoạt động 6: Redux & Protected Routes
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Base API URL - use environment variable on Vercel (must include /api)
// Example: REACT_APP_API_BASE_URL=https://api.example.com/api
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5002/api';

// Configure axios
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Async thunks cho API calls

// Login thunk
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // Mock login for testing on Vercel (replace with real API later)
      if (email === 'admin@test.com' && password === 'password123') {
        const mockResponse = {
          token: 'mock-jwt-token-admin',
          user: {
            id: 1,
            email: 'admin@test.com',
            name: 'Admin User',
            role: 'admin'
          }
        };
        
        // Lưu token vào localStorage
        localStorage.setItem('token', mockResponse.token);
        return mockResponse;
      } else if (email === 'user@test.com' && password === 'password123') {
        const mockResponse = {
          token: 'mock-jwt-token-user',
          user: {
            id: 2,
            email: 'user@test.com',
            name: 'Regular User',
            role: 'user'
          }
        };
        
        // Lưu token vào localStorage
        localStorage.setItem('token', mockResponse.token);
        return mockResponse;
      } else {
        return rejectWithValue('Email hoặc mật khẩu không đúng');
      }
      
      // Real API call (commented out for now)
      // const response = await api.post('/auth/login', { email, password });
      // if (response.data.token) {
      //   localStorage.setItem('token', response.data.token);
      // }
      // return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Đăng nhập thất bại';
      return rejectWithValue(message);
    }
  }
);

// Register thunk
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      
      // Lưu token vào localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Đăng ký thất bại';
      return rejectWithValue(message);
    }
  }
);

// Get user profile thunk
export const getUserProfile = createAsyncThunk(
  'auth/getUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      // Mock profile data based on stored token
      const token = localStorage.getItem('token');
      
      if (token === 'mock-jwt-token-admin') {
        return {
          user: {
            id: 1,
            email: 'admin@test.com',
            name: 'Admin User',
            role: 'admin'
          }
        };
      } else if (token === 'mock-jwt-token-user') {
        return {
          user: {
            id: 2,
            email: 'user@test.com',
            name: 'Regular User',
            role: 'user'
          }
        };
      } else {
        return rejectWithValue('Token không hợp lệ');
      }
      
      // Real API call (commented out)
      // const response = await api.get('/auth/profile');
      // return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Lấy thông tin user thất bại';
      return rejectWithValue(message);
    }
  }
);

// Logout thunk
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('token');
      return null;
    } catch (error) {
      // Vẫn logout locally dù API lỗi
      localStorage.removeItem('token');
      return null;
    }
  }
);

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    // Clear auth state
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('token');
    },
    // Set loading
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload;
      })
      
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload;
      })
      
      // Get profile cases
      .addCase(getUserProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload;
        localStorage.removeItem('token');
      })
      
      // Logout cases
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        state.isLoading = false;
      });
  },
});

// Export actions
export const { clearError, clearAuth, setLoading } = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectError = (state) => state.auth.error;

// Export reducer
export default authSlice.reducer;