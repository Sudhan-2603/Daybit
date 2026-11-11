import React, { useState } from 'react';
import { 
  Sun, 
  Moon, 
  LogOut, 
  Plus,
  User as UserIcon,
  Settings as SettingsIcon,
  ChevronDown
} from 'lucide-react';
import type { User } from '../types';
import daybitLogo from '../assets/daybit-logo.png';

interface NavbarProps {
  user: User | null;
  onOpenNewTask: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  wsConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenNewTask,
  onOpenAuth,
  onLogout,
  onOpenProfile,
  onOpenSettings,
  darkMode,
  onToggleDarkMode,
  wsConnected,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/75 dark:bg-black/75 border-b border-zinc-200/60 dark:border-zinc-800/60 transition-colors duration-200">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand: "Daybit" */}
        <div className="flex items-center gap-2.5">
          <img src={daybitLogo} alt="Daybit" className="w-8 h-8 rounded-full bg-black object-contain shadow-xs" />
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-black dark:text-white leading-tight font-sans">
              Daybit
            </h1>
          </div>
        </div>

        {/* Right Action Capsules */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Live Sync Capsule */}
          <div 
            title={wsConnected ? 'Real-time WebSocket Live' : 'Connecting to Live Sync...'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 font-medium"
          >
            {wsConnected ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="hidden xs:inline text-[11px]">Synced</span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                <span className="hidden xs:inline text-[11px] text-zinc-400">Offline</span>
              </>
            )}
          </div>

          {/* Dark / Light Mode Toggle Capsule */}
          <button
            onClick={onToggleDarkMode}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-all active:scale-95 duration-150 ease-linear"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* New Task Capsule */}
          <button
            onClick={onOpenNewTask}
            aria-label="Create new task"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-95 text-white dark:text-black text-xs font-semibold shadow-xs transition-all duration-150 ease-linear"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">New Task</span>
          </button>

          {/* User Account with Profile Image BEFORE Logout Button */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-zinc-200 dark:border-zinc-800">
              {/* Profile Image Trigger */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-1.5 p-0.5 rounded-full hover:ring-2 hover:ring-zinc-300 dark:hover:ring-zinc-700 transition-all"
                  title="My Profile & Settings"
                >
                  <span className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-white border border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-[11px] font-bold">
                    {user.email.charAt(0).toUpperCase()}
                  </span>
                  <ChevronDown className="w-3 h-3 text-zinc-400" />
                </button>

                {/* Profile Dropdown: "My Profile" & "Settings" */}
                {menuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-20" 
                      onClick={() => setMenuOpen(false)} 
                    />
                    <div className="absolute right-0 mt-2 w-48 backdrop-blur-2xl bg-white/95 dark:bg-black/95 rounded-2xl shadow-xl border border-zinc-200/80 dark:border-zinc-800 py-1.5 z-30 animate-linear-enter">
                      <div className="px-3.5 py-2 border-b border-zinc-100 dark:border-zinc-800/80">
                        <span className="block text-xs font-bold text-black dark:text-white truncate">
                          {user.email.split('@')[0]}
                        </span>
                        <span className="block text-[10px] text-zinc-400 truncate">
                          {user.email}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onOpenProfile();
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs font-medium flex items-center gap-2.5 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-zinc-500" />
                        <span>My Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onOpenSettings();
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs font-medium flex items-center gap-2.5 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                      >
                        <SettingsIcon className="w-4 h-4 text-zinc-500" />
                        <span>Settings</span>
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Logout Button (Positioned After Profile Image) */}
              <button
                onClick={onLogout}
                title="Log Out"
                className="p-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-500 hover:text-rose-500 transition-colors duration-150"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3 py-1.5 text-xs font-semibold rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
