const FormData = require('form-data');
const fs = require('fs');
// Use require instead of import for Node.js
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testUpload() {
  try {
    console.log('🔐 Step 1: Login...');
    
    // Login first
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'testuser',
        password: 'password123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login result:', loginData);
    
    if (!loginData.success) {
      console.error('❌ Login failed');
      return;
    }
    
    const token = loginData.token;
    console.log('✅ Login successful, token received');
    
    console.log('📤 Step 2: Upload avatar...');
    
    // Create a simple test file buffer
    const testImageBuffer = Buffer.from('test image data for debugging');
    
    // Create form data
    const form = new FormData();
    form.append('avatar', testImageBuffer, {
      filename: 'test-avatar.jpg',
      contentType: 'image/jpeg'
    });
    
    // Upload avatar
    const uploadResponse = await fetch('http://localhost:5000/api/upload/avatar', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...form.getHeaders()
      },
      body: form
    });
    
    const uploadData = await uploadResponse.json();
    console.log('Upload result:', uploadData);
    
    if (uploadData.success) {
      console.log('✅ Upload successful!');
    } else {
      console.error('❌ Upload failed:', uploadData.message);
    }
    
  } catch (error) {
    console.error('💥 Test error:', error.message);
  }
}

testUpload();