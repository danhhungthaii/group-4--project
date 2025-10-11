// backend/config/cloudinary.js
const cloudinary = require('cloudinary').v2;

// Debug: Log env variables
console.log('🔧 Cloudinary Config:');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY);
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '***configured***' : 'NOT SET');

// Cấu hình Cloudinary (hardcode để test)
cloudinary.config({
  cloud_name: 'dqvthgtsl',
  api_key: '326358829596442',
  api_secret: '1DMO4OA9w0b-3CH-ABbo8WjNUtg'
});

module.exports = cloudinary;