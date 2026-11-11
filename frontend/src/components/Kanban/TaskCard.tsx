import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  MoreHorizontal, 
  Folder, 
  MessageSquare, 
  Bell, 
  Share2, 
  Trash2, 
  Edit3,
  Check
} from 'lucide-react';
import type { Task, TaskStatus } from '../../types';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onInvite: (task: Task) => void;
  onTriggerReminder: (task: Task) => void;
  onToggleComplete?: (task: Task) => void;
  onRequestNotification?: (task: Task) => void;
}

// Clean Monochrome & Neutral tag styles (No violet)
const getTagColorClass = (tag: string) => {
  const lower = tag.toLowerCase();
  if (lower.includes('design') || lower.includes('ux') || lower.includes('ui')) {
    return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700';
  }
  if (lower.includes('front') || lower.includes('auth')) {
    return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-100 dark:border-blue-900/40';
  }
  if (lower.includes('qa') || lower.includes('test') || lower.includes('media') || lower.includes('perf')) {
    return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-100 dark:border-amber-900/40';
  }
  if (lower.includes('back') || lower.includes('data') || lower.includes('api')) {
    return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/40';
  }
  return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700';
};

// Segment progress color per status (clean high-contrast without violet)
const getProgressColor = (status: TaskStatus) => {
  switch (status) {
    case 'To Do':
      return 'bg-rose-500';
    case 'In Progress':
      return 'bg-blue-600 dark:bg-blue-500';
    case 'Review':
      return 'bg-amber-500';
    case 'Complete':
      return 'bg-emerald-500';
    default:
      return 'bg-black dark:bg-white';
  }
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onInvite,
  onTriggerReminder,
  onToggleComplete,
  onRequestNotification,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition ? `${transition}, opacity 0.15s linear` : 'opacity 0.15s linear',
  };

  const totalSegments = Math.max(1, task.progress_total || 4);
  const doneSegments = Math.min(totalSegments, Math.max(0, task.progress_done || 0));

  const tags: string[] = Array.isArray(task.tags)
    ? task.tags
    : typeof task.tags === 'string'
    ? (() => {
        try {
          const parsed = JSON.parse(task.tags);
          return Array.isArray(parsed) ? parsed : [task.tags];
        } catch {
          return task.tags ? [task.tags] : [];
        }
      })()
    : [];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onEdit(task)}
      className={`relative group backdrop-blur-xl bg-white/80 dark:bg-zinc-950/70 rounded-2xl p-4 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs hover:shadow-md transition-all duration-200 ease-linear cursor-pointer active:cursor-grabbing select-none animate-card-enter ${
        isDragging ? 'opacity-30 ring-2 ring-black dark:ring-white ring-offset-2' : ''
      }`}
    >
      {/* Top Header: Tags + Three Dots Menu */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex flex-wrap items-center gap-1.5 flex-1">
          {tags.length > 0 ? (
            tags.map((tag, idx) => (
              <span
                key={idx}
                className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${getTagColorClass(tag)}`}
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
              {task.place}
            </span>
          )}
        </div>

        {/* Notification and options */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            aria-label={`Enable notifications for ${task.name}`}
            title="Enable & test task notifications"
            onClick={async (event) => {
              event.stopPropagation();
              if (onRequestNotification) {
                onRequestNotification(task);
              } else if ('Notification' in window) {
                const res = await Notification.requestPermission();
                if (res === 'granted') {
                  new Notification(`Daybit Alert: ${task.name}`, {
                    body: `${task.description || 'Task notification active'} • Place: ${task.place}`,
                    icon: '/favicon.svg'
                  });
                } else {
                  alert('Notification access was not granted by your browser.');
                }
              }
            }}
            onPointerDown={(event) => event.stopPropagation()}
            className="rounded-full p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-black dark:hover:bg-zinc-800 dark:hover:text-white"
          >
            <Bell className="h-3.5 w-3.5" />
          </button>
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="p-1 rounded-full text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-150"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {menuOpen && (
            <>
              <div 
                className="fixed inset-0 z-20" 
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                }} 
              />
              <div className="absolute right-0 mt-1 w-44 bg-white/95 dark:bg-black/95 backdrop-blur-xl rounded-2xl shadow-xl border border-zinc-200/80 dark:border-zinc-800 py-1.5 z-30 animate-linear-enter">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onEdit(task);
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs flex items-center gap-2 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Edit Task</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onInvite(task);
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs flex items-center gap-2 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Share / Invite</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onTriggerReminder(task);
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs flex items-center gap-2 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                >
                  <Bell className="w-3.5 h-3.5 text-amber-500" />
                  <span>Test Ringtone Alert</span>
                </button>
                <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onDelete(task.id);
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs flex items-center gap-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Task</span>
                </button>
              </div>
            </>
          )}
        </div>
        </div>
      </div>

      {/* Task Name / Title */}
      <div className="flex items-start gap-2">
        <button
          type="button"
          aria-label={`Mark ${task.name} ${task.status === 'Complete' ? 'incomplete' : 'complete'}`}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onToggleComplete?.(task);
          }}
          onPointerDown={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
          onTouchStart={(event) => event.stopPropagation()}
          className={`mt-0.5 h-4 w-4 shrink-0 rounded border flex items-center justify-center transition-all duration-75 cursor-pointer ${
            task.status === 'Complete'
              ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
              : 'border-zinc-300 dark:border-zinc-600 bg-transparent hover:border-black dark:hover:border-white'
          }`}
        >
          {task.status === 'Complete' && (
            <Check className="w-3 h-3 stroke-[3]" />
          )}
        </button>
        <h3 className="text-[13.5px] font-bold text-black dark:text-white leading-snug line-clamp-2">
          {task.name}
        </h3>
      </div>

      {/* Description */}
      <p className="text-[11.5px] text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1 min-h-[30px] leading-relaxed">
        {task.description || 'No description provided.'}
      </p>

      {/* Segmented Progress Bar */}
      <div className="mt-3 mb-2.5">
        <div className="flex items-center justify-between text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
          <span>Progress</span>
          <span className="font-semibold text-black dark:text-white">
            {task.progress_done}/{task.progress_total}
          </span>
        </div>
        <div className="flex items-center gap-1.5 w-full">
          {Array.from({ length: totalSegments }).map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full flex-1 transition-all duration-200 ease-linear ${
                idx < doneSegments
                  ? getProgressColor(task.status)
                  : 'bg-zinc-100 dark:bg-zinc-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom Footer: Place Badge (Removed flex items-center gap-2.5 text-zinc count as requested) */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300">
          {task.place}
        </span>
        <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
          Click for details
        </span>
      </div>
    </div>
  );
};
