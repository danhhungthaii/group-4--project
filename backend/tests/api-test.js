// Test script for Redux Frontend APIs
// Run: node backend/tests/api-test.js

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testAPIs() {
  console.log('🧪 Testing APIs for Redux Frontend Integration...\n');

  try {
    // Test 1: Login API
    console.log('1️⃣ Testing Login API...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    console.log('✅ Login Success:');
    console.log(`   Status: ${loginResponse.status}`);
    console.log(`   Success: ${loginResponse.data.success}`);
    console.log(`   Token: ${loginResponse.data.token ? 'Generated' : 'Missing'}`);
    console.log(`   User ID: ${loginResponse.data.user._id}`);
    console.log(`   User Role: ${loginResponse.data.user.role}`);
    
    const token = loginResponse.data.token;

    // Test 2: Verify Token API
    console.log('\n2️⃣ Testing Verify Token API...');
    const verifyResponse = await axios.get(`${BASE_URL}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Token Verify Success:');
    console.log(`   Status: ${verifyResponse.status}`);
    console.log(`   Success: ${verifyResponse.data.success}`);
    console.log(`   User ID: ${verifyResponse.data.user._id}`);
    console.log(`   User Role: ${verifyResponse.data.user.role}`);

    // Test 3: Protected Route - Profile
    console.log('\n3️⃣ Testing Protected Route - Profile...');
    const profileResponse = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Profile Access Success:');
    console.log(`   Status: ${profileResponse.status}`);
    console.log(`   User Name: ${profileResponse.data.user.name}`);

    // Test 4: Protected Route - Admin Users List
    console.log('\n4️⃣ Testing Admin Route - Users List...');
    const usersResponse = await axios.get(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Admin Users Access Success:');
    console.log(`   Status: ${usersResponse.status}`);
    console.log(`   Users Count: ${usersResponse.data.users.length}`);

    console.log('\n🎉 All API tests passed! Backend is ready for Redux frontend.');

  } catch (error) {
    console.error('\n❌ API Test Failed:');
    console.error(`   Error: ${error.response?.data?.message || error.message}`);
    console.error(`   Status: ${error.response?.status}`);
  }
}

// Run tests
testAPIs();