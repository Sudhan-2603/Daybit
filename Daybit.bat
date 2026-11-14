@echo off
setlocal

set "APP=%LOCALAPPDATA%\Daybit\Daybit.exe"
if not exist "%APP%" set "APP=%~dp0releases\v0.2\windows\Daybit-v0.2.exe"

if not exist "%APP%" (
    echo Daybit desktop app was not found. Build or install the v0.2 release first.
    exit /b 1
)

start "" "%APP%"
exit /b 0

