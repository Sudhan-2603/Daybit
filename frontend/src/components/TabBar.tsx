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
        Single sleek capsule dock:
        Centered on desktop, floating bottom capsule on mobile
      */}
      <div className="
        md:mx-auto md:max-w-fit
        max-md:fixed max-md:bottom-4 max-md:left-1/2 max-md:-translate-x-1/2 max-md:z-40 max-md:max-w-fit
      ">
        <div className="flex items-center justify-center gap-1 p-1 sm:p-1.5 rounded-full backdrop-blur-2xl bg-zinc-100/95 dark:bg-zinc-900/95 border border-zinc-200/90 dark:border-zinc-800 shadow-xl">
          {/* Main Navigation Group: Tasks, Calendar, Dashboard */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onChangeTab('tasks')}
              title="Tasks"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ease-linear ${
                activeTab === 'tasks'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'p-2 sm:px-2.5 sm:py-1.5 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5 shrink-0" />
              {activeTab === 'tasks' && <span>Tasks</span>}
            </button>

            <button
              onClick={() => onChangeTab('calendar')}
              title="Calendar"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ease-linear ${
                activeTab === 'calendar'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'p-2 sm:px-2.5 sm:py-1.5 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
              {activeTab === 'calendar' && <span>Calendar</span>}
            </button>

            <button
              onClick={() => onChangeTab('dashboard')}
              title="Dashboard"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ease-linear ${
                activeTab === 'dashboard'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'p-2 sm:px-2.5 sm:py-1.5 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5 shrink-0" />
              {activeTab === 'dashboard' && <span>Dashboard</span>}
            </button>
          </div>

          {/* Quick Tools Group: Calc, Timer, WhatsApp with reduced gap */}
          <div className="flex items-center gap-1">
            <button
              onClick={onOpenCalculator}
              title="Calculator"
              className="p-2 rounded-full text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition-all"
            >
              <Calculator className="w-3.5 h-3.5 shrink-0" />
            </button>

            <button
              onClick={onOpenTimer}
              title="Timer"
              className="p-2 rounded-full text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition-all"
            >
              <Timer className="w-3.5 h-3.5 shrink-0" />
            </button>

            {whatsAppEnabled && (
              <button
                onClick={onOpenWhatsApp}
                title="WhatsApp Bot"
                className="p-2 rounded-full text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
