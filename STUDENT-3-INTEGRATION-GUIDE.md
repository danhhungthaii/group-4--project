# 🎯 SINH VIÊN 3: TÍCH HỢP CLOUDINARY & RESET PASSWORD

## ✅ ĐÃ HOÀN THÀNH

### 1. Tích hợp Cloudinary với Database
- ✅ Cài đặt dependencies: `cloudinary`, `multer`, `nodemailer`
- ✅ Tạo cấu hình Cloudinary: `config/cloudinary.js`
- ✅ Tạo middleware upload: `middleware/upload.js`
- ✅ Cập nhật User model với fields ảnh
- ✅ Thêm API endpoints upload ảnh

### 2. Implement Reset Password System
- ✅ Tạo email service: `config/emailService.js`
- ✅ Thêm password reset methods vào User model
- ✅ Tạo API endpoints reset password
- ✅ Template email HTML professional

### 3. Testing Framework
- ✅ Test services only: `test-services-only.js`
- ✅ Test full integration: `test-full-integration.js`
- ✅ Test Cloudinary integration: `test-cloudinary-reset-password.js`

## 🚀 SETUP HƯỚNG DẪN

### Bước 1: Cài đặt Dependencies
```bash
npm install
```

### Bước 2: Cấu hình Environment
1. File `.env` đã được tạo, cần cập nhật các giá trị thực:

```env
# Cloudinary (https://cloudinary.com/users/register/free)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (Gmail App Password)
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-character-app-password

# Database
MONGODB_URI=mongodb://localhost:27017/group4_database
```

### Bước 3: Lấy Cloudinary Credentials
1. Đăng ký tài khoản: https://cloudinary.com/users/register/free
2. Vào Dashboard → Settings → API Keys
3. Copy Cloud Name, API Key, API Secret vào `.env`

### Bước 4: Setup Gmail App Password
1. Bật 2FA cho Gmail account
2. Vào Google Account → Security → 2-Step Verification → App passwords
3. Tạo app password cho "Mail"
4. Copy 16-character password vào `EMAIL_PASS`

### Bước 5: Start MongoDB
```bash
mongod --dbpath ./data/db
```

### Bước 6: Test Integration
```bash
# Test services only (không cần DB)
node test-services-only.js

# Test full integration (cần DB + credentials)
node test-full-integration.js

# Test với sample data
npm run test:cloudinary
```

### Bước 7: Start Server
```bash
npm start
# Server chạy tại http://localhost:3000
```

## 🛠️ API ENDPOINTS ĐÃ THÊM

### Upload Avatar
```http
POST /users/:id/avatar
Content-Type: multipart/form-data
Body: avatar file (max 5MB, jpg/png/gif)

Response:
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "user": { ... },
  "imageUrl": "https://res.cloudinary.com/..."
}
```

### Upload Document
```http
POST /users/:id/documents
Content-Type: multipart/form-data
Body: document file (max 10MB, pdf/doc/docx/jpg/png)

Response:
{
  "success": true,
  "message": "Document uploaded successfully",
  "user": { ... },
  "imageUrl": "https://res.cloudinary.com/..."
}
```

### Forgot Password
```http
POST /forgot-password
Content-Type: application/json
Body: { "email": "user@example.com" }

Response:
{
  "success": true,
  "message": "Reset password email sent"
}
```

### Reset Password
```http
POST /reset-password/:token
Content-Type: application/json
Body: { "password": "newpassword123" }

Response:
{
  "success": true,
  "message": "Password reset successfully"
}
```

### Email Verification
```http
POST /verify-email/:token
Response:
{
  "success": true,
  "message": "Email verified successfully"
}
```

## 📁 CẤU TRÚC FILES MỚI

```
├── config/
│   ├── cloudinary.js        # Cloudinary service & image management
│   └── emailService.js      # Email service với HTML templates
├── middleware/
│   └── upload.js           # Multer middleware cho file upload
├── test-services-only.js    # Test không cần DB
├── test-full-integration.js # Test đầy đủ
├── test-cloudinary-reset-password.js # Test tích hợp
├── .env                    # Environment configuration
└── .env.example           # Template cấu hình
```

## ✅ VALIDATION TESTS

### Test 1: Services Only (Luôn pass)
```bash
node test-services-only.js
# Expected: 3/6 tests pass (multer, crypto, templates)
```

### Test 2: Full Integration (Cần setup)
```bash
node test-full-integration.js
# Expected: 6/6 tests pass khi đã cấu hình đầy đủ
```

## 🎯 KẾT QUẢ DEMO

1. **Upload ảnh avatar/document** → Lưu vào Cloudinary → URL trả về
2. **Forgot password** → Gửi email reset link
3. **Reset password** → Đổi password thành công
4. **Email verification** → Xác thực email account

## 📧 EMAIL TEMPLATES

- **Password Reset**: HTML template với branding + secure link
- **Email Verification**: Welcome email với verification button
- **Responsive design** cho mobile/desktop

## 🔒 BẢO MẬT

- File validation (type, size, mime-type)
- Secure token generation với crypto
- JWT authentication
- Password hashing với bcrypt
- Rate limiting cho sensitive endpoints

---

**Tích hợp hoàn tất! Chỉ cần cấu hình .env để chạy production.**