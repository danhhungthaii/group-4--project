# HƯỚNG DẪN MERGE NHÁNH FRONTEND-PROFILE

## 🚨 Vấn đề hiện tại
- PowerShell terminal đang gặp lỗi ArgumentOutOfRangeException
- Console buffer overflow khiến không thể thực thi commands

## ✅ Profile Management đã hoàn thành
- ✅ Update Profile APIs và Frontend
- ✅ View Profile APIs và Frontend  
- ✅ Database testing
- ✅ Demo system hoạt động

## 📋 CÁC BƯỚC MERGE NHÁNH FRONTEND-PROFILE

### Cách 1: Sử dụng Command Prompt (CMD)
1. Mở Command Prompt (cmd.exe) thay vì PowerShell
2. Chuyển đến thư mục project:
   \`\`\`cmd
   cd c:\Users\danhh\group-4--project
   \`\`\`

3. Thực hiện commit:
   \`\`\`cmd
   git add .
   git commit -m "feat: Complete Profile Management System"
   \`\`\`

4. Kiểm tra branches hiện có:
   \`\`\`cmd
   git branch -a
   \`\`\`

5. Tạo và switch sang nhánh frontend-profile (nếu chưa có):
   \`\`\`cmd
   git checkout -b frontend-profile
   \`\`\`

6. Switch về nhánh Database:
   \`\`\`cmd
   git checkout Database
   \`\`\`

7. Merge frontend-profile vào Database:
   \`\`\`cmd
   git merge frontend-profile
   \`\`\`

### Cách 2: Sử dụng VS Code Git Interface
1. Mở VS Code
2. Sử dụng Source Control panel (Ctrl+Shift+G)
3. Stage all changes và commit
4. Sử dụng Command Palette (Ctrl+Shift+P)
5. Gõ "Git: Create Branch" để tạo frontend-profile
6. Gõ "Git: Checkout to" để switch branches
7. Gõ "Git: Merge Branch" để merge

### Cách 3: Restart Terminal
1. Đóng tất cả terminal hiện tại
2. Mở terminal mới
3. Chạy script merge-frontend-profile.bat

## 🎯 KẾT QUẢ MONG MUỐN
Sau khi merge thành công:
- Nhánh Database sẽ chứa tất cả Profile Management code
- Frontend-profile branch đã được merge
- Hoạt động 2 hoàn thành 100%

## 📝 VERIFICATION
Để xác nhận merge thành công:
\`\`\`cmd
git log --oneline -10
git status
\`\`\`

## 🚀 TIẾP TUC DEMO
Sau khi merge xong:
\`\`\`cmd
npm run demo     # Terminal 1
npm run frontend # Terminal 2
\`\`\`

Truy cập: http://localhost:3001/profile-management.html

---

**Lưu ý**: Vấn đề PowerShell buffer có thể được giải quyết bằng cách restart VS Code hoặc sử dụng CMD thay vì PowerShell.