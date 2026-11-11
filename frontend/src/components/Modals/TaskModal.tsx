import React, { useState, useEffect } from 'react';
import { X, Volume2 } from 'lucide-react';
import type { Task, Place, TaskStatus, CreateTaskDto, UpdateTaskDto, RingtoneType } from '../../types';
import { audioService } from '../../services/audio';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: CreateTaskDto | UpdateTaskDto, isEdit: boolean, taskId?: string) => void;
  taskToEdit?: Task | null;
  defaultStatus?: TaskStatus;
  defaultDate?: string;
}

const RINGTONES: { id: RingtoneType; label: string }[] = [
  { id: 'chime', label: 'Classic Chime' },
  { id: 'digital-bell', label: 'Digital Bell' },
  { id: 'marimba', label: 'Marimba Melody' },
  { id: 'pulse', label: 'Pulse Wave' },
  { id: 'gentle-gong', label: 'Gentle Gong' },
];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  taskToEdit,
  defaultStatus,
  defaultDate,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [place, setPlace] = useState<Place>('Work');
  const [status, setStatus] = useState<TaskStatus>('To Do');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('17:00');
  const [remindDate, setRemindDate] = useState('');
  const [remindTime, setRemindTime] = useState('09:00');
  const [ringtone, setRingtone] = useState<RingtoneType>('chime');
  const [progressDone, setProgressDone] = useState(0);
  const [progressTotal, setProgressTotal] = useState(4);
  const [tagsStr, setTagsStr] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setName(taskToEdit.name);
      setDescription(taskToEdit.description || '');
      setPlace(taskToEdit.place);
      setStatus(taskToEdit.status);
      setProgressDone(taskToEdit.progress_done);
      setProgressTotal(taskToEdit.progress_total || 4);
      setRingtone((taskToEdit.ringtone as RingtoneType) || 'chime');

      let currentTags = '';
      if (Array.isArray(taskToEdit.tags)) {
        currentTags = taskToEdit.tags.join(', ');
      } else if (typeof taskToEdit.tags === 'string') {
        try {
          const parsed = JSON.parse(taskToEdit.tags);
          currentTags = Array.isArray(parsed) ? parsed.join(', ') : taskToEdit.tags;
        } catch {
          currentTags = taskToEdit.tags;
        }
      }
      setTagsStr(currentTags);

      if (taskToEdit.due_at) {
        const d = new Date(taskToEdit.due_at);
        setDueDate(d.toISOString().split('T')[0]);
        setDueTime(d.toTimeString().substring(0, 5));
      } else {
        setDueDate('');
      }

      if (taskToEdit.remind_at) {
        const r = new Date(taskToEdit.remind_at);
        setRemindDate(r.toISOString().split('T')[0]);
        setRemindTime(r.toTimeString().substring(0, 5));
      } else {
        setRemindDate('');
      }
    } else {
      setName('');
      setDescription('');
      setPlace('Work');
      setStatus(defaultStatus || 'To Do');
      setDueDate(defaultDate || new Date().toISOString().split('T')[0]);
      setDueTime('18:00');
      setRemindDate('');
      setRemindTime('09:00');
      setRingtone('chime');
      setProgressDone(0);
      setProgressTotal(4);
      setTagsStr('');
    }
  }, [taskToEdit, defaultStatus, defaultDate, isOpen]);

  if (!isOpen) return null;

  const handlePreviewRingtone = (r: RingtoneType) => {
    audioService.playRingtone(r);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let due_at: string | undefined = undefined;
    if (dueDate) {
      due_at = new Date(`${dueDate}T${dueTime || '00:00'}:00`).toISOString();
    }

    let remind_at: string | undefined = undefined;
    if (remindDate) {
      remind_at = new Date(`${remindDate}T${remindTime || '00:00'}:00`).toISOString();
    }

    const tags = tagsStr
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      place,
      status,
      progress_done: Number(progressDone),
      progress_total: Number(progressTotal),
      due_at,
      remind_at,
      ringtone,
      tags: tags.length > 0 ? tags : undefined,
    };

    onSave(payload, !!taskToEdit, taskToEdit?.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-linear-enter">
      <div 
        className="w-full max-w-xl backdrop-blur-2xl bg-white/95 dark:bg-black/95 rounded-3xl shadow-2xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200/60 dark:border-zinc-800">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-black dark:text-white">
              {taskToEdit ? 'Edit Task' : 'Create New Task'}
            </h2>
            <p className="text-xs text-zinc-400">Time, place, progress, and alerts</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Task Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Design UI Layout Draft"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all duration-150"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deliverables, scope, or notes..."
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all duration-150"
            />
          </div>

          {/* Place & Status Dual Selector */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Place
              </label>
              <select
                value={place}
                onChange={(e) => setPlace(e.target.value as Place)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              >
                <option value="College">College</option>
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Complete">Complete</option>
              </select>
            </div>
          </div>

          {/* Segmented Progress */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              <span>Segmented Progress</span>
              <span className="font-bold text-black dark:text-white">
                {progressDone} / {progressTotal} segments ({Math.round((progressDone / Math.max(1, progressTotal)) * 100)}%)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Completed Segments</label>
                <input
                  type="number"
                  min="0"
                  max={progressTotal}
                  value={progressDone}
                  onChange={(e) => setProgressDone(Math.min(progressTotal, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-black dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Total Segments</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={progressTotal}
                  onChange={(e) => {
                    const total = Math.max(1, parseInt(e.target.value) || 1);
                    setProgressTotal(total);
                    if (progressDone > total) setProgressDone(total);
                  }}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-black dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5 mt-3">
              {Array.from({ length: progressTotal }).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-full flex-1 transition-all duration-200 ease-linear ${
                    idx < progressDone ? 'bg-black dark:bg-white' : 'bg-zinc-200 dark:bg-zinc-800'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Due Date & Due Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-black dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Due Time
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-black dark:text-white"
              />
            </div>
          </div>

          {/* Reminder Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Reminder Date (Optional)
              </label>
              <input
                type="date"
                value={remindDate}
                onChange={(e) => setRemindDate(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-black dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Reminder Time
              </label>
              <input
                type="time"
                value={remindTime}
                onChange={(e) => setRemindTime(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-black dark:text-white"
              />
            </div>
          </div>

          {/* Ringtone Selection with Preview Button */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Task Reminder Ringtone
            </label>
            <div className="flex items-center gap-2">
              <select
                value={ringtone}
                onChange={(e) => setRingtone(e.target.value as RingtoneType)}
                className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-black dark:text-white focus:outline-none"
              >
                {RINGTONES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => handlePreviewRingtone(ringtone)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-full bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                title="Preview sound"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Test</span>
              </button>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              placeholder="Design UI/UX, Frontend, Auth"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-black dark:text-white focus:outline-none"
            />
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200/60 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs sm:text-sm font-semibold rounded-full bg-black dark:bg-white text-white dark:text-black active:scale-95 transition-all duration-150"
            >
              {taskToEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
