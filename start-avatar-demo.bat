@echo off
echo 🖼️ Starting Avatar Upload Demo - Hoạt động 3...
echo.

echo 📡 Starting Avatar Upload Server (Port 5000)...
start "Avatar Server" cmd /c "cd backend && node server-avatar.js && pause"

echo ⏳ Waiting 3 seconds for server to start...
timeout /t 3 /nobreak >nul

echo 🌐 Starting Static Server for Demo (Port 8080)...
start "Static Server" cmd /c "node -e \"const express=require('express');const path=require('path');const app=express();app.use(express.static('.'));app.listen(8080,()=>console.log('Static server running on http://localhost:8080'));\" && pause"

echo ⏳ Waiting 2 seconds for static server to start...
timeout /t 2 /nobreak >nul

echo.
echo ✅ All servers should be running now!
echo.
echo 📋 Avatar Upload Demo URLs:
echo    - Backend API: http://localhost:5000
echo    - HTML Demo:   http://localhost:8080/demo-avatar-upload.html
echo    - Test Page:   http://localhost:8080/test-avatar-upload.html
echo.
echo 👤 Test Accounts (Mock Database):
echo    - Email: test@example.com, Password: password123
echo    - Email: john@example.com, Password: password123
echo.
echo 🌟 Opening Avatar demo in 3 seconds...
timeout /t 3 /nobreak >nul
start http://localhost:8080/demo-avatar-upload.html

echo.
echo 🖼️ Avatar Upload Demo ready!
echo.
echo ✨ Key Features to Demo:
echo    1. File validation (type + size)
echo    2. Live image preview
echo    3. Auto resize to 300x300px
echo    4. Cloudinary cloud storage
echo    5. Upload progress feedback
echo    6. Delete avatar functionality
echo.
pause