@echo off
echo Starting Travel Route Planner...

echo Starting backend server...
start "Backend Server" cmd /k "cd server && npm run dev"

echo Waiting for backend server to start...
timeout /t 3 /nobreak > nul

echo Starting frontend development server...
start "Frontend Dev Server" cmd /k "npm run dev"

echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to stop all servers...
pause > nul

echo Stopping servers...
taskkill /FI "WINDOWTITLE eq Backend Server*" /T /F
taskkill /FI "WINDOWTITLE eq Frontend Dev Server*" /T /F

echo Servers stopped.