param(
    [string]$InstallDir = "$env:LOCALAPPDATA\Daybit"
)

$ErrorActionPreference = 'Stop'
$SourceExe = Join-Path $PSScriptRoot 'Daybit-v0.2.exe'
if (-not (Test-Path -LiteralPath $SourceExe -PathType Leaf)) {
    throw "Daybit-v0.2.exe was not found beside this installer: $PSScriptRoot"
}

$SetupPackage = Join-Path $PSScriptRoot 'Daybit-Setup-v0.2.msi'
if ((Test-Path -LiteralPath $SetupPackage -PathType Leaf) -and
    (Get-FileHash -LiteralPath $SourceExe -Algorithm SHA256).Hash -eq
    (Get-FileHash -LiteralPath $SetupPackage -Algorithm SHA256).Hash) {
    throw 'The app executable is identical to the setup package. Rebuild the Windows Tauri release before installing.'
}

New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
$InstalledExe = Join-Path $InstallDir 'Daybit.exe'
Copy-Item -LiteralPath $SourceExe -Destination $InstalledExe -Force

$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [System.Environment]::GetFolderPath('Desktop')
$DesktopShortcut = $WshShell.CreateShortcut((Join-Path $DesktopPath 'Daybit.lnk'))
$DesktopShortcut.TargetPath = $InstalledExe
$DesktopShortcut.WorkingDirectory = $InstallDir
$DesktopShortcut.Description = 'Daybit v0.2 local desktop task manager'
$DesktopShortcut.Save()

$StartMenuPath = Join-Path ([System.Environment]::GetFolderPath('Programs')) 'Daybit'
New-Item -ItemType Directory -Force -Path $StartMenuPath | Out-Null
$StartMenuShortcut = $WshShell.CreateShortcut((Join-Path $StartMenuPath 'Daybit.lnk'))
$StartMenuShortcut.TargetPath = $InstalledExe
$StartMenuShortcut.WorkingDirectory = $InstallDir
$StartMenuShortcut.Description = 'Daybit v0.2 local desktop task manager'
$StartMenuShortcut.Save()

Write-Host "Daybit v0.2 installed to $InstallDir" -ForegroundColor Green
