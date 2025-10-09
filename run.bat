@echo off
echo =============================================================================
echo GROUP 4 - DATABASE AUTHENTICATION PROJECT
echo =============================================================================
echo.

:menu
echo Chon option:
echo 1. Install dependencies
echo 2. Seed database (roles + users)  
echo 3. Test database
echo 4. Start server (development)
echo 5. Start server (production)
echo 6. Clear database
echo 7. Exit
echo.
set /p choice="Nhap lua chon (1-7): "

if "%choice%"=="1" goto install
if "%choice%"=="2" goto seed
if "%choice%"=="3" goto test
if "%choice%"=="4" goto dev
if "%choice%"=="5" goto start
if "%choice%"=="6" goto clear
if "%choice%"=="7" goto exit
goto menu

:install
echo Installing dependencies...
npm install
echo.
pause
goto menu

:seed
echo Seeding database with sample data...
node database/seeder.js
echo.
pause
goto menu

:test
echo Testing database operations...
node database/test.js
echo.
pause
goto menu

:dev
echo Starting development server...
echo Server will run at http://localhost:3000
echo Press Ctrl+C to stop
npm run dev
goto menu

:start
echo Starting production server...
echo Server will run at http://localhost:3000
npm start
goto menu

:clear
echo WARNING: This will delete ALL data!
set /p confirm="Are you sure? (y/N): "
if /i "%confirm%"=="y" (
    node database/seeder.js clear
    echo Database cleared!
) else (
    echo Operation cancelled.
)
echo.
pause
goto menu

:exit
echo Goodbye!
pause
exit