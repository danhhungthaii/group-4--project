// test-api.js - Script để test các API endpoints
const https = require('https');
const http = require('http');

const API_URL = 'http://localhost:5000/api';

async function testLogin() {
  console.log('🔐 Testing Login API...');
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'password123'
      })
    });
    
    const data = await response.json();
    console.log('✅ Login Response:', JSON.stringify(data, null, 2));
    return data.data;
  } catch (error) {
    console.error('❌ Login Error:', error.message);
    return null;
  }
}

async function testProtectedRoute(accessToken) {
  console.log('\n🔒 Testing Protected Route...');
  try {
    const response = await fetch(`${API_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    const data = await response.json();
    console.log('✅ Profile Response:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('❌ Profile Error:', error.message);
    return null;
  }
}

async function testRefreshToken(refreshToken) {
  console.log('\n🔄 Testing Refresh Token...');
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        refreshToken: refreshToken
      })
    });
    
    const data = await response.json();
    console.log('✅ Refresh Response:', JSON.stringify(data, null, 2));
    return data.data;
  } catch (error) {
    console.error('❌ Refresh Error:', error.message);
    return null;
  }
}

async function testLogout(refreshToken) {
  console.log('\n🚪 Testing Logout...');
  try {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        refreshToken: refreshToken
      })
    });
    
    const data = await response.json();
    console.log('✅ Logout Response:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('❌ Logout Error:', error.message);
    return null;
  }
}

async function testExpiredToken() {
  console.log('\n⏰ Testing Expired Token...');
  try {
    // Token giả lập đã hết hạn
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTYwMDAwMDkwMH0.expired';
    
    const response = await fetch(`${API_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${expiredToken}`
      }
    });
    
    const data = await response.json();
    console.log('✅ Expired Token Response:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('❌ Expired Token Error:', error.message);
    return null;
  }
}

async function runAllTests() {
  console.log('🚀 Starting API Tests...\n');
  
  // Test 1: Login
  const loginResult = await testLogin();
  if (!loginResult) {
    console.log('❌ Login failed, stopping tests');
    return;
  }
  
  const { accessToken, refreshToken } = loginResult;
  
  // Test 2: Protected route with valid token
  await testProtectedRoute(accessToken);
  
  // Test 3: Refresh token
  const refreshResult = await testRefreshToken(refreshToken);
  
  // Test 4: Protected route with new token
  if (refreshResult) {
    await testProtectedRoute(refreshResult.accessToken);
  }
  
  // Test 5: Expired token
  await testExpiredToken();
  
  // Test 6: Logout
  await testLogout(refreshToken);
  
  console.log('\n🎉 All tests completed!');
}

// Chạy tất cả tests
runAllTests().catch(console.error);