import React from 'react';
import { X, Monitor, ShieldCheck } from 'lucide-react';
import type { User } from '../../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

const getDeviceName = () => {
  const agent = navigator.userAgent;
  if (/Android/i.test(agent)) return 'Android device';
  if (/iPhone|iPad/i.test(agent)) return 'Apple mobile device';
  if (/Windows/i.test(agent)) return 'Windows device';
  if (/Mac OS/i.test(agent)) return 'Mac device';
  if (/Linux/i.test(agent)) return 'Linux device';
  return 'Current device';
};

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user }) => {
  if (!isOpen) return null;
  const name = user?.email.split('@')[0].replace(/[._-]+/g, ' ') || 'Daybit user';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-linear-enter" onMouseDown={onClose}>
      <section className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white/95 dark:bg-black/95 shadow-2xl backdrop-blur-2xl" onMouseDown={(event) => event.stopPropagation()}>
        <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-200/60 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-800 dark:text-white">{name.charAt(0).toUpperCase()}</div>
            <div>
              <h2 className="font-bold text-black dark:text-white">My Profile</h2>
              <p className="text-xs text-zinc-500">{user?.email || 'Signed in to Daybit'}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close profile" className="p-2 rounded-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"><X className="w-4 h-4" /></button>
        </header>
        <div className="p-6 space-y-5">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/50 p-4">
            <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">Name</p>
            <p className="mt-1 capitalize font-semibold text-black dark:text-white">{name}</p>
            <p className="mt-3 flex items-center gap-2 text-xs text-zinc-500"><ShieldCheck className="w-4 h-4" /> Signed in to Daybit</p>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-wider text-zinc-500 font-bold mb-2">Device sign-in status</h3>
            <div className="rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100/70 dark:bg-zinc-900/70 p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-white dark:bg-black flex items-center justify-center"><Monitor className="w-4 h-4" /></div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-black dark:text-white">{getDeviceName()} <span className="text-emerald-600 dark:text-emerald-400">· Current device</span></p>
                <p className="text-xs text-zinc-500 mt-1">Active now · {navigator.platform || 'Browser session'}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-zinc-500">Previous device sign-in history is not available for this account yet.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
