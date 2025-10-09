@echo off
echo ========================================
echo CREATE BACKEND-ADMIN BRANCH
echo ========================================

echo.
echo Step 1: Creating backend-admin branch...
git checkout -b backend-admin

echo.
echo Step 2: Checking current branch...
git branch

echo.
echo Step 3: Adding all admin management files...
git add .

echo.
echo Step 4: Committing admin management features...
git commit -m "feat: Add Admin Management System - User List, Delete User, RBAC"

echo.
echo Step 5: Switch back to Database branch...
git checkout Database

echo.
echo Step 6: Merge backend-admin into Database...
git merge backend-admin

echo.
echo Step 7: Final status check...
git status

echo.
echo Step 8: Recent commits...
git log --oneline -3

echo.
echo ========================================
echo BACKEND-ADMIN BRANCH CREATED AND MERGED!
echo ========================================
pause