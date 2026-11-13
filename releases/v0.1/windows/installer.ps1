# Daybit v0.1.0 - Windows Native Installer Script
param(
    [string]$InstallDir = "$env:LOCALAPPDATA\Daybit"
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Installing Daybit v0.1.0 (Stable Release)..." -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Target Directory
if (!(Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
}

$CurrentDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Copy-Item "$CurrentDir\Daybit.exe" -Destination "$InstallDir\Daybit.exe" -Force

# 2. Create Desktop Shortcut
$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [System.Environment]::GetFolderPath('Desktop')
$Shortcut = $WshShell.CreateShortcut("$DesktopPath\Daybit.lnk")
$Shortcut.TargetPath = "$InstallDir\Daybit.exe"
$Shortcut.WorkingDirectory = $InstallDir
$Shortcut.Description = "Daybit v0.1.0 - Cross-Platform Task Manager"
$Shortcut.Save()

# 3. Create Start Menu Shortcut
$StartMenuPath = [System.Environment]::GetFolderPath('Programs')
$StartShortcut = $WshShell.CreateShortcut("$StartMenuPath\Daybit.lnk")
$StartShortcut.TargetPath = "$InstallDir\Daybit.exe"
$StartShortcut.WorkingDirectory = $InstallDir
$StartShortcut.Description = "Daybit v0.1.0 - Cross-Platform Task Manager"
$StartShortcut.Save()

Write-Host "[OK] Daybit v0.1.0 successfully installed to $InstallDir" -ForegroundColor Green
Write-Host "[OK] Desktop and Start Menu shortcuts created." -ForegroundColor Green
Write-Host "You can now launch Daybit from your desktop or start menu." -ForegroundColor Cyan
