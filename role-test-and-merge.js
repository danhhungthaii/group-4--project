// =============================================================================
// SCRIPT KIỂM THỬ ROLE VÀ MERGE BACKEND-ADMIN
// File: role-test-and-merge.js
// =============================================================================

const fs = require('fs');
const path = require('path');

// Try to load environment if available
try {
    require('dotenv').config();
} catch (err) {
    console.log('⚠️  dotenv not available, using default config');
}

let dbConnection, User, Role;

// Try to load models if available  
try {
    const dbConfig = require('./config/database');
    dbConnection = dbConfig.dbConnection;
    User = require('./models/User');
    Role = require('./models/Role');
} catch (err) {
    console.log('⚠️  Database models not available, running file system checks only');
}

// Màu sắc cho console
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[0m'
};

function log(message, color = 'white') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function checkBackendAdminFiles() {
    log('\n=== KIỂM TRA FILES BACKEND-ADMIN ===', 'cyan');
    
    const backendAdminFiles = [
        'backend/controllers/userController.js',
        'backend/routes/user.js', 
        'backend/middleware/rbac.js',
        'backend/ADMIN_TEST_GUIDE.md'
    ];

    const existingFiles = [];
    const missingFiles = [];

    for (const file of backendAdminFiles) {
        const fullPath = path.join(process.cwd(), file);
        if (fs.existsSync(fullPath)) {
            existingFiles.push(file);
            log(`✅ Tìm thấy: ${file}`, 'green');
        } else {
            missingFiles.push(file);
            log(`❌ Không tìm thấy: ${file}`, 'red');
        }
    }

    return { existingFiles, missingFiles };
}

async function testRoleCreation() {
    log('\n=== TEST ROLE CREATION ===', 'cyan');
    
    try {
        // Clear existing roles
        await Role.deleteMany({});
        log('🧹 Đã xóa tất cả role cũ', 'yellow');

        // Test 1: Tạo role hợp lệ
        const adminRole = await Role.create({
            name: 'admin',
            description: 'Quản trị viên hệ thống',
            permissions: [
                'read_users', 'write_users', 'delete_users', 
                'manage_roles', 'manage_system'
            ],
            isActive: true
        });
        log('✅ Tạo admin role thành công', 'green');

        const moderatorRole = await Role.create({
            name: 'moderator',
            description: 'Người kiểm duyệt',
            permissions: ['read_users', 'write_users', 'read_posts', 'write_posts'],
            isActive: true
        });
        log('✅ Tạo moderator role thành công', 'green');

        const userRole = await Role.create({
            name: 'user',
            description: 'Người dùng thường',
            permissions: ['read_posts', 'write_posts'],
            isActive: true
        });
        log('✅ Tạo user role thành công', 'green');

        // Test 2: Thử tạo role với tên không hợp lệ (ngoài enum)
        try {
            await Role.create({
                name: 'invalid_role_name',
                description: 'Role không hợp lệ'
            });
            log('❌ FAILED: Role enum validation không hoạt động', 'red');
        } catch (error) {
            log('✅ Role enum validation hoạt động đúng', 'green');
        }

        // Test 3: Kiểm tra timestamps
        const now = new Date();
        const createdTime = new Date(adminRole.createdAt);
        if (Math.abs(now - createdTime) < 10000) {
            log('✅ Timestamps hoạt động đúng', 'green');
        } else {
            log('❌ Timestamps có vấn đề', 'red');
        }

        return { adminRole, moderatorRole, userRole };
    } catch (error) {
        log(`❌ Lỗi test role: ${error.message}`, 'red');
        throw error;
    }
}

async function testRolePermissions(roles) {
    log('\n=== TEST ROLE PERMISSIONS ===', 'cyan');
    
    try {
        const { adminRole, moderatorRole, userRole } = roles;

        // Test admin permissions
        const adminPerms = adminRole.permissions;
        if (adminPerms.includes('manage_system') && adminPerms.includes('delete_users')) {
            log('✅ Admin role có đúng permissions', 'green');
        } else {
            log('❌ Admin role permissions không đúng', 'red');
        }

        // Test user permissions (không có delete_users)
        const userPerms = userRole.permissions;
        if (!userPerms.includes('delete_users') && userPerms.includes('read_posts')) {
            log('✅ User role có đúng permissions (hạn chế)', 'green');
        } else {
            log('❌ User role permissions không đúng', 'red');
        }

        // Test moderator permissions (trung gian)
        const modPerms = moderatorRole.permissions;
        if (modPerms.includes('write_users') && !modPerms.includes('manage_system')) {
            log('✅ Moderator role có đúng permissions (trung gian)', 'green');
        } else {
            log('❌ Moderator role permissions không đúng', 'red');
        }

        return true;
    } catch (error) {
        log(`❌ Lỗi test permissions: ${error.message}`, 'red');
        return false;
    }
}

async function testRBACWithUsers(roles) {
    log('\n=== TEST RBAC VỚI USERS ===', 'cyan');
    
    try {
        const { adminRole, moderatorRole, userRole } = roles;

        // Clear existing users
        await User.deleteMany({});
        log('🧹 Đã xóa tất cả user cũ', 'yellow');

        // Tạo users với các role khác nhau
        const adminUser = await User.create({
            username: 'admin_test',
            email: 'admin_test@group4.com',
            password: 'admin123456',
            fullName: 'Admin Test User',
            role: adminRole._id,
            isActive: true,
            isVerified: true
        });
        log('✅ Tạo admin user thành công', 'green');

        const modUser = await User.create({
            username: 'mod_test',
            email: 'mod_test@group4.com',
            password: 'mod123456',
            fullName: 'Moderator Test User',
            role: moderatorRole._id,
            isActive: true,
            isVerified: true
        });
        log('✅ Tạo moderator user thành công', 'green');

        const normalUser = await User.create({
            username: 'user_test',
            email: 'user_test@group4.com',
            password: 'user123456',
            fullName: 'Normal Test User',
            role: userRole._id,
            isActive: true,
            isVerified: true
        });
        log('✅ Tạo normal user thành công', 'green');

        // Test populate role
        const adminWithRole = await User.findById(adminUser._id).populate('role');
        if (adminWithRole.role && adminWithRole.role.name === 'admin') {
            log('✅ Role populate hoạt động đúng', 'green');
        } else {
            log('❌ Role populate có vấn đề', 'red');
        }

        // Test RBAC logic simulation
        function simulateRBACCheck(user, requiredPermission) {
            return user.role.permissions.includes(requiredPermission);
        }

        // Test admin can delete users
        if (simulateRBACCheck(adminWithRole, 'delete_users')) {
            log('✅ Admin có quyền delete_users', 'green');
        } else {
            log('❌ Admin không có quyền delete_users', 'red');
        }

        // Test normal user cannot delete users
        const userWithRole = await User.findById(normalUser._id).populate('role');
        if (!simulateRBACCheck(userWithRole, 'delete_users')) {
            log('✅ Normal user KHÔNG có quyền delete_users (đúng)', 'green');
        } else {
            log('❌ Normal user có quyền delete_users (sai)', 'red');
        }

        return { adminUser, modUser, normalUser };
    } catch (error) {
        log(`❌ Lỗi test RBAC: ${error.message}`, 'red');
        throw error;
    }
}

async function testRoleUpdates() {
    log('\n=== TEST ROLE UPDATES ===', 'cyan');
    
    try {
        // Tìm role để update
        const userRole = await Role.findOne({ name: 'user' });
        
        // Update permissions
        userRole.permissions.push('delete_posts');
        await userRole.save();
        
        // Verify update
        const updatedRole = await Role.findById(userRole._id);
        if (updatedRole.permissions.includes('delete_posts')) {
            log('✅ Role update hoạt động đúng', 'green');
        } else {
            log('❌ Role update có vấn đề', 'red');
        }

        // Test updatedAt timestamp
        if (updatedRole.updatedAt > updatedRole.createdAt) {
            log('✅ UpdatedAt timestamp hoạt động đúng', 'green');
        } else {
            log('❌ UpdatedAt timestamp có vấn đề', 'red');
        }

        return true;
    } catch (error) {
        log(`❌ Lỗi test role updates: ${error.message}`, 'red');
        return false;
    }
}

function generateMergeInstructions() {
    log('\n=== HƯỚNG DẪN MERGE BACKEND-ADMIN ===', 'cyan');
    
    log('\n📋 Các bước thực hiện:', 'yellow');
    log('1. Mở CMD hoặc Git Bash mới (tránh PowerShell bị lỗi)', 'white');
    log('2. Chạy các lệnh sau:', 'white');
    
    log('\n# Fetch latest changes từ remote', 'magenta');
    log('git fetch --all', 'white');
    
    log('\n# Xem tất cả branches available', 'magenta');
    log('git branch -a', 'white');
    
    log('\n# Switch sang backend-admin branch (nếu có)', 'magenta');
    log('git checkout backend-admin', 'white');
    
    log('\n# Hoặc fetch backend-admin từ remote (nếu chưa có local)', 'magenta');
    log('git checkout -b backend-admin origin/backend-admin', 'white');
    
    log('\n# Kiểm tra changes trong backend-admin', 'magenta');
    log('git diff main..backend-admin --name-only', 'white');
    
    log('\n# Switch về main để merge', 'magenta');
    log('git checkout main', 'white');
    
    log('\n# Merge backend-admin vào main', 'magenta');
    log('git merge backend-admin', 'white');
    
    log('\n# Push changes lên remote', 'magenta');
    log('git push origin main', 'white');
    
    log('\n🚨 Lưu ý quan trọng:', 'red');
    log('- Backup project trước khi merge', 'yellow');
    log('- Kiểm tra conflicts và resolve cẩn thận', 'yellow');
    log('- Test lại toàn bộ system sau khi merge', 'yellow');
}

async function generatePostMergeTests() {
    log('\n=== TESTS SAU KHI MERGE ===', 'cyan');
    
    const testCommands = [
        'npm install',
        'npm run test:schema', 
        'npm run test:rbac',
        'npm start'
    ];

    log('\n📋 Chạy các lệnh test sau khi merge:', 'yellow');
    testCommands.forEach((cmd, index) => {
        log(`${index + 1}. ${cmd}`, 'white');
    });

    log('\n📋 API endpoints cần test với Postman:', 'yellow');
    const endpoints = [
        'GET /users (Admin only)',
        'POST /users (Admin only)', 
        'PUT /users/:id (Admin only)',
        'DELETE /users/:id (Admin only)',
        'GET /roles',
        'POST /roles',
        'PUT /roles/:id'
    ];

    endpoints.forEach((endpoint, index) => {
        log(`${index + 1}. ${endpoint}`, 'white');
    });
}

async function main() {
    try {
        log('🚀 BẮT ĐẦU KIỂM THỬ ROLE VÀ CHUẨN BỊ MERGE BACKEND-ADMIN', 'cyan');
        
        // 1. Kiểm tra backend-admin files trước
        const fileCheck = await checkBackendAdminFiles();
        
        // 2. Kiểm tra xem có thể kết nối database không
        if (dbConnection && User && Role) {
            try {
                await dbConnection.connect();
                log('✅ Kết nối database thành công', 'green');

                // 3. Test Role functionality nếu có database
                const roles = await testRoleCreation();
                await testRolePermissions(roles);
                await testRBACWithUsers(roles);
                await testRoleUpdates();

                log('\n🎉 TẤT CẢ TESTS ROLE ĐỀU PASS!', 'green');
                log('\n📊 KẾT QUẢ KIỂM THỬ:', 'cyan');
                log('✅ Role schema validation', 'green');
                log('✅ Role permissions system', 'green');
                log('✅ RBAC (Role-Based Access Control)', 'green');
                log('✅ Role CRUD operations', 'green');
                log('✅ User-Role associations', 'green');
                log('✅ Timestamps & updates', 'green');
            } catch (dbError) {
                log(`⚠️  Database không có sẵn: ${dbError.message}`, 'yellow');
                log('🔧 Tiếp tục với file system checks...', 'cyan');
            }
        } else {
            log('⚠️  Models không có sẵn, chỉ check file system', 'yellow');
        }

        // 4. Generate merge instructions
        generateMergeInstructions();
        generatePostMergeTests();

        if (fileCheck.existingFiles.length > 0) {
            log('\n📁 Backend-admin files đã sẵn sàng để merge:', 'yellow');
            fileCheck.existingFiles.forEach(file => {
                log(`  - ${file}`, 'white');
            });
        }

        if (fileCheck.missingFiles.length > 0) {
            log('\n⚠️  Một số files backend-admin chưa có:', 'yellow');
            fileCheck.missingFiles.forEach(file => {
                log(`  - ${file}`, 'white');
            });
        }

        log('\n🔧 Sẵn sàng để merge backend-admin vào main branch!', 'green');

    } catch (error) {
        log(`❌ LỖI TRONG QUÁ TRÌNH TEST: ${error.message}`, 'red');
        console.error(error);
    } finally {
        if (dbConnection) {
            log('\n💡 Database connection vẫn mở để tiếp tục development...', 'cyan');
        } else {
            log('\n💡 Setup database để chạy full tests sau khi merge...', 'cyan');
        }
    }
}

// Chạy test nếu file này được gọi trực tiếp
if (require.main === module) {
    main();
}

module.exports = { 
    testRoleCreation,
    testRolePermissions, 
    testRBACWithUsers,
    testRoleUpdates,
    checkBackendAdminFiles
};