#!/usr/bin/env bash
# Daybit v0.1.0 - Android ADB Installation Script
set -e

APK_FILE="$(dirname "$0")/Daybit-v0.1.apk"

if ! command -v adb &> /dev/null; then
    echo "[!] Android Debug Bridge (adb) is not found in your PATH."
    echo "    Please install Android Platform Tools or copy Daybit-v0.1.apk to your phone directly."
    exit 1
fi

echo "==> Detecting connected Android devices..."
adb devices

echo "==> Installing Daybit v0.1.0 on connected device..."
adb install -r "$APK_FILE"

echo "==> Launching Daybit..."
adb shell monkey -p app.daybit.taskmanager -c android.intent.category.LAUNCHER 1

echo "[OK] Daybit v0.1.0 is successfully installed and running!"
