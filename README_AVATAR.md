# 🖼️ Hoạt động 3: Upload Avatar với Cloudinary

## 🎯 Mục tiêu
Cho phép upload ảnh đại diện, resize trước khi lưu, lưu lên Cloudinary cloud storage.

## ✨ Tính năng đã implement

### 🔧 Backend Features
- ✅ **Multer Upload Middleware** - Xử lý file upload trong memory
- ✅ **Sharp Image Processing** - Resize ảnh tự động thành 300x300px
- ✅ **Cloudinary Integration** - Lưu trữ ảnh trên cloud với CDN
- ✅ **JWT Authentication** - Bảo mật API endpoints
- ✅ **File Validation** - Kiểm tra định dạng và kích thước file
- ✅ **Error Handling** - Xử lý lỗi đầy đủ với messages rõ ràng

### 🎨 Frontend Features  
- ✅ **Upload Form** - Giao diện upload ảnh user-friendly
- ✅ **Live Preview** - Xem trước ảnh trước khi upload
- ✅ **Progress Feedback** - Hiển thị trạng thái upload realtime
- ✅ **Avatar Display** - Hiển thị ảnh đại diện sau khi upload thành công
- ✅ **Delete Functionality** - Xóa avatar với xác nhận
- ✅ **Responsive Design** - Tối ưu cho mobile và desktop

## 📁 Cấu trúc Files

```
📂 Hoạt động 3 - Avatar Upload
├── 🌐 Backend
│   ├── server-avatar.js              # Main avatar server
│   ├── config/cloudinary.js          # Cloudinary configuration
│   ├── middleware/upload.js          # File upload middleware
│   └── package.json                  # Dependencies
│
├── 🎨 Frontend
│   ├── demo-avatar-upload.html       # Standalone demo page
│   ├── test-avatar-upload.html       # Existing test page
│   └── src/components/
│       ├── UploadAvatar.jsx          # React component
│       └── UploadAvatar.css          # Component styles
│
└── 🚀 Scripts
    ├── start-avatar-demo.bat         # Quick start script
    └── README_AVATAR.md              # This documentation
```

## 🚀 Cách chạy Demo

### 1️⃣ Khởi động nhanh (Recommended)
```bash
# Chạy script khởi động tự động
start-avatar-demo.bat
```

### 2️⃣ Khởi động thủ công
```bash
# 1. Start Avatar Server
cd backend
node server-avatar.js

# 2. Start Static Server (terminal mới)
cd ..
node -e "const express=require('express');const app=express();app.use(express.static('.'));app.listen(8080,()=>console.log('Static server running on http://localhost:8080'));"

# 3. Mở demo
# Browser: http://localhost:8080/demo-avatar-upload.html
```

### 3️⃣ Sử dụng npm scripts
```bash
cd backend
npm run avatar    # Production mode
npm run avatar:dev # Development với nodemon
```

## 🌐 Demo URLs

| Demo Type | URL | Description |
|-----------|-----|-------------|
| **Main Demo** | http://localhost:8080/demo-avatar-upload.html | Demo chính với UI đẹp |
| **Test Page** | http://localhost:8080/test-avatar-upload.html | Test page đơn giản |
| **API Health** | http://localhost:5000/api/health | Kiểm tra server status |

## 👤 Test Accounts

```javascript
// Mock database users
{
  email: "test@example.com",
  password: "password123",
  username: "testuser"
}

{
  email: "john@example.com", 
  password: "password123",
  username: "john_doe"
}
```

## 📱 API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/login` | Đăng nhập user | ❌ |
| `GET` | `/api/auth/profile` | Lấy thông tin user | ✅ |
| `POST` | `/api/upload/avatar` | Upload avatar | ✅ |
| `DELETE` | `/api/upload/avatar` | Xóa avatar | ✅ |
| `GET` | `/api/users` | Danh sách users | ✅ |
| `GET` | `/api/health` | Health check | ❌ |

## 🔧 Configuration

### Environment Variables (.env)
```env
# Cloudinary Config (Optional - có mock fallback)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key  
CLOUDINARY_API_SECRET=your-api-secret

# JWT Config
JWT_SECRET=avatar-upload-secret-key-2024

# Server Config
PORT=5000
```

### Upload Limits
- **File Types**: JPG, JPEG, PNG, GIF, WEBP
- **Max Size**: 5MB
- **Auto Resize**: 300x300px với Sharp.js
- **Quality**: 85% JPEG compression

## 🧪 Testing Scenarios

### ✅ Happy Path
1. Login với credentials hợp lệ
2. Chọn file ảnh hợp lệ (< 5MB, định dạng đúng)
3. Xem preview trước khi upload
4. Upload thành công → hiển thị avatar mới
5. Xóa avatar → xác nhận và xóa thành công

### ❌ Error Cases
1. **No Auth**: Upload without login → 401 error
2. **Invalid File**: Upload file không phải ảnh → validation error
3. **File Too Large**: Upload file > 5MB → size limit error
4. **Server Error**: Cloudinary error → graceful fallback
5. **Network Error**: Connection timeout → error handling

## 🌟 Demo Features to Highlight

### 1. 📤 **Smart Upload Process**
```
File Selection → Validation → Preview → Resize → Cloud Upload → Display
```

### 2. 🔄 **Auto Image Processing**
- Tự động resize về 300x300px
- Optimize quality và file size
- Support multiple image formats

### 3. ☁️ **Cloud Storage Integration**
- Upload lên Cloudinary CDN
- Generate secure URLs
- Auto backup và global access

### 4. 🎨 **User Experience**
- Live preview trước upload
- Progress feedback realtime  
- Responsive design cho mọi device
- Clear error messages

## 📊 Technical Stack

**Backend:**
- Express.js - Web framework
- Multer - File upload handling
- Sharp - Image processing & resize
- Cloudinary SDK - Cloud storage
- JWT - Authentication
- bcryptjs - Password hashing

**Frontend:**
- Vanilla JavaScript - Core functionality
- HTML5 File API - File handling
- CSS3 - Modern styling
- Fetch API - HTTP requests
- React Component - Alternative implementation

## 🔍 Code Highlights

### Backend Upload Handler
```javascript
app.post('/api/upload/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  // File validation
  if (!req.file) return res.status(400).json({...});
  
  // Resize with Sharp
  const processedBuffer = await sharp(req.file.buffer)
    .resize(300, 300, { fit: 'cover' })
    .jpeg({ quality: 85 })
    .toBuffer();
    
  // Upload to Cloudinary
  const result = await uploadToCloudinary(processedBuffer, 'avatars');
  
  // Update user avatar
  user.avatar = result.secure_url;
  
  res.json({ success: true, user, avatar: result });
});
```

### Frontend Upload Function
```javascript
async function uploadAvatar() {
  const formData = new FormData();
  formData.append('avatar', fileInput.files[0]);
  
  const response = await fetch('/api/upload/avatar', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  
  const data = await response.json();
  if (response.ok) updateCurrentAvatar(data.user.avatar);
}
```

## 🎯 Presentation Points

1. **Workflow Demo**: Login → Select → Preview → Upload → Display
2. **Technical Features**: Validation, Resize, Cloud Storage, Security
3. **User Experience**: Responsive design, feedback, error handling
4. **Code Quality**: Clean architecture, error handling, documentation

## 📈 Future Enhancements

- [ ] Multiple avatar sizes (thumbnail, medium, large)
- [ ] Drag & drop file upload
- [ ] Crop tool before upload
- [ ] Avatar history/versions
- [ ] Bulk upload multiple images
- [ ] Integration với social login avatars

---

## 🏆 **HOÀN THÀNH HOẠT ĐỘNG 3** ✅

**SV2: Frontend form upload avatar, hiển thị avatar sau upload** - **DONE** 🎉

Ready for commit & push! 🚀