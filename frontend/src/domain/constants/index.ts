import type { Place, RingtoneOption, Task, TaskStatus } from '../models';

export const PLACES: Place[] = ['College', 'Work', 'Personal'];

export const TASK_STATUSES: TaskStatus[] = ['To Do', 'In Progress', 'Review', 'Complete'];

export const RINGTONE_OPTIONS: RingtoneOption[] = [
  'chime',
  'digital-bell',
  'marimba',
  'pulse',
  'gentle-gong',
];

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'daybit_access_token',
  REFRESH_TOKEN: 'daybit_refresh_token',
  USER: 'daybit_user',
  OFFLINE_TASKS: 'daybit_offline_tasks',
  IS_OFFLINE: 'daybit_is_offline',
  THEME_DARK: 'daybit_dark_mode',
  THEME_ACCENT: 'daybit_bg_accent',
  START_ON_BOOT: 'daybit_start_on_boot',
  START_MINIMIZED: 'daybit_start_minimized',
} as const;

export const DEFAULT_STARTER_TASKS: Task[] = [
  {
    id: 'task_starter_1',
    user_id: 'default',
    name: 'Welcome to Daybit',
    description: 'Your unified workspace for tasks, focus timers, and team productivity.',
    status: 'In Progress',
    place: 'Personal',
    progress_done: 1,
    progress_total: 2,
    ringtone: 'chime',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'task_starter_2',
    user_id: 'default',
    name: 'Drag Cards Across Kanban Columns',
    description: 'Try moving this card from To Do to In Progress or Complete with smooth physics.',
    status: 'To Do',
    place: 'Work',
    progress_done: 0,
    progress_total: 1,
    ringtone: 'digital-bell',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'task_starter_3',
    user_id: 'default',
    name: 'Start a Pomodoro Focus Session',
    description: 'Launch the built-in timer for 25-minute deep focus intervals.',
    status: 'To Do',
    place: 'College',
    progress_done: 0,
    progress_total: 1,
    ringtone: 'marimba',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
