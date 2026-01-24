@echo off
echo ========================================
echo    FORGOT PASSWORD WORKFLOW TEST
echo ========================================
echo.

echo 📧 Step 1: Testing Forgot Password Request
curl -X POST http://localhost:5001/api/auth/forgot-password ^
  -H "Content-Type: application/json" ^
  -d "{\"email\": \"test@example.com\"}"

echo.
echo.
echo 📬 Step 2: Getting Last Sent Email
curl -X GET http://localhost:5001/api/test/last-email

echo.
echo.
echo 👤 Step 3: Checking User Status  
curl -X GET http://localhost:5001/api/test/users

echo.
echo.
echo ========================================
echo    TEST COMPLETED
echo ========================================
pause