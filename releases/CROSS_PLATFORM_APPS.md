# Daybit Cross-Platform Applications

Daybit is available as a native cross-platform application for **Windows**, **Linux (Ubuntu & Arch Linux)**, and **Android Mobile (APK)**.

---

## 📦 Supported Platforms & Packages

| Platform | Package Format | Target Operating Systems | Installation / Run Command |
| :--- | :--- | :--- | :--- |
| **Windows** | `.exe` / `.msi` | Windows 10, Windows 11 (x64) | Run `Daybit-Setup.exe` or `Daybit-Setup.msi` |
| **Ubuntu / Debian** | `.deb` | Ubuntu 20.04+, Debian 11+, Linux Mint, Pop!_OS | `sudo dpkg -i daybit_0.2.0_amd64.deb` |
| **Arch Linux** | `.AppImage` | Arch Linux, Manjaro, EndeavourOS, Fedora, openSUSE | `chmod +x Daybit-0.2.0.AppImage && ./Daybit-0.2.0.AppImage` |
| **Mobile Android** | `.apk` | Android 7.0 - Android 14+ (ARM64 & x86_64) | Tap `Daybit-v0.2.0.apk` to install on phone |

---

## 🚀 How to Download the Latest Binaries

All application packages are automatically built across parallel cloud runners using GitHub Actions:

1. Go to your GitHub repository: **[Sudhan-2603/Daybit Actions](https://github.com/Sudhan-2603/Daybit/actions)**
2. Click on the latest run of **"Build All Cross-Platform Apps (Windows, Ubuntu, Arch Linux, Android APK)"**.
3. Under the **Artifacts** section at the bottom of the page, download:
   - 🪟 `Daybit-Windows-Installers` (contains `.exe` and `.msi`)
   - 🐧 `Daybit-Linux-Ubuntu-Arch` (contains `daybit_0.2.0_amd64.deb` for Ubuntu and `Daybit-0.2.0.AppImage` for Arch Linux)
   - 📱 `Daybit-Android-APK` (contains `Daybit-v0.2.0.apk`)

---

## 🛠 Platform Installation Guides

### 1. Windows Installation
1. Download `Daybit-Setup.exe` or `Daybit-Setup.msi`.
2. Double-click the installer and follow the prompt.
3. Daybit will automatically create Desktop and Start Menu shortcuts.
4. Launch **Daybit** from your Desktop or Start Menu.

---

### 2. Ubuntu / Debian Installation
1. Download `daybit_0.2.0_amd64.deb`.
2. Open your terminal in the download folder and run:
   ```bash
   sudo dpkg -i daybit_0.2.0_amd64.deb
   # If any dependencies are needed:
   sudo apt-get install -f
   ```
3. Launch Daybit from your application menu or run `daybit` in the terminal.

---

### 3. Arch Linux Installation (AppImage)
1. Download `Daybit-0.2.0.AppImage`.
2. Make it executable and run:
   ```bash
   chmod +x Daybit-0.2.0.AppImage
   ./Daybit-0.2.0.AppImage
   ```
*(Optional) You can integrate it into your Arch Linux desktop launcher using `appimaged` or `appimagelauncher`:*
```bash
yay -S appimagelauncher
```

---

### 4. Android Mobile Installation (APK)
1. Download `Daybit-v0.2.0.apk` to your Android device (or transfer it from your computer).
2. Tap the downloaded APK file.
3. If prompted, allow "Install unknown apps" for your browser or file manager.
4. Tap **Install** and open **Daybit** on your home screen.

---

## 💻 Local Compilation Instructions

### To Build Android APK Locally:
```bash
cd frontend
npm run build:android
cd android
./gradlew assembleDebug
# Output APK: frontend/android/app/build/outputs/apk/debug/app-debug.apk
```

### To Build Desktop Binaries Locally (Tauri CLI):
```bash
# Windows
npx @tauri-apps/cli build --bundles msi,nsis

# Ubuntu / Arch Linux
npx @tauri-apps/cli build --bundles deb,appimage
```
