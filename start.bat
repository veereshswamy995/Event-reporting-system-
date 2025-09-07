@echo off
REM Campus Event Management System - Quick Start Script

echo 🚀 Campus Event Management System - Quick Start
echo ==============================================

REM Check if .env file exists
if not exist .env (
    echo ⚠️  .env file not found!
    echo 📝 Creating .env file from template...
    copy env.example .env
    echo.
    echo 🔧 Please update .env file with your Supabase credentials:
    echo    1. Go to https://supabase.com
    echo    2. Create a new project
    echo    3. Get your Project URL and anon key from Settings → API
    echo    4. Update the .env file with your credentials
    echo.
    echo 📋 Then run the SQL from supabase/schema.sql in your Supabase SQL editor
    echo.
    pause
)

REM Check if dependencies are installed
if not exist node_modules (
    echo 📦 Installing dependencies...
    npm install
)

REM Start the server
echo 🚀 Starting the application...
echo.
echo 🌐 Applications will be available at:
echo    - Admin Portal: http://localhost:5000/admin
echo    - Student App: http://localhost:5000/student
echo    - API: http://localhost:5000/api
echo.
echo 📋 Make sure you have:
echo    1. Updated .env file with your Supabase credentials
echo    2. Run the SQL from supabase/schema.sql in your Supabase project
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev
