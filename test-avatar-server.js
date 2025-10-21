// Test script for Avatar Upload API
const https = require('http');

console.log('🧪 Testing Avatar Upload Server...\n');

// Test health endpoint
const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/health',
  method: 'GET'
};

const req = https.request(options, (res) => {
  console.log(`✅ Server Response: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('📡 Health Check Result:');
      console.log(JSON.stringify(result, null, 2));
      console.log('\n🎉 Avatar Upload Server is running successfully!');
      console.log('\n🌐 Test URLs:');
      console.log('   - API Health: http://localhost:5000/api/health');
      console.log('   - Demo Page: http://localhost:8080/demo-avatar-upload.html');
    } catch (error) {
      console.log('📄 Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Connection error: ${e.message}`);
  console.log('\n🔧 Please make sure the avatar server is running:');
  console.log('   cd backend && node server-avatar.js');
});

req.end();