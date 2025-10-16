# Hướng dẫn Demo Frontend tự động Refresh Token

## Mô tả
Demo này thể hiện cơ chế JWT Access Token + Refresh Token với khả năng tự động refresh token khi token hết hạn.

## Cấu trúc dự án

### Backend (server-simple.js)
- **Port**: 5000
- **Endpoints**:
  - `POST /api/auth/login` - Đăng nhập và nhận tokens
  - `POST /api/auth/refresh` - Refresh access token
  - `POST /api/auth/logout` - Đăng xuất và thu hồi tokens
  - `GET /api/auth/profile` - Lấy thông tin profile (protected)

### Frontend Demo
1. **React Component** (`frontend/src/components/RefreshTokenDemo.jsx`)
2. **HTML Demo** (`demo-refresh-token.html`)
3. **Auth Service** (`frontend/src/services/authService.js`)

## Cách chạy Demo

### 1. Khởi động Backend
```bash
cd backend
node server-simple.js
```
Server sẽ chạy tại: http://localhost:5000

### 2. Khởi động Frontend (HTML Demo)
```bash
node static-server.js
```
Demo sẽ có tại: http://localhost:3001/demo-refresh-token.html

### 3. Khởi động React Frontend (Optional)
```bash
cd frontend
npm start
```
React app sẽ chạy tại: http://localhost:3000/refresh-demo

## Tài khoản Test
- **Admin**: admin / password123
- **Moderator**: moderator / password456
- **User**: user1 / password789

## Cách thức hoạt động

### 1. Login Process
- User nhập username/password
- Backend trả về access token (15 phút) và refresh token (7 ngày)
- Frontend lưu tokens vào localStorage

### 2. API Request với Auto-Refresh
```javascript
// AuthService tự động thêm access token vào header
Authorization: Bearer <access-token>

// Khi token hết hạn (401 error):
1. Hệ thống tự động gọi refresh endpoint
2. Nhận access token mới
3. Retry request gốc với token mới
4. User không biết gì về quá trình này
```

### 3. Refresh Token Flow
```
API Request -> 401 Error -> Auto Refresh -> Retry with New Token
     ↓              ↓            ↓               ↓
   Normal      Token Expired   Get New Token   Success
```

### 4. Logout Process
- Gọi logout API để thu hồi refresh token
- Xóa tất cả tokens khỏi localStorage
- Redirect về trang login

## Tính năng Demo

### HTML Demo
1. **Login Form**: Đăng nhập với tài khoản test
2. **User Info**: Hiển thị thông tin user và tokens
3. **Test API Call**: Gọi protected API để test auto-refresh
4. **Simulate Token Expiry**: Giả lập token hết hạn
5. **Manual Refresh**: Refresh token thủ công
6. **Activity Logs**: Theo dõi tất cả hoạt động

### React Component
- Tích hợp với React Router
- State management với hooks
- UI components với styling
- Real-time logging

## Code Examples

### Auto-Refresh Interceptor
```javascript
// Response interceptor - xử lý token hết hạn
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (this.isRefreshing) {
        // Queue failed requests
        return new Promise((resolve, reject) => {
          this.failedQueue.push({ resolve, reject });
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
```

### Protected API Call
```javascript
async function callProtectedAPI() {
  try {
    // Chỉ cần gọi API bình thường
    const response = await authService.getProfile();
    console.log('Profile:', response.data);
  } catch (error) {
    // Auto-refresh sẽ được xử lý tự động
    console.error('Error:', error);
  }
}
```

## Kiểm tra Demo

### Test Cases
1. **Login Success**: Đăng nhập thành công và nhận tokens
2. **API Call**: Gọi protected API khi token còn hiệu lực
3. **Token Expiry**: Simulate token hết hạn và test auto-refresh
4. **Manual Refresh**: Test refresh token thủ công
5. **Logout**: Test logout và thu hồi tokens
6. **Invalid Token**: Test với refresh token không hợp lệ

### Expected Behavior
- ✅ Login thành công và lưu tokens
- ✅ API calls tự động include authorization header
- ✅ Token hết hạn -> tự động refresh -> retry request
- ✅ Multiple failed requests được queue và retry cùng lúc
- ✅ Refresh token hết hạn -> auto logout
- ✅ Manual logout thu hồi tokens

## Bảo mật

### Access Token
- **Thời gian sống**: 15 phút
- **Mục đích**: Authorization cho API calls
- **Lưu trữ**: localStorage (có thể dùng httpOnly cookies)

### Refresh Token
- **Thời gian sống**: 7 ngày
- **Mục đích**: Làm mới access token
- **Lưu trữ**: localStorage
- **Thu hồi**: Khi logout hoặc phát hiện bất thường

### Best Practices
1. HTTPS cho production
2. Secure storage (httpOnly cookies)
3. Token rotation (refresh token mới mỗi lần refresh)
4. Rate limiting
5. Blacklist tokens
6. Device/IP tracking

## Troubleshooting

### Common Issues
1. **CORS Error**: Đảm bảo backend enable CORS
2. **Token not found**: Kiểm tra localStorage
3. **Infinite refresh loop**: Kiểm tra refresh token validity
4. **401 still occurs**: Verify token format và secret keys

### Debug Tips
- Check browser console logs
- Inspect localStorage tokens
- Monitor network requests
- Check backend logs

## File Structure
```
group-4--project/
├── backend/
│   ├── server-simple.js          # Backend API server
│   └── package.json
├── frontend/src/
│   ├── services/
│   │   └── authService.js        # Auth service với auto-refresh
│   └── components/
│       └── RefreshTokenDemo.jsx  # React demo component
├── demo-refresh-token.html       # Standalone HTML demo
├── static-server.js             # Server để serve HTML demo
└── README_REFRESH_TOKEN.md      # File này
```

## Kết luận
Demo này thể hiện hoàn chỉnh cơ chế refresh token tự động, giúp duy trì session người dùng một cách an toàn và mượt mà mà không cần user phải login lại khi access token hết hạn.