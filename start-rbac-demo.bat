@echo off
echo 🔐 Starting RBAC Demo Servers...
echo.

echo 📡 Starting RBAC Backend Server (Port 5000)...
start "RBAC Backend" cmd /c "cd backend && node server-rbac.js && pause"

echo ⏳ Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak >nul

echo 🌐 Starting Static Server (Port 3001)...  
start "Static Server" cmd /c "node static-server.js && pause"

echo ⏳ Waiting 2 seconds for static server to start...
timeout /t 2 /nobreak >nul

echo.
echo ✅ All servers should be running now!
echo.
echo 📋 RBAC Demo URLs:
echo    - Backend API: http://localhost:5000
echo    - HTML Demo:   http://localhost:3001/demo-rbac.html
echo    - React Demo:  http://localhost:3000/rbac-demo
echo.
echo 👥 Test Accounts:
echo    - admin / password123 (Full Access)
echo    - moderator / password456 (Limited Management)  
echo    - user1 / password789 (Basic Access)
echo.
echo 🌟 Opening RBAC demo in 3 seconds...
timeout /t 3 /nobreak >nul
start http://localhost:3001/demo-rbac.html

echo.
echo 🔐 RBAC Demo ready! Follow RBAC_TEST_GUIDE.md for test steps.
echo.
echo 📸 Key Screenshots Needed:
echo    1. Account Selection Page
echo    2. Admin Dashboard (Full Features)
echo    3. Moderator Dashboard (Limited Features)
echo    4. User Dashboard (Minimal Access)
echo.
pause