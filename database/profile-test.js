const { dbConnection } = require('../config/database');
const Role = require('../models/Role');
const User = require('../models/User');

class ProfileManagementTester {
    constructor() {
        this.testResults = [];
        this.testUser = null;
        this.testRole = null;
    }

    log(message, success = true) {
        const status = success ? '✅' : '❌';
        const logMessage = `${status} ${message}`;
        console.log(logMessage);
        this.testResults.push({ message, success });
    }

    async setupTestData() {
        try {
            console.log('🛠️  Setup: Tạo test data cho Profile Management...');
            
            // Tạo test role
            this.testRole = await Role.create({
                name: 'profile_test_role',
                description: 'Role cho profile management test',
                permissions: ['read_posts', 'write_posts'],
                isActive: true
            });
            
            // Tạo test user
            this.testUser = await User.create({
                username: 'profile_testuser',
                email: 'profile.test@group4.com',
                password: 'testpassword123',
                fullName: 'Profile Test User',
                phoneNumber: '0999888777',
                dateOfBirth: new Date('1995-05-15'),
                gender: 'male',
                role: this.testRole._id,
                isActive: true,
                isVerified: true
            });
            
            this.log('Test data setup thành công');
            return true;
        } catch (error) {
            this.log(`Setup test data thất bại: ${error.message}`, false);
            return false;
        }
    }

    async testViewProfile() {
        try {
            console.log('\n👤 Test 1: View Profile...');
            console.log('─'.repeat(50));
            
            // Test lấy profile với populate role
            const profile = await User.findById(this.testUser._id)
                .populate('role', 'name description permissions')
                .select('-password -verificationToken -resetPasswordToken');
            
            if (profile) {
                this.log('Lấy profile thành công');
                this.log(`Username: ${profile.username}`);
                this.log(`Full Name: ${profile.fullName}`);
                this.log(`Email: ${profile.email}`);
                this.log(`Role: ${profile.role.name}`);
                this.log(`Phone: ${profile.phoneNumber}`);
                this.log(`Gender: ${profile.gender}`);
                this.log(`Birth Date: ${profile.dateOfBirth?.toLocaleDateString('vi-VN')}`);
            } else {
                this.log('Không lấy được profile', false);
            }
            
            // Test profile statistics
            const accountAge = Math.floor((new Date() - profile.createdAt) / (1000 * 60 * 60 * 24));
            const accountStatus = profile.isActive ? (profile.isVerified ? 'Hoạt động' : 'Chưa xác thực') : 'Bị khóa';
            
            this.log(`Account Age: ${accountAge} ngày`);
            this.log(`Status: ${accountStatus}`);
            
        } catch (error) {
            this.log(`Test View Profile thất bại: ${error.message}`, false);
        }
    }

    async testUpdateProfile() {
        try {
            console.log('\n✏️  Test 2: Update Profile...');
            console.log('─'.repeat(50));
            
            // Test cập nhật thông tin cơ bản
            const updateData = {
                fullName: 'Profile Test User Updated',
                phoneNumber: '0777666555',
                dateOfBirth: new Date('1994-12-25'),
                gender: 'female',
                avatar: 'https://example.com/avatar.jpg'
            };
            
            const updatedProfile = await User.findByIdAndUpdate(
                this.testUser._id,
                updateData,
                { new: true, runValidators: true }
            ).populate('role', 'name description permissions')
             .select('-password -verificationToken -resetPasswordToken');
            
            if (updatedProfile) {
                this.log('Cập nhật profile thành công');
                this.log(`New Full Name: ${updatedProfile.fullName}`);
                this.log(`New Phone: ${updatedProfile.phoneNumber}`);
                this.log(`New Gender: ${updatedProfile.gender}`);
                this.log(`New Birth Date: ${updatedProfile.dateOfBirth?.toLocaleDateString('vi-VN')}`);
                
                // Verify changes
                if (updatedProfile.fullName === updateData.fullName) {
                    this.log('Full name được cập nhật đúng');
                } else {
                    this.log('Full name không được cập nhật đúng', false);
                }
                
                if (updatedProfile.phoneNumber === updateData.phoneNumber) {
                    this.log('Phone number được cập nhật đúng');
                } else {
                    this.log('Phone number không được cập nhật đúng', false);
                }
            } else {
                this.log('Không thể cập nhật profile', false);
            }
            
        } catch (error) {
            this.log(`Test Update Profile thất bại: ${error.message}`, false);
        }
    }

    async testChangePassword() {
        try {
            console.log('\n🔐 Test 3: Change Password...');
            console.log('─'.repeat(50));
            
            // Test đổi mật khẩu
            const currentPassword = 'testpassword123';
            const newPassword = 'newtestpassword456';
            
            // Lấy user để test password
            const user = await User.findById(this.testUser._id);
            
            // Verify current password
            const isCurrentValid = await user.comparePassword(currentPassword);
            if (isCurrentValid) {
                this.log('Xác thực mật khẩu hiện tại thành công');
                
                // Change password
                user.password = newPassword;
                await user.save();
                this.log('Lưu mật khẩu mới thành công');
                
                // Verify new password
                const updatedUser = await User.findById(this.testUser._id);
                const isNewValid = await updatedUser.comparePassword(newPassword);
                
                if (isNewValid) {
                    this.log('Xác thực mật khẩu mới thành công');
                } else {
                    this.log('Xác thực mật khẩu mới thất bại', false);
                }
                
                // Test old password should fail
                const isOldStillValid = await updatedUser.comparePassword(currentPassword);
                if (!isOldStillValid) {
                    this.log('Mật khẩu cũ đã không còn hiệu lực (đúng)');
                } else {
                    this.log('Mật khẩu cũ vẫn còn hiệu lực (sai)', false);
                }
                
            } else {
                this.log('Xác thực mật khẩu hiện tại thất bại', false);
            }
            
        } catch (error) {
            this.log(`Test Change Password thất bại: ${error.message}`, false);
        }
    }

    async testProfileValidation() {
        try {
            console.log('\n✅ Test 4: Profile Validation...');
            console.log('─'.repeat(50));
            
            // Test invalid phone number
            try {
                await User.findByIdAndUpdate(
                    this.testUser._id,
                    { phoneNumber: 'invalid-phone' },
                    { new: true, runValidators: true }
                );
                this.log('Validation không hoạt động (sai)', false);
            } catch (validationError) {
                this.log('Phone number validation hoạt động đúng');
            }
            
            // Test invalid email format
            try {
                await User.findByIdAndUpdate(
                    this.testUser._id,
                    { email: 'invalid-email-format' },
                    { new: true, runValidators: true }
                );
                this.log('Email validation không hoạt động (sai)', false);
            } catch (validationError) {
                this.log('Email validation hoạt động đúng');
            }
            
            // Test invalid gender
            try {
                await User.findByIdAndUpdate(
                    this.testUser._id,
                    { gender: 'invalid-gender' },
                    { new: true, runValidators: true }
                );
                this.log('Gender validation không hoạt động (sai)', false);
            } catch (validationError) {
                this.log('Gender validation hoạt động đúng');
            }
            
        } catch (error) {
            this.log(`Test Profile Validation thất bại: ${error.message}`, false);
        }
    }

    async testActivityHistory() {
        try {
            console.log('\n📊 Test 5: Activity History...');
            console.log('─'.repeat(50));
            
            // Mock activity history (trong thực tế sẽ có bảng activity_logs)
            const user = await User.findById(this.testUser._id);
            
            const activities = [
                {
                    action: 'profile_update',
                    description: 'Cập nhật thông tin cá nhân',
                    timestamp: user.updatedAt,
                    status: 'success'
                },
                {
                    action: 'password_change',
                    description: 'Đổi mật khẩu',
                    timestamp: new Date(),
                    status: 'success'
                },
                {
                    action: 'account_created',
                    description: 'Tạo tài khoản',
                    timestamp: user.createdAt,
                    status: 'success'
                }
            ];
            
            // Sort by timestamp descending
            activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            this.log('Tạo activity history thành công');
            this.log(`Tổng số activities: ${activities.length}`);
            
            activities.forEach((activity, index) => {
                this.log(`${index + 1}. ${activity.description} - ${activity.timestamp.toLocaleString('vi-VN')}`);
            });
            
        } catch (error) {
            this.log(`Test Activity History thất bại: ${error.message}`, false);
        }
    }

    async cleanupTestData() {
        try {
            console.log('\n🧹 Cleanup: Xóa test data...');
            
            if (this.testUser) {
                await User.deleteOne({ _id: this.testUser._id });
                this.log('Xóa test user thành công');
            }
            
            if (this.testRole) {
                await Role.deleteOne({ _id: this.testRole._id });
                this.log('Xóa test role thành công');
            }
            
        } catch (error) {
            this.log(`Cleanup thất bại: ${error.message}`, false);
        }
    }

    async runAllTests() {
        try {
            console.log('🚀 Bắt đầu kiểm thử Profile Management...\n');
            
            // Kết nối database
            await dbConnection.connect();
            
            // Setup test data
            const setupSuccess = await this.setupTestData();
            if (!setupSuccess) {
                console.log('❌ Không thể setup test data, dừng test');
                return;
            }
            
            // Run tests
            await this.testViewProfile();
            await this.testUpdateProfile();
            await this.testChangePassword();
            await this.testProfileValidation();
            await this.testActivityHistory();
            
            // Cleanup
            await this.cleanupTestData();
            
            // Results
            console.log('\n📊 KẾT QUẢ KIỂM THỬ PROFILE MANAGEMENT:');
            console.log('=' .repeat(60));
            
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
            
            console.log('\n🎉 Profile Management testing hoàn tất!');
            
        } catch (error) {
            console.error('💥 Lỗi trong quá trình test:', error.message);
        }
    }
}

// Export tester
const profileTester = new ProfileManagementTester();

// Nếu file được chạy trực tiếp
if (require.main === module) {
    (async () => {
        try {
            await profileTester.runAllTests();
        } catch (error) {
            console.error('Profile Management test suite thất bại:', error.message);
        } finally {
            await dbConnection.disconnect();
            process.exit(0);
        }
    })();
}

module.exports = profileTester;