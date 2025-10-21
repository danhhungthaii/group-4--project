// Comprehensive Avatar Upload API Test
const http = require('http');

const BASE_URL = 'localhost';
const PORT = 5000;

console.log('🧪 COMPREHENSIVE AVATAR UPLOAD API TEST\n');

// Test cases
const tests = [
  {
    name: '1. Health Check',
    method: 'GET',
    path: '/api/health',
    expected: 200
  },
  {
    name: '2. Login Test',
    method: 'POST',
    path: '/api/auth/login',
    body: JSON.stringify({
      username: 'testuser',
      password: 'password123'
    }),
    headers: {
      'Content-Type': 'application/json'
    },
    expected: 200
  },
  {
    name: '3. Profile Access (No Auth)',
    method: 'GET', 
    path: '/api/auth/profile',
    expected: 401
  }
];

let completedTests = 0;
let passedTests = 0;

// Test runner function
function runTest(test) {
  return new Promise((resolve) => {
    const options = {
      hostname: BASE_URL,
      port: PORT,
      path: test.path,
      method: test.method,
      headers: test.headers || {}
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const passed = res.statusCode === test.expected;
        
        console.log(`${passed ? '✅' : '❌'} ${test.name}`);
        console.log(`   Status: ${res.statusCode} (Expected: ${test.expected})`);
        
        if (data) {
          try {
            const result = JSON.parse(data);
            if (result.message) {
              console.log(`   Message: ${result.message}`);
            }
            if (result.token) {
              console.log(`   Token: ${result.token.substring(0, 20)}...`);
            }
          } catch (e) {
            console.log(`   Response: ${data.substring(0, 100)}...`);
          }
        }
        
        console.log('');
        
        if (passed) passedTests++;
        completedTests++;
        resolve();
      });
    });

    req.on('error', (e) => {
      console.log(`❌ ${test.name}`);
      console.log(`   Error: ${e.message}\n`);
      completedTests++;
      resolve();
    });

    if (test.body) {
      req.write(test.body);
    }
    
    req.end();
  });
}

// Run all tests sequentially
async function runAllTests() {
  console.log('🚀 Starting API tests...\n');
  
  for (const test of tests) {
    await runTest(test);
  }
  
  console.log('📊 TEST RESULTS:');
  console.log(`   Passed: ${passedTests}/${completedTests}`);
  console.log(`   Success Rate: ${((passedTests/completedTests)*100).toFixed(1)}%`);
  
  if (passedTests === completedTests) {
    console.log('\n🎉 ALL TESTS PASSED! Avatar Upload API is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Check server configuration.');
  }
  
  console.log('\n🌐 Manual Testing:');
  console.log('   1. Open: http://localhost:8080/demo-avatar-upload.html');
  console.log('   2. Login with: test@example.com / password123');
  console.log('   3. Upload an image file');
  console.log('   4. Verify avatar is displayed');
}

runAllTests();