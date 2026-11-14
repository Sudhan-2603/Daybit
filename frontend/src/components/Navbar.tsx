import React, { useState } from 'react';
import { 
  Sun, 
  Moon, 
  LogOut, 
  Plus,
  User as UserIcon,
  Settings as SettingsIcon,
  ChevronDown
  ,Search, SlidersHorizontal, Check
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
  wsConnected,
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
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Small Sized Search Bar (Placed before theme button) */}
          <div className="relative flex items-center gap-1.5 rounded-full border border-zinc-200/90 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-900/80 px-2.5 py-1 text-xs">
            <Search className="w-3 h-3 text-zinc-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search..."
              className="w-20 sm:w-28 focus:w-40 transition-all bg-transparent text-xs outline-none text-black dark:text-white placeholder:text-zinc-400"
            />
            {searchQuery.trim().length > 0 && searchResults.length > 0 && (
              <div className="absolute right-0 sm:left-0 top-full mt-2 z-50 w-64 max-w-[85vw] rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white/95 dark:bg-black/95 p-1.5 shadow-2xl backdrop-blur-2xl animate-linear-enter">
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
              <div className="absolute right-0 sm:left-0 top-full mt-2 z-50 w-48 rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-white/95 dark:bg-black/95 px-3 py-1.5 text-xs text-zinc-500 shadow-xl backdrop-blur-2xl animate-linear-enter">
                No matching tasks
              </div>
            )}
          </div>

          {/* Small Sized Place Filter (Placed before theme button) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setFilterOpen(!filterOpen)}
              className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
                selectedPlace !== 'All'
                  ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-semibold shadow-xs'
                  : 'border-zinc-200/90 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-900/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/80 dark:hover:bg-zinc-800'
              }`}
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>{selectedPlace === 'All' ? 'Filter' : selectedPlace}</span>
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
              {user.id !== 'offline_user' && (
                <button
                  onClick={onLogout}
                  title="Log Out"
                  className="p-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-500 hover:text-rose-500 transition-colors duration-150"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
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
