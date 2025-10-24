# Hướng dẫn Deploy Frontend React lên Vercel

## Bước 1: Push code lên GitHub ✅
Code đã được push lên branch `feature/redux-protected` thành công!

## Bước 2: Truy cập Vercel và tạo project mới

1. **Truy cập https://vercel.com**
2. **Đăng nhập bằng GitHub account**
3. **Chọn "New Project"**
4. **Import repository:**
   - Tìm repository `group-4--project`
   - Chọn branch `feature/redux-protected`
   - Click "Import"

## Bước 3: Cấu hình build settings

Vercel sẽ tự động detect React app, nhưng hãy kiểm tra:

- **Framework Preset**: Create React App (React)
- **Root Directory**: `frontend/` 
- **Build Command**: `npm run build`
- **Output Directory**: `build`

## Bước 4: Thêm biến môi trường

Trong Vercel project settings, thêm Environment Variables:

```
REACT_APP_API_BASE_URL = https://your-backend-api.com/api
```

**Lưu ý**: 
- Phải có prefix `REACT_APP_`
- Cần có `/api` ở cuối nếu backend yêu cầu
- Ví dụ: `https://api.example.com/api`

## Bước 5: Deploy

1. Click **"Deploy"**
2. Đợi build hoàn thành (2-3 phút)
3. Vercel sẽ tạo domain: `https://tên-project.vercel.app`

## Bước 6: Kiểm tra kết quả

1. **Mở URL Vercel**
2. **Test tính năng login** với:
   - Email: `admin@test.com`
   - Password: `password123`
3. **Kiểm tra Network tab** để đảm bảo API calls đi đúng backend

## Lưu ý quan trọng

- **Backend API phải allow CORS** từ domain Vercel
- **Backend phải deployed** và accessible từ internet
- **File `vercel.json`** đã được thêm để support SPA routing
- **Environment variables** đã được setup trong code

## Troubleshooting

- Nếu build fail: kiểm tra dependencies trong `package.json`
- Nếu API không work: kiểm tra `REACT_APP_API_BASE_URL`
- Nếu routing không work: đảm bảo `vercel.json` có SPA fallback

## Kết quả mong đợi
🎉 **Frontend React app chạy trên domain Vercel với full functionality Redux + Protected Routes!**