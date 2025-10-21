# 🔑 Forgot Password System - Complete Test Guide

## 📋 Overview
This guide helps you test the complete forgot password system with real Gmail integration for **Hoạt động 4 - SV2 requirements**.

## 🚀 Quick Start

### Option 1: Automated Test (Recommended)
```bash
# Run the automated test script
test-full-system.bat
```

### Option 2: Manual Setup
```bash
# 1. Install dependencies
npm install

# 2. Test email configuration
node test-email-simple.js

# 3. Start backend server
node server-forgot-password.js

# 4. Start frontend server (in new terminal)
node static-server-forgot-password.js
```

## 📧 Email Configuration

### Step 1: Gmail Setup
1. Enable 2-factor authentication in your Google account
2. Go to Google Account Settings > Security > App passwords
3. Generate a new app password for "Mail"
4. Use this app password (not your regular password)

### Step 2: Environment Variables
Create `.env` file in project root:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
EMAIL_FROM=your_email@gmail.com
FRONTEND_URL=http://localhost:8080
JWT_SECRET=group4-forgot-password-secret-key-2024
```

### Step 3: Test Email Configuration
```bash
node test-email-simple.js
```

## 🌐 System Architecture

### Backend Server (Port 5000)
- **File**: `server-forgot-password.js`
- **Base URL**: `http://localhost:5000`
- **Features**: Complete forgot password API with email integration

### Frontend Server (Port 8080)
- **File**: `static-server-forgot-password.js`
- **Base URL**: `http://localhost:8080`
- **Features**: Serves HTML forms and demo pages

## 📱 Test Pages

### 1. Demo Page (Recommended)
**URL**: `http://localhost:8080/demo-forgot-password.html`
- Complete workflow visualization
- Real-time API testing
- System status monitoring
- Interactive email testing

### 2. Forgot Password Form
**URL**: `http://localhost:8080/forgot-password.html`
- Email input form
- Real-time validation
- API integration
- Loading states

### 3. Reset Password Form
**URL**: `http://localhost:8080/reset-password.html`
- Password reset with token
- Password strength validation
- Security requirements
- Success confirmation

## 🧪 API Endpoints

### Health Check
```http
GET /api/health
```
**Response**: System status and configuration

### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Reset Password
```http
POST /api/auth/reset-password/:token
Content-Type: application/json

{
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

### Test Email
```http
POST /api/test/email
Content-Type: application/json

{
  "email": "test@example.com"
}
```

### Login (For Testing)
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "testuser@example.com",
  "password": "password123"
}
```

## 👤 Test Accounts

Pre-configured test accounts for development:
- **Email**: `testuser@example.com` | **Password**: `password123`
- **Email**: `demo@example.com` | **Password**: `password123`

## 🔄 Complete Workflow Test

### Step 1: Request Password Reset
1. Open `http://localhost:8080/forgot-password.html`
2. Enter your email address
3. Click "Gửi yêu cầu đặt lại mật khẩu"
4. Check for success message

### Step 2: Check Email
1. Check your Gmail inbox
2. Look for email from your configured address
3. Email should contain reset link

### Step 3: Reset Password
1. Click reset link in email
2. Or manually visit: `http://localhost:8080/reset-password.html?token=YOUR_TOKEN`
3. Enter new password (min 6 characters)
4. Confirm new password
5. Click "Đặt lại mật khẩu"

### Step 4: Test New Password
1. Try logging in with new password
2. Use login endpoint or create login form

## 🛠️ Troubleshooting

### Email Issues

#### Authentication Failed (EAUTH)
```
Solution:
1. Enable 2FA in Google Account
2. Generate App Password in Security settings
3. Use App Password in EMAIL_PASS (not regular password)
4. Double-check EMAIL_USER format
```

#### Connection Failed (ECONNECTION)
```
Solution:
1. Check internet connection
2. Verify SMTP settings (host: smtp.gmail.com, port: 587)
3. Check firewall/antivirus blocking
4. Try different network
```

#### Invalid Recipients
```
Solution:
1. Verify email address format
2. Check EMAIL_FROM matches EMAIL_USER
3. Ensure recipient email is valid
```

### Server Issues

#### Port Already in Use
```bash
# Kill existing Node processes
taskkill /f /im node.exe

# Or use different ports in code
```

#### Module Not Found
```bash
# Install missing dependencies
npm install express cors crypto jsonwebtoken bcryptjs nodemailer dotenv
```

### Frontend Issues

#### CORS Errors
```
Solution: Backend includes CORS middleware for all origins
```

#### API Connection Failed
```
Solution: Ensure backend server is running on port 5000
```

## 📊 Monitoring & Logs

### Backend Logs
The server provides detailed console logs:
- 📧 Email requests
- 🔑 Token generation
- ✅ Successful operations
- ❌ Error details

### Email Status
Check email service status in logs:
- ✅ SMTP connection successful
- 📬 Message ID for sent emails
- ❌ Detailed error messages

## 🔐 Security Features

### Token Security
- Crypto-random 32-byte tokens
- SHA256 hashing
- 1-hour expiration
- Single-use tokens

### Password Requirements
- Minimum 6 characters
- Confirmation matching
- Bcrypt hashing (10 rounds)

### Email Security
- Rate limiting ready (implement if needed)
- Secure token transmission
- Professional email templates

## 📝 SV2 Requirements Completion

✅ **Frontend form nhập email**: `forgot-password.html`
✅ **Nhận link reset**: Email integration with Gmail
✅ **Form đổi password mới**: `reset-password.html`
✅ **Email thật**: Real Gmail SMTP integration
✅ **Beautiful UI**: Responsive design with gradients
✅ **Complete workflow**: End-to-end functionality

## 🎯 Next Steps

1. **Test with real email** - Verify Gmail integration
2. **Security enhancements** - Add rate limiting
3. **Git workflow** - Commit and push to feature branch
4. **Documentation** - Complete technical documentation

## 💡 Tips

- Use demo page for comprehensive testing
- Monitor console logs for debugging
- Test with multiple email addresses
- Verify token expiration handling
- Check responsive design on mobile

## 🤝 Support

If you encounter issues:
1. Check console logs for errors
2. Verify .env configuration
3. Test email configuration separately
4. Review API responses in Network tab
5. Check Gmail app password setup

---

**Group 4 Project** - Forgot Password Feature Implementation  
**SV2 Requirements**: ✅ Complete  
**Email Integration**: ✅ Gmail SMTP  
**Frontend Forms**: ✅ Beautiful & Responsive