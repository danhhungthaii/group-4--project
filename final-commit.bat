@echo off
echo Adding all files...
git add .

echo Committing Profile Management...
git commit -m "feat: Complete Profile Management System - Hoat dong 2"

echo Checking git status...  
git status

echo Recent commits:
git log --oneline -3

echo.
echo Profile Management completed successfully!
echo Ready for merge with frontend-profile branch.
pause