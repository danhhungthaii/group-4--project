@echo off
cls
echo Commit and merge script...
git add . > commit-log.txt 2>&1
git commit -m "feat: Profile Management complete" >> commit-log.txt 2>&1
git checkout -b frontend-profile >> commit-log.txt 2>&1
git checkout Database >> commit-log.txt 2>&1
git merge frontend-profile >> commit-log.txt 2>&1
git status > final-status.txt 2>&1
echo Done! Check commit-log.txt and final-status.txt for results.
type final-status.txt
pause