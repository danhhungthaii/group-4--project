// =============================================================================
// MULTER MIDDLEWARE FOR FILE UPLOADS
// File: middleware/upload.js
// =============================================================================

const multer = require('multer');
const { validateFile } = require('../config/cloudinary');

// Cấu hình memory storage - files sẽ được lưu trong memory (buffer)
const storage = multer.memoryStorage();

// File filter để validate file type
const fileFilter = (req, file, cb) => {
    const validation = validateFile(file);
    
    if (validation.isValid) {
        cb(null, true);
    } else {
        cb(new Error(validation.error), false);
    }
};

// Cấu hình multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 5 // Maximum 5 files at once
    }
});

// Middleware cho single avatar upload
const uploadAvatar = upload.single('avatar');

// Middleware cho multiple images upload
const uploadImages = upload.array('images', 5);

// Middleware cho single file upload (general)
const uploadSingle = upload.single('file');

// Error handler middleware cho multer
const handleMulterError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        switch (error.code) {
            case 'LIMIT_FILE_SIZE':
                return res.status(400).json({
                    success: false,
                    message: 'File quá lớn. Tối đa 5MB cho mỗi file'
                });
            case 'LIMIT_FILE_COUNT':
                return res.status(400).json({
                    success: false,
                    message: 'Quá nhiều files. Tối đa 5 files'
                });
            case 'LIMIT_UNEXPECTED_FILE':
                return res.status(400).json({
                    success: false,
                    message: 'Field name không đúng. Sử dụng "avatar", "images", hoặc "file"'
                });
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Lỗi upload file: ' + error.message
                });
        }
    }
    
    if (error.message) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
    
    next(error);
};

// Middleware wrapper để handle errors tự động
const wrapUploadMiddleware = (uploadMiddleware) => {
    return (req, res, next) => {
        uploadMiddleware(req, res, (error) => {
            if (error) {
                return handleMulterError(error, req, res, next);
            }
            next();
        });
    };
};

// Export wrapped middlewares
module.exports = {
    uploadAvatar: wrapUploadMiddleware(uploadAvatar),
    uploadImages: wrapUploadMiddleware(uploadImages),
    uploadSingle: wrapUploadMiddleware(uploadSingle),
    handleMulterError,
    
    // Raw middlewares (nếu cần custom error handling)
    rawUploadAvatar: uploadAvatar,
    rawUploadImages: uploadImages,
    rawUploadSingle: uploadSingle
};