import React, { useState } from 'react';
import { 
  Sun, 
  Moon, 
  LogOut, 
  LogIn,
  Plus,
  User as UserIcon,
  Settings as SettingsIcon,
  ChevronDown,
  Search, 
  SlidersHorizontal, 
  Check
} from 'lucide-react';
import type { User } from '../types';
import type { Place, Task } from '../types';
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
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  selectedPlace?: Place | 'All';
  onPlaceChange?: (place: Place | 'All') => void;
  searchResults?: Task[];
  onSelectSearchResult?: (task: Task) => void;
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
  wsConnected: _wsConnected,
  searchQuery = '',
  onSearchChange = () => {},
  selectedPlace = 'All',
  onPlaceChange = () => {},
  searchResults = [],
  onSelectSearchResult = () => {},
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const places: (Place | 'All')[] = ['All', 'College', 'Work', 'Personal'];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/80 dark:bg-black/80 border-b border-zinc-200/60 dark:border-zinc-800/60 transition-colors duration-200">
      <div className="max-w-[1600px] mx-auto px-2.5 sm:px-6 py-2 sm:py-3 flex items-center justify-between gap-1.5 sm:gap-3">
        {/* 1. Logo */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <img src={daybitLogo} alt="Daybit" className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black object-contain shadow-xs" />
          <h1 className="hidden md:inline-block text-base sm:text-lg font-bold tracking-tight text-black dark:text-white leading-tight font-sans">
            Daybit
          </h1>
        </div>

        {/* 
          Action icons group in exact requested sequence:
          Search bar -> Filter icon -> Theme switcher icon -> Account icon -> Add new tasks icon -> Logout icon
        */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* 2. Search Bar */}
          <div className="relative flex items-center gap-1 sm:gap-1.5 rounded-full border border-zinc-200/90 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-900/80 px-2 py-1 text-xs">
            <Search className="w-3 h-3 text-zinc-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search..."
              className="w-14 sm:w-28 focus:w-24 sm:focus:w-36 transition-all bg-transparent text-[11px] sm:text-xs outline-none text-black dark:text-white placeholder:text-zinc-400"
            />
            {searchQuery.trim().length > 0 && searchResults.length > 0 && (
              <div className="fixed left-3 right-3 sm:left-auto sm:right-0 sm:absolute top-12 sm:top-full mt-2 z-50 sm:w-64 max-w-[90vw] rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white/95 dark:bg-black/95 p-1.5 shadow-2xl backdrop-blur-2xl animate-linear-enter">
                <div className="px-2.5 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800/80 mb-1">
                  Matching Tasks ({searchResults.length})
                </div>
                <div className="max-h-52 overflow-y-auto no-scrollbar space-y-0.5">
                  {searchResults.slice(0, 6).map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => onSelectSearchResult(task)}
                      className="block w-full rounded-xl px-2.5 py-1.5 text-left hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="truncate text-xs font-bold text-black dark:text-white">
                          {task.name}
                        </span>
                        <span className="shrink-0 text-[9px] font-semibold px-1.5 py-0.2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                          {task.place}
                        </span>
                      </div>
                      {task.description && (
                        <span className="block truncate text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {task.description}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {searchQuery.trim().length > 0 && searchResults.length === 0 && (
              <div className="fixed left-3 right-3 sm:left-auto sm:right-0 sm:absolute top-12 sm:top-full mt-2 z-50 sm:w-48 rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-white/95 dark:bg-black/95 px-3 py-1.5 text-xs text-zinc-500 shadow-xl backdrop-blur-2xl animate-linear-enter">
                No matching tasks
              </div>
            )}
          </div>

          {/* 3. Filter Icon */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setFilterOpen(!filterOpen)}
              title="Filter tasks by place"
              className={`relative flex items-center justify-center p-1.5 sm:px-2.5 sm:py-1 rounded-full border text-xs font-medium transition-all ${
                selectedPlace !== 'All'
                  ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-semibold shadow-xs'
                  : 'border-zinc-200/90 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-900/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/80 dark:hover:bg-zinc-800'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline ml-1">{selectedPlace === 'All' ? 'Filter' : selectedPlace}</span>
              {selectedPlace !== 'All' && (
                <span className="sm:hidden absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-white dark:ring-black" />
              )}
            </button>

            {filterOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setFilterOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 z-50 w-36 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white/95 dark:bg-black/95 p-1 shadow-2xl backdrop-blur-2xl animate-linear-enter">
                  <div className="px-2.5 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800/80 mb-0.5">
                    Filter by Place
                  </div>
                  {places.map((place) => (
                    <button
                      key={place}
                      type="button"
                      onClick={() => {
                        onPlaceChange(place);
                        setFilterOpen(false);
                      }}
                      className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                    >
                      <span>{place}</span>
                      {selectedPlace === place && <Check className="h-3 w-3 stroke-[2.5]" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* 4. Theme Switcher Icon */}
          <button
            onClick={onToggleDarkMode}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-all active:scale-95 duration-150 ease-linear"
          >
            {darkMode ? <Sun className="w-3.5 h-3.5 shrink-0" /> : <Moon className="w-3.5 h-3.5 shrink-0" />}
          </button>

          {/* 5. Account Icon */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center p-0.5 rounded-full hover:ring-2 hover:ring-zinc-300 dark:hover:ring-zinc-700 transition-all"
                title="Account: Profile & Settings"
              >
                <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-white border border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-[10px] sm:text-[11px] font-bold">
                  {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                </span>
              </button>

              {menuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setMenuOpen(false)} 
                  />
                  <div className="absolute right-0 top-full mt-2 w-48 backdrop-blur-2xl bg-white/95 dark:bg-black/95 rounded-2xl shadow-xl border border-zinc-200/80 dark:border-zinc-800 py-1.5 z-50 animate-linear-enter">
                    <div className="px-3.5 py-2 border-b border-zinc-100 dark:border-zinc-800/80">
                      <span className="block text-xs font-bold text-black dark:text-white truncate">
                        {user.email ? user.email.split('@')[0] : 'User'}
                      </span>
                      <span className="block text-[10px] text-zinc-400 truncate">
                        {user.email || 'user@daybit.app'}
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
          ) : (
            <button
              onClick={onOpenAuth}
              title="Sign In"
              className="p-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors"
            >
              <UserIcon className="w-3.5 h-3.5 shrink-0" />
            </button>
          )}

          {/* 6. Add New Tasks Icon */}
          <button
            onClick={onOpenNewTask}
            aria-label="Create new task"
            title="Create New Task"
            className="flex items-center gap-1 p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-95 text-white dark:text-black text-xs font-semibold shadow-xs transition-all duration-150 ease-linear"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
            <span className="hidden sm:inline">New Task</span>
          </button>

          {/* 7. Logout Icon */}
          {user ? (
            <button
              onClick={onLogout}
              title="Log Out"
              className="p-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-500 hover:text-rose-500 transition-colors duration-150"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              title="Sign In"
              className="p-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white transition-colors duration-150"
            >
              <LogIn className="w-3.5 h-3.5 shrink-0" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
