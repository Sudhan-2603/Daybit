@echo off
title Daybit - Cross-Platform Task Manager
echo ========================================================
echo   Launching Daybit Desktop Application...
echo ========================================================

:: 1. Ensure Rust Backend is running on port 4000
netstat -ano | findstr :4000 >nul 2>&1
if %errorlevel% neq 0 (
    echo Starting Daybit Backend Server...
    start /b "" "%~dp0backend\target\debug\daybit-backend.exe"
    timeout /t 2 /nobreak >nul
) else (
    echo Daybit Backend is already active on port 4000.
)

:: 2. Ensure Frontend is serving on port 5173
netstat -ano | findstr :5173 >nul 2>&1
if %errorlevel% neq 0 (
    echo Starting Daybit Frontend Server...
    start /b "" cmd /c "cd /d "%~dp0frontend" && npm run dev -- --host 127.0.0.1 --port 5173"
    timeout /t 3 /nobreak >nul
) else (
    echo Daybit Frontend is already active on port 5173.
)

:: 3. Launch Standalone Native Desktop App Window
echo Opening Daybit Desktop Window...
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app=http://localhost:5173 --window-size=1280,840
) else if exist "C:\Program Files\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files\Microsoft\Edge\Application\msedge.exe" --app=http://localhost:5173 --window-size=1280,840
) else if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app=http://localhost:5173 --window-size=1280,840
) else (
    start http://localhost:5173
)

echo Done! Daybit is running on your desktop.

