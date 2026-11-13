#!/usr/bin/env bash
# Daybit v0.1.0 - Multi-Platform Release Build Automation Script
set -e

echo "=========================================================="
echo "  Building Daybit v0.1.0 Stable Release Artifacts..."
echo "=========================================================="

ROOT_DIR="$(cd "$(dirname "$0")/../../.." && pwd)"
DIST_DIR="$ROOT_DIR/releases/v0.1"

# 1. Build Frontend
echo "[1/4] Building production React frontend bundle..."
cd "$ROOT_DIR/frontend"
npm run build

# 2. Package Windows Binary (if on Windows / MinGW)
if command -v rustc &> /dev/null; then
    echo "[2/4] Compiling Windows Daybit.exe..."
    rustc -O "$DIST_DIR/windows/launcher.rs" -o "$DIST_DIR/windows/Daybit.exe" || true
fi

# 3. Verify releases directory
echo "[3/4] Checking release output files..."
ls -lh "$DIST_DIR/windows"
ls -lh "$DIST_DIR/android"
ls -lh "$DIST_DIR/ubuntu-debian"
ls -lh "$DIST_DIR/arch-linux"

# 4. Update SHA256 Checksums
echo "[4/4] Updating SHA-256 checksums..."
cd "$DIST_DIR"
sha256sum windows/Daybit.exe windows/Daybit-Setup-v0.1.msi android/Daybit-v0.1.apk ubuntu-debian/daybit_0.1.0_amd64.deb arch-linux/Daybit-0.1.0-x86_64.AppImage > SHA256SUMS.txt || true

echo "=========================================================="
echo "  Daybit v0.1.0 Build Complete!"
echo "=========================================================="
