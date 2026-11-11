import React from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Bell, 
  Share2, 
  Trash2, 
  Edit3,
  Calendar
} from 'lucide-react';
import { Task, TaskStatus } from '../../types';

interface ListViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onInviteTask: (task: Task) => void;
  onTriggerReminder: (task: Task) => void;
  onToggleComplete: (task: Task) => void;
}

export const ListView: React.FC<ListViewProps> = ({
  tasks,
  onEditTask,
  onDeleteTask,
  onInviteTask,
  onTriggerReminder,
  onToggleComplete,
}) => {
  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'To Do':
        return 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300';
      case 'In Progress':
        return 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300';
      case 'Review':
        return 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300';
      case 'Complete':
        return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300';
    }
  };

  const getPlaceBadge = (place: string) => {
    switch (place) {
      case 'College': return 'bg-blue-50 text-blue-600';
      case 'Work': return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200';
      case 'Personal': return 'bg-emerald-50 text-emerald-600';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-6">
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/60 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4 w-12 text-center">Status</th>
              <th className="py-3 px-4">Task Name & Details</th>
              <th className="py-3 px-4">Place</th>
              <th className="py-3 px-4">Progress</th>
              <th className="py-3 px-4">Due Date</th>
              <th className="py-3 px-4">Ringtone</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-sm">
            {tasks.map((task) => {
              const isDone = task.status === 'Complete';
              const totalSegments = task.progress_total || 4;
              const doneSegments = task.progress_done || 0;

              return (
                <tr 
                  key={task.id} 
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-700/40 transition-colors"
                >
                  {/* Done toggle checkbox */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => onToggleComplete(task)}
                      className="text-slate-400 hover:text-emerald-600 transition-colors"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                  </td>

                  {/* Name & tags */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold text-slate-800 dark:text-slate-100 ${isDone ? 'line-through text-slate-400' : ''}`}>
                        {task.name}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusBadge(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{task.description}</p>
                    )}
                  </td>

                  {/* Place */}
                  <td className="py-3.5 px-4">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${getPlaceBadge(task.place)}`}>
                      {task.place}
                    </span>
                  </td>

                  {/* Segmented Progress */}
                  <td className="py-3.5 px-4 w-40">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span>{doneSegments}/{totalSegments}</span>
                      <span>{Math.round((doneSegments / totalSegments) * 100)}%</span>
                    </div>
                    <div className="flex items-center gap-1 w-full">
                      {Array.from({ length: totalSegments }).map((_, idx) => (
                        <div
                          key={idx}
                          className={`h-1.5 flex-1 rounded-full ${
                            idx < doneSegments ? 'bg-zinc-800 dark:bg-zinc-200' : 'bg-slate-200 dark:bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </td>

                  {/* Due Date */}
                  <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
                    {task.due_at ? (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(task.due_at).toLocaleDateString()}
                      </span>
                    ) : (
                      'No date'
                    )}
                  </td>

                  {/* Ringtone */}
                  <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Bell className="w-3.5 h-3.5 text-amber-500" />
                      {task.ringtone || 'chime'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onTriggerReminder(task)}
                        title="Test Reminder"
                        className="p-1.5 text-slate-400 hover:text-amber-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <Bell className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onInviteTask(task)}
                        title="Share / Invite"
                        className="p-1.5 text-slate-400 hover:text-blue-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEditTask(task)}
                        title="Edit"
                        className="p-1.5 text-slate-400 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        title="Delete"
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {tasks.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-sm">
            No tasks found.
          </div>
        )}
      </div>
    </div>
  );
};

