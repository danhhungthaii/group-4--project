// backend/middleware/upload.js
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');

// Cấu hình multer để upload file vào memory
const storage = multer.memoryStorage();

// File filter để chỉ cho phép upload ảnh
const fileFilter = (req, file, cb) => {
  // Kiểm tra loại file
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép upload file ảnh (JPEG, JPG, PNG, GIF, WEBP)'));
  }
};

// Middleware để resize ảnh avatar
const resizeAvatar = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    // Resize ảnh thành 300x300 pixel với quality tốt
    const resizedImageBuffer = await sharp(req.file.buffer)
      .resize(300, 300, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 90 })
      .toBuffer();

    // Cập nhật buffer đã resize vào req.file
    req.file.buffer = resizedImageBuffer;
    req.file.mimetype = 'image/jpeg';
    req.file.originalname = req.file.originalname.replace(/\.[^/.]+$/, ".jpeg");
    
    next();
  } catch (error) {
    console.error('Error resizing image:', error);
    return res.status(500).json({
      message: 'Lỗi xử lý ảnh',
      error: error.message
    });
  }
};

// Cấu hình upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Giới hạn 5MB
  },
  fileFilter: fileFilter
});

// Middleware xử lý lỗi upload
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File quá lớn. Kích thước tối đa là 5MB.'
      });
    }
    return res.status(400).json({
      message: 'Lỗi upload file',
      error: error.message
    });
  }
  
  if (error) {
    return res.status(400).json({
      message: error.message
    });
  }
  
  next();
};

module.exports = {
  upload,
  resizeAvatar,
  handleUploadError
};