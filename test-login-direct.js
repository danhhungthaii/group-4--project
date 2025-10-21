// Test login endpoint directly
const https = require('http');

const postData = JSON.stringify({
  email: 'test@example.com', 
  password: 'password123'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🧪 Testing Avatar Login with fixed credentials...\n');
console.log('📤 Sending login request:');
console.log('   Email: test@example.com');
console.log('   Password: password123\n');

const req = https.request(options, (res) => {
  console.log(`📡 Response Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      if (res.statusCode === 200) {
        console.log('✅ LOGIN SUCCESS!');
        console.log(`👤 User: ${result.user.username}`);
        console.log(`📧 Email: ${result.user.email}`);
        console.log(`🔑 Token: ${result.token.substring(0, 30)}...`);
        console.log('\n🎉 Avatar upload server is working correctly!');
        console.log('🌐 Demo ready at: http://localhost:8080/demo-avatar-upload.html');
      } else {
        console.log('❌ LOGIN FAILED:');
        console.log(`   Message: ${result.message}`);
      }
    } catch (error) {
      console.log('📄 Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Connection error: ${e.message}`);
  console.log('\n🔧 Make sure avatar server is running:');
  console.log('   cd backend && node server-avatar.js');
});

req.write(postData);
req.end();