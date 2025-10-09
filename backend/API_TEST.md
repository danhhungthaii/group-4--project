# API Authentication Test

## Các endpoint có sẵn:

### 1. Đăng ký (Sign Up)
- **URL**: `POST /api/auth/signup`
- **Body**:
```json
{
  "name": "Nguyễn Văn A",
  "email": "test@example.com",
  "password": "123456"
}
```

### 2. Đăng nhập (Login)
- **URL**: `POST /api/auth/login`
- **Body**:
```json
{
  "email": "test@example.com",
  "password": "123456"
}
```

### 3. Đăng xuất (Logout)
- **URL**: `POST /api/auth/logout`
- **Headers**: `Authorization: Bearer <token>`

## Profile Management APIs:

### 4. Xem thông tin cá nhân (View Profile)
- **URL**: `GET /api/profile`
- **Headers**: `Authorization: Bearer <token>`

### 5. Cập nhật thông tin cá nhân (Update Profile)
- **URL**: `PUT /api/profile`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "name": "Tên mới",
  "email": "email_moi@example.com"
}
```

### 6. Đổi mật khẩu (Change Password)
- **URL**: `PUT /api/profile/password`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "currentPassword": "mat_khau_cu",
  "newPassword": "mat_khau_moi"
}
```

## Cách sử dụng:

1. Chạy server: `npm run dev`
2. Sử dụng Postman hoặc curl để test các API
3. Sau khi đăng nhập/đăng ký, sử dụng token trong header Authorization cho các API yêu cầu xác thực

## Ví dụ với curl:

### Đăng ký:
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"123456"}'
```

### Đăng nhập:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

### Xem profile:
```bash
curl -X GET http://localhost:3000/api/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Cập nhật profile:
```bash
curl -X PUT http://localhost:3000/api/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Tên mới","email":"email_moi@example.com"}'
```

### Đổi mật khẩu:
```bash
curl -X PUT http://localhost:3000/api/profile/password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"123456","newPassword":"654321"}'
```

## Admin Management APIs:

### 7. Danh sách người dùng (Admin only)
- **URL**: `GET /api/users`
- **Headers**: `Authorization: Bearer <admin_token>`
- **Query Parameters**: 
  - `page`: Số trang (mặc định: 1)
  - `limit`: Số lượng per page (mặc định: 10)

### 8. Xem thông tin user cụ thể (Admin only)
- **URL**: `GET /api/users/:id`
- **Headers**: `Authorization: Bearer <admin_token>`

### 9. Xóa tài khoản (Admin hoặc chính user đó)
- **URL**: `DELETE /api/users/:id`
- **Headers**: `Authorization: Bearer <token>`

### 10. Cập nhật quyền user (Admin only)
- **URL**: `PUT /api/users/:id/role`
- **Headers**: `Authorization: Bearer <admin_token>`
- **Body**:
```json
{
  "role": "admin" // hoặc "user"
}
```

### 11. Thống kê users (Admin only)
- **URL**: `GET /api/users/stats`
- **Headers**: `Authorization: Bearer <admin_token>`

### 12. Đăng ký với role Admin
- **URL**: `POST /api/auth/signup`
- **Body**:
```json
{
  "name": "Admin User",
  "email": "admin@test.com",
  "password": "123456",
  "role": "admin"
}
```

## Advanced Features APIs:

### 13. Quên mật khẩu (Forgot Password)
- **URL**: `POST /api/advanced/forgot-password`
- **Body**:
```json
{
  "email": "user@example.com"
}
```

### 14. Đặt lại mật khẩu (Reset Password)
- **URL**: `POST /api/advanced/reset-password`
- **Body**:
```json
{
  "token": "reset-token-from-email",
  "newPassword": "new_password_123"
}
```

### 15. Upload Avatar
- **URL**: `POST /api/advanced/upload-avatar`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: form-data với key `avatar` và file ảnh

### 16. Xóa Avatar
- **URL**: `DELETE /api/advanced/delete-avatar`
- **Headers**: `Authorization: Bearer <token>`