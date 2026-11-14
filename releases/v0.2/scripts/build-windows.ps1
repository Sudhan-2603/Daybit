$ErrorActionPreference = 'Stop'

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..')).Path
$ReleaseDir = Join-Path $RepoRoot 'releases\v0.2\windows'
$TargetDir = Join-Path $RepoRoot 'target\release'

if (-not (Get-Command cargo -ErrorAction SilentlyContinue)) {
    throw 'Rust and Cargo are required to build Daybit.'
}
if (-not (Get-Command cargo-tauri -ErrorAction SilentlyContinue)) {
    throw "Tauri CLI is required. Install it with: cargo install tauri-cli --version '^2'"
}

Push-Location $RepoRoot
try {
    cargo tauri build --manifest-path src-tauri/Cargo.toml --bundles msi
    if ($LASTEXITCODE -ne 0) {
        throw "Tauri build failed with exit code $LASTEXITCODE."
    }
} finally {
    Pop-Location
}

$AppExe = @(
    (Join-Path $TargetDir 'daybit-desktop.exe'),
    (Join-Path $TargetDir 'daybit.exe')
) | Where-Object { Test-Path -LiteralPath $_ -PathType Leaf } | Select-Object -First 1

$Msi = Get-ChildItem (Join-Path $TargetDir 'bundle\msi') -Filter '*.msi' -File |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

if (-not $AppExe -or -not $Msi) {
    throw 'The Tauri build did not produce both the desktop executable and MSI.'
}

New-Item -ItemType Directory -Force -Path $ReleaseDir | Out-Null
Copy-Item -LiteralPath $AppExe -Destination (Join-Path $ReleaseDir 'Daybit-v0.2.exe') -Force
Copy-Item -LiteralPath $Msi.FullName -Destination (Join-Path $ReleaseDir 'Daybit-Setup-v0.2.msi') -Force

Get-FileHash (Join-Path $ReleaseDir 'Daybit-v0.2.exe') -Algorithm SHA256 |
    ForEach-Object { "$($_.Hash)  Daybit-v0.2.exe" } |
    Set-Content (Join-Path $ReleaseDir 'SHA256SUMS.txt')
Get-FileHash (Join-Path $ReleaseDir 'Daybit-Setup-v0.2.msi') -Algorithm SHA256 |
    ForEach-Object { "$($_.Hash)  Daybit-Setup-v0.2.msi" } |
    Add-Content (Join-Path $ReleaseDir 'SHA256SUMS.txt')

Write-Host "Daybit v0.2 Windows packages created in $ReleaseDir" -ForegroundColor Green
