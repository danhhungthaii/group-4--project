# 📧 Email Configuration Guide - Hoạt động 4

## 🔧 Setup Gmail SMTP for Real Email Service

### Step 1: Tạo Gmail App Password

1. **Đăng nhập Gmail account** bạn muốn dùng
2. **Bật 2-Factor Authentication** (bắt buộc)
3. **Tạo App Password**:
   - Vào [Google Account Security](https://myaccount.google.com/security)
   - Click "2-Step Verification" 
   - Scroll down to "App passwords"
   - Click "Select app" → Choose "Mail"
   - Click "Select device" → Choose "Other" → Nhập "Group 4 Project"
   - Click "Generate"
   - **Copy 16-character password** (format: xxxx-xxxx-xxxx-xxxx)

### Step 2: Cập nhật .env file

```bash
# Update these values in .env file:
EMAIL_USER=your-real-email@gmail.com  
EMAIL_PASS=your-16-char-app-password   # NO SPACES!
EMAIL_FROM="Your Name <your-real-email@gmail.com>"
```

### Step 3: Test Email Configuration

```bash
# Run email test
node test-email-config.js
```

## 🚀 Email Features

### ✅ **Implemented Features**
- **Security**: Token-based password reset
- **Real SMTP**: Gmail integration với app passwords
- **Beautiful Templates**: HTML email templates
- **Token Expiry**: 1-hour expiration for security
- **Rate Limiting**: Prevent spam attempts

### 📋 **Email Flow**
1. User nhập email → POST `/api/auth/forgot-password`
2. Server tạo secure token → Lưu vào database
3. Send email với reset link → `reset-password.html?token=xxx`
4. User click link → Mở form đổi password
5. Submit new password → POST `/api/auth/reset-password/:token`
6. Token validation → Update password → Success

## 🔐 Security Features

- **Hashed Tokens**: Tokens được hash trước khi lưu DB
- **Time Expiry**: Auto-expire sau 1 giờ
- **Rate Limiting**: Giới hạn số lần request
- **No Email Disclosure**: Không tiết lộ email có tồn tại hay không

## 📧 Email Template

Email sẽ bao gồm:
- **Professional design** với CSS styles
- **Clear call-to-action** button
- **Security warnings** và instructions
- **Expiry time** notification
- **Support contact** information

## 🧪 Testing

### Test Cases:
1. ✅ Valid email → Receive reset email
2. ✅ Invalid email → Generic success message  
3. ✅ Valid token → Reset successful
4. ✅ Expired token → Error message
5. ✅ Invalid token → Error message
6. ✅ Used token → Error message

## 🎯 Demo Credentials

For testing purposes:
- **Email**: testuser@example.com
- **Frontend**: http://localhost:8080/forgot-password.html
- **Backend**: http://localhost:5000/api/auth/forgot-password

## 📱 Mobile Ready

Email templates are responsive and work on:
- ✅ Desktop email clients
- ✅ Mobile email apps  
- ✅ Web-based email (Gmail, Outlook, etc.)

---

**Ready for production use with real Gmail SMTP!** 🚀