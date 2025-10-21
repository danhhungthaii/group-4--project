const fs = require('fs');
const path = require('path');

// Test tạo file đơn giản
async function testFileCreation() {
  try {
    const uploadDir = path.join(__dirname, 'uploads', 'avatars');
    console.log('Upload directory:', uploadDir);
    
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('Directory created');
    }
    
    // Test write file
    const testFile = path.join(uploadDir, 'test.txt');
    await fs.promises.writeFile(testFile, 'Hello World');
    console.log('✅ File write successful:', testFile);
    
    // Test read file
    const content = await fs.promises.readFile(testFile, 'utf8');
    console.log('✅ File read successful:', content);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testFileCreation();