import React from 'react';
import { 
  CheckSquare, 
  Calendar as CalendarIcon, 
  BarChart2, 
  Calculator,
  Timer,
  MessageSquare
} from 'lucide-react';

export type MainTab = 'tasks' | 'calendar' | 'dashboard' | 'profile' | 'settings';

interface TabBarProps {
  activeTab: MainTab;
  onChangeTab: (tab: MainTab) => void;
  onOpenCalculator: () => void;
  onOpenTimer: () => void;
  onOpenWhatsApp: () => void;
  whatsAppEnabled?: boolean;
}

export const TabBar: React.FC<TabBarProps> = ({
  activeTab,
  onChangeTab,
  onOpenCalculator,
  onOpenTimer,
  onOpenWhatsApp,
  whatsAppEnabled = false,
}) => {
  return (
    <div className="w-full py-2.5 px-4 transition-colors duration-200">
      {/* 
        Single merged sleek capsule in the center of all screens on desktop, 
        and fixed at the bottom on mobile view!
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
        </div>
      </div>
    </div>
  );
};
