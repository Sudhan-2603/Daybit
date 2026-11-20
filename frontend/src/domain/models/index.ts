export type Place = 'College' | 'Work' | 'Personal';

export type TaskStatus = 'To Do' | 'In Progress' | 'Review' | 'Complete';

export type RingtoneOption = 'chime' | 'digital-bell' | 'marimba' | 'pulse' | 'gentle-gong';
export type RingtoneType = RingtoneOption;

export interface User {
  id: string;
  email: string;
  phone_number?: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  name: string;
  description: string;
  place: Place;
  status: TaskStatus;
  progress_done: number;
  progress_total: number;
  due_at?: string | null;
  remind_at?: string | null;
  ringtone: RingtoneOption | string;
  tags?: string[] | string;
  attachment_count?: number;
  comment_count?: number;
  assignees?: string[] | string;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  name: string;
  description?: string;
  place?: Place;
  status?: TaskStatus;
  progress_done?: number;
  progress_total?: number;
  due_at?: string | null;
  remind_at?: string | null;
  ringtone?: string;
  tags?: string[];
  attachment_count?: number;
  comment_count?: number;
  assignees?: string[];
}

export type CreateTaskDto = CreateTaskInput;

export interface UpdateTaskInput {
  name?: string;
  description?: string;
  place?: Place;
  status?: TaskStatus;
  progress_done?: number;
  progress_total?: number;
  due_at?: string | null;
  remind_at?: string | null;
  ringtone?: string;
  tags?: string[] | string;
  attachment_count?: number;
  comment_count?: number;
  assignees?: string[] | string;
}

export type UpdateTaskDto = UpdateTaskInput;

export interface Invite {
  id: string;
  task_id: string;
  from_user: string;
  to_user: string;
  state: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface StatusCount {
  status: TaskStatus | string;
  count: number;
}

export interface PlaceCount {
  place: Place | string;
  count: number;
}

export interface DashboardStats {
  total_tasks: number;
  completed_percentage: number;
  count_by_status: StatusCount[];
  count_by_place: PlaceCount[];
  average_progress: number;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  user?: User;
}

export type SyncEvent =
  | { type: 'TaskCreated'; task: Task }
  | { type: 'TaskUpdated'; task: Task }
  | { type: 'TaskDeleted'; task_id: string }
  | { type: 'TaskReminder'; task: Task }
  | { type: 'UserInvited'; invite: Invite }
  | { type: 'InviteResponded'; invite: Invite };

export type MainTab = 'tasks' | 'dashboard' | 'analytics' | 'calendar' | 'profile' | 'settings';
