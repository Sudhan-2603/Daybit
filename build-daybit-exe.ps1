$csCode = @"
using System;
using System.Diagnostics;
using System.IO;

namespace Daybit
{
    static class Program
    {
        [STAThread]
        static void Main(string[] args)
        {
            string edge = @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe";
            if (!File.Exists(edge))
            {
                edge = @"C:\Program Files\Microsoft\Edge\Application\msedge.exe";
            }

            string url = "https://daybit.sudhan.website";

            ProcessStartInfo psi = new ProcessStartInfo();
            if (File.Exists(edge))
            {
                psi.FileName = edge;
                psi.Arguments = "--app=\"" + url + "\" --window-size=1280,840";
            }
            else
            {
                psi.FileName = url;
                psi.UseShellExecute = true;
            }

            Process.Start(psi);
        }
    }
}
"@

$csFile = Join-Path $PSScriptRoot "DaybitSource.cs"
$outFile = Join-Path $PSScriptRoot "Daybit.exe"
$icoFile = Join-Path $PSScriptRoot "src-tauri\icons\icon.ico"

Set-Content -Path $csFile -Value $csCode

$csc = "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
if (Test-Path $icoFile) {
    & $csc /target:winexe /win32icon:$icoFile /out:$outFile $csFile
} else {
    & $csc /target:winexe /out:$outFile $csFile
}

Remove-Item $csFile -Force -ErrorAction SilentlyContinue

if (Test-Path $outFile) {
    Write-Host "SUCCESS: Daybit.exe successfully compiled!" -ForegroundColor Green

    # Copy to releases folder and local app data folder
    $relDir = Join-Path $PSScriptRoot "releases\v0.2\windows"
    New-Item -ItemType Directory -Force -Path $relDir | Out-Null
    Copy-Item $outFile -Destination (Join-Path $relDir "Daybit-v0.2.exe") -Force

    $appDataDir = "$env:LOCALAPPDATA\Daybit"
    New-Item -ItemType Directory -Force -Path $appDataDir | Out-Null
    Copy-Item $outFile -Destination (Join-Path $appDataDir "Daybit.exe") -Force

    # Create Desktop Shortcut
    try {
        $wsh = New-Object -ComObject WScript.Shell
        $desktop = [System.Environment]::GetFolderPath('Desktop')
        $shortcut = $wsh.CreateShortcut((Join-Path $desktop "Daybit.lnk"))
        $shortcut.TargetPath = (Join-Path $appDataDir "Daybit.exe")
        $shortcut.IconLocation = (Join-Path $appDataDir "Daybit.exe")
        $shortcut.Description = "Daybit Task Manager Desktop Application"
        $shortcut.Save()
        Write-Host "SUCCESS: Desktop shortcut Daybit.lnk created on Desktop!" -ForegroundColor Green
    } catch {
        Write-Host "Shortcut notice: $_"
    }
} else {
    Write-Host "Compilation failed" -ForegroundColor Red
}
