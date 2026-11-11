import React, { useState } from 'react';
import { 
  CheckSquare, 
  Calendar as CalendarIcon, 
  BarChart2, 
  Search, 
  SlidersHorizontal,
  Calculator,
  Timer,
  MessageSquare,
  Check,
} from 'lucide-react';
import type { Place } from '../types';
import type { Task } from '../types';

export type MainTab = 'tasks' | 'calendar' | 'dashboard' | 'profile' | 'settings';

interface TabBarProps {
  activeTab: MainTab;
  onChangeTab: (tab: MainTab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedPlace: Place | 'All';
  onPlaceChange: (place: Place | 'All') => void;
  onOpenCalculator: () => void;
  onOpenTimer: () => void;
  onOpenWhatsApp: () => void;
  searchResults: Task[];
  onSelectSearchResult: (task: Task) => void;
  whatsAppEnabled?: boolean;
}

export const TabBar: React.FC<TabBarProps> = ({
  activeTab,
  onChangeTab,
  searchQuery,
  onSearchChange,
  selectedPlace,
  onPlaceChange,
  onOpenCalculator,
  onOpenTimer,
  onOpenWhatsApp,
  searchResults,
  onSelectSearchResult,
  whatsAppEnabled = false,
}) => {
  const [filterOpen, setFilterOpen] = useState(false);
  const places: (Place | 'All')[] = ['All', 'College', 'Work', 'Personal'];

  return (
    <div className="w-full py-2.5 px-4 transition-colors duration-200">
      {/* 
        Single merged capsule in the center of all screens on desktop, 
        and fixed at the bottom on mobile view as requested!
      */}
      <div className="
        md:mx-auto md:max-w-fit
        max-md:fixed max-md:bottom-4 max-md:left-1/2 max-md:-translate-x-1/2 max-md:z-40 max-md:w-[96%] max-md:max-w-md
      ">
        <div className="flex items-center justify-between sm:justify-center gap-1.5 p-1.5 rounded-full backdrop-blur-2xl bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-200/90 dark:border-zinc-800 shadow-xl overflow-x-auto no-scrollbar">
          {/* Main Navigation Group: Tasks, Calendar, Dashboard */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onChangeTab('tasks')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ease-linear ${
                activeTab === 'tasks'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Tasks</span>
            </button>

            <button
              onClick={() => onChangeTab('calendar')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ease-linear ${
                activeTab === 'calendar'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>

            <button
              onClick={() => onChangeTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ease-linear ${
                activeTab === 'dashboard'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

          </div>

          <div className="w-[1px] h-5 bg-zinc-200 dark:bg-zinc-800 mx-1 hidden sm:block" />

          {/* Quick Tools Group: Calc, Timer, WhatsApp */}
          <div className="flex items-center gap-1">
            <button
              onClick={onOpenCalculator}
              title="Calculator"
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-full text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white text-xs font-medium flex items-center gap-1 transition-all"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span className="hidden lg:inline text-[11px]">Calc</span>
            </button>

            <button
              onClick={onOpenTimer}
              title="Timer"
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-full text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white text-xs font-medium flex items-center gap-1 transition-all"
            >
              <Timer className="w-3.5 h-3.5" />
              <span className="hidden lg:inline text-[11px]">Timer</span>
            </button>

            {whatsAppEnabled && (
              <button
                onClick={onOpenWhatsApp}
                title="WhatsApp Bot"
                className="p-1.5 sm:px-2.5 sm:py-1 rounded-full text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white text-xs font-medium flex items-center gap-1 transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                <span className="hidden lg:inline text-[11px]">WhatsApp</span>
              </button>
            )}
          </div>

          <div className="w-[1px] h-5 bg-zinc-200 dark:bg-zinc-800 mx-1 hidden sm:block" />

          {/* Search Input Capsule */}
          <div className="relative flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/70 dark:bg-black/60 border border-zinc-200/70 dark:border-zinc-800 text-xs">
            <Search className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search tasks..."
              className="bg-transparent text-xs w-16 sm:w-24 focus:w-36 transition-all outline-none text-black dark:text-white placeholder:text-zinc-400"
            />
            {searchQuery.trim().length > 0 && searchResults.length > 0 && (
              <div className="absolute left-0 top-full mt-2.5 z-50 w-72 max-w-[85vw] rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white/95 dark:bg-black/95 p-2 shadow-2xl backdrop-blur-2xl animate-linear-enter">
                <div className="px-2.5 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800/80 mb-1">
                  Matching Tasks ({searchResults.length})
                </div>
                <div className="max-h-56 overflow-y-auto no-scrollbar space-y-1">
                  {searchResults.slice(0, 6).map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => onSelectSearchResult(task)}
                      className="block w-full rounded-xl px-2.5 py-1.5 text-left hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-xs font-bold text-black dark:text-white">
                          {task.name}
                        </span>
                        <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                          {task.place}
                        </span>
                      </div>
                      <span className="block truncate text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {task.description || 'No description'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {searchQuery.trim().length > 0 && searchResults.length === 0 && (
              <div className="absolute left-0 top-full mt-2.5 z-50 w-56 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white/95 dark:bg-black/95 px-3 py-2 text-xs text-zinc-500 shadow-2xl backdrop-blur-2xl animate-linear-enter">
                No matching tasks
              </div>
            )}
          </div>

          {/* Place Filter Popover Capsule - Shows OUTSIDE directly UNDER the capsule */}
          <div className="relative">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedPlace !== 'All'
                  ? 'bg-black text-white dark:bg-white dark:text-black font-semibold'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800'
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
                <div className="absolute right-0 top-full mt-2.5 w-48 backdrop-blur-2xl bg-white/95 dark:bg-black/95 rounded-2xl shadow-2xl border border-zinc-200/90 dark:border-zinc-800 py-2 z-50 animate-linear-enter">
                  <div className="px-3.5 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800/80 mb-1">
                    Filter by Place
                  </div>
                  {places.map((place) => (
                    <button
                      key={place}
                      onClick={() => {
                        onPlaceChange(place);
                        setFilterOpen(false);
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs flex items-center justify-between text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                    >
                      <span className="font-medium">{place}</span>
                      {selectedPlace === place && (
                        <Check className="w-3.5 h-3.5 text-black dark:text-white stroke-[2.5]" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
