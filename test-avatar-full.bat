@echo off
echo 🖼️ Starting Avatar Upload Server Test...
echo.

echo 📡 Starting Avatar Server (Port 5000)...
start "Avatar Server" cmd /c "cd backend && node server-avatar.js && pause"

echo ⏳ Waiting 3 seconds for server to start...
timeout /t 3 /nobreak >nul

echo 🧪 Testing server connection...
node test-avatar-server.js

echo.
echo 🌐 If server is running, open demo at:
echo    http://localhost:8080/demo-avatar-upload.html
echo.
echo 👤 Test Account:
echo    Email: test@example.com
echo    Password: password123
echo.
pause