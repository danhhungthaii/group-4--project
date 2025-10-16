// frontend/src/services/authService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Class để quản lý authentication và tự động refresh token
class AuthService {
  constructor() {
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
    this.isRefreshing = false;
    this.failedQueue = [];
    this.setupInterceptors();
  }

  // Thiết lập axios interceptors để tự động thêm token và xử lý refresh
  setupInterceptors() {
    // Request interceptor - thêm access token vào header
    axios.interceptors.request.use(
      (config) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - xử lý token hết hạn và tự động refresh
    axios.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Nếu lỗi 401 (Unauthorized) và chưa retry
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Nếu đang refresh, thêm request vào queue
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return axios(originalRequest);
            }).catch(err => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newAccessToken = await this.refreshAccessToken();
            this.processQueue(null, newAccessToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            this.logout();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Xử lý queue của các request bị fail
  processQueue(error, token = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  // Login user
  async login(username, password) {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        username,
        password
      });

      if (response.data.success) {
        const { accessToken, refreshToken, user } = response.data.data;
        
        // Lưu tokens vào localStorage
        this.setTokens(accessToken, refreshToken);
        
        // Lưu user info
        localStorage.setItem('user', JSON.stringify(user));
        
        console.log('✅ Login successful, tokens saved');
        return { success: true, user, accessToken, refreshToken };
      }
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data?.message || error.message);
      throw error;
    }
  }

  // Refresh access token
  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post(`${API_URL}/auth/refresh`, {
        refreshToken: this.refreshToken
      });

      if (response.data.success) {
        const { accessToken } = response.data.data;
        this.setAccessToken(accessToken);
        console.log('✅ Token refreshed successfully');
        return accessToken;
      }
    } catch (error) {
      console.error('❌ Token refresh failed:', error.response?.data?.message || error.message);
      throw error;
    }
  }

  // Logout user
  async logout() {
    try {
      if (this.refreshToken) {
        await axios.post(`${API_URL}/auth/logout`, {
          refreshToken: this.refreshToken
        });
      }
    } catch (error) {
      console.error('❌ Logout API call failed:', error.message);
    } finally {
      this.clearTokens();
      console.log('✅ Logged out successfully');
    }
  }

  // Lưu tokens
  setTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  // Lưu access token
  setAccessToken(accessToken) {
    this.accessToken = accessToken;
    localStorage.setItem('accessToken', accessToken);
  }

  // Xóa tokens
  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  // Kiểm tra đã login chưa
  isAuthenticated() {
    return !!this.accessToken && !!this.refreshToken;
  }

  // Lấy thông tin user hiện tại
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Lấy profile từ API (protected route)
  async getProfile() {
    try {
      const response = await axios.get(`${API_URL}/auth/profile`);
      return response.data;
    } catch (error) {
      console.error('❌ Get profile failed:', error.response?.data?.message || error.message);
      throw error;
    }
  }
}

// Export singleton instance
export default new AuthService();