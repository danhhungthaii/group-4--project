// backend/scripts/createAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createAdminUser = async () => {
  try {
    // Kết nối MongoDB
    await mongoose.connect('mongodb+srv://danhhungthao_db_user:u9PaNiwyAVyquN3a@cluster0.wu9qtho.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Kết nối MongoDB thành công!');

    // Kiểm tra xem đã có admin chưa
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log(`Admin đã tồn tại: ${existingAdmin.email}`);
      process.exit(0);
    }

    // Tạo admin user
    const adminUser = new User({
      name: 'Administrator',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin'
    });

    await adminUser.save();
    console.log('✅ Tạo tài khoản Admin thành công!');
    console.log('📧 Email: admin@example.com');
    console.log('🔑 Password: admin123');
    console.log('⚠️  Hãy đổi mật khẩu sau khi đăng nhập lần đầu!');

  } catch (error) {
    console.error('Lỗi tạo admin:', error);
  } finally {
    mongoose.connection.close();
  }
};

createAdminUser();