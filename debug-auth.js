/**
 * Debug Authentication Test
 * Kiểm tra chi tiết login process
 */

const bcrypt = require('bcryptjs');

// Test data
const testPassword = 'password123';
const correctHash = '$2b$10$LK00xxmANes1XKzIkfpTOOS61ysaWaazx6O1IAO6hiUPCEW0TtxMu';

console.log('🔍 Debug Authentication Test');
console.log('============================');
console.log('Password to test:', testPassword);
console.log('Hash in database:', correctHash);
console.log('');

// Test bcrypt compare
const isValid = bcrypt.compareSync(testPassword, correctHash);
console.log('✅ BCrypt compare result:', isValid);

// Test with different variations
const variations = [
    'password123',
    'Password123', 
    'password 123',
    'password123 ',
    ' password123'
];

console.log('\n🧪 Testing password variations:');
variations.forEach((pwd, index) => {
    const result = bcrypt.compareSync(pwd, correctHash);
    console.log(`${index + 1}. "${pwd}" → ${result ? '✅ VALID' : '❌ INVALID'}`);
});

// Generate fresh hash for verification  
console.log('\n🔄 Generating fresh hash:');
const freshHash = bcrypt.hashSync(testPassword, 10);
console.log('Fresh hash:', freshHash);
console.log('Fresh hash test:', bcrypt.compareSync(testPassword, freshHash));

console.log('\n🌐 Test API endpoint:');
console.log('curl -X POST http://localhost:5002/api/auth/login \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -d \'{"email":"admin@test.com","password":"password123"}\'');