// =============================================================================
// CLOUDINARY CONFIGURATION
// File: config/cloudinary.js
// =============================================================================

const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Cấu hình Cloudinary với credentials từ environment
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'group4-project',
    api_key: process.env.CLOUDINARY_API_KEY || 'your-api-key',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'your-api-secret',
    secure: true
});

// Cấu hình upload options cho avatar
const avatarUploadOptions = {
    folder: 'group4/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
        {
            width: 300,
            height: 300,
            crop: 'fill',
            gravity: 'face',
            quality: 'auto:good'
        }
    ],
    public_id_prefix: 'avatar_'
};

// Cấu hình upload options cho documents/images
const documentUploadOptions = {
    folder: 'group4/documents',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
    transformation: [
        {
            width: 800,
            height: 600,
            crop: 'limit',
            quality: 'auto:good'
        }
    ],
    public_id_prefix: 'doc_'
};

/**
 * Upload avatar lên Cloudinary
 * @param {Buffer} fileBuffer - Buffer của file image
 * @param {string} userId - ID của user để tạo unique public_id
 * @returns {Promise<Object>} - Cloudinary upload result
 */
const uploadAvatar = async (fileBuffer, userId) => {
    try {
        return new Promise((resolve, reject) => {
            const uploadOptions = {
                ...avatarUploadOptions,
                public_id: `avatar_${userId}_${Date.now()}`
            };

            cloudinary.uploader.upload_stream(
                uploadOptions,
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        reject(error);
                    } else {
                        console.log('Avatar uploaded successfully:', result.public_id);
                        resolve(result);
                    }
                }
            ).end(fileBuffer);
        });
    } catch (error) {
        console.error('Error in uploadAvatar:', error);
        throw error;
    }
};

/**
 * Upload document lên Cloudinary
 * @param {Buffer} fileBuffer - Buffer của file
 * @param {string} userId - ID của user
 * @param {string} filename - Tên file gốc
 * @returns {Promise<Object>} - Cloudinary upload result
 */
const uploadDocument = async (fileBuffer, userId, filename) => {
    try {
        return new Promise((resolve, reject) => {
            const uploadOptions = {
                ...documentUploadOptions,
                public_id: `doc_${userId}_${Date.now()}_${filename.replace(/\.[^/.]+$/, "")}`
            };

            cloudinary.uploader.upload_stream(
                uploadOptions,
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary document upload error:', error);
                        reject(error);
                    } else {
                        console.log('Document uploaded successfully:', result.public_id);
                        resolve(result);
                    }
                }
            ).end(fileBuffer);
        });
    } catch (error) {
        console.error('Error in uploadDocument:', error);
        throw error;
    }
};

/**
 * Xóa image từ Cloudinary
 * @param {string} publicId - Public ID của image trên Cloudinary
 * @returns {Promise<Object>} - Delete result
 */
const deleteImage = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        console.log('Image deleted from Cloudinary:', publicId, result);
        return result;
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        throw error;
    }
};

/**
 * Lấy optimized URL cho image
 * @param {string} publicId - Public ID của image
 * @param {Object} options - Transform options
 * @returns {string} - Optimized image URL
 */
const getOptimizedUrl = (publicId, options = {}) => {
    const defaultOptions = {
        quality: 'auto:good',
        fetch_format: 'auto'
    };

    return cloudinary.url(publicId, { ...defaultOptions, ...options });
};

/**
 * Tạo thumbnail từ image
 * @param {string} publicId - Public ID của image
 * @returns {string} - Thumbnail URL
 */
const getThumbnailUrl = (publicId) => {
    return getOptimizedUrl(publicId, {
        width: 150,
        height: 150,
        crop: 'fill',
        gravity: 'face'
    });
};

/**
 * Validate file type và size
 * @param {Object} file - Multer file object
 * @returns {Object} - Validation result
 */
const validateFile = (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (!file) {
        return { isValid: false, error: 'Không có file được upload' };
    }

    if (file.size > maxSize) {
        return { isValid: false, error: 'File quá lớn. Tối đa 5MB' };
    }

    if (!allowedTypes.includes(file.mimetype)) {
        return { isValid: false, error: 'Loại file không được hỗ trợ. Chỉ chấp nhận: JPG, JPEG, PNG, GIF, WEBP' };
    }

    return { isValid: true, error: null };
};

/**
 * Extract public ID từ Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string} - Public ID
 */
const extractPublicId = (url) => {
    if (!url || !url.includes('cloudinary.com')) {
        return null;
    }

    try {
        const parts = url.split('/');
        const uploadIndex = parts.findIndex(part => part === 'upload');
        if (uploadIndex === -1) return null;

        // Lấy phần sau 'upload' và version (nếu có)
        let pathParts = parts.slice(uploadIndex + 1);
        
        // Bỏ qua version nếu có (vX_XXXXXX)
        if (pathParts[0] && pathParts[0].startsWith('v')) {
            pathParts = pathParts.slice(1);
        }

        // Join lại và bỏ extension
        const fullPath = pathParts.join('/');
        return fullPath.replace(/\.[^/.]+$/, '');
    } catch (error) {
        console.error('Error extracting public ID:', error);
        return null;
    }
};

module.exports = {
    cloudinary,
    uploadAvatar,
    uploadDocument,
    deleteImage,
    getOptimizedUrl,
    getThumbnailUrl,
    validateFile,
    extractPublicId,
    avatarUploadOptions,
    documentUploadOptions
};