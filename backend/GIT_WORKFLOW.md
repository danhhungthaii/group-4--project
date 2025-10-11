# GIT WORKFLOW & BRANCH MANAGEMENT

## 🌳 **Branch Structure:**

```
main (production branch)
├── backend-auth        ✅ Authentication system
├── backend-admin       ✅ Admin management  
├── backend-profile     ✅ Profile management
└── backend-advanced    🔄 Advanced features (in backend-auth)
```

## 🔄 **Git Workflow Process:**

### **1. Feature Development:**
```bash
# Tạo nhánh mới từ main
git checkout main
git pull origin main
git checkout -b feature-name

# Develop and commit
git add .
git commit -m "feat: Add feature description"

# Push lên remote
git push -u origin feature-name
```

### **2. Pull Request Process:**
1. **Create PR** từ feature branch → main
2. **Code Review** bởi team members
3. **Test** tính năng hoạt động
4. **Merge** vào main khi approved

### **3. Conventional Commits:**
```bash
feat: Thêm tính năng mới
fix: Sửa lỗi  
docs: Cập nhật tài liệu
style: Formatting, missing semi colons, etc
refactor: Code refactoring
test: Thêm tests
chore: Build process, dependencies
```

## 📋 **Current Branches Status:**

### ✅ **backend-auth** 
- **Status**: Pushed to GitHub
- **Features**: 
  - JWT Authentication (signup, login, logout)
  - Password hashing with bcrypt
  - Auth middleware
  - Advanced features (forgot/reset password, avatar upload)
- **Files**: 
  - `controllers/authController.js`
  - `controllers/advancedController.js`
  - `routes/auth.js`
  - `routes/advanced.js`
  - `middleware/auth.js`
  - `services/emailService.js`

### ✅ **backend-admin**
- **Status**: Pushed to GitHub  
- **Features**:
  - RBAC (Role-Based Access Control)
  - User management for admins
  - User statistics
  - Admin creation script
- **Files**:
  - `controllers/userController.js`
  - `middleware/rbac.js`
  - `routes/user.js`
  - `scripts/createAdmin.js`

### ✅ **backend-profile**
- **Status**: Pushed to GitHub
- **Features**:
  - Profile view and update
  - Password change
  - User settings management
- **Files**:
  - `controllers/profileController.js`
  - `routes/profile.js`

## 🔗 **GitHub Links:**

- **Main Repository**: https://github.com/danhhungthaii/group-4--project
- **Backend-Auth PR**: https://github.com/danhhungthaii/group-4--project/pull/new/backend-auth
- **Backend-Admin PR**: https://github.com/danhhungthaii/group-4--project/pull/new/backend-admin  
- **Backend-Profile PR**: https://github.com/danhhungthaii/group-4--project/pull/new/backend-profile

## 📝 **Next Steps:**

### **1. Create Pull Requests:**
- Tạo PR từ mỗi feature branch vào main
- Thêm description chi tiết cho mỗi PR
- Request review từ team members

### **2. Code Review Process:**
- Review code quality
- Test functionality
- Check for conflicts
- Approve và merge

### **3. Merge Strategy:**
- **Squash and merge** để giữ history sạch
- **Delete branch** sau khi merge
- **Update main** và pull latest changes

## 🛠️ **Commands Reference:**

### **Branch Management:**
```bash
# Xem tất cả branches
git branch -a

# Chuyển branch
git checkout branch-name

# Tạo branch mới
git checkout -b new-branch

# Xóa branch local
git branch -d branch-name

# Xóa branch remote
git push origin --delete branch-name
```

### **Sync với Remote:**
```bash
# Pull latest từ main
git checkout main
git pull origin main

# Update feature branch với main
git checkout feature-branch
git merge main

# Push changes
git push origin feature-branch
```

## ✅ **Best Practices Applied:**

1. **Feature Branching**: Mỗi tính năng một nhánh riêng
2. **Conventional Commits**: Commit messages theo chuẩn
3. **Code Organization**: Files được tổ chức theo chức năng
4. **Documentation**: Tài liệu đầy đủ cho mỗi API
5. **Security**: JWT, RBAC, input validation
6. **Error Handling**: Comprehensive error responses