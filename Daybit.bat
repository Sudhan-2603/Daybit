@echo off
setlocal

echo Starting Daybit Desktop Application for Windows...

set "APP=%~dp0Daybit.exe"
if not exist "%APP%" set "APP=%LOCALAPPDATA%\Daybit\Daybit.exe"
if not exist "%APP%" set "APP=%~dp0releases\v0.2\windows\Daybit-v0.2.exe"

if exist "%APP%" (
    start "" "%APP%"
    exit /b 0
)

:: Direct Native App Mode Launch (No localhost errors)
set "EDGE=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if not exist "%EDGE%" set "EDGE=C:\Program Files\Microsoft\Edge\Application\msedge.exe"

if exist "%EDGE%" (
    start "" "%EDGE%" --app="https://daybit.sudhan.website" --window-size=1280,840
    exit /b 0
)

:: Browser fallback
start https://daybit.sudhan.website
exit /b 0
