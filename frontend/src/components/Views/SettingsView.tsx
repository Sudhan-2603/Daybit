import React, { useState } from 'react';
import { 
  Sun, 
  Moon, 
  Kanban, 
  List, 
  LayoutGrid, 
  Bell, 
  Check, 
  MessageSquare, 
  Type, 
  Globe, 
  Palette,
  CheckCircle2,
  Power,
  Laptop
} from 'lucide-react';
import type { TasksViewMode } from '../Modals/SettingsModal';
import { LANGUAGES, SupportedLanguage } from '../../services/i18n';

interface SettingsViewProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  tasksViewMode: TasksViewMode;
  onSelectTasksViewMode: (mode: TasksViewMode) => void;
  darkBg: string;
  onSelectDarkBg: (bg: string) => void;
  lightBg: string;
  onSelectLightBg: (bg: string) => void;
  fontFamily: string;
  onSelectFontFamily: (font: string) => void;
  language: SupportedLanguage;
  onSelectLanguage: (language: SupportedLanguage) => void;
  backgroundAccent: string;
  onSelectBackgroundAccent: (color: string) => void;
  whatsAppEnabled?: boolean;
  onToggleWhatsAppEnabled?: (val: boolean) => void;
  onOpenWhatsApp?: () => void;
  onOpenFeedbacks: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  darkMode,
  onToggleDarkMode,
  tasksViewMode,
  onSelectTasksViewMode,
  darkBg,
  onSelectDarkBg,
  lightBg,
  onSelectLightBg,
  fontFamily,
  onSelectFontFamily,
  language,
  onSelectLanguage,
  backgroundAccent: _backgroundAccent,
  onSelectBackgroundAccent: _onSelectBackgroundAccent,
  whatsAppEnabled: _whatsAppEnabled,
  onToggleWhatsAppEnabled: _onToggleWhatsAppEnabled,
  onOpenWhatsApp: _onOpenWhatsApp,
  onOpenFeedbacks,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'appearance'>('general');
  const [notificationStatus, setNotificationStatus] = useState<string>(() => {
    if ('Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });

  // Auto-start on system boot / startup
  const [startOnBoot, setStartOnBoot] = useState<boolean>(() => {
    return localStorage.getItem('daybit_autostart_system') === 'true';
  });
  const [startMinimized, setStartMinimized] = useState<boolean>(() => {
    return localStorage.getItem('daybit_autostart_minimized') === 'true';
  });
  const [bootStatusMsg, setBootStatusMsg] = useState<string>('');

  const handleToggleStartOnBoot = (val: boolean) => {
    setStartOnBoot(val);
    localStorage.setItem('daybit_autostart_system', String(val));
    setBootStatusMsg(val ? 'Startup enabled: Daybit will start when system turns on' : 'Startup disabled: Daybit will launch manually');
    setTimeout(() => setBootStatusMsg(''), 3000);
  };

  const handleToggleStartMinimized = (val: boolean) => {
    setStartMinimized(val);
    localStorage.setItem('daybit_autostart_minimized', String(val));
    setBootStatusMsg('Startup preference saved');
    setTimeout(() => setBootStatusMsg(''), 2500);
  };

  const requestNotification = async () => {
    if ('Notification' in window) {
      const res = await Notification.requestPermission();
      setNotificationStatus(res);
      if (res === 'granted') {
        new Notification('Daybit Notifications Active', {
          body: 'You will receive reminders for scheduled tasks.',
          icon: '/daybit-logo.png'
        });
      }
    } else {
      alert('Desktop notifications are not supported in this browser.');
    }
  };

  const fontOptions = [
    { id: 'Inter', name: 'Inter (Default)', style: `'Inter', sans-serif`, preview: 'Clean modern sans-serif' },
    { id: 'Roboto', name: 'Roboto', style: `'Roboto', sans-serif`, preview: 'Geometric neo-grotesque' },
    { id: 'Outfit', name: 'Outfit', style: `'Outfit', sans-serif`, preview: 'High-tech display curves' },
    { id: 'Plus Jakarta Sans', name: 'Plus Jakarta Sans', style: `'Plus Jakarta Sans', sans-serif`, preview: 'Contemporary geometric' },
    { id: 'JetBrains Mono', name: 'JetBrains Mono', style: `'JetBrains Mono', monospace`, preview: 'Developer monospaced' },
    { id: 'Poppins', name: 'Poppins', style: `'Poppins', sans-serif`, preview: 'Friendly geometric circular' },
    { id: 'Noto Sans Tamil', name: 'Noto Sans Tamil', style: `'Noto Sans Tamil', sans-serif`, preview: 'தமிழ் எழுத்துரு' },
    { id: 'Noto Sans Telugu', name: 'Noto Sans Telugu', style: `'Noto Sans Telugu', sans-serif`, preview: 'తెలుగు లిపి' },
    { id: 'Noto Sans Devanagari', name: 'Noto Sans Hindi', style: `'Noto Sans Devanagari', sans-serif`, preview: 'हिन्दी देवनागरी' },
  ];

  const darkColorCircles = [
    { id: 'pure-black', name: 'Pure Obsidian', hex: '#000000' },
    { id: 'deep-carbon', name: 'Deep Carbon', hex: '#09090b' },
    { id: 'slate-midnight', name: 'Slate Midnight', hex: '#0f172a' },
    { id: 'dark-navy', name: 'Dark Navy', hex: '#030712' },
    { id: 'deep-forest', name: 'Deep Forest', hex: '#051c14' },
    { id: 'deep-plum', name: 'Deep Plum', hex: '#180816' },
  ];

  const lightColorCircles = [
    { id: 'pure-white', name: 'Pure White', hex: '#ffffff' },
    { id: 'warm-cream', name: 'Warm Cream', hex: '#fafaf9' },
    { id: 'soft-mist', name: 'Soft Mist', hex: '#f8fafc' },
    { id: 'ice-blue', name: 'Ice Blue', hex: '#f0f9ff' },
    { id: 'mint-fresh', name: 'Mint Fresh', hex: '#f0fdf4' },
    { id: 'rose-whisper', name: 'Rose Whisper', hex: '#fff1f2' },
  ];

  const views: { id: TasksViewMode; label: string; desc: string; icon: React.ReactNode }[] = [
    { id: 'kanban', label: 'Kanban Columns', desc: 'Drag-and-drop workflow across 4 status stages', icon: <Kanban className="w-4 h-4" /> },
    { id: 'list', label: 'Compact List', desc: 'Dense table view with one-click completion checkboxes', icon: <List className="w-4 h-4" /> },
    { id: 'board', label: 'Card Grid Board', desc: 'Clean cards grid grouped with segmented progress', icon: <LayoutGrid className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-[1600px] mx-auto px-3 sm:px-6 py-4 sm:py-6 animate-linear-enter">
      {/* Settings Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-400">Workspace Preferences</span>
          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-black dark:text-white mt-0.5">
            Settings
          </h1>
        </div>

        {/* Section Tabs: General / Appearance */}
        <div className="flex items-center gap-1 p-1 rounded-full backdrop-blur-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ease-linear ${
              activeTab === 'general'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('appearance')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ease-linear ${
              activeTab === 'appearance'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Appearance
          </button>
        </div>
      </div>

      {/* Main Settings Panel */}
      <div className="max-w-4xl space-y-4 sm:space-y-6">
        {/* 1. GENERAL SETTINGS */}
        {activeTab === 'general' && (
          <div className="space-y-4 sm:space-y-6 animate-linear-enter">
            {/* Desktop Notifications */}
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl backdrop-blur-xl bg-white/80 dark:bg-zinc-950/70 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white flex items-center justify-center shrink-0">
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-black dark:text-white">
                      Desktop Notifications
                    </h3>
                    <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                      Allow alerts for live task reminders, scheduled notifications, and focus alerts while Daybit is open.
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <span className="text-zinc-400 text-[11px]">Permission:</span>
                      <span className={`font-semibold uppercase tracking-wider text-[9.5px] px-2 py-0.5 rounded-full ${
                        notificationStatus === 'granted'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}>
                        {notificationStatus}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={requestNotification}
                  className="self-start sm:self-auto px-4 py-1.5 sm:py-2 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-semibold active:scale-95 transition-all shadow-xs shrink-0"
                >
                  {notificationStatus === 'granted' ? 'Test Alert' : 'Enable Access'}
                </button>
              </div>
            </div>

            {/* Start App When System Turns On (System Startup) */}
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl backdrop-blur-xl bg-white/80 dark:bg-zinc-950/70 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs transition-all">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                    startOnBoot
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                  }`}>
                    <Power className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <h3 className="text-xs sm:text-sm font-bold text-black dark:text-white">
                        Start App When System Turns On
                      </h3>
                      <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full transition-all ${
                        startOnBoot 
                          ? 'bg-emerald-500 text-white shadow-xs' 
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                      }`}>
                        {startOnBoot ? 'Active on Boot' : 'Manual Launch Only'}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                      Launch Daybit automatically on system startup so background task notifications and reminders are active.
                    </p>
                  </div>
                </div>

                {/* Main Toggle Switch Capsule */}
                <button
                  type="button"
                  onClick={() => handleToggleStartOnBoot(!startOnBoot)}
                  className={`self-start sm:self-auto px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 active:scale-95 ${
                    startOnBoot
                      ? 'bg-emerald-500 text-white shadow-xs hover:bg-emerald-600'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {startOnBoot ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              {/* Startup Options & Status Details */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 text-[11px] sm:text-xs">
                    <Laptop className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span>Launch Behavior on System Startup:</span>
                  </div>
                  <button
                    type="button"
                    disabled={!startOnBoot}
                    onClick={() => handleToggleStartMinimized(!startMinimized)}
                    className={`self-start sm:self-auto px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold transition-all border ${
                      !startOnBoot 
                        ? 'opacity-40 cursor-not-allowed border-zinc-200 dark:border-zinc-800 text-zinc-400'
                        : startMinimized
                          ? 'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-bold'
                          : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {startMinimized ? '✓ Start Minimized to Tray' : 'Open Full Window on Boot'}
                  </button>
                </div>

                {bootStatusMsg && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-fadeIn">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{bootStatusMsg}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Language Selection */}
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl backdrop-blur-xl bg-white/80 dark:bg-zinc-950/70 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
              <div className="flex items-center gap-2 mb-1.5">
                <Globe className="w-4 h-4 text-zinc-500" />
                <h3 className="text-xs sm:text-sm font-bold text-black dark:text-white">
                  Interface Language / மொழி / భాష / भाषा
                </h3>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mb-3 sm:mb-4">
                Choose your preferred language across headers, views, statuses, and menus.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => onSelectLanguage(lang.code)}
                    className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all duration-150 ${
                      language === lang.code
                        ? 'border-black dark:border-white bg-zinc-100 dark:bg-zinc-900 shadow-xs font-bold'
                        : 'border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm sm:text-base">{lang.flag}</span>
                      {language === lang.code && (
                        <Check className="w-3.5 h-3.5 text-black dark:text-white" />
                      )}
                    </div>
                    <span className="block text-[11px] sm:text-xs font-bold text-black dark:text-white truncate">
                      {lang.native}
                    </span>
                    <span className="block text-[9.5px] sm:text-[10px] text-zinc-400 truncate">
                      {lang.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Global Typography (Font Families) */}
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl backdrop-blur-xl bg-white/80 dark:bg-zinc-950/70 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
              <div className="flex items-center gap-2 mb-1.5">
                <Type className="w-4 h-4 text-zinc-500" />
                <h3 className="text-xs sm:text-sm font-bold text-black dark:text-white">
                  Global Typography & Font Families
                </h3>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mb-3 sm:mb-4">
                Choose any font to change the entire application typography instantly.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                {fontOptions.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => onSelectFontFamily(f.id)}
                    className={`p-3 rounded-2xl border text-left transition-all duration-150 ${
                      fontFamily === f.id
                        ? 'border-black dark:border-white bg-zinc-100 dark:bg-zinc-900 shadow-xs'
                        : 'border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-bold text-black dark:text-white">
                        {f.name}
                      </span>
                      {fontFamily === f.id && (
                        <Check className="w-3.5 h-3.5 text-black dark:text-white" />
                      )}
                    </div>
                    <span 
                      className="block text-[11px] text-zinc-500 dark:text-zinc-400 truncate"
                      style={{ fontFamily: f.style }}
                    >
                      {f.preview}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Default Tasks View Mode */}
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl backdrop-blur-xl bg-white/80 dark:bg-zinc-950/70 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
              <h3 className="text-xs sm:text-sm font-bold text-black dark:text-white mb-1">
                Default Tasks View
              </h3>
              <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mb-3 sm:mb-4">
                Select your preferred layout for viewing and managing tasks
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                {views.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => onSelectTasksViewMode(v.id)}
                    className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-150 ${
                      tasksViewMode === v.id
                        ? 'border-black dark:border-white bg-zinc-50/90 dark:bg-zinc-900/80 shadow-sm'
                        : 'border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        tasksViewMode === v.id
                          ? 'bg-black text-white dark:bg-white dark:text-black'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                      }`}>
                        {v.icon}
                      </div>
                      {tasksViewMode === v.id && (
                        <Check className="w-4 h-4 text-black dark:text-white" />
                      )}
                    </div>
                    <div className="text-xs font-bold text-black dark:text-white">
                      {v.label}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-zinc-400 mt-0.5 sm:mt-1 leading-snug">
                      {v.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. APPEARANCE SETTINGS */}
        {activeTab === 'appearance' && (
          <div className="space-y-4 sm:space-y-6 animate-linear-enter">
            {/* Theme Toggle */}
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl backdrop-blur-xl bg-white/80 dark:bg-zinc-950/70 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
              <h3 className="text-xs sm:text-sm font-bold text-black dark:text-white mb-1">
                Appearance Theme
              </h3>
              <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mb-3 sm:mb-4">
                Choose between high-contrast Pure White (#FFFFFF) or Obsidian Dark (#000000)
              </p>

              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => { if (darkMode) onToggleDarkMode(); }}
                  className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-2xl border text-xs font-semibold transition-all ${
                    !darkMode
                      ? 'border-black bg-zinc-100 text-black shadow-sm'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:border-zinc-300'
                  }`}
                >
                  <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0" />
                  <div className="text-left">
                    <span className="block font-bold text-xs sm:text-sm">Light Theme</span>
                    <span className="text-[9.5px] sm:text-[10px] text-zinc-400">Pure #FFFFFF</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => { if (!darkMode) onToggleDarkMode(); }}
                  className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-2xl border text-xs font-semibold transition-all ${
                    darkMode
                      ? 'border-white bg-zinc-900 text-white shadow-sm'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:border-zinc-300'
                  }`}
                >
                  <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 shrink-0" />
                  <div className="text-left">
                    <span className="block font-bold text-xs sm:text-sm">Dark Theme</span>
                    <span className="text-[9.5px] sm:text-[10px] text-zinc-400">Pure #000000</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Dark Theme Background Color Circles */}
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl backdrop-blur-xl bg-white/80 dark:bg-zinc-950/70 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
              <div className="flex items-center gap-2 mb-1">
                <Palette className="w-4 h-4 text-zinc-400" />
                <h3 className="text-xs sm:text-sm font-bold text-black dark:text-white">
                  Dark Theme Background Colors
                </h3>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mb-3 sm:mb-4">
                Color circles for background tinting in Dark Mode
              </p>

              <div className="flex flex-wrap items-center gap-3 sm:gap-3.5 mb-1">
                {darkColorCircles.map((circle) => (
                  <button
                    key={circle.id}
                    type="button"
                    title={circle.name}
                    onClick={() => onSelectDarkBg(circle.id)}
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 transition-all active:scale-90 flex items-center justify-center shadow-md ${
                      darkBg === circle.id
                        ? 'border-white ring-2 ring-white/60 scale-110'
                        : 'border-zinc-700/80 hover:scale-105'
                    }`}
                    style={{ backgroundColor: circle.hex }}
                  >
                    {darkBg === circle.id && (
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white stroke-[3]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Light Theme Background Color Circles */}
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl backdrop-blur-xl bg-white/80 dark:bg-zinc-950/70 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
              <div className="flex items-center gap-2 mb-1">
                <Palette className="w-4 h-4 text-zinc-400" />
                <h3 className="text-xs sm:text-sm font-bold text-black dark:text-white">
                  Light Theme Background Colors
                </h3>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mb-3 sm:mb-4">
                Color circles for background tinting in Light Mode
              </p>

              <div className="flex flex-wrap items-center gap-3 sm:gap-3.5 mb-1">
                {lightColorCircles.map((circle) => (
                  <button
                    key={circle.id}
                    type="button"
                    title={circle.name}
                    onClick={() => onSelectLightBg(circle.id)}
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 transition-all active:scale-90 flex items-center justify-center shadow-sm ${
                      lightBg === circle.id
                        ? 'border-black ring-2 ring-black/40 scale-110'
                        : 'border-zinc-300 hover:scale-105'
                    }`}
                    style={{ backgroundColor: circle.hex }}
                  >
                    {lightBg === circle.id && (
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black stroke-[3]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Community Feedback Capsule Footer */}
        <div className="pt-4 sm:pt-6 border-t border-zinc-200/80 dark:border-zinc-800/80 flex flex-col items-center text-center gap-2 pb-6">
          <button
            type="button"
            onClick={onOpenFeedbacks}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-semibold shadow-xs hover:opacity-90 active:scale-95 transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Community Feedbacks & Reviews</span>
          </button>
          <div className="text-[10px] text-zinc-400 font-mono mt-1">
            Daybit v0.2.0 • React 19 • Rust Axum
          </div>
        </div>
      </div>
    </div>
  );
};
