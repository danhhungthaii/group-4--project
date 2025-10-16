# ✅ Quick Test Checklist - Demo Refresh Token

## 🔥 CÁC BƯỚC TEST QUAN TRỌNG

### Step 1: Khởi động Demo
```bash
# Terminal 1
cd backend && node server-simple.js

# Terminal 2  
node static-server.js

# Browser
http://localhost:3001/demo-refresh-token.html
```

### Step 2: Test Login 📸 **CHỤP #1**
- Username: `admin`
- Password: `password123`
- Click "Login"
- **CHỤP**: Tokens hiển thị + Activity logs

### Step 3: Test API Call 📸 **CHỤP #2** 
- Click "Test API Call (Get Profile)"
- **CHỤP**: Profile data + Success logs

### Step 4: Simulate Token Expiry 📸 **CHỤP #3**
- Click "Simulate Token Expiry"
- **CHỤP**: Warning logs + Access token = "Not available"

### Step 5: Auto-Refresh Magic 📸 **CHỤP #4 - QUAN TRỌNG NHẤT**
- Click "Test API Call (Get Profile)" lại
- **CHỤP**: Auto-refresh logs sequence:
  ```
  🔍 Making API call to get profile...
  🔄 Access token expired, refreshing...
  ✅ Token refreshed successfully  
  🔑 New Access Token: eyJ...
  ✅ Profile fetched successfully
  ```

### Step 6: Network Tab 📸 **CHỤP #5**
- F12 → Network tab
- **CHỤP**: 3 requests:
  1. profile → 401
  2. refresh → 200  
  3. profile → 200

## 🎯 KEY DEMO POINTS

### Phải nhấn mạnh:
1. **"Tự động"** - User không cần làm gì
2. **"Trong suốt"** - UX không bị gián đoạn  
3. **"An toàn"** - Token có thời hạn
4. **"Thông minh"** - Retry failed requests

### Câu nói demo:
- "Khi token hết hạn, hệ thống TỰ ĐỘNG refresh"
- "User KHÔNG HỀ BIẾT quá trình này diễn ra"  
- "Request được RETRY với token mới"
- "UX hoàn toàn MƯỢT MÀ, không có gián đoạn"

## 📱 Screenshots cần có:

| # | Mô tả | Quan trọng | Nội dung chính |
|---|-------|------------|----------------|
| 1 | Login success | 🔴 Bắt buộc | Tokens + user info |
| 2 | API call success | 🔴 Bắt buộc | Profile data |  
| 3 | Token expiry | 🟡 Quan trọng | Warning logs |
| 4 | **Auto-refresh** | 🔴 **SIÊU QUAN TRỌNG** | **Refresh sequence** |
| 5 | Network requests | 🟡 Quan trọng | 401→refresh→200 |

## ⚡ Quick Commands

### Restart demo:
```bash
# Ctrl+C in both terminals, then:
cd backend && node server-simple.js
node static-server.js
```

### Clear browser:
- F12 → Application → Storage → Clear storage
- Refresh page (F5)

### Test URLs:
- Demo: http://localhost:3001/demo-refresh-token.html
- API: http://localhost:5000
- Health: http://localhost:5000/ (should show "✅ Backend API đang hoạt động!")

## 🎬 30-Second Demo Script:

1. **[5s]** "Đây là demo frontend tự động refresh token"
2. **[5s]** Login → "Nhận access token 15 phút và refresh token 7 ngày"  
3. **[5s]** API call → "Token hợp lệ, API thành công"
4. **[5s]** Simulate → "Giả lập token hết hạn"
5. **[10s]** Auto-refresh → "MAGIC! Tự động refresh và retry - user không biết gì!"

**Kết thúc:** "Đây là cách duy trì session mượt mà!"