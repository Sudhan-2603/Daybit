<div align="center">

<br />

<img src="frontend/public/daybit-logo.png" alt="Daybit Logo" width="96" height="96" />

# Daybit

### Minimalist. Real-Time. Cross-Platform Task Workspace.

**Daybit** is a full-stack task manager and productivity suite crafted with **React 19 + TypeScript**, a high-speed **Rust (Axum)** backend, **MongoDB** persistence, **WebSocket** live synchronization, and **Tauri 2** native builds for **Windows**, **Linux**, and **Android**.

<p>
  <img src="https://img.shields.io/badge/React-19-000000?style=for-the-badge&logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-000000?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Rust-Axum%200.7-000000?style=for-the-badge&logo=rust&logoColor=white" alt="Rust Axum" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas%20%2F%20Local-000000?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Tauri%202-Win%20%7C%20Linux%20%7C%20Android-000000?style=for-the-badge&logo=tauri&logoColor=white" alt="Tauri 2" />
  <a href="https://github.com/Sudhan-2603/Daybit/releases/latest"><img src="https://img.shields.io/badge/Latest%20Release-v0.2.0-000000?style=for-the-badge&logo=github&logoColor=white" alt="v0.2.0" /></a>
</p>

<p>
  <a href="#-why-daybit">About</a> •
  <a href="#-latest-release-v020--all-platform-installers"><strong>Downloads</strong></a> •
  <a href="#-screenshots">Screenshots</a> •
  <a href="#-feature-highlights">Features</a> •
  <a href="#%EF%B8%8F-architecture">Architecture</a> •
  <a href="#-project-structure">Structure</a> •
  <a href="#-getting-started">Quick Start</a> •
  <a href="#-api--websocket">API</a>
</p>

</div>

---

## ⚡ Why Daybit?

Designed around a monochrome **frosted-glass aesthetic** (`#000000` / `#ffffff`) with smooth linear animations and zero-latency interactions, **Daybit** brings your daily planning, analytics, focus timers, and messaging alerts together in one unified workspace:

- **One Codebase, Everywhere:** Run natively on desktop & mobile via **Tauri 2** or in any modern browser.
- **Instant Sync Across Devices:** Drag a card or check off a task on one device and see every connected session update live over **WebSockets**.
- **Built-In Focus & Utility Suite:** Never leave your flow for a **Calculator**, **Countdown Timer / Stopwatch**, **Calendar**, or **WhatsApp Task Bot**.
- **Deep Personalization:** Switch view layouts, background color circles, global typography, and full **multi-language** UI translations *(including English, Tamil, Telugu, and Hindi)*.

---

## ✨ Feature Highlights

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>📋 Unified Task Workflows</h3>
      <ul>
        <li><strong>Kanban, Board &amp; List Views:</strong> Drag-and-drop cards across <em>To Do</em>, <em>In Progress</em>, <em>Review</em>, and <em>Complete</em> with <code>@dnd-kit</code>.</li>
        <li><strong>0ms Optimistic Checkboxes:</strong> Instant completion toggle and segmented progress bars (<code>done / total</code>).</li>
        <li><strong>Place &amp; Live Search:</strong> Filter by <strong>College</strong>, <strong>Work</strong>, or <strong>Personal</strong> and jump directly to tasks from the live search dropdown.</li>
        <li><strong>Invites &amp; Collaboration:</strong> Share tasks with teammates via email invites.</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>📊 Dashboard &amp; Scheduling</h3>
      <ul>
        <li><strong>Live Analytics:</strong> Track Active, Overdue, Completed, and Unscheduled tasks alongside completion rate % and weekly trend charts.</li>
        <li><strong>Horizontal Date Strip &amp; Calendar:</strong> Scroll horizontally through upcoming deadlines on the Dashboard or inspect full-month schedules in Calendar view.</li>
        <li><strong>Cron Reminder Engine:</strong> Background <code>tokio-cron-scheduler</code> triggers alerts with <strong>Accept</strong>, <strong>Remind (+15m)</strong>, and <strong>Reject</strong> actions.</li>
        <li><strong>Web Audio Ringtones:</strong> 5 synthesized custom tones (<code>chime</code>, <code>digital-bell</code>, <code>marimba</code>, <code>pulse</code>, <code>gentle-gong</code>).</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>🛠️ Built-In Productivity Tools</h3>
      <ul>
        <li><strong>Timer &amp; Stopwatch:</strong> Presets (<code>5m</code>, <code>15m</code>, <code>25m</code>, <code>45m</code>), custom <code>+</code> timer, bold red <code>00.0</code> finish state, and lap tracking.</li>
        <li><strong>Keyboard-Ready Calculator:</strong> Click or type seamlessly using your physical keyboard &amp; numpad.</li>
        <li><strong>WhatsApp Cloud API Bot:</strong> Manage tasks straight from WhatsApp using <code>add</code>, <code>list today</code>, and <code>done &lt;id&gt;</code> — toggleable directly from Settings.</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>🎨 Customization &amp; i18n</h3>
      <ul>
        <li><strong>Theme Color Circles:</strong> Custom dark &amp; light background palettes (Pure Obsidian, Deep Carbon, Slate Midnight, Mint Fresh, Ice Blue, etc.).</li>
        <li><strong>9 Global Font Families:</strong> Inter, Roboto, Outfit, Plus Jakarta Sans, JetBrains Mono, Poppins, Noto Sans Tamil, Noto Sans Telugu, Noto Sans Devanagari.</li>
        <li><strong>8 Languages:</strong> Instant translation across English, <strong>தமிழ் (Tamil)</strong>, <strong>తెలుగు (Telugu)</strong>, <strong>हिन्दी (Hindi)</strong>, Spanish, French, German, and Japanese.</li>
      </ul>
    </td>
  </tr>
</table>

---

## 📸 Screenshots

### 📊 Dashboard & Task Analytics
<table>
  <tr>
    <td width="50%"><strong>Dashboard Overview (Light Theme)</strong></td>
    <td width="50%"><strong>Dashboard Overview (Dark Theme)</strong></td>
  </tr>
  <tr>
    <td><img src="Screenshots/dashboard-light.png" alt="Daybit Dashboard Light Theme" /></td>
    <td><img src="Screenshots/dashboard-dark.png" alt="Daybit Dashboard Dark Theme" /></td>
  </tr>
</table>

### 📋 Task Kanban Board & Task Creation
<table>
  <tr>
    <td width="60%"><strong>Kanban Columns Workflow & Place Badges</strong></td>
    <td width="40%"><strong>Create New Task Modal</strong></td>
  </tr>
  <tr>
    <td><img src="Screenshots/tasks-kanban-light.png" alt="Daybit Tasks Kanban Workflow" /></td>
    <td><img src="Screenshots/create-task-modal.png" alt="Create New Task Modal" /></td>
  </tr>
</table>

### 📅 Calendar & Deadline Timeline
<table>
  <tr>
    <td width="50%"><strong>Scheduled Timeline (Light Theme)</strong></td>
    <td width="50%"><strong>Scheduled Timeline (Dark Theme)</strong></td>
  </tr>
  <tr>
    <td><img src="Screenshots/calendar-light.png" alt="Daybit Calendar Light Theme" /></td>
    <td><img src="Screenshots/calendar-dark.png" alt="Daybit Calendar Dark Theme" /></td>
  </tr>
</table>

### 🔑 Day - Personal AI Assistance API Key Generator
<table>
  <tr>
    <td width="50%"><strong>General Settings & API Keys (Light)</strong></td>
    <td width="50%"><strong>General Settings & API Keys (Dark)</strong></td>
  </tr>
  <tr>
    <td><img src="Screenshots/settings-general-light.png" alt="Settings API Keys Light" /></td>
    <td><img src="Screenshots/settings-general-dark.png" alt="Settings API Keys Dark" /></td>
  </tr>
</table>

### 🎨 Customization, Themes & Typography
<table>
  <tr>
    <td width="50%"><strong>Appearance Theme & Color Palettes (Light)</strong></td>
    <td width="50%"><strong>Appearance Theme & Color Palettes (Dark)</strong></td>
  </tr>
  <tr>
    <td><img src="Screenshots/settings-appearance-light.png" alt="Settings Appearance Light" /></td>
    <td><img src="Screenshots/settings-appearance-dark.png" alt="Settings Appearance Dark" /></td>
  </tr>
</table>

<p align="center">
  <img src="Screenshots/settings-typography-views-light.png" alt="Global Typography & Tasks Views" width="100%" />
  <br />
  <em>Global Typography (Inter, Roboto, Poppins, Tamil, Telugu, Hindi) and Default Task View Layouts</em>
</p>

---

## 🏗️ Architecture

```mermaid
flowchart LR
    UI["React 19 + TypeScript - Browser / Tauri 2"]
    API["Rust Axum Server - JWT Auth & REST"]
    WS["WebSocket Broadcast - /ws Live Sync"]
    CRON["Tokio Cron Scheduler - Reminders"]
    WA["WhatsApp Cloud API - Webhook Bot"]
    DB[("MongoDB - daybit_state")]

    UI <-->|HTTPS REST| API
    UI <-->|WebSocket| WS
    API --> DB
    API --> WS
    CRON --> DB
    CRON --> WS
    WA <-->|Webhook Events| API
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS, Lucide Icons, `@dnd-kit/core`, `@dnd-kit/sortable` |
| **Backend** | Rust, Axum 0.7, Tokio, Argon2 Password Hashing, HS256 JWT (Access & Refresh) |
| **Scheduler** | `tokio-cron-scheduler` |
| **Database** | MongoDB (`mongodb` 2.8) + SQL reference schema (`backend/migrations/20261110000000_init.sql`) |
| **Desktop & Mobile** | Tauri 2 (`src-tauri`) targeting Windows, Linux, and Android |
| **Integrations** | Meta WhatsApp Cloud API, Web Audio API, Browser Desktop Notifications |

---

## 📦 Release v0.2

The v0.2 Windows desktop app bundles its frontend, saves tasks locally, and does not start separate frontend or backend servers. Build instructions and the installer script are in [`releases/v0.2/`](releases/v0.2/README.md). Release binaries are generated by the Windows build script and are not checked into this source tree.

---

### Prerequisites
- **Rust & Cargo** (stable)
- **Node.js 18+** & **npm**
- **MongoDB** (Local `mongodb://localhost:27017/daybit` or MongoDB Atlas)

### 1. Clone the Repository
```bash
git clone https://github.com/Sudhan-2603/Daybit.git
cd Daybit
```

### 2. Configure Environment Variables
Create `backend/.env` using `.env.example`:
```env
PORT=4000
DATABASE_URL=mongodb+srv://<username>:<db_password>@<cluster>.mongodb.net/daybit?retryWrites=true&w=majority
JWT_SECRET=replace_with_a_long_random_secret

# Optional: WhatsApp Cloud API Integration
WHATSAPP_ACCESS_TOKEN=your_whatsapp_cloud_api_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_whatsapp_phone_number_id_here
WHATSAPP_VERIFY_TOKEN=daybit_whatsapp_verify_token
```

### 3. Start Backend & Frontend
```bash
# Terminal 1 — Rust API Server (http://localhost:4000)
cd backend
cargo run

# Terminal 2 — React + Vite Client (http://localhost:5173)
cd frontend
npm install
npm run dev
```

> **Windows Quick Launch:** Install Daybit and open it from the Desktop shortcut or Start Menu. The desktop app bundles its frontend and saves tasks locally; it does not start separate frontend or backend servers.

### Deploy the API backend to Render

The root [`render.yaml`](render.yaml) defines only a Rust web service; it does not create a Render database. MongoDB Atlas is the backend's only database. In Render, create a Blueprint from this repository and provide `DATABASE_URL` using your Atlas connection string when prompted. JWT authentication stays enabled, and Render generates `JWT_SECRET`; it supplies the service `PORT` automatically. The service health check uses `/health`.

After Render creates the service, use its `https://<service>.onrender.com` URL as `VITE_API_URL` for web frontend builds. Set `VITE_WS_URL` to `wss://<service>.onrender.com/ws` for live sync. The local desktop v0.2 build continues to use local storage and does not call this backend.

### Deploy the frontend to GitHub Pages

The [`deploy-frontend.yml`](.github/workflows/deploy-frontend.yml) workflow builds the Vite app and publishes it to GitHub Pages on every push to `main`. The expected site URL is `https://sudhan-2603.github.io/Daybit/`. In repository Settings → Pages, choose **GitHub Actions** as the publishing source. If the Render backend is deployed, add repository variables `VITE_API_URL` and `VITE_WS_URL`; without them, the Pages frontend starts in local-storage mode.

---

## 🔌 API & WebSocket

<details>
<summary><strong>Click to expand all REST &amp; WebSocket endpoints</strong></summary>

<br />

| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| `POST` | `/auth/register` | Register a new account (Argon2 password hashing) |
| `POST` | `/auth/login` | Sign in and obtain JWT access &amp; refresh tokens |
| `POST` | `/auth/refresh` | Refresh an expired access token |
| `GET` | `/auth/me` | Fetch the current authenticated user |
| `GET` / `POST` | `/tasks` | List all user tasks or create a new task |
| `PUT` / `DELETE` | `/tasks/:id` | Update task status/details or remove a task |
| `POST` | `/tasks/:id/respond` | Respond to a reminder (`accept`, `remind`, `reject`) |
| `POST` | `/tasks/:id/invite` | Invite a collaborator to a task |
| `GET` | `/invites` | Retrieve task invitations |
| `POST` | `/devices` | Register a device push token |
| `GET` | `/dashboard` | Fetch completion stats, status counts &amp; place metrics |
| `GET` | `/ws` | Live WebSocket stream for multi-device sync |
| `GET` / `POST` | `/whatsapp/webhook` | Meta WhatsApp webhook verification &amp; bot commands |

</details>

---

## 📂 Project Structure

The codebase is organized into modular workspaces and platform directories:

```text
Daybit/
├── .github/              # CI/CD pipelines, GitHub Pages deployment & multi-platform build workflows
├── backend/              # Rust Axum API, Tokio cron scheduler, WebSockets & MongoDB store
├── frontend/             # React 19 + TypeScript + Tailwind UI workspace & PWA
│   └── android/          # Native Android Gradle project (Capacitor Mobile APK)
├── releases/             # Multi-platform release guides, installation scripts & checksums
├── Screenshots/          # High-resolution application previews & theme showcases
└── src-tauri/            # Tauri 2 native desktop shell configuration (Windows & Linux)
```

---

## 🚀 Latest Releases & All-Platform Installers

Precompiled standalone installers and binary packages are generated for all supported desktop and mobile operating systems:

| Platform | Installer Package | Format | Direct Download / Run Command |
| :--- | :--- | :--- | :--- |
| **🪟 Windows (Installer)** | `Daybit-Setup-v0.2.0.exe` | NSIS Executable | [Download for Windows](https://github.com/Sudhan-2603/Daybit/releases/latest) |
| **🪟 Windows (Enterprise)** | `Daybit-v0.2.0-x64.msi` | Windows MSI Installer | [Download MSI Installer](https://github.com/Sudhan-2603/Daybit/releases/latest) |
| **🐧 Ubuntu / Debian** | `daybit_0.2.0_amd64.deb` | Native Debian Package | `sudo dpkg -i daybit_0.2.0_amd64.deb` |
| **🐧 Arch Linux / Universal** | `Daybit-0.2.0.AppImage` | Standalone AppImage | `chmod +x Daybit-0.2.0.AppImage && ./Daybit-0.2.0.AppImage` |
| **📱 Mobile Android** | `Daybit-v0.2.0.apk` | Android APK Package | [Download Android APK](https://github.com/Sudhan-2603/Daybit/releases/latest) |

> [!TIP]
> **Automated Cloud Builds:** All platform installers are compiled directly from source across Windows, Ubuntu, Arch Linux, and Android runners using [`.github/workflows/build-all-platforms.yml`](.github/workflows/build-all-platforms.yml). You can download raw build artifacts directly from the **[GitHub Actions Artifacts Tab](https://github.com/Sudhan-2603/Daybit/actions)** or the official **[GitHub Releases Page](https://github.com/Sudhan-2603/Daybit/releases)**. Detailed documentation for each operating system is available in **[releases/CROSS_PLATFORM_APPS.md](releases/CROSS_PLATFORM_APPS.md)**.

---

<div align="center">
  <sub>Built with Rust, React 19, TypeScript, Tauri 2 &amp; Capacitor</sub>
</div>
