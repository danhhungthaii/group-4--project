const { dbConnection } = require('../config/database');
const Role = require('../models/Role');
const User = require('../models/User');

class DatabaseTester {
    constructor() {
        this.testResults = [];
    }

    log(message, success = true) {
        const status = success ? '✅' : '❌';
        const logMessage = `${status} ${message}`;
        console.log(logMessage);
        this.testResults.push({ message, success });
    }

    async testConnection() {
        try {
            console.log('🔍 Test 1: Kiểm tra kết nối database...');
            
            await dbConnection.connect();
            const status = dbConnection.getConnectionStatus();
            
            if (status.isConnected) {
                this.log(`Kết nối thành công - DB: ${status.name} @ ${status.host}:${status.port}`);
            } else {
                this.log('Kết nối thất bại', false);
            }
        } catch (error) {
            this.log(`Lỗi kết nối: ${error.message}`, false);
        }
    }

    async testRoleOperations() {
        try {
            console.log('\n🔍 Test 2: Kiểm tra operations trên Role...');
            
            // Test tạo role
            const testRole = new Role({
                name: 'test_role',
                description: 'Role dùng để test',
                permissions: ['read_posts'],
                isActive: true
            });
            
            await testRole.save();
            this.log('Tạo role thành công');
            
            // Test tìm role
            const foundRole = await Role.findOne({ name: 'test_role' });
            if (foundRole) {
                this.log('Tìm role thành công');
            } else {
                this.log('Không tìm thấy role', false);
            }
            
            // Test cập nhật role
            await Role.updateOne(
                { name: 'test_role' }, 
                { description: 'Role đã được cập nhật' }
            );
            this.log('Cập nhật role thành công');
            
            // Test xóa role
            await Role.deleteOne({ name: 'test_role' });
            this.log('Xóa role thành công');
            
        } catch (error) {
            this.log(`Lỗi test Role: ${error.message}`, false);
        }
    }

    async testUserOperations() {
        try {
            console.log('\n🔍 Test 3: Kiểm tra operations trên User...');
            
            // Tạo role để test
            const testRole = await Role.create({
                name: 'test_user_role',
                description: 'Role cho test user',
                permissions: ['read_posts'],
                isActive: true
            });
            
            // Test tạo user
            const testUser = new User({
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
                fullName: 'Test User',
                phoneNumber: '0123456789',
                role: testRole._id,
                isActive: true,
                isVerified: true
            });
            
            await testUser.save();
            this.log('Tạo user thành công');
            
            // Test password hashing
            const isPasswordHashed = testUser.password !== 'password123';
            if (isPasswordHashed) {
                this.log('Password được hash thành công');
            } else {
                this.log('Password không được hash', false);
            }
            
            // Test compare password
            const isPasswordValid = await testUser.comparePassword('password123');
            if (isPasswordValid) {
                this.log('So sánh password thành công');
            } else {
                this.log('So sánh password thất bại', false);
            }
            
            // Test populate role
            await testUser.populateRole();
            if (testUser.role && testUser.role.name) {
                this.log(`Populate role thành công - Role: ${testUser.role.name}`);
            } else {
                this.log('Populate role thất bại', false);
            }
            
            // Test find by email or username
            const foundUser = await User.findByEmailOrUsername('test@example.com');
            if (foundUser) {
                this.log('Tìm user bằng email thành công');
            } else {
                this.log('Không tìm thấy user bằng email', false);
            }
            
            // Cleanup
            await User.deleteOne({ _id: testUser._id });
            await Role.deleteOne({ _id: testRole._id });
            this.log('Dọn dẹp test data thành công');
            
        } catch (error) {
            this.log(`Lỗi test User: ${error.message}`, false);
        }
    }

    async testUserSecurity() {
        try {
            console.log('\n🔍 Test 4: Kiểm tra tính năng bảo mật User...');
            
            // Tạo role để test
            const testRole = await Role.create({
                name: 'security_test_role',
                description: 'Role cho security test',
                permissions: ['read_posts'],
                isActive: true
            });
            
            // Test user
            const securityUser = await User.create({
                username: 'securityuser',
                email: 'security@example.com',
                password: 'password123',
                fullName: 'Security Test User',
                role: testRole._id,
                isActive: true,
                isVerified: true
            });
            
            // Test login attempts
            await securityUser.incLoginAttempts();
            await securityUser.incLoginAttempts();
            const updatedUser = await User.findById(securityUser._id);
            
            if (updatedUser.loginAttempts === 2) {
                this.log('Tăng login attempts thành công');
            } else {
                this.log('Tăng login attempts thất bại', false);
            }
            
            // Test reset login attempts
            await updatedUser.resetLoginAttempts();
            const resetUser = await User.findById(securityUser._id);
            
            if (resetUser.loginAttempts === undefined || resetUser.loginAttempts === 0) {
                this.log('Reset login attempts thành công');
            } else {
                this.log('Reset login attempts thất bại', false);
            }
            
            // Cleanup
            await User.deleteOne({ _id: securityUser._id });
            await Role.deleteOne({ _id: testRole._id });
            this.log('Dọn dẹp security test data thành công');
            
        } catch (error) {
            this.log(`Lỗi test Security: ${error.message}`, false);
        }
    }

    async testIndexes() {
        try {
            console.log('\n🔍 Test 5: Kiểm tra database indexes...');
            
            // Test User indexes
            const userIndexes = await User.collection.getIndexes();
            const hasEmailIndex = Object.keys(userIndexes).some(key => key.includes('email'));
            const hasUsernameIndex = Object.keys(userIndexes).some(key => key.includes('username'));
            
            if (hasEmailIndex) {
                this.log('Index email cho User tồn tại');
            } else {
                this.log('Index email cho User không tồn tại', false);
            }
            
            if (hasUsernameIndex) {
                this.log('Index username cho User tồn tại');
            } else {
                this.log('Index username cho User không tồn tại', false);
            }
            
            // Test Role indexes
            const roleIndexes = await Role.collection.getIndexes();
            const hasNameIndex = Object.keys(roleIndexes).some(key => key.includes('name'));
            
            if (hasNameIndex) {
                this.log('Index name cho Role tồn tại');
            } else {
                this.log('Index name cho Role không tồn tại', false);
            }
            
        } catch (error) {
            this.log(`Lỗi test Indexes: ${error.message}`, false);
        }
    }

    async runAllTests() {
        try {
            console.log('🚀 Bắt đầu kiểm thử database...\n');
            
            await this.testConnection();
            await this.testRoleOperations();
            await this.testUserOperations();
            await this.testUserSecurity();
            await this.testIndexes();
            
            console.log('\n📊 KẾT QUẢ KIỂM THỬ:');
            console.log('=' .repeat(50));
            
            const totalTests = this.testResults.length;
            const passedTests = this.testResults.filter(r => r.success).length;
            const failedTests = totalTests - passedTests;
            
            console.log(`Tổng số test: ${totalTests}`);
            console.log(`✅ Passed: ${passedTests}`);
            console.log(`❌ Failed: ${failedTests}`);
            console.log(`📈 Success rate: ${((passedTests/totalTests) * 100).toFixed(1)}%`);
            
            if (failedTests > 0) {
                console.log('\n❌ FAILED TESTS:');
                this.testResults
                    .filter(r => !r.success)
                    .forEach(r => console.log(`   - ${r.message}`));
            }
            
        } catch (error) {
            console.error('💥 Lỗi trong quá trình test:', error.message);
        }
    }
}

// Export tester
const tester = new DatabaseTester();

// Nếu file được chạy trực tiếp
if (require.main === module) {
    (async () => {
        try {
            await tester.runAllTests();
        } catch (error) {
            console.error('Test suite thất bại:', error.message);
        } finally {
            await dbConnection.disconnect();
            process.exit(0);
        }
    })();
}

module.exports = tester;