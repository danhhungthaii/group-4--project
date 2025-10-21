// simple-test.js - Test đơn giản với console output
console.log('🚀 Testing Refresh Token Demo');
console.log('');
console.log('📋 Test Steps:');
console.log('1. Mở browser tại: http://localhost:3001/demo-refresh-token.html');
console.log('2. Backend API đang chạy tại: http://localhost:5000');
console.log('');
console.log('🔐 Test Accounts:');
console.log('   - admin / password123 (Admin)');
console.log('   - moderator / password456 (Moderator)');
console.log('   - user1 / password789 (User)');
console.log('');
console.log('🧪 Test Scenarios:');
console.log('   ✅ 1. Login với tài khoản admin');
console.log('   ✅ 2. Test API Call (Get Profile) - token hợp lệ');
console.log('   ✅ 3. Simulate Token Expiry - giả lập token hết hạn');
console.log('   ✅ 4. Test API Call lại - sẽ tự động refresh token');
console.log('   ✅ 5. Manual Refresh - refresh token thủ công');
console.log('   ✅ 6. Logout - thu hồi tokens');
console.log('');
console.log('🔍 Expected Results:');
console.log('   - Login thành công và hiển thị tokens');
console.log('   - API calls hoạt động với token hợp lệ');
console.log('   - Khi token hết hạn, tự động refresh và retry');
console.log('   - Logs hiển thị tất cả hoạt động');
console.log('   - Logout xóa tokens và quay về form login');
console.log('');
console.log('🎯 Demo URLs:');
console.log('   - HTML Demo: http://localhost:3001/demo-refresh-token.html');
console.log('   - API Server: http://localhost:5000');
console.log('   - API Endpoints:');
console.log('     * POST /api/auth/login');
console.log('     * POST /api/auth/refresh');
console.log('     * POST /api/auth/logout');
console.log('     * GET /api/auth/profile');
console.log('');

// Kiểm tra server status
const http = require('http');

function checkServer(port, name) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}`, (res) => {
      console.log(`✅ ${name} server is running on port ${port}`);
      resolve(true);
    });
    
    req.on('error', () => {
      console.log(`❌ ${name} server is NOT running on port ${port}`);
      resolve(false);
    });
    
    req.setTimeout(2000, () => {
      console.log(`⏰ ${name} server timeout on port ${port}`);
      req.destroy();
      resolve(false);
    });
  });
}

async function checkServers() {
  console.log('🔍 Checking server status...');
  const apiServer = await checkServer(5000, 'API');
  const staticServer = await checkServer(3001, 'Static');
  
  console.log('');
  if (apiServer && staticServer) {
    console.log('🎉 All servers are running! Ready to test.');
    console.log('');
    console.log('👆 Please open your browser and navigate to:');
    console.log('   http://localhost:3001/demo-refresh-token.html');
  } else {
    console.log('⚠️  Some servers are not running. Please start them:');
    if (!apiServer) console.log('   - Backend: node backend/server-simple.js');
    if (!staticServer) console.log('   - Frontend: node static-server.js');
  }
}

checkServers();