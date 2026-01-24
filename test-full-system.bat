@echo off
echo 🚀 Group 4 - Forgot Password System Test
echo =======================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Check if .env file exists
if not exist ".env" (
    echo ❌ .env file not found
    echo.
    echo 📝 Creating sample .env file...
    echo EMAIL_HOST=smtp.gmail.com > .env
    echo EMAIL_USER=your_email@gmail.com >> .env
    echo EMAIL_PASS=your_app_password >> .env
    echo EMAIL_FROM=your_email@gmail.com >> .env
    echo FRONTEND_URL=http://localhost:8080 >> .env
    echo JWT_SECRET=group4-forgot-password-secret-key-2024 >> .env
    echo.
    echo ✅ Sample .env file created
    echo 📧 Please edit .env file with your Gmail credentials
    echo 💡 Use App Password for EMAIL_PASS (not regular password)
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js found
echo ✅ .env file found
echo.

:: Test email configuration first
echo 📧 Testing email configuration...
node test-email-simple.js
if errorlevel 1 (
    echo.
    echo ❌ Email configuration test failed
    echo Please check your .env file settings
    pause
    exit /b 1
)

echo.
echo ✅ Email configuration test passed
echo.

:: Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install express cors crypto jsonwebtoken bcryptjs nodemailer dotenv
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed
    echo.
)

:: Start backend server in background
echo 🖥️ Starting backend server...
start "Backend Server" cmd /c "node server-forgot-password.js"

:: Wait a moment for server to start
timeout /t 3 /nobreak >nul

:: Start frontend server in background
echo 🌐 Starting frontend server...
start "Frontend Server" cmd /c "node static-server-forgot-password.js"

:: Wait a moment for server to start
timeout /t 2 /nobreak >nul

echo.
echo 🎉 System started successfully!
echo.
echo 📋 Available Services:
echo    🖥️  Backend API:  http://localhost:5000
echo    🌐 Frontend:     http://localhost:8080
echo    📊 Demo Page:    http://localhost:8080/demo-forgot-password.html
echo    🧪 Health Check: http://localhost:5000/api/health
echo.
echo 📱 Test Accounts:
echo    📧 testuser@example.com / password123
echo    📧 demo@example.com / password123
echo.
echo 🔧 Quick Tests:
echo    1. Open http://localhost:8080/forgot-password.html
echo    2. Enter an email address
echo    3. Check your email for reset link
echo    4. Click reset link to set new password
echo.
echo ⚡ API Endpoints:
echo    POST /api/auth/forgot-password
echo    POST /api/auth/reset-password/:token
echo    POST /api/auth/login
echo    POST /api/test/email
echo.

:: Open browser automatically
echo 🌐 Opening demo page in browser...
start http://localhost:8080/demo-forgot-password.html

echo.
echo 💡 Press any key to stop all servers...
pause >nul

:: Stop servers
echo.
echo 🛑 Stopping servers...
taskkill /f /im node.exe >nul 2>&1
echo ✅ All servers stopped

echo.
echo 👋 Thanks for testing Group 4 Forgot Password System!
pause