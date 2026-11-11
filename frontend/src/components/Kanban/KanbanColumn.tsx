import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import type { Task, TaskStatus } from '../../types';
import { TaskCard } from './TaskCard';

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  onAddTask: (status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onInviteTask: (task: Task) => void;
  onTriggerReminder: (task: Task) => void;
  onToggleComplete?: (task: Task) => void;
  onRequestNotification?: (task: Task) => void;
}

const getColumnConfig = (status: TaskStatus) => {
  switch (status) {
    case 'To Do':
      return {
        dotColor: 'bg-rose-500',
        badgeBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
      };
    case 'In Progress':
      return {
        dotColor: 'bg-blue-500',
        badgeBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
      };
    case 'Review':
      return {
        dotColor: 'bg-amber-500',
        badgeBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
      };
    case 'Complete':
      return {
        dotColor: 'bg-emerald-500',
        badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
      };
    default:
      return {
        dotColor: 'bg-zinc-500',
        badgeBg: 'bg-zinc-100 text-zinc-700',
      };
  }
};

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  id,
  title,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onInviteTask,
  onTriggerReminder,
  onToggleComplete,
  onRequestNotification,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${id}`,
    data: {
      type: 'Column',
      status: id,
    },
  });

  const config = getColumnConfig(id);

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-w-0 w-full backdrop-blur-xl bg-zinc-100/60 dark:bg-white/[0.04] rounded-3xl p-3 border transition-all duration-200 ease-linear ${
        isOver
          ? 'border-black dark:border-white ring-2 ring-black/10 dark:ring-white/20 bg-zinc-100/80 dark:bg-zinc-900/60'
          : 'border-zinc-200/60 dark:border-zinc-800/60'
      }`}
    >
      {/* Frosted Column Capsule Header */}
      <div className="flex items-center justify-between px-2.5 py-1.5 mb-2.5">
        <div className="flex items-center gap-2">
          {/* Status Dot */}
          <span className={`w-2.5 h-2.5 rounded-full ${config.dotColor}`} />
          {/* Title */}
          <h2 className="text-xs sm:text-sm font-bold text-black dark:text-white tracking-tight">
            {title}
          </h2>
          {/* Count Badge Capsule */}
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config.badgeBg}`}>
            {tasks.length}
          </span>
        </div>

        {/* Plus Button Capsule */}
        <button
          type="button"
          onClick={() => onAddTask(id)}
          title={`Add task to ${title}`}
          className="w-6 h-6 rounded-full flex items-center justify-center text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200/80 dark:hover:bg-zinc-800 transition-all duration-150 ease-linear"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
        </button>
      </div>

      {/* Task List / Droppable Container */}
      <div className="flex-1 flex flex-col gap-3 min-h-[350px]">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onInvite={onInviteTask}
              onTriggerReminder={onTriggerReminder}
              onToggleComplete={onToggleComplete}
              onRequestNotification={onRequestNotification}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 text-center">
            <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">No tasks</p>
            <button
              onClick={() => onAddTask(id)}
              className="mt-2 text-xs font-semibold text-black dark:text-white hover:underline transition-colors"
            >
              + Add task
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
