# 🚀 Hướng dẫn Test Schema User + Role với Postman

## 📋 Các bước chuẩn bị:

### 1. Khởi động Server:
```bash
npm start
# Hoặc
node server.js
```
Server sẽ chạy trên: `http://localhost:3000`

### 2. Seed dữ liệu ban đầu (tùy chọn):
```bash
npm run seed
```

---

## 🎯 Danh sách API Endpoints để test:

### 🔐 **AUTHENTICATION APIs**

#### 1. **Đăng nhập** 
- **URL**: `POST http://localhost:3000/auth/login`
- **Body** (JSON):
```json
{
  "identifier": "admin@group4.com",
  "password": "admin123456"
}
```
- **Response**: Sẽ trả về `token` để sử dụng cho các request khác

#### 2. **Verify Token**
- **URL**: `POST http://localhost:3000/auth/verify`  
- **Headers**: `Authorization: Bearer <token>`

---

### 👥 **ROLE APIs**

#### 3. **Lấy tất cả Roles**
- **URL**: `GET http://localhost:3000/roles`

#### 4. **Lấy Role theo ID**
- **URL**: `GET http://localhost:3000/roles/:id`

#### 5. **Tạo Role mới**
- **URL**: `POST http://localhost:3000/roles`
- **Body** (JSON):
```json
{
  "name": "editor",
  "description": "Biên tập viên",
  "permissions": ["read_posts", "write_posts"],
  "isActive": true
}
```

#### 6. **Cập nhật Role**
- **URL**: `PUT http://localhost:3000/roles/:id`
- **Body** (JSON):
```json
{
  "description": "Biên tập viên cao cấp",
  "permissions": ["read_posts", "write_posts", "delete_posts"]
}
```

---

### 👤 **USER APIs**

#### 7. **Xem Profile User**
- **URL**: `GET http://localhost:3000/profile/:userId`
- **Headers**: `Authorization: Bearer <token>`

#### 8. **Cập nhật Profile**  
- **URL**: `PUT http://localhost:3000/profile/:userId`
- **Headers**: `Authorization: Bearer <token>`
- **Body** (JSON):
```json
{
  "fullName": "Nguyễn Văn Admin Updated",
  "phoneNumber": "0987654321",
  "dateOfBirth": "1990-01-01",
  "gender": "male"
}
```

#### 9. **Đổi mật khẩu**
- **URL**: `PUT http://localhost:3000/profile/:userId/change-password`
- **Headers**: `Authorization: Bearer <token>`
- **Body** (JSON):
```json
{
  "currentPassword": "admin123456",
  "newPassword": "newpassword123"
}
```

#### 10. **Lấy tất cả Users** (Admin only)
- **URL**: `GET http://localhost:3000/users`
- **Headers**: `Authorization: Bearer <token>`

#### 11. **Tạo User mới** (Admin only)
- **URL**: `POST http://localhost:3000/users`
- **Headers**: `Authorization: Bearer <token>`
- **Body** (JSON):
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "fullName": "Test User",
  "phoneNumber": "0123456789",
  "roleId": "ROLE_ID_HERE"
}
```

#### 12. **Cập nhật User** (Admin only)
- **URL**: `PUT http://localhost:3000/users/:id`
- **Headers**: `Authorization: Bearer <token>`

#### 13. **Xóa User** (Admin only)
- **URL**: `DELETE http://localhost:3000/users/:id`
- **Headers**: `Authorization: Bearer <token>`

---

## 📝 **Test Cases cho Schema**

### ✅ **Test User Schema:**
1. **Validation Test**: Tạo user với dữ liệu không hợp lệ
   - Email sai format
   - Username quá ngắn (< 3 ký tự)
   - Password quá ngắn (< 6 ký tự)
   - Phone number sai format

2. **Unique Constraint Test**: Tạo user với email/username đã tồn tại

3. **Password Hashing Test**: Kiểm tra password đã được hash

4. **Role Association Test**: Kiểm tra user có liên kết đúng với role

### ✅ **Test Role Schema:**
1. **Enum Test**: Tạo role với name không trong enum ['admin', 'user', 'moderator', 'guest']

2. **Permissions Test**: Test các permissions khác nhau

3. **Timestamps Test**: Kiểm tra createdAt, updatedAt tự động

### ✅ **Test RBAC (Role-Based Access Control):**
1. **Authorization Test**: User với role khác nhau truy cập endpoint
2. **Permission Test**: Kiểm tra permissions có hoạt động đúng không

---

## 🛠️ **Postman Collection Setup**

1. Tạo **Environment** trong Postman:
   - `baseURL`: `http://localhost:3000`
   - `token`: (sẽ set tự động sau khi login)

2. Tạo **Pre-request Script** cho login:
```javascript
// Auto login và set token
if (!pm.environment.get("token")) {
    pm.sendRequest({
        url: pm.environment.get("baseURL") + "/auth/login",
        method: 'POST',
        header: {'Content-Type': 'application/json'},
        body: {
            mode: 'raw',
            raw: JSON.stringify({
                identifier: "admin@group4.com", 
                password: "admin123456"
            })
        }
    }, function (err, response) {
        if (!err && response.code === 200) {
            const jsonData = response.json();
            pm.environment.set("token", jsonData.token);
        }
    });
}
```

3. **Authorization Header** tự động:
   - Type: `Bearer Token`
   - Token: `{{token}}`

---

## 🚨 **Lỗi thường gặp và cách fix:**

1. **Connection Error**: Kiểm tra MongoDB có chạy không
2. **401 Unauthorized**: Token hết hạn hoặc không hợp lệ
3. **403 Forbidden**: Không có quyền truy cập
4. **Validation Error**: Dữ liệu đầu vào không đúng format

---

## 📊 **Expected Results:**

- ✅ User schema validation hoạt động đúng
- ✅ Role schema và permissions hoạt động  
- ✅ Password được hash tự động
- ✅ JWT authentication hoạt động
- ✅ RBAC (Role-based access control) hoạt động
- ✅ CRUD operations hoạt động đầy đủ

**Chúc bạn test thành công!** 🎉