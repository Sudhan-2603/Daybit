import React from 'react';
import { 
  User as UserIcon, 
  ShieldCheck, 
  Smartphone, 
  Monitor, 
  Laptop, 
  Clock, 
  Settings, 
  LogOut, 
  Sparkles,
  Wifi,
  HardDrive
} from 'lucide-react';
import type { User, Task } from '../../types';

interface ProfileViewProps {
  user: User | null;
  tasks: Task[];
  wsConnected: boolean;
  onOpenSettings: () => void;
  onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  tasks,
  wsConnected,
  onOpenSettings,
  onLogout,
}) => {
  const agent = navigator.userAgent;
  const currentDevice = /Android/i.test(agent) ? 'Android device' : /iPhone|iPad/i.test(agent) ? 'Apple mobile device' : /Windows/i.test(agent) ? 'Windows device' : /Mac OS/i.test(agent) ? 'Mac device' : /Linux/i.test(agent) ? 'Linux device' : 'Current device';
  const devices = [{ id: 'current-session', name: currentDevice, platform: navigator.platform || 'Browser session', isCurrent: true, lastActive: 'Active now', ip: 'Current session', icon: /Android|iPhone|iPad/i.test(agent) ? <Smartphone className="w-5 h-5" /> : /Mac OS|Linux/i.test(agent) ? <Laptop className="w-5 h-5" /> : <Monitor className="w-5 h-5" /> }];

  const completedCount = tasks.filter((t) => t.status === 'Complete').length;

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 animate-linear-enter">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black dark:text-white">
            My Profile
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-all duration-150"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Workspace Settings</span>
          </button>

          {user?.id !== 'offline_user' && (
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-xs font-semibold text-rose-600 dark:text-rose-400 transition-all duration-150"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: User Card & Stats */}
        <div className="space-y-6">
          {/* Main User Card */}
          <div className="p-6 rounded-3xl backdrop-blur-xl bg-white/80 dark:bg-zinc-950/70 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
            <div className="flex items-center gap-4 mb-5">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-black dark:border-white bg-zinc-100 dark:bg-zinc-800 shadow-md flex items-center justify-center text-xl font-bold text-zinc-800 dark:text-white">
                  {(user?.email.charAt(0) || 'D').toUpperCase()}
                </div>
                <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-black" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-black dark:text-white">
                  {user ? user.email.split('@')[0] : 'Demo User'}
                </h2>
                <p className="text-xs text-zinc-400 font-mono">
                  {user?.email || 'demo@daybit.app'}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Security Encryption</span>
                <span className="font-semibold text-black dark:text-white flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Argon2 Hash</span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Token Authorization</span>
                <span className="font-semibold text-black dark:text-white">Pure-Rust HS256 JWT</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Live Sync Engine</span>
                <span className={`font-semibold flex items-center gap-1 ${wsConnected ? 'text-emerald-500' : 'text-amber-500'}`}>
                  <Wifi className="w-3.5 h-3.5" />
                  <span>{wsConnected ? 'WebSocket Online' : 'Offline'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="p-6 rounded-3xl backdrop-blur-xl bg-white/80 dark:bg-zinc-950/70 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">
              Workspace Summary
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800/70">
                <span className="text-[10px] text-zinc-400 font-semibold block mb-0.5">Total Tasks</span>
                <span className="text-2xl font-black text-black dark:text-white">{tasks.length}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800/70">
                <span className="text-[10px] text-zinc-400 font-semibold block mb-0.5">Completed</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{completedCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Connected Devices & Active Sessions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl backdrop-blur-xl bg-white/80 dark:bg-zinc-950/70 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-black dark:text-white">
                  Connected Devices & Sessions
                </h3>
                <p className="text-xs text-zinc-400">
                  Current sign-in status for this device
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                {devices.length} Active Devices
              </span>
            </div>

            <div className="space-y-3.5">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className={`p-4 rounded-2xl border transition-all duration-150 ${
                    device.isCurrent
                      ? 'border-black dark:border-white bg-zinc-50/90 dark:bg-zinc-900/80 shadow-sm'
                      : 'border-zinc-200/80 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/40'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        device.isCurrent
                          ? 'bg-black text-white dark:bg-white dark:text-black'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                      }`}>
                        {device.icon}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-black dark:text-white">
                            {device.name}
                          </h4>
                          {device.isCurrent && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                              Current Device
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {device.platform}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 text-xs pt-2 sm:pt-0 border-t sm:border-0 border-zinc-100 dark:border-zinc-800">
                      <div className="text-right">
                        <span className={`block text-xs font-semibold ${
                          device.isCurrent ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'
                        }`}>
                          {device.lastActive}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {device.ip}
                        </span>
                      </div>

                      {!device.isCurrent && (
                        <button
                          type="button"
                          onClick={() => alert(`Session for ${device.name} revoked.`)}
                          className="px-3 py-1 rounded-full text-[11px] font-semibold border border-zinc-200 dark:border-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition-colors"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
