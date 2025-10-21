@echo off
title AVATAR UPLOAD DEMO - Hoat dong 3
color 0A

echo.
echo ===============================================
echo   🖼️  HOẠT ĐỘNG 3: AVATAR UPLOAD DEMO
echo ===============================================
echo.
echo 🎯 Mục tiêu: Upload ảnh đại diện với Cloudinary
echo ✅ SV2: Frontend form upload avatar, hiển thị sau upload
echo.

echo 📡 Starting Avatar Upload Server (Port 5000)...
start "Avatar Server" cmd /c "cd backend && echo Starting Avatar Server... && node server-avatar.js && pause"

echo ⏳ Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak >nul

echo 🌐 Starting Static Demo Server (Port 8080)...
start "Static Server" cmd /c "echo Starting Static Server... && node static-server-avatar.js && pause"

echo ⏳ Waiting 2 seconds for static server to start...
timeout /t 2 /nobreak >nul

echo.
echo ✅ SERVERS STARTED SUCCESSFULLY!
echo.
echo 📋 Server Information:
echo    💾 Backend API: http://localhost:5000
echo    🌐 Demo Page:   http://localhost:8080/demo-avatar-upload.html
echo    🧪 Test Page:   http://localhost:8080/test-avatar-upload.html
echo    📊 API Health:  http://localhost:5000/api/health
echo.

echo 👤 Test Account Credentials:
echo    📧 Email:    test@example.com
echo    🔑 Password: password123
echo.

echo 🧪 Running API connectivity test...
timeout /t 1 /nobreak >nul
node test-avatar-api.js

echo.
echo 🎨 DEMO WORKFLOW:
echo    1️⃣  Login with provided credentials
echo    2️⃣  Select image file (JPG/PNG, max 5MB)
echo    3️⃣  Preview image before upload
echo    4️⃣  Upload to server (auto-resize to 300x300)
echo    5️⃣  View uploaded avatar
echo    6️⃣  Test delete functionality
echo.

echo 💡 TECHNICAL HIGHLIGHTS TO DEMO:
echo    🔧 File validation (type, size)
echo    🔄 Auto resize with Sharp.js
echo    ☁️  Cloudinary cloud storage simulation
echo    🔐 JWT authentication security
echo    📱 Responsive design
echo    ⚡ Real-time feedback
echo.

echo 🌟 Opening demo page in 3 seconds...
timeout /t 3 /nobreak >nul
start http://localhost:8080/demo-avatar-upload.html

echo.
echo 🎉 AVATAR UPLOAD DEMO IS READY!
echo.
echo 📖 Additional Documentation:
echo    📄 README_AVATAR.md - Complete documentation
echo    🧪 AVATAR_TEST_RESULTS.md - Test results
echo.
echo 🚀 Ready for presentation and grading!
echo.
pause