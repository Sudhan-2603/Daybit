import React from 'react';
import { Plus } from 'lucide-react';
import sleepImg from '../../assets/empty-sleep.png';

interface EmptyTasksViewProps {
  onAddTask: () => void;
}

export const EmptyTasksView: React.FC<EmptyTasksViewProps> = ({ onAddTask }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[500px] px-6 py-12 text-center animate-linear-enter">
      {/* Uploaded Sleep Illustration */}
      <div className="relative mb-6 group">
        <div className="w-52 h-36 flex items-center justify-center p-3 rounded-3xl backdrop-blur-xl bg-white/60 dark:bg-zinc-950/40 border border-zinc-200/80 dark:border-zinc-800 shadow-sm transition-transform duration-300 group-hover:scale-105">
          <img
            src={sleepImg}
            alt="Sleeping task manager"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Message specified by user: "Kindly add Tasks" */}
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-black dark:text-white mb-2">
        Kindly add Tasks
      </h2>
      <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-6 leading-relaxed">
        Start by adding a task. Your tasks will appear here once you create them.
      </p>

      {/* Add Task Capsule Button */}
      <button
        onClick={onAddTask}
        className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs sm:text-sm font-semibold shadow-md hover:opacity-90 active:scale-95 transition-all duration-150 ease-linear"
      >
        <Plus className="w-4 h-4 stroke-[2.5]" />
        <span>Create First Task</span>
      </button>
    </div>
  );
};
