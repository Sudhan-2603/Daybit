import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus
} from 'lucide-react';
import type { Task } from '../../types';

interface CalendarViewProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onAddTask: (dateStr?: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  onSelectTask,
  onAddTask,
}) => {
  // Default to November (Month index 10 in JavaScript is November)
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    // Default to November 2026
    return new Date(2026, 10, 10);
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const today = new Date();
  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const tasksByDate = tasks.reduce<Record<string, Task[]>>((acc, task) => {
    if (task.due_at) {
      const d = new Date(task.due_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(task);
    }
    return acc;
  }, {});

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case 'To Do': return 'bg-rose-500';
      case 'In Progress': return 'bg-blue-600';
      case 'Review': return 'bg-amber-500';
      case 'Complete': return 'bg-emerald-500';
      default: return 'bg-black dark:bg-white';
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 animate-linear-enter">
      {/* Calendar Header with Light Grey Capsule Controls */}
      <div className="flex items-center justify-between mb-6 backdrop-blur-xl bg-white/70 dark:bg-zinc-950/50 p-4 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-black dark:text-white">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-black dark:text-white">
              {monthNames[month]} {year}
            </h2>
            <p className="text-xs text-zinc-400">Scheduled task timeline</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
          <button
            onClick={() => setCurrentDate(new Date(2026, 10, 10))}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors duration-150 ${
              month === 10 
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs' 
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/80 dark:hover:bg-zinc-800'
            }`}
          >
            November
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 text-xs font-semibold rounded-full hover:bg-zinc-200/80 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors duration-150 ease-linear"
          >
            Today
          </button>
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-full hover:bg-zinc-200/80 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors duration-150 ease-linear"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-full hover:bg-zinc-200/80 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors duration-150 ease-linear"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Frosted Glass Calendar Grid */}
      <div className="backdrop-blur-xl bg-white/70 dark:bg-zinc-950/50 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs overflow-x-auto">
        <div className="min-w-[760px] overflow-hidden rounded-3xl">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/40">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="py-3 text-center text-xs font-bold text-zinc-400 uppercase tracking-wider"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Cells */}
        <div className="grid grid-cols-7 auto-rows-[115px] divide-x divide-y divide-zinc-200/50 dark:divide-zinc-800/50">
          {/* Previous Month */}
          {Array.from({ length: firstDay }).map((_, idx) => {
            const dayNum = daysInPrevMonth - firstDay + idx + 1;
            return (
              <div
                key={`prev-${idx}`}
                className="p-2 bg-zinc-50/20 dark:bg-zinc-950/20 text-zinc-300 dark:text-zinc-700 text-xs font-medium"
              >
                {dayNum}
              </div>
            );
          })}

          {/* Current Month */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const dayTasks = tasksByDate[dateKey] || [];
            const isCurrent = isToday(dayNum);

            return (
              <div
                key={`current-${dayNum}`}
                className={`p-2 transition-colors duration-150 ease-linear group relative flex flex-col justify-between ${
                  isCurrent ? 'bg-zinc-100/50 dark:bg-zinc-900/40' : 'hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      isCurrent
                        ? 'bg-black text-white dark:bg-white dark:text-black'
                        : 'text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {dayNum}
                  </span>
                  <button
                    onClick={() => onAddTask(dateKey)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-black dark:hover:text-white rounded transition-opacity duration-150"
                    title="Add task"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Day Tasks List */}
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-1">
                  {dayTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => onSelectTask(t)}
                      className="cursor-pointer px-2 py-1 rounded-xl text-[11px] font-medium bg-white/90 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs hover:border-black dark:hover:border-white flex items-center gap-1.5 truncate transition-all duration-150 ease-linear"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getStatusDotColor(t.status)}`} />
                      <span className="truncate text-black dark:text-white font-semibold">{t.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        </div>
      </div>
    </div>
  );
};
