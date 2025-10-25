/**
 * Test script để kiểm tra login API
 */

const axios = require('axios');

async function testLogin() {
  // Test với localhost trước
  const API_BASE_URL = 'http://localhost:5000/api';
  
  try {
    console.log('🔍 Testing login API...');
    console.log('API URL:', API_BASE_URL + '/auth/login');
    
    // Test với thông tin admin từ backend mock data
    const loginData = {
      email: 'admin@example.com',  // Sẽ match với backend field
      password: 'password123'
    };
    
    console.log('Login data:', loginData);
    
    const response = await axios.post(API_BASE_URL + '/auth/login', loginData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login successful!');
    console.log('Response:', response.data);
    
    // Test profile API với token
    if (response.data.data && response.data.data.accessToken) {
      console.log('\n🔍 Testing profile API...');
      const profileResponse = await axios.get(API_BASE_URL + '/auth/profile', {
        headers: {
          'Authorization': `Bearer ${response.data.data.accessToken}`
        }
      });
      
      console.log('✅ Profile API successful!');
      console.log('Profile:', profileResponse.data);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response:', error.response.data);
    }
    if (error.code) {
      console.log('Error Code:', error.code);
    }
    if (error.cause) {
      console.log('Cause:', error.cause);
    }
    console.log('Full error:', error);
  }
}

testLogin();