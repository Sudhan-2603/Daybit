@echo off
setlocal

echo Starting Daybit Local Development Server on http://localhost:5173...
start "Daybit Local Server" /min cmd /c "cd /d %~dp0frontend && npm run dev"

echo Waiting for Vite dev server to start...
timeout /t 3 /nobreak >nul

set "EDGE=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if not exist "%EDGE%" set "EDGE=C:\Program Files\Microsoft\Edge\Application\msedge.exe"

if exist "%EDGE%" (
    start "" "%EDGE%" --app="http://localhost:5173" --window-size=1280,840
) else (
    start http://localhost:5173
)

exit /b 0
