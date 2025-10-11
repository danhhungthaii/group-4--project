// =============================================================================
// SCRIPT KIỂM TRA GIT STATUS VÀ BRANCHES
// File: check-branches.js
// =============================================================================

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[0m'
};

function log(message, color = 'white') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function execPromise(command) {
    return new Promise((resolve, reject) => {
        exec(command, { cwd: process.cwd() }, (error, stdout, stderr) => {
            if (error) {
                reject({ error, stdout, stderr });
            } else {
                resolve({ stdout, stderr });
            }
        });
    });
}

async function checkGitStatus() {
    log('\n=== KIỂM TRA GIT STATUS ===', 'cyan');
    
    try {
        // Check if this is a git repository
        const gitDir = path.join(process.cwd(), '.git');
        if (!fs.existsSync(gitDir)) {
            log('❌ Không phải Git repository', 'red');
            return false;
        }
        log('✅ Đây là Git repository', 'green');

        // Check current branch
        try {
            const { stdout: currentBranch } = await execPromise('git branch --show-current');
            log(`📍 Current branch: ${currentBranch.trim()}`, 'yellow');
        } catch (err) {
            log('⚠️  Không thể xác định current branch', 'yellow');
        }

        // Check git status
        try {
            const { stdout: status } = await execPromise('git status --porcelain');
            if (status.trim()) {
                log('📝 Có uncommitted changes:', 'yellow');
                console.log(status);
            } else {
                log('✅ Working directory clean', 'green');
            }
        } catch (err) {
            log('⚠️  Không thể kiểm tra git status', 'yellow');
        }

        return true;
    } catch (error) {
        log(`❌ Lỗi kiểm tra git: ${error.message}`, 'red');
        return false;
    }
}

async function listAllBranches() {
    log('\n=== KIỂM TRA BRANCHES ===', 'cyan');
    
    try {
        // List local branches
        try {
            const { stdout: localBranches } = await execPromise('git branch');
            log('📋 Local branches:', 'yellow');
            console.log(localBranches);
        } catch (err) {
            log('⚠️  Không thể list local branches', 'yellow');
        }

        // Try to fetch remote branches
        try {
            log('🔄 Đang fetch remote branches...', 'cyan');
            await execPromise('git fetch --all');
            log('✅ Fetch remote thành công', 'green');
        } catch (err) {
            log('⚠️  Không thể fetch remote branches', 'yellow');
        }

        // List all branches including remote
        try {
            const { stdout: allBranches } = await execPromise('git branch -a');
            log('📋 Tất cả branches (local + remote):', 'yellow');
            console.log(allBranches);
            
            // Check if backend-admin exists
            if (allBranches.includes('backend-admin')) {
                log('✅ Tìm thấy backend-admin branch!', 'green');
                return { hasBackendAdmin: true, branches: allBranches };
            } else {
                log('❌ Không tìm thấy backend-admin branch', 'red');
                return { hasBackendAdmin: false, branches: allBranches };
            }
        } catch (err) {
            log('⚠️  Không thể list all branches', 'yellow');
            return { hasBackendAdmin: false, branches: '' };
        }

    } catch (error) {
        log(`❌ Lỗi kiểm tra branches: ${error.message}`, 'red');
        return { hasBackendAdmin: false, branches: '' };
    }
}

async function checkBackendAdminContent() {
    log('\n=== KIỂM TRA NỘI DUNG BACKEND-ADMIN ===', 'cyan');
    
    try {
        // Check if we can see backend-admin differences
        const { stdout: diff } = await execPromise('git diff main origin/backend-admin --name-only');
        if (diff.trim()) {
            log('📝 Files khác nhau giữa main và backend-admin:', 'yellow');
            console.log(diff);
        } else {
            log('ℹ️  Không có differences hoặc backend-admin không tồn tại', 'blue');
        }
    } catch (err) {
        log('⚠️  Không thể kiểm tra diff với backend-admin', 'yellow');
        
        // Try alternative method - check remote branches
        try {
            const { stdout: remotes } = await execPromise('git remote -v');
            log('📡 Remote repositories:', 'yellow');
            console.log(remotes);
        } catch (remoteErr) {
            log('⚠️  Không thể kiểm tra remotes', 'yellow');
        }
    }
}

async function generateMergeStrategy(branchInfo) {
    log('\n=== CHIẾN LƯỢC MERGE ===', 'cyan');
    
    if (branchInfo.hasBackendAdmin) {
        log('🎯 Backend-admin branch có sẵn - Có thể merge ngay:', 'green');
        log('\n📋 Các bước merge:', 'yellow');
        log('1. git checkout main', 'white');
        log('2. git pull origin main  # Đảm bảo main mới nhất', 'white');
        log('3. git merge backend-admin', 'white');
        log('4. # Resolve conflicts nếu có', 'white');
        log('5. git push origin main', 'white');
    } else {
        log('⚠️  Backend-admin branch không có sẵn:', 'yellow');
        log('\n🔍 Cần kiểm tra:', 'yellow');
        log('1. Branch có tồn tại trên remote không?', 'white');
        log('2. Tên branch có đúng không? (có thể là admin-backend, backend_admin, etc.)', 'white');
        log('3. Có cần tạo branch mới không?', 'white');
        
        log('\n🛠️  Các options:', 'cyan');
        log('Option 1: Tìm branch với tên khác:', 'white');
        log('  git branch -a | grep -i admin', 'white');
        log('  git branch -a | grep -i backend', 'white');
        
        log('\nOption 2: Tạo backend-admin branch mới:', 'white');
        log('  git checkout -b backend-admin', 'white');
        log('  # Add admin features', 'white');
        log('  git push origin backend-admin', 'white');
        
        log('\nOption 3: Merge từ remote branch khác:', 'white');
        log('  git checkout main', 'white');
        log('  git merge origin/<tên-branch-thực-tế>', 'white');
    }
}

async function createBackupScript() {
    log('\n=== TẠO BACKUP SCRIPT ===', 'cyan');
    
    const backupScript = `@echo off
REM =============================================================================
REM BACKUP SCRIPT TRƯỚC KHI MERGE
REM =============================================================================

echo 🛡️  CREATING BACKUP BEFORE MERGE...

REM Tạo backup folder với timestamp
set timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set timestamp=%timestamp: =0%
set backupDir=backup_before_merge_%timestamp%

echo 📁 Creating backup directory: %backupDir%
mkdir %backupDir%

REM Copy toàn bộ project (trừ node_modules và .git)
echo 📄 Copying project files...
xcopy /E /I /H /Y . %backupDir% /EXCLUDE:backup_exclude.txt

REM Tạo file exclude để bỏ qua node_modules, .git, backups
echo node_modules\\ > backup_exclude.txt
echo .git\\ >> backup_exclude.txt
echo backup_*\\ >> backup_exclude.txt

echo ✅ Backup completed in: %backupDir%
echo ⚠️  Restore command: xcopy /E /I /H /Y %backupDir%\\* .
pause
`;

    fs.writeFileSync(path.join(process.cwd(), 'create_backup.bat'), backupScript);
    log('✅ Đã tạo create_backup.bat script', 'green');
    log('💡 Chạy create_backup.bat trước khi merge để backup project', 'cyan');
}

async function main() {
    try {
        log('🔍 KIỂM TRA TRẠNG THÁI GIT VÀ CHUẨN BỊ MERGE', 'cyan');
        
        const isGitRepo = await checkGitStatus();
        if (!isGitRepo) {
            log('\n❌ Không thể tiếp tục - Không phải Git repository', 'red');
            return;
        }

        const branchInfo = await listAllBranches();
        await checkBackendAdminContent();
        await generateMergeStrategy(branchInfo);
        await createBackupScript();

        log('\n📊 KẾT QUẢ KIỂM TRA:', 'cyan');
        log(`- Git Repository: ✅`, 'green');
        log(`- Backend-admin branch: ${branchInfo.hasBackendAdmin ? '✅' : '❌'}`, 
            branchInfo.hasBackendAdmin ? 'green' : 'red');
        log(`- Backup script: ✅`, 'green');

        log('\n🚀 SẴN SÀNG CHO MERGE!', 'green');
        if (branchInfo.hasBackendAdmin) {
            log('💡 Có thể tiến hành merge ngay theo hướng dẫn trên', 'cyan');
        } else {
            log('💡 Cần tìm hiểu thêm về backend-admin branch', 'yellow');
        }

    } catch (error) {
        log(`❌ LỖI: ${error.message}`, 'red');
        console.error(error);
    }
}

// Chạy script nếu được gọi trực tiếp
if (require.main === module) {
    main();
}

module.exports = { 
    checkGitStatus,
    listAllBranches,
    checkBackendAdminContent,
    generateMergeStrategy
};