# 📸 Hướng dẫn Test và Chụp màn hình Demo Refresh Token

## 🎯 Mục tiêu Demo
Chứng minh frontend có thể **tự động refresh token** khi access token hết hạn mà user không biết.

## 🚀 Chuẩn bị Demo

### 1. Kiểm tra Server Status
```bash
# Terminal 1: Backend API Server
cd backend
node server-simple.js
# ✅ Phải thấy: "Server running at http://localhost:5000"

# Terminal 2: Static Server  
node static-server.js
# ✅ Phải thấy: "Static server running at http://localhost:3001"
```

### 2. Mở Demo Page
- URL: http://localhost:3001/demo-refresh-token.html
- Mở Developer Tools (F12) → Network tab để xem API calls

## 📸 CÁC PHẦN QUAN TRỌNG CẦN CHỤP

### **Screenshot 1: Initial State** 🔴 **BẮT BUỘC**
**Chụp gì:** Trang demo ban đầu với login form
**Nội dung:**
- Login form với username/password
- Activity logs trống hoặc "Ready to start demo..."
- Authentication Status: "Not logged in"

---

### **Screenshot 2: Login Success** 🔴 **BẮT BUỘC**
**Thao tác:** 
1. Nhập `admin` / `password123`
2. Click "Login"

**Chụp gì:** Sau khi login thành công
**Nội dung phải có:**
- ✅ User info: "Welcome, admin! (Admin)"
- ✅ Access Token hiển thị (dài ~150+ ký tự)
- ✅ Refresh Token hiển thị  
- ✅ Activity log: "✅ Login successful for admin"
- ✅ Activity log: "🔑 Access Token: eyJ..." 
- ✅ Activity log: "🔄 Refresh Token: eyJ..."

---

### **Screenshot 3: Protected API Call Success** 🔴 **BẮT BUỘC**
**Thao tác:** Click "Test API Call (Get Profile)"

**Chụp gì:** API call thành công với token hợp lệ
**Nội dung phải có:**
- ✅ Activity log: "🔍 Making API call to get profile..."
- ✅ Activity log: "✅ Profile fetched successfully"
- ✅ Profile Data section hiển thị JSON:
```json
{
  "id": 1,
  "username": "admin", 
  "email": "admin@example.com",
  "role": "Admin"
}
```

---

### **Screenshot 4: Token Expiry Simulation** 🟡 **QUAN TRỌNG**
**Thao tác:** Click "Simulate Token Expiry"

**Chụp gì:** Simulation token hết hạn
**Nội dung phải có:**
- ✅ Activity log: "⚠️ Simulated access token expiry"
- ✅ Activity log: "🔄 Next API call will trigger automatic token refresh"
- ✅ Access Token field hiển thị "Not available"

---

### **Screenshot 5: Auto-Refresh in Action** 🔴 **QUAN TRỌNG NHẤT**
**Thao tác:** Sau simulate expiry, click "Test API Call (Get Profile)" lại

**Chụp gì:** Quá trình auto-refresh diễn ra
**Nội dung phải có:**
- ✅ Activity log: "🔍 Making API call to get profile..."
- ✅ Activity log: "🔄 Access token expired, refreshing..."
- ✅ Activity log: "✅ Token refreshed successfully"
- ✅ Activity log: "🔑 New Access Token: eyJ..."
- ✅ Activity log: "✅ Profile fetched successfully"
- ✅ Access Token field cập nhật với token mới
- ✅ Profile data vẫn hiển thị đúng

**🎯 Screenshot này chứng minh AUTO-REFRESH hoạt động!**

---

### **Screenshot 6: Network Tab** 🟡 **QUAN TRỌNG**
**Chụp gì:** Developer Tools → Network tab
**Nội dung phải thấy:**
- Request 1: `POST /api/auth/profile` → 401 Unauthorized
- Request 2: `POST /api/auth/refresh` → 200 OK  
- Request 3: `POST /api/auth/profile` → 200 OK (với token mới)

**Này chứng minh backend flow hoạt động đúng!**

---

### **Screenshot 7: Manual Refresh** 🟡 **TUỲ CHỌN**
**Thao tác:** Click "Manual Refresh Token"

**Chụp gì:** Manual refresh thành công
**Nội dung:**
- ✅ Activity log: "🔄 Manually refreshing token..."
- ✅ Activity log: "✅ Token refreshed successfully"  
- ✅ Access Token cập nhật

---

### **Screenshot 8: Logout** 🟡 **TUỲ CHỌN**
**Thao tác:** Click "Logout"

**Chụp gì:** Logout và clear tokens
**Nội dung:**
- ✅ Quay về login form
- ✅ Activity log: "✅ Logged out successfully"
- ✅ Authentication Status: "Not logged in"

## 🎥 Video Demo Flow (Nếu có thể)

### Recommended Recording Sequence:
1. **Start**: Trang login
2. **Login**: Nhập credentials → Submit
3. **API Test**: Click test API → Success
4. **Simulate**: Click simulate expiry
5. **Auto-Refresh**: Click test API → Watch auto-refresh magic! ✨
6. **End**: Logout

**Thời gian video:** ~2-3 phút

## 📋 Checklist Demo Presentation

### Trước khi demo:
- [ ] Backend server đang chạy (port 5000)
- [ ] Static server đang chạy (port 3001) 
- [ ] Browser mở tại demo page
- [ ] Developer tools sẵn sàng (Network tab)
- [ ] Clear localStorage để demo sạch

### Trong khi demo:
- [ ] Giải thích từng bước đang làm gì
- [ ] Chỉ ra logs trong Activity section
- [ ] Highlight token changes
- [ ] Nhấn mạnh "automatic" nature của refresh

### Key Points để nhấn mạnh:
1. **"User không biết gì"** - Transparent UX
2. **"Tự động refresh"** - No manual intervention  
3. **"Request queue"** - Multiple calls handled properly
4. **"Secure"** - Tokens có expiry time

## 🎯 Presentation Script

### Mở đầu:
"Tôi sẽ demo cơ chế frontend tự động refresh token. Khi access token hết hạn, hệ thống sẽ tự động làm mới token mà user không hề biết."

### Login:
"Đầu tiên tôi login với tài khoản admin. Hệ thống trả về access token 15 phút và refresh token 7 ngày."

### API Call:
"Tôi test API call protected. Token còn hiệu lực nên request thành công bình thường."

### Token Expiry:
"Bây giờ tôi simulate token hết hạn để demo auto-refresh."

### Auto-Refresh Magic:
"Khi tôi call API lại, watch this magic! Token hết hạn → hệ thống tự động refresh → retry request → success! User không biết gì cả."

### Kết luận:
"Đây là cơ chế hoàn hảo để duy trì user session mà không làm gián đoạn UX."

## 🚨 Troubleshooting

### Nếu demo không hoạt động:
1. **Check servers**: `node simple-test.js`
2. **Clear cache**: Ctrl+Shift+Del
3. **Check console**: F12 → Console tab
4. **Restart servers**: Ctrl+C → restart

### Common Demo Failures:
- **CORS Error**: Backend chưa enable CORS
- **Network Error**: Server not running  
- **No refresh**: Logic error trong interceptor
- **Token not found**: localStorage issue

## 📊 Success Metrics

### Demo thành công khi:
- ✅ Login nhận được 2 tokens
- ✅ API call với valid token works
- ✅ Simulate expiry clears access token
- ✅ Subsequent API call triggers auto-refresh
- ✅ New token works for API calls
- ✅ Logs cho thấy full flow

**Quan trọng nhất: Screenshot 5 - Auto-refresh in action!**