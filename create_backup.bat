@echo off
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
echo node_modules\ > backup_exclude.txt
echo .git\ >> backup_exclude.txt
echo backup_*\ >> backup_exclude.txt

echo ✅ Backup completed in: %backupDir%
echo ⚠️  Restore command: xcopy /E /I /H /Y %backupDir%\* .
pause
