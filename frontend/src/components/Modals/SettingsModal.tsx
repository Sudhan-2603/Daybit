import React, { useState } from 'react';
import { X, Sun, Moon, LayoutGrid, Kanban, List, Image as ImageIcon } from 'lucide-react';

export type TasksViewMode = 'kanban' | 'list' | 'board';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  tasksViewMode: TasksViewMode;
  onSelectTasksViewMode: (mode: TasksViewMode) => void;
  darkBg: string;
  onSelectDarkBg: (bg: string) => void;
  lightBg: string;
  onSelectLightBg: (bg: string) => void;
  onOpenFeedback: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen, onClose, darkMode, onToggleDarkMode, tasksViewMode, onSelectTasksViewMode,
  darkBg, onSelectDarkBg, lightBg, onSelectLightBg, onOpenFeedback,
}) => {
  const [section, setSection] = useState<'general' | 'appearance'>('general');
  if (!isOpen) return null;

  const darkWallpapers = [
    { id: 'pure-black', name: 'Pure black', style: 'bg-black' },
    { id: 'dark-mesh', name: 'Obsidian mesh', style: 'bg-gradient-to-br from-zinc-950 via-black to-zinc-800' },
    { id: 'carbon', name: 'Carbon', style: 'bg-zinc-900' },
  ];
  const lightWallpapers = [
    { id: 'pure-white', name: 'Pure white', style: 'bg-white' },
    { id: 'light-mist', name: 'Soft mist', style: 'bg-gradient-to-br from-white via-zinc-50 to-zinc-200' },
    { id: 'paper', name: 'Neutral', style: 'bg-zinc-100' },
  ];
  const views: { id: TasksViewMode; label: string; icon: React.ReactNode }[] = [
    { id: 'kanban', label: 'Kanban', icon: <Kanban className="h-4 w-4" /> },
    { id: 'list', label: 'List', icon: <List className="h-4 w-4" /> },
    { id: 'board', label: 'Board', icon: <LayoutGrid className="h-4 w-4" /> },
  ];
  const wallpapers = section === 'appearance' ? (darkMode ? darkWallpapers : lightWallpapers) : [];
  const selectedWallpaper = darkMode ? darkBg : lightBg;
  const selectWallpaper = darkMode ? onSelectDarkBg : onSelectLightBg;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-linear-enter" onMouseDown={onClose}>
      <section className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-zinc-200/80 bg-white/95 shadow-2xl backdrop-blur-2xl dark:border-zinc-800 dark:bg-black/95" onMouseDown={(event) => event.stopPropagation()}>
        <header className="flex items-center justify-between border-b border-zinc-200/70 px-6 py-4 dark:border-zinc-800">
          <div><h2 className="text-base font-bold text-black dark:text-white">Settings</h2><p className="mt-0.5 text-[11px] text-zinc-500">Preferences for your Daybit workspace</p></div>
          <button onClick={onClose} aria-label="Close settings" className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"><X className="h-4 w-4" /></button>
        </header>
        <nav className="flex gap-1 border-b border-zinc-200/70 px-6 py-2 dark:border-zinc-800">
          {(['general', 'appearance'] as const).map((tab) => <button key={tab} onClick={() => setSection(tab)} className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition ${section === tab ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900'}`}>{tab}</button>)}
        </nav>

        {section === 'general' ? (
          <div className="flex-1 space-y-6 overflow-y-auto p-6 animate-linear-enter">
            <section><h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500">Tasks view</h3><div className="grid grid-cols-3 gap-2">
              {views.map((view) => <button key={view.id} onClick={() => onSelectTasksViewMode(view.id)} className={`flex flex-col items-center gap-2 rounded-2xl border p-3 text-xs font-semibold transition ${tasksViewMode === view.id ? 'border-black bg-zinc-100 text-black dark:border-white dark:bg-zinc-900 dark:text-white' : 'border-zinc-200 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900'}`}>{view.icon}{view.label}</button>)}
            </div></section>
            <section className="border-t border-zinc-200/70 pt-5 dark:border-zinc-800">
              <button onClick={onOpenFeedback} className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 text-left transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:bg-zinc-900">
                <span className="block text-sm font-semibold text-zinc-900 dark:text-white">Feedback</span>
                <span className="mt-1 block text-xs text-zinc-500">View or send workspace feedback</span>
              </button>
              <div className="mt-4 flex items-center justify-center gap-2 text-center text-[10px] text-zinc-400 font-mono">
                <span>Daybit v0.2</span>
                <span className="text-zinc-300 dark:text-zinc-600">•</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-semibold text-[9px]">Stable Release</span>
              </div>
            </section>
          </div>
        ) : (
          <div className="flex-1 space-y-6 overflow-y-auto p-6 animate-linear-enter">
            <section><h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500">Appearance</h3><div className="grid grid-cols-2 gap-3">
              <button onClick={() => { if (darkMode) onToggleDarkMode(); }} className={`flex items-center gap-2 rounded-2xl border p-3 text-xs font-semibold ${!darkMode ? 'border-black bg-zinc-100 text-black' : 'border-zinc-200 text-zinc-400 dark:border-zinc-800'}`}><Sun className="h-4 w-4" /> Light mode</button>
              <button onClick={() => { if (!darkMode) onToggleDarkMode(); }} className={`flex items-center gap-2 rounded-2xl border p-3 text-xs font-semibold ${darkMode ? 'border-white bg-zinc-900 text-white' : 'border-zinc-200 text-zinc-400 dark:border-zinc-800'}`}><Moon className="h-4 w-4" /> Dark mode</button>
            </div></section>
            <section><h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500"><ImageIcon className="h-3.5 w-3.5" /> {darkMode ? 'Dark' : 'White'} mode background</h3><div className="grid grid-cols-3 gap-2.5">
              {wallpapers.map((wallpaper) => <button key={wallpaper.id} onClick={() => selectWallpaper(wallpaper.id)} className={`rounded-2xl border p-2 transition ${selectedWallpaper === wallpaper.id ? 'border-black ring-1 ring-black dark:border-white dark:ring-white' : 'border-zinc-200 dark:border-zinc-800'}`}><span className={`mb-1.5 block h-12 rounded-xl ${wallpaper.style}`} /><span className="block truncate text-center text-[10px] font-medium text-zinc-600 dark:text-zinc-300">{wallpaper.name}</span></button>)}
            </div></section>
          </div>
        )}
      </section>
    </div>
  );
};
