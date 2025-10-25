# 🚀 REDUX & PROTECTED ROUTES TEST GUIDE
## Hoạt động 6 - Frontend Redux & Protected Routes

### 📋 **Tổng quan**
- **Mục tiêu:** Quản lý state nâng cao với Redux, chặn truy cập trang nếu chưa đăng nhập
- **Yêu cầu:** Redux Toolkit, store auth, Protected Routes (/profile, /admin), Redux thunk gọi API
- **Git:** `git commit -m "Thêm Redux và Protected Routes"` + `git push origin feature/redux-protected`

---

## 🏗️ **Architecture Implemented**

### **Redux Store Structure**
```
src/store/
├── index.js                    # Store configuration
└── slices/
    └── authSlice.js            # Auth state management
```

### **Components Created**
```
src/
├── components/
│   └── ProtectedRoute.jsx      # Route protection
├── pages/
│   ├── LoginPage.jsx           # Login form
│   ├── ProfilePage.jsx         # User profile (protected)
│   └── AdminPage.jsx           # Admin dashboard (admin only)
└── styles/
    └── redux-protected.css     # Modern styling
```

---

## 🧪 **Testing Instructions**

### **1. Khởi động servers**
```bash
# Terminal 1: Backend API Server
cd "d:\dihoc\GitThuchanh\buoi5\group-4--project"
node simple-activity-logs-server.js
# ➡️ Server chạy tại: http://localhost:5002

# Terminal 2: React Frontend
cd "d:\dihoc\GitThuchanh\buoi5\group-4--project\frontend"
npm start
# ➡️ React app chạy tại: http://localhost:3000
```

### **2. Test Authentication Flow**

#### **🔓 Login Test**
1. Mở: http://localhost:3000
2. Tự động redirect đến `/login`
3. Đăng nhập với:
   - **Admin:** admin@test.com / password123
   - **User:** user@test.com / password123
4. Sau login → redirect đến `/profile`

#### **👤 Profile Access Test**
1. Sau khi login thành công
2. URL tự động chuyển đến `/profile`
3. Xem thông tin user profile
4. Test nút "Đăng xuất"

#### **👑 Admin Access Test**
1. Login với admin account
2. Trong profile page, click "Trang Admin"
3. Truy cập `/admin` dashboard
4. Xem user management table
5. Thử các action buttons

#### **🚫 Unauthorized Access Test**
1. **Logout test:**
   - Click "Đăng xuất" 
   - Redirect về `/login`
   
2. **Direct URL access:**
   - Thử truy cập `/profile` khi chưa login
   - Tự động redirect về `/login`
   
3. **Role-based access:**
   - Login với user account
   - Thử truy cập `/admin`
   - Hiển thị "Truy cập bị từ chối"

---

## 🔑 **Test Accounts**

| Role | Email | Password | Access |
|------|-------|----------|---------|
| **👑 Admin** | admin@test.com | password123 | `/profile`, `/admin` |
| **👤 User** | user@test.com | password123 | `/profile` only |

---

## 🎯 **Expected Behaviors**

### **Redux State Management**
- ✅ Login action cập nhật state
- ✅ Token lưu vào localStorage
- ✅ Auto fetch user profile
- ✅ Logout clear state và token

### **Protected Routes**
- ✅ Chặn truy cập khi chưa login
- ✅ Role-based access control
- ✅ Loading states khi check auth
- ✅ Proper redirect flows

### **UI Components**
- ✅ Login form với validation
- ✅ Profile page hiển thị user info
- ✅ Admin dashboard với user table
- ✅ Responsive design

---

## 📊 **API Endpoints Tested**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/login` | User authentication |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/auth/profile` | Get user profile |
| GET | `/api/logs/all` | Admin: Get activity logs |
| GET | `/api/logs/stats` | Admin: Get statistics |

---

## 🚀 **Demo Links**

1. **🖥️ React App:** http://localhost:3000
2. **🔗 Backend API:** http://localhost:5002
3. **📊 Demo Page:** http://localhost:5002/redux-protected-demo.html
4. **⚡ Rate Limiting Test:** http://localhost:5002/test-rate-limiting.html
5. **📈 Admin Logs:** http://localhost:5002/frontend/src/pages/admin-logs/index.html

---

## ✅ **Git Workflow Completed**

```bash
✅ git checkout -b feature/redux-protected
✅ git add .
✅ git commit -m "Thêm Redux và Protected Routes"
✅ git push origin feature/redux-protected
```

**Files Changed:** 11 files, 1765 insertions
- ✅ Redux store setup
- ✅ Auth slice with thunks
- ✅ Protected route component
- ✅ Login, Profile, Admin pages
- ✅ Modern CSS styling

---

## 🐛 **Troubleshooting**

### **React App không start**
```bash
cd frontend
npm install
npm start
```

### **Backend API lỗi**
- Kiểm tra port 5002 có bị chiếm không
- Restart server: `node simple-activity-logs-server.js`

### **Authentication issues**
- Clear localStorage: `localStorage.clear()`
- Check Network tab trong DevTools
- Verify JWT token format

---

## 🎉 **Success Criteria**

- [x] **Redux Toolkit** đã được cài đặt và config
- [x] **Auth slice** với login/logout/getUserProfile
- [x] **Protected Routes** cho `/profile` và `/admin`
- [x] **Role-based access** admin vs user
- [x] **API integration** với JWT tokens
- [x] **Git workflow** hoàn thành đúng yêu cầu

**🏆 Hoạt động 6 hoàn thành thành công!**