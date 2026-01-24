# SV2 Frontend Components - Forgot Password System

## 📁 Directory Structure
```
frontend/src/
├── pages/forgot-password/
│   ├── index.html          # Form nhập email
│   └── reset.html          # Form đổi password mới
├── styles/
│   ├── forgot-password.css # Styling cho forgot password
│   └── reset-password.css  # Styling cho reset password  
└── scripts/
    └── forgot-password.js  # JavaScript xử lý form & API
```

## 🎨 UI/UX Features
- **Modern Gradient Design**: Beautiful background with glassmorphism effect
- **Responsive Layout**: Mobile-first design với breakpoints
- **Real-time Validation**: Password requirements với visual feedback
- **Loading States**: Button animations khi đang xử lý request
- **Professional Typography**: Segoe UI font stack

## 🔧 Technical Implementation

### Frontend Components (SV2)
1. **Email Form (`index.html`)**: 
   - Input validation cho email format
   - API call tới `/api/auth/forgot-password`
   - Success/error message handling

2. **Reset Form (`reset.html`)**:
   - Password strength indicator với real-time validation
   - Confirm password matching
   - Token extraction từ URL parameters
   - API call tới `/api/auth/reset-password`

3. **JavaScript Handler (`forgot-password.js`)**:
   - Class-based architecture
   - Async/await cho API calls
   - Real-time form validation
   - Error handling và user feedback

## 🎯 Password Requirements
- ✅ Minimum 8 characters
- ✅ At least 1 uppercase letter  
- ✅ At least 1 lowercase letter
- ✅ At least 1 number
- ✅ At least 1 special character

## 🔗 API Integration
```javascript
// Forgot Password Endpoint
POST /api/auth/forgot-password
Body: { email: "user@example.com" }

// Reset Password Endpoint  
POST /api/auth/reset-password
Body: { token: "reset_token", newPassword: "newPassword123!" }
```

## 📱 Responsive Design
- Desktop: 450px max-width centered
- Tablet: Optimized spacing và touch targets
- Mobile: Full-width với proper margins

## 🎨 Design System
- **Primary Colors**: Green gradient (#28a745 → #20c997)
- **Background**: Purple gradient (#667eea → #764ba2)
- **Glass Effect**: backdrop-filter blur với transparency
- **Shadows**: Layered shadows cho depth

## 🚀 Usage
1. Include CSS files trong HTML head
2. Include JavaScript file trước closing body tag
3. Ensure proper API endpoint configuration
4. Test với real email service

## 📝 Notes for SV2
- All frontend code organized trong `frontend/src/`
- Ready for integration với existing backend
- Mobile-responsive và accessibility compliant
- Professional design matching modern standards