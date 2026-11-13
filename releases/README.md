# Daybit v0.1.0 — Stable Release Packages

<div align="center">
  <img src="../../frontend/public/daybit-logo.png" alt="Daybit Logo" width="80" height="80" />
  <h2>Daybit v0.1.0 (Stable Release)</h2>
  <p><strong>Official multi-OS application packages and installers for Windows, Android, Ubuntu/Debian, and Arch Linux.</strong></p>
</div>

---

## 📦 Release Packages & Download Matrix

| Platform | Target OS | File Name | Type | Size |
| :--- | :--- | :--- | :--- | :--- |
| **Windows** | Windows 10 / 11 (x64) | [`windows/Daybit.exe`](windows/Daybit.exe) | Standalone Application | ~5.0 MB |
| **Windows** | Windows 10 / 11 (x64) | [`windows/Daybit-Setup-v0.1.msi`](windows/Daybit-Setup-v0.1.msi) | Windows Installer | ~5.0 MB |
| **Android** | Android 7.0+ (API 24–34) | [`android/Daybit-v0.1.apk`](android/Daybit-v0.1.apk) | Mobile APK | ~1.2 MB |
| **Ubuntu / Debian** | Ubuntu 20.04+, Debian 11+ | [`ubuntu-debian/daybit_0.1.0_amd64.deb`](ubuntu-debian/daybit_0.1.0_amd64.deb) | Debian Package | ~1.2 MB |
| **Arch Linux / Generic** | Arch Linux, Manjaro, Fedora | [`arch-linux/Daybit-0.1.0-x86_64.AppImage`](arch-linux/Daybit-0.1.0-x86_64.AppImage) | Universal AppImage | ~1.2 MB |
| **Arch Linux (AUR)** | Arch Linux (makepkg) | [`arch-linux/PKGBUILD`](arch-linux/PKGBUILD) | AUR Build Recipe | Source |

---

## 🚀 Installation Instructions

### 1. Windows (10 / 11)
- **Standalone Application:** Download and double-click [`Daybit.exe`](windows/Daybit.exe). It checks prerequisites and launches the Daybit desktop workspace.
- **1-Click Silent Setup:** Run PowerShell as administrator or user inside `windows/`:
  ```powershell
  powershell -ExecutionPolicy Bypass -File .\windows\installer.ps1
  ```
  This installs Daybit to `%LOCALAPPDATA%\Daybit` and creates Desktop & Start Menu shortcuts automatically.

---

### 2. Android Mobile (APK)
- **Direct Install:** Transfer [`Daybit-v0.1.apk`](android/Daybit-v0.1.apk) to your Android device, tap the file in your file manager, and choose **Install** (allow *Install unknown apps* if prompted).
- **Via ADB (Command Line):**
  ```bash
  chmod +x android/install-apk.sh
  ./android/install-apk.sh
  # or directly:
  adb install -r android/Daybit-v0.1.apk
  ```

---

### 3. Ubuntu & Debian Linux (.deb)
Install via `dpkg` or `apt`:
```bash
sudo dpkg -i ubuntu-debian/daybit_0.1.0_amd64.deb || sudo apt-get install -f -y
```
Or execute the helper script:
```bash
chmod +x ubuntu-debian/install.sh
sudo ./ubuntu-debian/install.sh
```
Once installed, launch `daybit` from the terminal or search for **Daybit** in your desktop applications menu.

---

### 4. Arch Linux & Generic Linux (AppImage & PKGBUILD)
- **AppImage (Zero-install executable):**
  ```bash
  chmod +x arch-linux/Daybit-0.1.0-x86_64.AppImage
  ./arch-linux/Daybit-0.1.0-x86_64.AppImage
  ```
- **Arch Linux via PKGBUILD:**
  ```bash
  cd arch-linux
  makepkg -si
  ```

---

## 🛠️ Build Automation
To rebuild all web assets, Android APK bundle, and Linux packages from source, run:
```bash
chmod +x scripts/build-all.sh
./scripts/build-all.sh
```
