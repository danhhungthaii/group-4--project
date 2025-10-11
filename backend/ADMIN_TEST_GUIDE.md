# HƯỚNG DẪN TEST ADMIN APIs

## 🔐 **Bước 1: Đăng nhập Admin**

### Tài khoản Admin có sẵn:
- **Email**: `admin@example.com`
- **Password**: `admin123`

### Đăng nhập Admin trong Postman:
- **Method**: `POST`
- **URL**: `http://localhost:3000/api/auth/login`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**⚠️ LUU Ý**: Copy token từ response để dùng cho các API admin!

---

## 📋 **Bước 2: Test Admin APIs**

### 1. **Xem danh sách tất cả users**
- **Method**: `GET`
- **URL**: `http://localhost:3000/api/users`
- **Headers**: 
  - `Authorization: Bearer <admin_token>`
- **Query Parameters** (optional):
  - `page=1&limit=10`

### 2. **Xem thống kê users**
- **Method**: `GET` 
- **URL**: `http://localhost:3000/api/users/stats`
- **Headers**: 
  - `Authorization: Bearer <admin_token>`

### 3. **Xem thông tin user cụ thể**
- **Method**: `GET`
- **URL**: `http://localhost:3000/api/users/:id`
- **Headers**: 
  - `Authorization: Bearer <admin_token>`

### 4. **Cập nhật quyền user**
- **Method**: `PUT`
- **URL**: `http://localhost:3000/api/users/:id/role`
- **Headers**: 
  - `Authorization: Bearer <admin_token>`
  - `Content-Type: application/json`
- **Body**:
```json
{
  "role": "admin"
}
```

### 5. **Xóa user**
- **Method**: `DELETE`
- **URL**: `http://localhost:3000/api/users/:id`
- **Headers**: 
  - `Authorization: Bearer <admin_token>`

---

## 🧪 **Bước 3: Test Phân quyền**

### Test quyền User (không phải admin):
1. Đăng ký user thường
2. Login lấy token
3. Thử gọi API admin → Sẽ bị từ chối (403)

### Test tự xóa tài khoản:
1. User có thể xóa chính tài khoản của mình
2. Admin có thể xóa bất kỳ user nào
3. Admin không thể xóa admin khác

---

## ⚡ **Các kết quả mong đợi:**

### ✅ Admin APIs thành công:
```json
{
  "message": "Lấy danh sách người dùng thành công",
  "users": [...],
  "pagination": {...}
}
```

### ❌ User thường truy cập Admin API:
```json
{
  "message": "Không có quyền truy cập. Chỉ Admin mới có thể thực hiện hành động này."
}
```

### ❌ Không có token:
```json
{
  "message": "Token không được cung cấp"
}
```

---

## 🔧 **Tạo thêm admin:**

Để tạo admin mới, dùng API signup với role:
```json
{
  "name": "Admin Mới",
  "email": "admin2@example.com", 
  "password": "123456",
  "role": "admin"
}
```