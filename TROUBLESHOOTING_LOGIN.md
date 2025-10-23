# 🛠️ TROUBLESHOOTING LOGIN ISSUES

## ❓ **"Đăng nhập thất bại" - Các nguyên nhân & giải pháp**

### 🔍 **1. Kiểm tra Rate Limiting**
**Triệu chứng:** Too many login attempts
**Giải pháp:**
```bash
# Restart server để reset rate limiting
cd "d:\dihoc\GitThuchanh\buoi5\group-4--project"
# Ctrl+C để stop server hiện tại
node simple-activity-logs-server.js
```

### 🔑 **2. Verify Password Hash**
**Kiểm tra:**
```bash
node debug-auth.js
# Kết quả phải là: ✅ BCrypt compare result: true
```

### 🌐 **3. Test API Trực Tiếp**
**Quick Test Page:**
- Mở: http://localhost:5002/quick-login-test.html
- Click "Quick Admin Test"
- Xem kết quả

### 📊 **4. Server Logs Debugging**
**Kiểm tra logs:** 
```
🔐 Login attempt: admin@test.com from ::1
📝 Activity logged: LOGIN_SUCCESS - ::1 - Success: true
```
- **LOGIN_SUCCESS** = OK ✅
- **LOGIN_FAILED** = Có vấn đề ❌

### 🚫 **5. Common Issues:**

#### **Rate Limited:**
```
🚫 Login rate limit exceeded for IP: ::1
```
**Fix:** Restart server

#### **Wrong Password:**
```
🔐 Login attempt: admin@test.com from ::1
📝 Activity logged: LOGIN_FAILED - ::1 - Success: false
```
**Fix:** Đảm bảo password = "password123" (case sensitive)

#### **Wrong Email:**
```
📝 Activity logged: LOGIN_FAILED - ::1 - Success: false
```
**Fix:** Đảm bảo email = "admin@test.com" hoặc "user@test.com"

### 🧪 **Quick Test Steps:**

1. **Clear localStorage:**
```javascript
localStorage.clear()
```

2. **Test with correct credentials:**
```
Email: admin@test.com
Password: password123
```

3. **Check Network tab:**
- F12 → Network
- Xem response của /api/auth/login
- Status code 200 = OK, 401 = Unauthorized

### ✅ **Working Test Accounts:**
| Role | Email | Password | Expected Result |
|------|-------|----------|------------------|
| Admin | admin@test.com | password123 | ✅ Login + Token |
| User | user@test.com | password123 | ✅ Login + Token |

### 🔧 **Emergency Fix:**
Nếu vẫn không work, restart cả 2 servers:

```bash
# Terminal 1: Stop và restart backend
Ctrl+C
node simple-activity-logs-server.js

# Terminal 2: Stop và restart React
Ctrl+C  
npm start
```

### 📞 **Debug Commands:**
```bash
# Test password hash
node debug-auth.js

# Manual API test
# Mở http://localhost:5002/quick-login-test.html

# Check server status
# http://localhost:5002/redux-protected-demo.html
```

**🎯 Nếu tất cả đều fail, có thể là vấn đề CORS hoặc network. Kiểm tra browser console!**