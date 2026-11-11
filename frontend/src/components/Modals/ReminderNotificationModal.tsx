import React, { useEffect } from 'react';
import { Bell, Check, Clock, X, Volume2 } from 'lucide-react';
import type { Task, RingtoneType } from '../../types';
import { audioService } from '../../services/audio';

interface ReminderNotificationModalProps {
  task: Task | null;
  isOpen: boolean;
  onAccept: (taskId: string) => void;
  onRemind: (taskId: string) => void;
  onReject: (taskId: string) => void;
  onClose: () => void;
}

export const ReminderNotificationModal: React.FC<ReminderNotificationModalProps> = ({
  task,
  isOpen,
  onAccept,
  onRemind,
  onReject,
  onClose,
}) => {
  useEffect(() => {
    let intervalId: any;
    if (isOpen && task) {
      const tone = (task.ringtone as RingtoneType) || 'chime';
      audioService.playRingtone(tone);

      intervalId = setInterval(() => {
        audioService.playRingtone(tone);
      }, 4000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isOpen, task]);

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-linear-enter">
      <div 
        className="w-full max-w-md backdrop-blur-2xl bg-white/95 dark:bg-black/95 rounded-3xl shadow-2xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (Clean High-Contrast Monochrome) */}
        <div className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200/60 dark:border-zinc-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black animate-pulse">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-black dark:text-white">Task Reminder</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {task.ringtone || 'chime'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500">Scheduled reminder fired</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                {task.place}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                Progress: {task.progress_done}/{task.progress_total}
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-bold text-black dark:text-white leading-snug">
              {task.name}
            </h4>
            {task.description && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-3">
                {task.description}
              </p>
            )}
          </div>

          <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl flex items-center justify-between text-xs text-zinc-500 mb-6 border border-zinc-200/60 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Due: {task.due_at ? new Date(task.due_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}</span>
            </div>
            <button
              onClick={() => audioService.playRingtone((task.ringtone as RingtoneType) || 'chime')}
              className="flex items-center gap-1 text-[11px] font-semibold text-black dark:text-white hover:underline"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Replay</span>
            </button>
          </div>

          {/* Three Mandatory Actions */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onAccept(task.id)}
              className="flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs active:scale-95 transition-all duration-150"
            >
              <Check className="w-4 h-4" />
              <span>Accept</span>
            </button>
            <button
              onClick={() => onRemind(task.id)}
              className="flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white dark:bg-zinc-200 dark:hover:bg-zinc-300 dark:text-black font-bold text-xs active:scale-95 transition-all duration-150"
            >
              <Clock className="w-4 h-4" />
              <span>Remind 15m</span>
            </button>
            <button
              onClick={() => onReject(task.id)}
              className="flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 font-bold text-xs active:scale-95 transition-all duration-150"
            >
              <X className="w-4 h-4" />
              <span>Reject</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
