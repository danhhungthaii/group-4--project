@echo off
echo 🚀 Starting Refresh Token Demo Servers...
echo.

echo 📡 Starting Backend API Server (Port 5000)...
start "Backend API" cmd /c "cd backend && node server-simple.js && pause"

echo ⏳ Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak >nul

echo 🌐 Starting Static Server (Port 3001)...  
start "Static Server" cmd /c "node static-server.js && pause"

echo ⏳ Waiting 2 seconds for static server to start...
timeout /t 2 /nobreak >nul

echo.
echo ✅ All servers should be running now!
echo.
echo 📋 Demo URLs:
echo    - Backend API: http://localhost:5000
echo    - Demo Page:   http://localhost:3001/demo-refresh-token.html
echo.
echo 🎯 Test Accounts:
echo    - admin / password123
echo    - moderator / password456  
echo    - user1 / password789
echo.
echo 🌟 Opening demo page in 3 seconds...
timeout /t 3 /nobreak >nul
start http://localhost:3001/demo-refresh-token.html

echo.
echo 🎉 Demo ready! Follow QUICK_TEST.md for test steps.
pause