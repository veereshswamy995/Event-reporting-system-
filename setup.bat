@echo off
REM Campus Event Management System Setup Script for Windows

echo 🚀 Setting up Campus Event Management System...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    echo Visit: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

REM Install dependencies
echo 📦 Installing dependencies...
npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file...
    copy env.example .env
    echo ⚠️  Please update .env file with your Supabase credentials
) else (
    echo ✅ .env file already exists
)

REM Create directories for static files
echo 📁 Creating necessary directories...
if not exist public mkdir public
if not exist student-app\icons mkdir student-app\icons

echo ✅ Directories created

echo.
echo 🎉 Setup completed successfully!
echo.
echo 📋 Next steps:
echo 1. Set up your Supabase project:
echo    - Go to https://supabase.com
echo    - Create a new project
echo    - Copy your project URL and anon key
echo    - Update the .env file with your credentials
echo.
echo 2. Set up the database:
echo    - Run the SQL commands from supabase/schema.sql in your Supabase SQL editor
echo.
echo 3. Start the application:
echo    - Run: npm run dev (for backend)
echo    - Run: npm run admin (for admin portal)
echo    - Run: npm run student (for student app)
echo.
echo 🌐 Access URLs:
echo    - Admin Portal: http://localhost:3000
echo    - Student App: http://localhost:3001
echo    - Backend API: http://localhost:5000
echo.
echo 📱 The student app is PWA-ready and can be installed on mobile devices!
echo.
pause
