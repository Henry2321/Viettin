@echo off
title Viettin.AI - Safe Startup
color 0A

echo.
echo ========================================
echo    VIETTIN.AI - SAFE STARTUP SCRIPT
echo ========================================
echo.

echo [STEP 1] Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)
echo ✅ Python is installed

echo.
echo [STEP 2] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)
echo ✅ Node.js is installed

echo.
echo [STEP 3] Installing backend dependencies...
cd backend
pip install fastapi uvicorn python-multipart python-dotenv requests Pillow google-genai --quiet
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed

echo.
echo [STEP 4] Testing backend startup...
start "Backend Test" /min cmd /c "python test_server.py"
timeout /t 5 /nobreak > nul

echo.
echo [STEP 5] Installing frontend dependencies...
cd ..\frontend
call npm install --silent
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)
echo ✅ Frontend dependencies installed

echo.
echo [STEP 6] Starting servers...
echo.
echo 🚀 Backend: http://localhost:8003
echo 🌐 Frontend: http://localhost:5173
echo.

cd ..\backend
start "Viettin.AI Backend" cmd /k "title Viettin.AI Backend && python main.py"

timeout /t 3 /nobreak > nul

cd ..\frontend
start "Viettin.AI Frontend" cmd /k "title Viettin.AI Frontend && npm run dev"

echo.
echo ✅ Both servers are starting...
echo 📱 Open your browser and go to: http://localhost:5173
echo.
echo Press any key to test connection...
pause > nul

cd ..
python test_connection.py