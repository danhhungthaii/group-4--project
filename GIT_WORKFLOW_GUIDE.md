# 🌿 GIT WORKFLOW - QUẢN LÝ NHÁNH & PULL REQUEST

## 📋 TỔNG QUAN Dự ÁN

**Repository:** `group-4--project`  
**Owner:** `danhhungthaii`  
**Main Branch:** `main`  

### 🎯 VAI TRÒ SINH VIÊN 3
- **Quản lý Pull Request** 
- **Review code** từ các feature branches
- **Merge** các PR vào main branch
- **Quản lý Git workflow** cho toàn team

## 🌳 CẤU TRÚC BRANCHES

### Main Branches
- `main` - Production branch chính
- `Database` - Legacy database branch

### Feature Branches  
- `backend-auth` - Authentication backend features
- `backend-admin` - Admin panel backend  
- `frontend-auth` - Authentication frontend UI
- `frontend-profile` - Profile management frontend
- `database-auth` - Database authentication setup

### Legacy Branches
- `backend` - General backend development
- `frontend` - General frontend development  
- `backend-profile` - Profile backend features

## 🔄 QUY TRÌNH WORKFLOW

### 1. Phát triển Feature
```bash
# Developer checkout feature branch
git checkout backend-auth
git pull origin backend-auth

# Làm việc trên feature
# ... code changes ...

# Commit changes
git add .
git commit -m "feat: thêm tính năng authentication"

# Push lên remote
git push origin backend-auth
```

### 2. Tạo Pull Request
```bash
# Tự động tạo PR link khi push branch mới
# Hoặc tạo manual tại GitHub:
# https://github.com/danhhungthaii/group-4--project/compare
```

### 3. Review Process (Sinh viên 3)
- **Kiểm tra code quality**
- **Test functionality** 
- **Verify documentation**
- **Check conflicts** với main branch
- **Approve hoặc Request changes**

### 4. Merge Process
```bash
# Sinh viên 3 thực hiện merge
git checkout main
git pull origin main
git merge backend-auth
git push origin main

# Hoặc sử dụng GitHub UI để merge PR
```

## 🛠️ LỆNH GIT CƠ BẢN

### Quản lý Branches
```bash
# Xem tất cả branches
git branch -a

# Tạo branch mới
git checkout -b feature-name

# Chuyển đổi branch
git checkout branch-name

# Xóa branch local
git branch -d branch-name

# Xóa branch remote
git push origin --delete branch-name
```

### Sync với Remote
```bash
# Fetch tất cả branches
git fetch origin

# Pull latest changes
git pull origin branch-name

# Push branch
git push origin branch-name

# Set upstream cho branch mới
git push -u origin new-branch
```

### Merge & Conflicts
```bash
# Merge branch vào current branch
git merge source-branch

# Xem merge conflicts
git status

# Resolve conflicts manually rồi:
git add .
git commit -m "resolve: merge conflicts"

# Abort merge nếu cần
git merge --abort
```

## 📝 QUY CHUẨN COMMIT

### Commit Message Format
```
<type>(<scope>): <description>

<body>

<footer>
```

### Commit Types
- `feat:` - Tính năng mới
- `fix:` - Sửa lỗi
- `docs:` - Cập nhật documentation
- `style:` - Format code (không thay đổi logic)
- `refactor:` - Refactor code
- `test:` - Thêm tests
- `chore:` - Maintenance tasks

### Ví dụ:
```bash
feat(auth): thêm reset password với email verification

- Tích hợp Cloudinary cho upload avatar
- Email service với HTML templates
- Password reset tokens với expiration
- API endpoints cho forgot/reset password

Closes #123
```

## 🔍 PULL REQUEST TEMPLATE

### Tạo PR Description
```markdown
## 📋 Mô tả thay đổi
Brief description của những gì được thay đổi

## ✅ Checklist
- [ ] Code đã được test
- [ ] Documentation đã cập nhật  
- [ ] Không có breaking changes
- [ ] Code style đúng chuẩn

## 🧪 Testing
Describe how to test changes

## 📸 Screenshots (nếu có UI changes)
Include screenshots

## 🔗 Related Issues
Closes #issue_number
```

## 🎯 WORKFLOW CHO SINH VIÊN 3

### Daily Tasks
1. **Kiểm tra PRs mới**
   ```bash
   # Check GitHub notifications
   # Review pending PRs
   ```

2. **Review Code**
   - Đọc code changes
   - Test locally nếu cần
   - Comment feedback
   - Approve hoặc request changes

3. **Merge PRs**
   ```bash
   git checkout main
   git pull origin main
   git merge feature-branch
   git push origin main
   
   # Hoặc merge via GitHub UI
   ```

4. **Cleanup Branches**
   ```bash
   # Xóa merged branches
   git branch -d merged-branch
   git push origin --delete merged-branch
   ```

### Weekly Tasks
- **Sync tất cả branches**
- **Update documentation**
- **Review workflow effectiveness**
- **Backup repository**

## 🚨 QUY TẮC & BẢO MẬT

### Branch Protection
- **Main branch** được bảo vệ
- **Require PR review** trước khi merge
- **No direct push** to main branch
- **Status checks** must pass

### Code Review Guidelines
1. **Functionality** - Code hoạt động đúng
2. **Performance** - Không impact performance  
3. **Security** - Không có security issues
4. **Style** - Follow coding standards
5. **Documentation** - Đầy đủ comments & docs

### Emergency Procedures
```bash
# Rollback nếu cần
git revert commit-hash
git push origin main

# Hotfix cho production
git checkout -b hotfix/urgent-fix
# ... fix code ...
git commit -m "hotfix: urgent production fix"
git push origin hotfix/urgent-fix
# Create immediate PR for review
```

## 📊 MONITORING & METRICS

### Branch Status
```bash
# Kiểm tra ahead/behind status
git status

# Compare branches
git log main..feature-branch

# See branch relationships
git show-branch
```

### Repository Health
- **Open PRs count**
- **Merge frequency** 
- **Code review turnaround**
- **Conflict resolution time**

## 🎉 BEST PRACTICES

### For Developers
- **Small, focused commits**
- **Descriptive commit messages**
- **Regular sync with main**
- **Test before pushing**

### For Reviewers (Sinh viên 3)
- **Timely reviews** (trong 24h)
- **Constructive feedback**
- **Test critical changes**
- **Document decisions**

### For Team
- **Communicate early** về breaking changes
- **Update documentation** cùng với code
- **Use Issues** để track bugs/features
- **Regular team sync** về workflow

---

## 🔗 QUICK LINKS

- **Repository:** https://github.com/danhhungthaii/group-4--project
- **Open PRs:** https://github.com/danhhungthaii/group-4--project/pulls
- **Issues:** https://github.com/danhhungthaii/group-4--project/issues
- **Actions:** https://github.com/danhhungthaii/group-4--project/actions

**Sinh viên 3 - Git Workflow Manager** 🎯