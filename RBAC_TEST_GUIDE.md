# 🔐 RBAC Demo Test Guide - Role-Based Access Control

## 🎯 Mục tiêu Demo
Chứng minh Frontend hiển thị **chức năng khác nhau theo role** của user (Admin, Moderator, User).

## 🚀 Setup Demo

### 1. Servers Required
```bash
# Terminal 1: RBAC Backend Server
node backend/server-rbac.js
# ✅ Port 5000 - RBAC endpoints

# Terminal 2: Static Server (if using HTML demo)
node static-server.js  
# ✅ Port 3001 - Static files
```

### 2. Demo URLs
- **HTML Demo**: http://localhost:3001/demo-rbac.html
- **React Demo**: http://localhost:3000/rbac-demo
- **API Server**: http://localhost:5000

## 👥 Test Accounts & Permissions

### 🔴 **Admin Account** (Full Access)
- **Credentials**: admin / password123
- **Permissions**: 
  - VIEW_DASHBOARD, MANAGE_USERS, CREATE_USER, UPDATE_USER, DELETE_USER
  - VIEW_USERS, VIEW_ANALYTICS, MANAGE_SETTINGS, VIEW_LOGS, EXPORT_DATA
  - VIEW_PROFILE, UPDATE_PROFILE
- **UI Features**:
  - ✅ Dashboard with stats
  - ✅ User Management (Full CRUD)
  - ✅ Create new users
  - ✅ Delete users
  - ✅ Analytics charts
  - ✅ Settings management
  - ✅ Profile access

### 🟡 **Moderator Account** (Limited Management)
- **Credentials**: moderator / password456
- **Permissions**:
  - VIEW_DASHBOARD, VIEW_USERS, UPDATE_USER, VIEW_ANALYTICS
  - VIEW_PROFILE, UPDATE_PROFILE
- **UI Features**:
  - ✅ Dashboard with stats
  - ✅ User Management (View/Edit only)
  - ❌ Cannot create users
  - ❌ Cannot delete users
  - ✅ Analytics charts
  - ❌ No settings access
  - ✅ Profile access

### 🔵 **User Account** (Basic Access)
- **Credentials**: user1 / password789
- **Permissions**:
  - VIEW_PROFILE, UPDATE_PROFILE
- **UI Features**:
  - ❌ No dashboard access
  - ❌ No user management
  - ❌ No analytics
  - ❌ No settings
  - ✅ Profile access only
  - ⚠️ Access Denied message for other features

## 📸 SCREENSHOTS CẦN CHỤP

### **Screenshot 1: Account Selection** 🔴 **BẮT BUỘC**
**Chụp gì:** Trang login với 3 account cards
**Nội dung:**
- 3 account cards: Admin (red), Moderator (yellow), User (gray)  
- Permissions badges hiển thị cho mỗi role
- Login form

### **Screenshot 2: Admin Dashboard** 🔴 **BẮT BUỘC**
**Thao tác:** Login as admin
**Chụp gì:** Dashboard đầy đủ chức năng
**Nội dung:**
- User header với admin avatar và permissions
- Dashboard stats (4 stat cards)
- User Management với Create User form
- Analytics section
- Settings section (Admin only)
- Profile section

### **Screenshot 3: Moderator Dashboard** 🔴 **BẮT BUỘC**  
**Thao tác:** Logout → Login as moderator
**Chụp gì:** Dashboard bị giới hạn
**Nội dung:**
- User header với moderator avatar
- Dashboard stats
- User Management WITHOUT Create User form
- Analytics section
- NO Settings section
- Profile section

### **Screenshot 4: User Dashboard** 🔴 **BẮT BUỘC**
**Thao tác:** Logout → Login as user1
**Chụp gì:** Dashboard tối thiểu
**Nội dung:**
- User header với user avatar
- "Access Denied" message
- ONLY Profile section visible
- NO other features

### **Screenshot 5: Permission Test** 🟡 **QUAN TRỌNG**
**Thao tác:** Try creating user as Moderator
**Chụp gì:** Permission denied trong Activity Logs
**Nội dung:**
- Activity log: "❌ Access denied: CREATE_USER permission required"

## 🧪 Test Scenarios Chi Tiết

### **Test 1: Admin Full Access**
1. Login as admin/password123
2. Verify all sections visible:
   - Dashboard ✅
   - User Management ✅ (with Create form)
   - Analytics ✅
   - Settings ✅ 
   - Profile ✅
3. Test create new user:
   - Fill form: username=test1, email=test@test.com, etc.
   - Click Create User
   - Verify success log + user appears in list
4. Test delete user:
   - Click Delete on any user
   - Verify success log + user removed

### **Test 2: Moderator Limited Access**
1. Logout and login as moderator/password456
2. Verify limited sections:
   - Dashboard ✅
   - User Management ✅ (NO Create form)
   - Analytics ✅
   - Settings ❌ (hidden)
   - Profile ✅
3. Try to create user (should fail - no form)
4. Try to delete user (no delete buttons)

### **Test 3: User Minimal Access**
1. Logout and login as user1/password789
2. Verify minimal access:
   - Dashboard ❌ (hidden)
   - User Management ❌ (hidden)
   - Analytics ❌ (hidden)
   - Settings ❌ (hidden)
   - Profile ✅ (only section)
   - Access Denied message ✅

### **Test 4: API Permission Validation**
1. Login as any role
2. Check Activity Logs for API calls
3. Verify logs show appropriate permissions:
   - Admin: All API calls succeed
   - Moderator: Limited API calls
   - User: Profile API only

## 📊 Expected UI Differences

### Layout Comparison:
```
ADMIN VIEW:
┌─ User Header (Admin) ─┐
├─ Dashboard Stats     ─┤
├─ User Mgmt (CRUD)    ─┤  
├─ Analytics           ─┤
├─ Settings (Admin)    ─┤
└─ Profile             ─┘

MODERATOR VIEW:
┌─ User Header (Mod)   ─┐
├─ Dashboard Stats     ─┤
├─ User Mgmt (R/U)     ─┤  
├─ Analytics           ─┤
└─ Profile             ─┘

USER VIEW:
┌─ User Header (User)  ─┐
├─ Access Denied Msg   ─┤
└─ Profile             ─┘
```

## 🎤 Presentation Script (3 phút)

### **Intro (20s)**
"Demo RBAC - Role-Based Access Control. Cùng một ứng dụng nhưng hiển thị giao diện HOÀN TOÀN KHÁC NHAU tùy theo role của user."

### **Admin Demo (60s)**  
"Đầu tiên login as Admin - role cao nhất. Admin có FULL ACCESS: Dashboard với stats, User Management có thể CRUD users, Analytics, và Settings chỉ Admin mới thấy được."

### **Moderator Demo (60s)**
"Bây giờ logout và login as Moderator. Thấy ngay UI đã THAY ĐỔI: Dashboard và Analytics vẫn có, User Management chỉ được xem và sửa, KHÔNG thể tạo user mới, và Settings đã biến mất."

### **User Demo (40s)**  
"Cuối cùng login as User thông thường. UI cực kỳ đơn giản: CHỈ có Profile, tất cả features khác đều bị ẩn, có Access Denied message."

### **Technical Points (20s)**
"Đây là RBAC thực thụ: Backend API có permission middleware, Frontend component conditionally render dựa trên user permissions."

## 🔍 Debug Points

### Activity Logs phải thấy:
- Login successful với permissions list
- API calls success/failure based on role
- Permission denied messages for unauthorized actions

### Network Tab phải thấy:
- `/api/auth/login` → 200 with user permissions
- `/api/dashboard` → 200 (Admin/Mod) hoặc 403 (User)
- `/api/users` → 200 (Admin/Mod) hoặc 403 (User)  
- `/api/settings` → 200 (Admin) hoặc 403 (Mod/User)

## ✅ Success Criteria

### Demo thành công khi:
1. **3 roles hiển thị UI hoàn toàn khác nhau**
2. **Permissions được enforce ở cả Frontend và Backend**
3. **Unauthorized actions bị block với clear messages**
4. **Activity logs cho thấy permission checks**
5. **UI components appear/disappear based on role**

## 🚨 Common Issues

### Potential Problems:
- **Same UI for different roles** → Check hasPermission() logic
- **API 403 errors** → Verify middleware permissions  
- **Missing UI sections** → Check conditional rendering
- **No permission logs** → Verify API responses include permissions

## 🎯 Key Demo Messages

### Highlight Points:
1. **"Cùng 1 app, 3 giao diện khác nhau"**
2. **"Security ở cả Frontend lẫn Backend"**  
3. **"User experience được tối ưu theo role"**
4. **"Scalable cho nhiều roles và permissions"**

**🏆 RBAC Demo hoàn hảo khi audience thấy rõ sự khác biệt UI giữa các roles!**