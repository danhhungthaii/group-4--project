# Group 4 - Database + Authentication Setup

## 📋 Tổng quan
Dự án này tạo schema database cho User và Role management với các tính năng authentication và authorization.

## 🏗️ Cấu trúc Database Schema

### User Schema (`models/User.js`)
```javascript
{
  username: String (unique, required),
  email: String (unique, required, validated),
  password: String (hashed với bcrypt),
  fullName: String (required),
  phoneNumber: String (validated),
  dateOfBirth: Date,
  gender: String (enum: male/female/other),
  avatar: String,
  role: ObjectId (ref to Role),
  isActive: Boolean,
  isVerified: Boolean,
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  lastLogin: Date,
  loginAttempts: Number,
  lockUntil: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Role Schema (`models/Role.js`)
```javascript
{
  name: String (unique, required, enum: admin/user/moderator/guest),
  description: String,
  permissions: [String] (array of permission strings),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Cài đặt và Chạy

### 1. Cài đặt Dependencies
```bash
# Vào thư mục project
cd group-4--project

# Cài đặt packages
npm install

# Hoặc cài đặt từng package
npm install bcrypt jsonwebtoken dotenv nodemon
```

### 2. Cấu hình Environment
```bash
# Copy file .env.example thành .env
copy .env.example .env

# Chỉnh sửa .env theo môi trường của bạn
```

### 3. Khởi động MongoDB
```bash
# Khởi động MongoDB service
net start MongoDB

# Hoặc chạy mongod trực tiếp
mongod --dbpath="C:\data\db"
```

### 4. Seed Database (Tạo dữ liệu mẫu)
```bash
# Seed tất cả (roles + users)
npm run seed

# Chỉ seed roles
npm run seed:roles

# Chỉ seed users  
npm run seed:users

# Xóa tất cả dữ liệu
npm run seed:clear
```

### 5. Kiểm thử Database
```bash
# Chạy test database
npm run test:db
```

### 6. Khởi động Server
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

## 🔧 NPM Scripts

| Script | Mô tả |
|--------|-------|
| `npm start` | Khởi động server production |
| `npm run dev` | Khởi động server development với nodemon |
| `npm run seed` | Seed tất cả dữ liệu mẫu |
| `npm run seed:roles` | Chỉ seed roles |
| `npm run seed:users` | Chỉ seed users |
| `npm run seed:clear` | Xóa tất cả dữ liệu |
| `npm run test:db` | Kiểm thử database operations |

## 📡 API Endpoints

### Role Management
- `GET /roles` - Lấy tất cả roles
- `GET /roles/:id` - Lấy role theo ID
- `POST /roles` - Tạo role mới
- `PUT /roles/:id` - Cập nhật role
- `DELETE /roles/:id` - Xóa role

### User Management
- `GET /users` - Lấy tất cả users (có pagination)
- `GET /users/:id` - Lấy user theo ID
- `POST /users` - Tạo user mới
- `PUT /users/:id` - Cập nhật user
- `DELETE /users/:id` - Xóa user

### System Utilities
- `GET /` - API information
- `GET /status` - System status
- `GET /statistics/users-by-role` - Thống kê users theo role

## 🔐 Tính năng Security

### Password Security
- Hash password với bcrypt (12 rounds)
- Compare password method
- Password validation

### Account Security
- Login attempts tracking
- Account locking after 5 failed attempts
- Lock duration: 2 hours
- Reset login attempts method

### Data Validation
- Email format validation
- Phone number validation
- Required field validation
- Enum validation cho gender và roles

### Database Indexes
- Email index (unique)
- Username index (unique)
- Role name index (unique)
- Role reference index

## 📊 Default Data

### Default Roles
1. **admin** - Quản trị viên hệ thống
   - Permissions: Tất cả quyền
2. **moderator** - Người kiểm duyệt
   - Permissions: Quản lý users và posts
3. **user** - Người dùng thông thường
   - Permissions: Đọc và viết posts
4. **guest** - Khách truy cập
   - Permissions: Chỉ đọc posts

### Test Users
- **admin@group4.com** - Administrator
- **moderator@group4.com** - Moderator  
- **user1@group4.com** - Regular user 1
- **user2@group4.com** - Regular user 2

Default password cho tất cả test users: Tương ứng với role + "123456"

## 🗂️ Cấu trúc Project

```
group-4--project/
├── config/
│   └── database.js          # Database configuration
├── models/
│   ├── User.js             # User schema
│   └── Role.js             # Role schema
├── database/
│   ├── seeder.js           # Database seeder
│   └── test.js             # Database tests
├── .env                    # Environment variables
├── .env.example            # Environment template
├── server.js               # Main server file
├── package.json            # Dependencies
└── README_Database.md      # This file
```

## 🔍 Kiểm thử

### Test Database Connection
```bash
npm run test:db
```

### Test API với Postman/Thunder Client
1. Start server: `npm run dev`
2. Test endpoints tại `http://localhost:3000`

### Ví dụ tạo user mới:
```json
POST /users
{
  "username": "newuser",
  "email": "newuser@example.com", 
  "password": "password123",
  "fullName": "New User",
  "phoneNumber": "0123456789",
  "role": "ROLE_ID_HERE"
}
```

## 🚨 Lưu ý

1. **MongoDB phải được khởi động trước khi chạy server**
2. **Cần seed roles trước khi tạo users**
3. **Luôn backup database trước khi chạy seed:clear**
4. **Thay đổi JWT_SECRET trong production**
5. **Cấu hình firewall cho MongoDB trong production**

## 📝 Git Workflow

```bash
# Tạo nhánh database-auth
git checkout -b database-auth

# Add files
git add .

# Commit
git commit -m "feat: implement User and Role schema with authentication"

# Push to remote
git push origin database-auth
```

## 👥 Team Member: Database + Git Manager
- Tạo schema User + Role ✅
- Kết nối database ✅  
- Kiểm thử dữ liệu ✅
- Quản lý Git branches ✅
- Documentation ✅