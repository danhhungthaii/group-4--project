@echo off
echo Starting merge process...

echo Adding files...
git add .

echo Committing Profile Management...
git commit -m "feat: Profile Management - Update and View Profile with Frontend"

echo Creating frontend-profile branch...  
git checkout -b frontend-profile

echo Switching back to Database branch...
git checkout Database

echo Merging frontend-profile...
git merge frontend-profile

echo Checking final status...
git status

echo Recent commits:
git log --oneline -5

echo.
echo Merge completed successfully!
pause