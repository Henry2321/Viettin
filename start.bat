@echo off
echo Starting Viettin.AI Application...
echo.

echo [1/3] Installing backend dependencies...
cd backend
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Error installing backend dependencies!
    pause
    exit /b 1
)

echo.
echo [2/3] Installing frontend dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo Error installing frontend dependencies!
    pause
    exit /b 1
)

echo.
echo [3/3] Starting both servers...
echo Backend will run on: http://localhost:8003
echo Frontend will run on: http://localhost:5173
echo.

start "Backend Server" cmd /k "cd /d %~dp0backend && python main.py"
timeout /t 3 /nobreak > nul
start "Frontend Server" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Both servers are starting...
echo Please wait a few seconds then open: http://localhost:5173
echo.
pause