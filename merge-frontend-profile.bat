@echo off
echo ========================================
echo GIT COMMIT AND MERGE OPERATIONS
echo ========================================

echo.
echo Step 1: Adding all files...
git add .

echo.
echo Step 2: Committing Profile Management...
git commit -m "feat: Complete Profile Management System"

echo.
echo Step 3: Checking current status...
git status

echo.
echo Step 4: Listing available branches...
git branch -a

echo.
echo Step 5: Creating frontend-profile branch if not exists...
git checkout -b frontend-profile 2>nul || git checkout frontend-profile

echo.
echo Step 6: Switching back to Database branch...
git checkout Database

echo.
echo Step 7: Merging frontend-profile into Database...
git merge frontend-profile

echo.
echo Step 8: Final status check...
git status

echo.
echo Step 9: Recent commits...
git log --oneline -5

echo.
echo ========================================
echo MERGE OPERATIONS COMPLETED!
echo ========================================
pause