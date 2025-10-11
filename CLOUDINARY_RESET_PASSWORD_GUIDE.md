# 🌟 SINH VIÊN 3 - TÍCH HỢP CLOUDINARY + RESET PASSWORD

## 🎯 TÓM TẮT TÍNH NĂNG ĐÃ HOÀN THÀNH

### ✅ Cloudinary Integration
- **Image Upload**: Upload avatar và gallery images
- **Image Optimization**: Tự động resize, compress, và optimize
- **CDN Delivery**: Fast loading với Cloudinary CDN
- **Image Management**: Xóa, cập nhật, và quản lý images

### ✅ Reset Password System  
- **Secure Token**: Crypto-based tokens với expiry time
- **Email Integration**: Gửi email reset password đẹp mắt
- **Token Validation**: Verify và validate reset tokens
- **Password Update**: Secure password reset process

### ✅ Email Verification
- **Email Verification**: Xác thực email khi đăng ký
- **Resend Verification**: Gửi lại email xác thực
- **HTML Templates**: Professional email templates

---

## 🔧 SETUP VÀ CẤU HÌNH

### 1. Cài đặt Dependencies
```bash
npm install cloudinary multer nodemailer crypto validator
```

### 2. Cấu hình Environment (.env file)
```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
FRONTEND_URL=http://localhost:3000

# Database & JWT
MONGODB_URI=mongodb://localhost:27017/group4_database
JWT_SECRET=your-jwt-secret-min-32-chars
```

### 3. Cloudinary Setup
1. Đăng ký tài khoản free tại [Cloudinary](https://cloudinary.com/users/register/free)
2. Vào Dashboard → Settings → Account
3. Copy Cloud Name, API Key, API Secret vào .env file

### 4. Gmail Setup (cho Reset Password)
1. Bật 2-Factor Authentication trên Gmail
2. Vào Google Account → Security → App passwords  
3. Tạo App Password cho "Mail"
4. Dùng App Password này trong .env file

---

## 🚀 API ENDPOINTS MỚI

### 📸 Image Upload Endpoints

#### **POST /users/:id/avatar**
Upload avatar cho user
```json
// Headers
{
  "Authorization": "Bearer jwt-token",
  "Content-Type": "multipart/form-data"
}

// Form Data
{
  "avatar": "file" // Image file (JPG, PNG, GIF, WEBP, max 5MB)
}

// Response
{
  "success": true,
  "data": {
    "user": { ... },
    "avatar": {
      "url": "https://res.cloudinary.com/...",
      "publicId": "group4/avatars/avatar_...",
      "thumbnail": "https://res.cloudinary.com/...thumbnail"
    }
  },
  "message": "Upload avatar thành công"
}
```

#### **POST /users/:id/images**
Upload multiple images vào gallery
```json
// Form Data
{
  "images": ["file1", "file2", ...], // Max 5 files
  "descriptions": ["desc1", "desc2", ...] // Optional descriptions
}

// Response
{
  "success": true,
  "data": {
    "user": { ... },
    "uploadedImages": [...],
    "totalImages": 5
  },
  "message": "Upload thành công 3/3 images"
}
```

#### **DELETE /users/:userId/images/:imageId**
Xóa image từ gallery
```json
// Response
{
  "success": true,
  "data": {
    "remainingImages": 2
  },
  "message": "Xóa image thành công"
}
```

#### **GET /users/:id/avatar/optimized**
Lấy optimized avatar URLs
```json
// Query Params (Optional)
?width=300&height=300&quality=auto

// Response
{
  "success": true,
  "data": {
    "original": "https://res.cloudinary.com/original",
    "optimized": "https://res.cloudinary.com/optimized", 
    "thumbnail": "https://res.cloudinary.com/thumbnail",
    "publicId": "group4/avatars/avatar_..."
  }
}
```

### 🔐 Password Reset Endpoints

#### **POST /forgot-password**
Yêu cầu reset password
```json
// Request Body
{
  "email": "user@example.com"
}

// Response
{
  "success": true,
  "message": "Email hướng dẫn đặt lại mật khẩu đã được gửi"
}
```

#### **POST /reset-password**  
Reset password với token
```json
// Request Body
{
  "token": "reset-token-from-email",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}

// Response
{
  "success": true,
  "message": "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập với mật khẩu mới"
}
```

### ✉️ Email Verification Endpoints

#### **POST /verify-email**
Xác thực email với token
```json
// Request Body
{
  "token": "verification-token-from-email"
}

// Response
{
  "success": true,
  "message": "Xác thực email thành công"
}
```

#### **POST /resend-verification**
Gửi lại email xác thực
```json
// Request Body
{
  "email": "user@example.com"
}

// Response  
{
  "success": true,
  "message": "Email xác thực đã được gửi lại"
}
```

---

## 🧪 TESTING

### Chạy Integration Tests
```bash
# Test tất cả tính năng mới
npm run test:cloudinary

# Test toàn bộ hệ thống
npm run test:integration

# Start server với validation
npm run postman:ready
```

### Test Cases Included
- ✅ Cloudinary connection và configuration
- ✅ Email service connection và sending
- ✅ Reset password flow hoàn chỉnh
- ✅ User image fields và methods
- ✅ Email verification flow
- ✅ Token expiration và cleanup

---

## 📋 USER MODEL CẬP NHẬT

### New Fields
```javascript
// Avatar với Cloudinary
avatar: String,              // Cloudinary URL
avatarPublicId: String,      // Cloudinary Public ID

// Image Gallery
images: [{
  url: String,               // Cloudinary URL
  publicId: String,          // Cloudinary Public ID  
  description: String,       // Image description
  uploadedAt: Date          // Upload timestamp
}],

// Email Verification
emailVerificationToken: String,
emailVerificationExpires: Date,

// Reset Password (đã có từ trước)
resetPasswordToken: String,
resetPasswordExpires: Date
```

### New Methods
```javascript
// Cloudinary Methods
user.updateAvatar(cloudinaryResult)     // Update avatar
user.addImage(cloudinaryResult, desc)   // Add to gallery
user.removeImage(imageId)               // Remove from gallery
user.getOptimizedAvatar(options)        // Get optimized URL
user.getAvatarThumbnail()              // Get thumbnail URL

// Reset Password Methods  
user.createPasswordResetToken()         // Generate reset token
user.verifyPasswordResetToken(token)    // Verify token
user.resetPassword(newPassword)         // Reset password

// Email Verification Methods
user.createEmailVerificationToken()     // Generate verification token
user.verifyEmailToken(token)           // Verify token  
user.verifyEmail()                     // Mark as verified

// Static Methods
User.cleanupExpiredTokens()            // Cleanup expired tokens
```

---

## 🎨 EMAIL TEMPLATES

### Reset Password Email
- **Professional HTML template** với branding
- **Security warnings** và instructions
- **Responsive design** cho mobile
- **15-minute expiry** với clear messaging

### Email Verification
- **Welcome message** với clean design
- **One-click verification** button
- **24-hour expiry** time
- **Fallback text version** included

---

## 📊 FEATURES HIGHLIGHTS

### 🔒 Security Features
- **Crypto-based tokens** (SHA256 hashing)
- **Token expiration** (15 min reset, 24h verification)
- **Rate limiting ready** (middleware structure)
- **Account unlock** after password reset
- **Secure file validation** (type, size limits)

### 🚀 Performance Features  
- **Memory storage** cho file uploads (no disk I/O)
- **Automatic image optimization** với Cloudinary
- **CDN delivery** cho fast loading
- **Thumbnail generation** tự động
- **Database indexing** ready

### 🎯 User Experience
- **Beautiful HTML emails** với professional design
- **Progress tracking** cho uploads
- **Error handling** với clear messages
- **Multiple file upload** support
- **Image gallery management**

---

## 💡 USAGE EXAMPLES

### Frontend Integration (React/Vue/Angular)

#### Upload Avatar
```javascript
const formData = new FormData();
formData.append('avatar', fileInput.files[0]);

const response = await fetch('/users/123/avatar', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userToken}`
  },
  body: formData
});

const result = await response.json();
console.log(result.data.avatar.url); // New avatar URL
```

#### Upload Multiple Images
```javascript
const formData = new FormData();
files.forEach((file, index) => {
  formData.append('images', file);
  formData.append('descriptions', descriptions[index]);
});

const response = await fetch('/users/123/images', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

#### Request Password Reset
```javascript
const response = await fetch('/forgot-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com' })
});

// User receives email with reset link
```

#### Reset Password
```javascript
// From reset password form
const response = await fetch('/reset-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: tokenFromURL,
    newPassword: 'newpass123',
    confirmPassword: 'newpass123'
  })
});
```

---

## 🚨 TROUBLESHOOTING

### Common Issues

#### 1. Cloudinary Upload Fails
```
Error: "Invalid API credentials"
Solution: Check CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in .env
```

#### 2. Email Not Sending
```
Error: "Authentication failed"
Solution: Use Gmail App Password, not regular password
```

#### 3. File Upload Rejected
```
Error: "File type not supported"
Solution: Only JPG, JPEG, PNG, GIF, WEBP files allowed, max 5MB
```

#### 4. Token Expired
```
Error: "Token không hợp lệ hoặc đã hết hạn"
Solution: Reset tokens expire in 15 minutes, request new reset
```

### Debug Commands
```bash
# Test email connection
node -e "require('./config/emailService').testEmailConnection().then(console.log)"

# Test Cloudinary connection  
node -e "require('./config/cloudinary').cloudinary.api.ping().then(console.log)"

# Run full diagnostic
npm run test:cloudinary
```

---

## 🎉 KẾT LUẬN

### ✅ Hoàn thành 100%
- **Cloudinary Integration**: Upload, optimize, manage images
- **Reset Password**: Secure token-based password reset
- **Email Verification**: Complete email verification system
- **Database Integration**: Enhanced User model với image fields
- **API Endpoints**: RESTful endpoints cho tất cả tính năng
- **Testing Suite**: Comprehensive integration tests
- **Documentation**: Complete setup và usage guides

### 🚀 Production Ready
- **Security**: Crypto tokens, validation, rate limiting ready
- **Performance**: CDN delivery, image optimization, memory uploads
- **Scalability**: Cloudinary handles image processing và storage
- **Reliability**: Error handling, fallbacks, cleanup mechanisms
- **User Experience**: Professional emails, progress tracking

---

**🎯 SINH VIÊN 3 - TÍCH HỢP CLOUDINARY + RESET PASSWORD HOÀN THÀNH!**

*Hệ thống đã sẵn sàng cho production với đầy đủ tính năng upload ảnh, reset password, và email verification!* 🌟