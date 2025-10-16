# Manual Test Guide - Refresh Token Demo

## 🚀 Trạng thái hiện tại
- ✅ Backend API Server: http://localhost:5000 (RUNNING)
- ✅ Static Server: http://localhost:3001 (RUNNING)  
- ✅ Demo Page: http://localhost:3001/demo-refresh-token.html (OPENED)

## 🧪 Test Scenarios

### Test 1: Login Process
**Steps:**
1. Trên demo page, sử dụng credentials mặc định:
   - Username: `admin`
   - Password: `password123`
2. Click "Login" button

**Expected Result:**
- ✅ Login form biến mất
- ✅ User info hiển thị: "Welcome, admin! (Admin)"
- ✅ Access Token và Refresh Token được hiển thị
- ✅ Activity log shows: "✅ Login successful for admin"
- ✅ Tokens được lưu vào localStorage

### Test 2: Protected API Call
**Steps:**
1. Click "Test API Call (Get Profile)" button

**Expected Result:**
- ✅ API call thành công 
- ✅ Profile data hiển thị trong "Profile Data" section
- ✅ Activity log shows: "✅ Profile fetched successfully"
- ✅ Response chứa user info (id, username, email, role)

### Test 3: Token Expiry Simulation
**Steps:**
1. Click "Simulate Token Expiry" button
2. Sau đó click "Test API Call (Get Profile)" lại

**Expected Result:**
- ✅ Log shows: "⚠️ Simulated access token expiry"
- ✅ Log shows: "🔄 Next API call will trigger automatic token refresh"
- ✅ Khi gọi API: "🔄 Access token expired, refreshing..."
- ✅ Log shows: "✅ Token refreshed successfully"
- ✅ API call thành công sau khi refresh
- ✅ Access token mới được cập nhật

### Test 4: Manual Refresh
**Steps:**
1. Click "Manual Refresh" button

**Expected Result:**
- ✅ Log shows: "🔄 Manually refreshing token..."
- ✅ Log shows: "✅ Token refreshed successfully"
- ✅ Access token được cập nhật với token mới

### Test 5: Multiple API Calls During Refresh
**Steps:**
1. Click "Simulate Token Expiry" 
2. Nhanh chóng click "Test API Call" nhiều lần

**Expected Result:**
- ✅ Chỉ có 1 refresh request được gửi
- ✅ Các request khác được queue
- ✅ Tất cả requests thành công sau khi có token mới
- ✅ Logs không có duplicate refresh calls

### Test 6: Logout Process
**Steps:**
1. Click "Logout" button

**Expected Result:**
- ✅ User info section biến mất
- ✅ Login form xuất hiện lại
- ✅ Auth status: "Not logged in"
- ✅ Log shows: "✅ Logged out successfully"
- ✅ localStorage được xóa sạch

## 🔍 Debugging Checklist

### Browser Developer Tools
1. **Console Tab**: Kiểm tra errors và logs
2. **Network Tab**: Xem API requests/responses
3. **Application Tab > Local Storage**: Kiểm tra tokens
4. **Application Tab > Local Storage**: 
   - `accessToken`: JWT string
   - `refreshToken`: JWT string  
   - `user`: JSON object với user info

### API Endpoints Test
**Backend Health Check:**
```
GET http://localhost:5000/
Response: "✅ Backend API đang hoạt động!"
```

**Login Test:**
```
POST http://localhost:5000/api/auth/login
Body: {"username":"admin","password":"password123"}
Expected: 200 + tokens
```

**Profile Test (with token):**
```
GET http://localhost:5000/api/auth/profile  
Header: Authorization: Bearer <access_token>
Expected: 200 + user profile
```

## 🎯 Success Criteria

### ✅ All Tests Pass When:
1. Login hoạt động và lưu tokens
2. Protected API calls hoạt động với valid token
3. Token expiry được phát hiện và tự động refresh
4. New token được sử dụng cho subsequent requests
5. Manual refresh hoạt động
6. Multiple concurrent requests được handle đúng
7. Logout xóa tokens và reset state

### ❌ Common Issues:
1. **CORS Error**: Backend CORS settings
2. **401 Unauthorized**: Token format hoặc expiry
3. **Network Error**: Server not running
4. **Infinite Refresh**: Invalid refresh token logic

## 📊 Performance Metrics

### Token Timing:
- **Access Token**: 15 minutes lifetime
- **Refresh Token**: 7 days lifetime
- **Auto-refresh**: Triggered on 401 error
- **Queue Processing**: All failed requests retry với new token

### Expected Response Times:
- Login: < 500ms
- Profile API: < 200ms  
- Refresh Token: < 300ms
- Logout: < 200ms

## 🎉 Demo Complete!

Nếu tất cả tests đều pass, nghĩa là frontend auto-refresh token mechanism đã hoạt động hoàn hảo!

**Next Steps:**
- Integrate vào production app
- Add error handling cho edge cases
- Implement secure token storage
- Add refresh token rotation
- Monitor token usage analytics