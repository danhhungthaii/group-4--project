@echo off
echo =============================================================================
echo MONGODB SETUP GUIDE - GROUP 4 PROJECT
echo =============================================================================
echo.

echo STEP 1: Download MongoDB Community Server
echo - Go to: https://www.mongodb.com/try/download/community
echo - Select Windows
echo - Download and install MongoDB Community Server
echo.

echo STEP 2: Start MongoDB Service
echo Option A - Start as Windows Service (Recommended):
echo   - MongoDB should start automatically after installation
echo   - Check Windows Services for "MongoDB Server (MongoDB)"
echo.
echo Option B - Start manually:
echo   - Open Command Prompt as Administrator
echo   - Run: "mongod --dbpath C:\data\db"
echo   - Keep this window open
echo.

echo STEP 3: Verify MongoDB is running
echo - Open new command prompt
echo - Run: "mongo" or "mongosh"
echo - You should see MongoDB shell
echo.

echo STEP 4: After MongoDB is running, return to project and run:
echo   npm run seed        (Create sample data)
echo   npm run test:db     (Test database operations)
echo   npm run dev         (Start development server)
echo.

echo =============================================================================
echo ALTERNATIVE: Use MongoDB Atlas (Cloud Database)
echo =============================================================================
echo 1. Go to https://www.mongodb.com/atlas
echo 2. Create free account and cluster
echo 3. Get connection string
echo 4. Update .env file with your connection string:
echo    MONGODB_URI=your-atlas-connection-string
echo.

echo Press any key to continue...
pause >nul