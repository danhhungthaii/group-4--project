// Script quản lý Pull Request cho Sinh viên 3
const { execSync } = require('child_process');
const fs = require('fs');

console.log('🎯 QUẢN LÝ PULL REQUEST - SINH VIÊN 3\n');

class GitPRManager {
    constructor() {
        this.branches = [
            'backend-auth',
            'backend-admin', 
            'frontend-auth',
            'frontend-profile',
            'database-auth'
        ];
        this.mainBranch = 'main';
    }

    // Kiểm tra trạng thái tất cả branches
    checkAllBranches() {
        console.log('📊 KIỂM TRA TRẠNG THÁI BRANCHES\n');
        
        try {
            // Fetch latest từ remote
            console.log('Fetching latest changes...');
            execSync('git fetch origin', { stdio: 'pipe' });
            
            this.branches.forEach(branch => {
                try {
                    console.log(`\n🌿 Branch: ${branch}`);
                    
                    // Kiểm tra branch có tồn tại không
                    const branchExists = this.branchExists(branch);
                    if (!branchExists) {
                        console.log('   ❌ Branch không tồn tại');
                        return;
                    }
                    
                    // Kiểm tra commits ahead of main
                    const aheadCommits = this.getAheadCommits(branch);
                    const behindCommits = this.getBehindCommits(branch);
                    
                    console.log(`   📈 Ahead: ${aheadCommits} commits`);
                    console.log(`   📉 Behind: ${behindCommits} commits`);
                    
                    // Kiểm tra conflicts tiềm ẩn
                    const hasConflicts = this.checkPotentialConflicts(branch);
                    if (hasConflicts) {
                        console.log('   ⚠️  Có thể có conflicts với main');
                    } else {
                        console.log('   ✅ Không có conflicts');
                    }
                    
                    // Suggest action
                    if (aheadCommits > 0 && !hasConflicts) {
                        console.log(`   🎯 READY FOR PR: ${branch} -> main`);
                    } else if (behindCommits > 0) {
                        console.log(`   🔄 CẦN SYNC: merge main vào ${branch}`);
                    }
                    
                } catch (error) {
                    console.log(`   ❌ Error checking ${branch}: ${error.message}`);
                }
            });
            
        } catch (error) {
            console.log('❌ Fetch failed:', error.message);
        }
    }

    // Kiểm tra branch có tồn tại không
    branchExists(branch) {
        try {
            execSync(`git rev-parse --verify origin/${branch}`, { stdio: 'pipe' });
            return true;
        } catch {
            return false;
        }
    }

    // Lấy số commits ahead of main
    getAheadCommits(branch) {
        try {
            const result = execSync(`git rev-list --count origin/${branch}..origin/main`, { stdio: 'pipe' });
            return parseInt(result.toString().trim()) || 0;
        } catch {
            return 0;
        }
    }

    // Lấy số commits behind main
    getBehindCommits(branch) {
        try {
            const result = execSync(`git rev-list --count origin/main..origin/${branch}`, { stdio: 'pipe' });
            return parseInt(result.toString().trim()) || 0;
        } catch {
            return 0;
        }
    }

    // Kiểm tra conflicts tiềm ẩn
    checkPotentialConflicts(branch) {
        try {
            // Tạm thời merge test (dry-run)
            execSync(`git merge-tree origin/main origin/${branch}`, { stdio: 'pipe' });
            return false; // Không có conflicts
        } catch {
            return true; // Có conflicts
        }
    }

    // Sync branch với main
    syncBranchWithMain(branch) {
        console.log(`\n🔄 SYNC ${branch} với main branch\n`);
        
        try {
            // Checkout branch
            execSync(`git checkout ${branch}`, { stdio: 'inherit' });
            
            // Pull latest
            execSync(`git pull origin ${branch}`, { stdio: 'inherit' });
            
            // Merge main
            execSync(`git merge main`, { stdio: 'inherit' });
            
            // Push changes
            execSync(`git push origin ${branch}`, { stdio: 'inherit' });
            
            console.log(`✅ ${branch} đã được sync với main`);
            
        } catch (error) {
            console.log(`❌ Sync failed for ${branch}:`, error.message);
        }
    }

    // Tạo PR URLs cho các branches
    generatePRUrls() {
        console.log('\n🔗 PULL REQUEST URLS\n');
        
        const baseUrl = 'https://github.com/danhhungthaii/group-4--project';
        
        this.branches.forEach(branch => {
            if (this.branchExists(branch)) {
                const aheadCommits = this.getBehindCommits(branch); // Inverted for PR creation
                if (aheadCommits > 0) {
                    const prUrl = `${baseUrl}/compare/main...${branch}`;
                    console.log(`📝 ${branch}: ${prUrl}`);
                }
            }
        });
    }

    // Merge PR (sau khi đã review)
    mergePR(branch, squash = false) {
        console.log(`\n🎯 MERGE PR: ${branch} -> main\n`);
        
        try {
            // Checkout main
            execSync('git checkout main', { stdio: 'inherit' });
            
            // Pull latest main
            execSync('git pull origin main', { stdio: 'inherit' });
            
            // Merge branch
            if (squash) {
                execSync(`git merge --squash ${branch}`, { stdio: 'inherit' });
                
                // Commit squashed changes
                const commitMsg = `feat: merge ${branch} features\n\nSquashed commits from ${branch} branch`;
                execSync(`git commit -m "${commitMsg}"`, { stdio: 'inherit' });
            } else {
                execSync(`git merge ${branch}`, { stdio: 'inherit' });
            }
            
            // Push to main
            execSync('git push origin main', { stdio: 'inherit' });
            
            console.log(`✅ Successfully merged ${branch} into main`);
            
            // Cleanup: delete merged branch (optional)
            const cleanup = this.askForCleanup(branch);
            if (cleanup) {
                this.cleanupBranch(branch);
            }
            
        } catch (error) {
            console.log(`❌ Merge failed:`, error.message);
        }
    }

    // Cleanup merged branch
    cleanupBranch(branch) {
        try {
            // Delete local branch
            execSync(`git branch -d ${branch}`, { stdio: 'pipe' });
            console.log(`🗑️  Deleted local branch: ${branch}`);
        } catch (error) {
            console.log(`⚠️  Could not delete local branch ${branch}: ${error.message}`);
        }
    }

    // Generate PR status report
    generatePRReport() {
        console.log('\n📊 PULL REQUEST STATUS REPORT\n');
        
        const report = {
            timestamp: new Date().toISOString(),
            branches: {}
        };
        
        this.branches.forEach(branch => {
            if (this.branchExists(branch)) {
                report.branches[branch] = {
                    ahead: this.getAheadCommits(branch),
                    behind: this.getBehindCommits(branch),
                    hasConflicts: this.checkPotentialConflicts(branch),
                    readyForPR: false
                };
                
                const branchData = report.branches[branch];
                branchData.readyForPR = branchData.behind > 0 && !branchData.hasConflicts;
                
                console.log(`${branch}:`);
                console.log(`  Ahead: ${branchData.ahead} commits`);
                console.log(`  Behind: ${branchData.behind} commits`);
                console.log(`  Conflicts: ${branchData.hasConflicts ? 'Yes' : 'No'}`);
                console.log(`  Ready for PR: ${branchData.readyForPR ? 'Yes' : 'No'}`);
                console.log('');
            }
        });
        
        // Save report to file
        fs.writeFileSync('pr-status-report.json', JSON.stringify(report, null, 2));
        console.log('📝 Report saved to: pr-status-report.json');
        
        return report;
    }

    // Main menu cho Sinh viên 3
    showMainMenu() {
        console.log('\n' + '='.repeat(50));
        console.log('🎯 SINH VIÊN 3 - PULL REQUEST MANAGER');
        console.log('='.repeat(50));
        console.log('1. Kiểm tra trạng thái tất cả branches');
        console.log('2. Tạo Pull Request URLs');
        console.log('3. Sync branch với main');
        console.log('4. Merge Pull Request');
        console.log('5. Tạo PR Status Report');
        console.log('6. Show Git Commands Quick Guide');
        console.log('0. Thoát');
        console.log('='.repeat(50));
    }

    // Quick guide các lệnh Git
    showGitQuickGuide() {
        console.log('\n📚 GIT COMMANDS QUICK GUIDE\n');
        console.log('🔍 KIỂM TRA:');
        console.log('   git status                    - Trạng thái hiện tại');
        console.log('   git branch -a                 - Tất cả branches');
        console.log('   git log --oneline -10         - 10 commits gần nhất');
        console.log('');
        console.log('🔄 SYNC:');
        console.log('   git fetch origin              - Fetch all changes');
        console.log('   git pull origin main          - Pull main branch');
        console.log('   git merge branch-name         - Merge branch');
        console.log('');
        console.log('🚀 PUSH:');
        console.log('   git push origin branch-name   - Push branch');
        console.log('   git push origin main          - Push to main');
        console.log('');
        console.log('🎯 PR WORKFLOW:');
        console.log('   1. git checkout feature-branch');
        console.log('   2. git merge main             - Sync với main');
        console.log('   3. git push origin feature-branch');
        console.log('   4. Create PR on GitHub');
        console.log('   5. Review & Merge');
        console.log('');
    }

    // Ask user for cleanup confirmation
    askForCleanup(branch) {
        // In real scenario, would use readline for user input
        // For now, return false to be safe
        return false;
    }
}

// Main execution
if (require.main === module) {
    const prManager = new GitPRManager();
    
    console.log('🚀 Starting PR Management System...\n');
    
    // Show current status
    prManager.checkAllBranches();
    
    // Generate PR URLs
    prManager.generatePRUrls();
    
    // Show commands guide  
    prManager.showGitQuickGuide();
    
    // Generate status report
    prManager.generatePRReport();
    
    console.log('\n🎯 SINH VIÊN 3 - PR MANAGER READY!');
    console.log('📋 Sử dụng script này để quản lý Pull Requests hiệu quả');
}

module.exports = GitPRManager;