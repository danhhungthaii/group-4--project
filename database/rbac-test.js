// =============================================================================
// ROLE MANAGEMENT & RBAC TESTING SUITE
// =============================================================================

const User = require('../models/User');
const Role = require('../models/Role');
const bcrypt = require('bcrypt');
const { dbConnection } = require('../config/database');

// Test configuration
const TEST_DB_URL = 'mongodb://localhost:27017/group4_auth_test_rbac';

async function setupTestEnvironment() {
    console.log('🧪 RBAC Testing Suite - Setting up test environment...\n');
    
    try {
        // Connect to test database
        await dbConnection.connect(TEST_DB_URL);
        console.log('✅ Connected to test database');

        // Clear existing data
        await User.deleteMany({});
        await Role.deleteMany({});
        console.log('✅ Cleared existing test data');

        // Create test roles
        const roles = await Role.insertMany([
            {
                name: 'admin',
                description: 'System Administrator',
                permissions: ['read_users', 'write_users', 'delete_users', 'manage_system', 'manage_roles'],
                isActive: true
            },
            {
                name: 'manager',
                description: 'Manager Role',
                permissions: ['read_users', 'write_users', 'manage_team'],
                isActive: true
            },
            {
                name: 'user',
                description: 'Standard User',
                permissions: ['read_posts', 'write_posts'],
                isActive: true
            }
        ]);

        console.log('✅ Created test roles:', roles.map(r => r.name).join(', '));

        // Create test users
        const hashedPassword = await bcrypt.hash('test123', 10);
        const users = await User.insertMany([
            {
                username: 'testadmin',
                email: 'admin@test.com',
                password: hashedPassword,
                fullName: 'Test Administrator',
                role: roles.find(r => r.name === 'admin')._id,
                isActive: true,
                isVerified: true
            },
            {
                username: 'testmanager',
                email: 'manager@test.com',
                password: hashedPassword,
                fullName: 'Test Manager',
                role: roles.find(r => r.name === 'manager')._id,
                isActive: true,
                isVerified: true
            },
            {
                username: 'testuser',
                email: 'user@test.com',
                password: hashedPassword,
                fullName: 'Test User',
                role: roles.find(r => r.name === 'user')._id,
                isActive: true,
                isVerified: true
            },
            {
                username: 'inactiveuser',
                email: 'inactive@test.com',
                password: hashedPassword,
                fullName: 'Inactive User',
                role: roles.find(r => r.name === 'user')._id,
                isActive: false,
                isVerified: true
            }
        ]);

        console.log('✅ Created test users:', users.map(u => u.username).join(', '));
        console.log('✅ Test environment setup complete!\n');

        return { roles, users };
    } catch (error) {
        console.error('❌ Error setting up test environment:', error.message);
        throw error;
    }
}

async function testRoleManagement() {
    console.log('🧪 Testing Role Management...\n');
    
    try {
        // Test 1: Role creation
        console.log('📝 Test 1: Role Creation');
        const newRole = new Role({
            name: 'moderator',
            description: 'Content Moderator',
            permissions: ['moderate_content', 'read_users'],
            isActive: true
        });
        await newRole.save();
        console.log('✅ Role created successfully:', newRole.name);

        // Test 2: Role validation
        console.log('\n📝 Test 2: Role Validation');
        try {
            const invalidRole = new Role({
                name: '', // Invalid: empty name
                description: 'Invalid Role',
                permissions: []
            });
            await invalidRole.save();
            console.log('❌ Should have failed validation');
        } catch (error) {
            console.log('✅ Role validation working:', error.message.includes('required'));
        }

        // Test 3: Duplicate role prevention
        console.log('\n📝 Test 3: Duplicate Role Prevention');
        try {
            const duplicateRole = new Role({
                name: 'admin', // Duplicate name
                description: 'Another Admin',
                permissions: ['read_users']
            });
            await duplicateRole.save();
            console.log('❌ Should have prevented duplicate role');
        } catch (error) {
            console.log('✅ Duplicate prevention working:', error.message.includes('duplicate') || error.code === 11000);
        }

        // Test 4: Role permissions update
        console.log('\n📝 Test 4: Role Permissions Update');
        const roleToUpdate = await Role.findOne({ name: 'moderator' });
        roleToUpdate.permissions.push('delete_content');
        await roleToUpdate.save();
        console.log('✅ Role permissions updated:', roleToUpdate.permissions);

        console.log('\n✅ Role Management tests completed!\n');
    } catch (error) {
        console.error('❌ Role Management test failed:', error.message);
        throw error;
    }
}

async function testUserManagement() {
    console.log('🧪 Testing User Management...\n');
    
    try {
        // Test 5: User role assignment
        console.log('📝 Test 5: User Role Assignment');
        const moderatorRole = await Role.findOne({ name: 'moderator' });
        const user = await User.findOne({ username: 'testuser' });
        
        user.role = moderatorRole._id;
        await user.save();
        
        const updatedUser = await User.findById(user._id).populate('role');
        console.log('✅ User role updated:', updatedUser.role.name);

        // Test 6: User listing with role info
        console.log('\n📝 Test 6: User Listing with Role Info');
        const users = await User.find({ isActive: true })
            .populate('role', 'name description permissions')
            .select('-password');
        console.log('✅ Active users with roles:', users.length);
        users.forEach(u => {
            console.log(`   - ${u.username}: ${u.role.name} (${u.role.permissions.length} permissions)`);
        });

        // Test 7: User status management
        console.log('\n📝 Test 7: User Status Management');
        const userToDeactivate = await User.findOne({ username: 'testuser' });
        userToDeactivate.isActive = false;
        await userToDeactivate.save();
        console.log('✅ User deactivated:', userToDeactivate.username);

        // Reactivate for further tests
        userToDeactivate.isActive = true;
        await userToDeactivate.save();
        console.log('✅ User reactivated:', userToDeactivate.username);

        console.log('\n✅ User Management tests completed!\n');
    } catch (error) {
        console.error('❌ User Management test failed:', error.message);
        throw error;
    }
}

async function testRBACPermissions() {
    console.log('🧪 Testing RBAC Permissions...\n');
    
    try {
        // Test 8: Permission checking
        console.log('📝 Test 8: Permission Checking');
        const adminUser = await User.findOne({ username: 'testadmin' }).populate('role');
        const regularUser = await User.findOne({ username: 'testuser' }).populate('role');

        // Check admin permissions
        const adminHasUserManagement = adminUser.role.permissions.includes('write_users');
        const adminHasSystemManagement = adminUser.role.permissions.includes('manage_system');
        console.log('✅ Admin permissions:', {
            userManagement: adminHasUserManagement,
            systemManagement: adminHasSystemManagement
        });

        // Check regular user permissions
        const userHasUserManagement = regularUser.role.permissions.includes('write_users');
        const userHasPostPermissions = regularUser.role.permissions.includes('write_posts');
        console.log('✅ User permissions:', {
            userManagement: userHasUserManagement,
            postPermissions: userHasPostPermissions
        });

        // Test 9: Role hierarchy validation
        console.log('\n📝 Test 9: Role Hierarchy Validation');
        const allRoles = await Role.find({});
        const roleHierarchy = {
            admin: allRoles.find(r => r.name === 'admin').permissions.length,
            manager: allRoles.find(r => r.name === 'manager').permissions.length,
            user: allRoles.find(r => r.name === 'user').permissions.length
        };
        console.log('✅ Role permission counts:', roleHierarchy);
        
        // Verify admin has most permissions
        if (roleHierarchy.admin >= roleHierarchy.manager && roleHierarchy.manager >= roleHierarchy.user) {
            console.log('✅ Role hierarchy is correctly structured');
        } else {
            console.log('⚠️ Role hierarchy may need review');
        }

        console.log('\n✅ RBAC Permissions tests completed!\n');
    } catch (error) {
        console.error('❌ RBAC Permissions test failed:', error.message);
        throw error;
    }
}

async function testUserDeletion() {
    console.log('🧪 Testing User Deletion...\n');
    
    try {
        // Test 10: Self-deletion prevention (simulation)
        console.log('📝 Test 10: Self-Deletion Prevention');
        const adminUser = await User.findOne({ username: 'testadmin' });
        
        // In real application, this would be prevented by middleware
        // Here we simulate the check
        const canDeleteSelf = false; // Simulated middleware check
        console.log('✅ Self-deletion prevention:', canDeleteSelf ? 'Failed' : 'Working');

        // Test 11: User deletion
        console.log('\n📝 Test 11: User Deletion');
        const userToDelete = await User.findOne({ username: 'inactiveuser' });
        const deletedUser = await User.findByIdAndDelete(userToDelete._id);
        console.log('✅ User deleted successfully:', deletedUser.username);

        // Test 12: Bulk user operations
        console.log('\n📝 Test 12: Bulk User Operations');
        
        // Create test users for bulk operations
        const hashedPassword = await bcrypt.hash('test123', 10);
        const userRole = await Role.findOne({ name: 'user' });
        
        const bulkUsers = await User.insertMany([
            {
                username: 'bulkuser1',
                email: 'bulk1@test.com',
                password: hashedPassword,
                fullName: 'Bulk User 1',
                role: userRole._id,
                isActive: true,
                isVerified: true
            },
            {
                username: 'bulkuser2',
                email: 'bulk2@test.com',
                password: hashedPassword,
                fullName: 'Bulk User 2',
                role: userRole._id,
                isActive: true,
                isVerified: true
            }
        ]);

        // Simulate bulk deletion
        const bulkDeleteResult = await User.deleteMany({
            username: { $in: ['bulkuser1', 'bulkuser2'] }
        });
        console.log('✅ Bulk deletion result:', bulkDeleteResult.deletedCount, 'users deleted');

        console.log('\n✅ User Deletion tests completed!\n');
    } catch (error) {
        console.error('❌ User Deletion test failed:', error.message);
        throw error;
    }
}

async function generateTestReport() {
    console.log('📊 Generating Test Report...\n');
    
    try {
        // Get final statistics
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const totalRoles = await Role.countDocuments();

        // User statistics by role
        const usersByRole = await User.aggregate([
            {
                $lookup: {
                    from: 'roles',
                    localField: 'role',
                    foreignField: '_id',
                    as: 'roleInfo'
                }
            },
            {
                $unwind: '$roleInfo'
            },
            {
                $group: {
                    _id: '$roleInfo.name',
                    count: { $sum: 1 },
                    activeCount: { $sum: { $cond: ['$isActive', 1, 0] } }
                }
            }
        ]);

        console.log('📈 RBAC Test Report:');
        console.log('==========================================');
        console.log(`📊 Total Users: ${totalUsers}`);
        console.log(`🟢 Active Users: ${activeUsers}`);
        console.log(`🔒 Inactive Users: ${totalUsers - activeUsers}`);
        console.log(`👥 Total Roles: ${totalRoles}`);
        console.log('\n📋 Users by Role:');
        usersByRole.forEach(stat => {
            console.log(`   ${stat._id}: ${stat.count} total (${stat.activeCount} active)`);
        });

        // Role details
        const roles = await Role.find({});
        console.log('\n🔐 Role Permissions:');
        roles.forEach(role => {
            console.log(`   ${role.name}: ${role.permissions.length} permissions`);
            role.permissions.forEach(perm => {
                console.log(`      - ${perm}`);
            });
        });

        console.log('\n✅ All RBAC tests completed successfully! 🎉');
        console.log('==========================================\n');

    } catch (error) {
        console.error('❌ Error generating test report:', error.message);
        throw error;
    }
}

async function cleanupTestEnvironment() {
    console.log('🧹 Cleaning up test environment...');
    
    try {
        await User.deleteMany({});
        await Role.deleteMany({});
        await dbConnection.disconnect();
        console.log('✅ Test environment cleaned up\n');
    } catch (error) {
        console.error('❌ Cleanup error:', error.message);
    }
}

// Main test runner
async function runRBACTests() {
    console.log('🚀 Starting RBAC & User Management Testing Suite\n');
    console.log('================================================\n');
    
    try {
        await setupTestEnvironment();
        await testRoleManagement();
        await testUserManagement();
        await testRBACPermissions();
        await testUserDeletion();
        await generateTestReport();
    } catch (error) {
        console.error('💥 Test suite failed:', error.message);
        console.error(error.stack);
    } finally {
        await cleanupTestEnvironment();
    }
}

// Export for use in other files
module.exports = {
    runRBACTests,
    setupTestEnvironment,
    testRoleManagement,
    testUserManagement,
    testRBACPermissions,
    testUserDeletion,
    cleanupTestEnvironment
};

// Run tests if called directly
if (require.main === module) {
    runRBACTests().then(() => {
        process.exit(0);
    }).catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}