#!/usr/bin/env bash
# Daybit v0.1.0 - Ubuntu / Debian Linux Installation Script
set -e

DEB_FILE="$(dirname "$0")/daybit_0.1.0_amd64.deb"

if [ "$EUID" -ne 0 ]; then
    echo "[!] Please run this installer as root (e.g. sudo ./install.sh)"
    exit 1
fi

echo "==> Installing Daybit v0.1.0 (.deb)..."
dpkg -i "$DEB_FILE" || apt-get install -f -y

echo "[OK] Daybit v0.1.0 successfully installed!"
echo "     Run 'daybit' in terminal or launch Daybit from your applications menu."
