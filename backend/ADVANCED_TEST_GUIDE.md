# HƯỚNG DẪN TEST TÍNH NĂNG NÂNG CAO

## 🔧 **Cấu hình trước khi test:**

### 1. **Cấu hình Email (Gmail)**
Cập nhật file `.env`:
```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password  # Không phải password thường!
EMAIL_FROM=your-gmail@gmail.com
```

**Hướng dẫn lấy App Password:**
1. Đăng nhập Gmail → Google Account
2. Security → 2-Step Verification (bật nếu chưa có)
3. App passwords → Generate password
4. Copy password vào EMAIL_PASS

### 2. **Cấu hình Cloudinary**
Đăng ký tài khoản tại: https://cloudinary.com
Cập nhật file `.env`:
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

---

## 📧 **TEST FORGOT PASSWORD & RESET PASSWORD**

### 1. **Forgot Password (Quên mật khẩu)**
- **Method**: `POST`
- **URL**: `http://localhost:3000/api/advanced/forgot-password`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "email": "user@example.com"
}
```

**Kết quả mong đợi:**
```json
{
  "message": "Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.",
  "resetToken": "abc123..." // Chỉ hiện trong dev mode
}
```

### 2. **Reset Password (Đặt lại mật khẩu)**
- **Method**: `POST`
- **URL**: `http://localhost:3000/api/advanced/reset-password`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "token": "reset-token-from-email",
  "newPassword": "new_password_123"
}
```

**Kết quả mong đợi:**
```json
{
  "message": "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập với mật khẩu mới.",
  "user": {
    "id": "...",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

---

## 🖼️ **TEST UPLOAD AVATAR**

### 1. **Upload Avatar**
- **Method**: `POST`
- **URL**: `http://localhost:3000/api/advanced/upload-avatar`
- **Headers**: 
  - `Authorization: Bearer <user_token>`
- **Body**: 
  - Type: `form-data`
  - Key: `avatar`
  - Value: Select file (ảnh JPEG, JPG, PNG, GIF, WEBP)

**Kết quả mong đợi:**
```json
{
  "message": "Upload avatar thành công",
  "avatar": {
    "url": "https://res.cloudinary.com/...",
    "publicId": "avatars/user_123_1634567890",
    "width": 200,
    "height": 200,
    "format": "jpg",
    "bytes": 15420
  },
  "user": {
    "id": "...",
    "name": "User Name",
    "email": "user@example.com",
    "avatar": "https://res.cloudinary.com/..."
  }
}
```

### 2. **Delete Avatar**
- **Method**: `DELETE`
- **URL**: `http://localhost:3000/api/advanced/delete-avatar`
- **Headers**: 
  - `Authorization: Bearer <user_token>`

**Kết quả mong đợi:**
```json
{
  "message": "Xóa avatar thành công",
  "user": {
    "id": "...",
    "name": "User Name", 
    "email": "user@example.com",
    "avatar": null
  }
}
```

---

## 🧪 **THỨ TỰ TEST ĐỀ XUẤT:**

### **Bước 1: Test Forgot Password**
1. Cấu hình email trong `.env`
2. Test API forgot-password với email có trong DB
3. Kiểm tra email trong hộp thư
4. Copy reset token

### **Bước 2: Test Reset Password**
1. Dùng token từ email hoặc response
2. Test API reset-password với token và password mới
3. Test login với password mới

### **Bước 3: Test Upload Avatar**
1. Cấu hình Cloudinary trong `.env`
2. Đăng nhập lấy token
3. Test upload avatar với file ảnh
4. Kiểm tra ảnh trên Cloudinary dashboard
5. Test delete avatar

---

## ⚠️ **LƯU Ý QUAN TRỌNG:**

### **Email Configuration:**
- Phải sử dụng App Password, không phải password Gmail thường
- Bật 2-Step Verification trước khi tạo App Password
- Test email config bằng cách gọi API forgot-password

### **File Upload:**
- Chỉ hỗ trợ ảnh: JPEG, JPG, PNG, GIF, WEBP
- Kích thước tối đa: 5MB
- Avatar sẽ được resize thành 200x200px
- Avatar cũ sẽ bị xóa khi upload avatar mới

### **Security:**
- Reset token hết hạn sau 1 giờ
- Mỗi user chỉ có 1 reset token active
- Avatar upload yêu cầu authentication

---

## 🔍 **XỬ LÝ LỖI:**

### **Forgot Password Errors:**
- `404`: Email không tồn tại
- `500`: Lỗi gửi email (kiểm tra config)

### **Reset Password Errors:**  
- `400`: Token không hợp lệ hoặc hết hạn
- `400`: Password quá ngắn

### **Upload Avatar Errors:**
- `400`: Không có file hoặc file không đúng định dạng
- `400`: File quá lớn (>5MB)
- `500`: Lỗi Cloudinary (kiểm tra config)

---

## 🚀 **READY TO TEST!**

Đảm bảo server đang chạy và các config đã được thiết lập đúng trước khi test!