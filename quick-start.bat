@echo off
echo Quick Start - Viettin.AI
echo.

echo Starting Backend Server...
start "Backend" cmd /k "cd /d %~dp0backend && python main.py"

echo Waiting 3 seconds...
timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start "Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ✅ Both servers are starting!
echo 🌐 Frontend: http://localhost:5173
echo 🔧 Backend: http://localhost:8003
echo.
echo Press any key to exit this window...
pause > nul