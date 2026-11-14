import type {
  CreateTaskInput,
  DashboardStats,
  Invite,
  Place,
  Task,
  TaskStatus,
  TokenPair,
  UpdateTaskInput,
  User,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://127.0.0.1:4000' : '');

const DEFAULT_STARTER_TASKS: Task[] = [
  {
    id: 'task_welcome_1',
    user_id: 'offline_user',
    name: 'Welcome to Daybit Offline Workspace',
    description: 'You are using Daybit in Offline Mode. All your tasks, Kanban boards, and timers are saved locally.',
    status: 'In Progress',
    place: 'Personal',
    progress_done: 1,
    progress_total: 2,
    ringtone: 'chime',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'task_welcome_2',
    user_id: 'offline_user',
    name: 'Try Dragging Cards on the Kanban Board',
    description: 'Drag this task across columns (To Do, In Progress, Review, Complete) with smooth physics.',
    status: 'To Do',
    place: 'Work',
    progress_done: 0,
    progress_total: 1,
    ringtone: 'digital-bell',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'task_welcome_3',
    user_id: 'offline_user',
    name: 'Set a Pomodoro Focus Timer',
    description: 'Use the built-in timer tool for 25-minute uninterrupted work blocks.',
    status: 'To Do',
    place: 'College',
    progress_done: 0,
    progress_total: 1,
    ringtone: 'marimba',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

class ApiService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.accessToken = localStorage.getItem('daybit_access_token');
    this.refreshToken = localStorage.getItem('daybit_refresh_token');
  }

  public isDesktopApp(): boolean {
    return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
  }

  public hasRemoteBackend(): boolean {
    return import.meta.env.DEV || Boolean(import.meta.env.VITE_API_URL);
  }

  public getOfflineTasks(): Task[] {
    const raw = localStorage.getItem('daybit_offline_tasks');
    if (!raw) {
      this.saveOfflineTasks(DEFAULT_STARTER_TASKS);
      return DEFAULT_STARTER_TASKS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_STARTER_TASKS;
    }
  }

  public saveOfflineTasks(tasks: Task[]): void {
    localStorage.setItem('daybit_offline_tasks', JSON.stringify(tasks));
  }

  public isOfflineSession(): boolean {
    return this.isDesktopApp() || !this.hasRemoteBackend() || localStorage.getItem('daybit_is_offline') === 'true' || !navigator.onLine;
  }

  public enableOfflineMode(): User {
    const offlineUser: User = {
      id: 'offline_user',
      email: 'offline@daybit.local',
      phone_number: undefined,
      created_at: new Date().toISOString(),
    };
    localStorage.setItem('daybit_is_offline', 'true');
    this.setTokens('offline_token_' + Date.now(), 'offline_refresh');
    localStorage.setItem('daybit_user', JSON.stringify(offlineUser));
    if (!localStorage.getItem('daybit_offline_tasks')) {
      this.saveOfflineTasks(DEFAULT_STARTER_TASKS);
    }
    return offlineUser;
  }

  public setTokens(tokensOrAccess: TokenPair | string, refresh?: string) {
    if (typeof tokensOrAccess === 'string') {
      this.accessToken = tokensOrAccess;
      this.refreshToken = refresh || null;
      localStorage.setItem('daybit_access_token', tokensOrAccess);
      if (refresh) localStorage.setItem('daybit_refresh_token', refresh);
    } else {
      this.accessToken = tokensOrAccess.access_token;
      this.refreshToken = tokensOrAccess.refresh_token;
      localStorage.setItem('daybit_access_token', tokensOrAccess.access_token);
      localStorage.setItem('daybit_refresh_token', tokensOrAccess.refresh_token);
      if (tokensOrAccess.user) {
        localStorage.setItem('daybit_user', JSON.stringify(tokensOrAccess.user));
      }
    }
  }

  public clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('daybit_access_token');
    localStorage.removeItem('daybit_refresh_token');
    localStorage.removeItem('daybit_user');
  }

  public logout() {
    this.clearTokens();
  }

  public getToken(): string | null {
    return this.accessToken;
  }

  public getAccessToken(): string | null {
    return this.accessToken;
  }

  public getUser(): User | null {
    const raw = localStorage.getItem('daybit_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (this.isDesktopApp() || !this.hasRemoteBackend()) {
      throw new Error('This Daybit build uses local storage and has no backend configured.');
    }

    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');

    if (this.accessToken) {
      headers.set('Authorization', `Bearer ${this.accessToken}`);
    }

    let res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    // Auto-refresh token on 401 if refresh token is available
    if (res.status === 401 && this.refreshToken && !endpoint.startsWith('/auth/')) {
      const refreshed = await this.tryRefresh();
      if (refreshed) {
        headers.set('Authorization', `Bearer ${this.accessToken}`);
        res = await fetch(`${API_BASE}${endpoint}`, {
          ...options,
          headers,
        });
      } else {
        this.clearTokens();
        window.dispatchEvent(new CustomEvent('auth:expired'));
        throw new Error('Session expired, please login again.');
      }
    }

    if (!res.ok) {
      let errorMsg = `HTTP Error ${res.status}`;
      try {
        const errorJson = await res.json();
        if (errorJson.error) errorMsg = errorJson.error;
      } catch {
        // use fallback
      }
      throw new Error(errorMsg);
    }

    return res.json();
  }

  private async tryRefresh(): Promise<boolean> {
    if (!this.refreshToken) return false;
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      });
      if (res.ok) {
        const data: TokenPair = await res.json();
        this.setTokens(data);
        return true;
      }
    } catch {
      // refresh failed
    }
    return false;
  }

  // Auth APIs
  async register(email: string, password: string, phone_number?: string): Promise<TokenPair> {
    const data = await this.request<TokenPair>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, phone_number }),
    });
    this.setTokens(data);
    return data;
  }

  async login(email: string, password: string): Promise<TokenPair> {
    const data = await this.request<TokenPair>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setTokens(data);
    return data;
  }

  async signInWithFirebase(idToken: string): Promise<TokenPair> {
    const data = await this.request<TokenPair>('/auth/firebase', {
      method: 'POST',
      body: JSON.stringify({ id_token: idToken }),
    });
    this.setTokens(data);
    return data;
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  // Task APIs
  async getTasks(params?: { place?: Place | 'All'; status?: TaskStatus; search?: string }): Promise<Task[]> {
    try {
      const query = new URLSearchParams();
      if (params?.place && params.place !== 'All') query.set('place', params.place);
      if (params?.status) query.set('status', params.status);
      if (params?.search) query.set('search', params.search);

      const qs = query.toString();
      const tasks = await this.request<Task[]>(`/tasks${qs ? `?${qs}` : ''}`);
      this.saveOfflineTasks(tasks);
      return tasks;
    } catch (err) {
      console.warn('Network task fetch failed, serving from offline local storage:', err);
      let tasks = this.getOfflineTasks();
      if (params?.place && params.place !== 'All') {
        tasks = tasks.filter(t => t.place === params.place);
      }
      if (params?.status) {
        tasks = tasks.filter(t => t.status === params.status);
      }
      if (params?.search) {
        const s = params.search.toLowerCase();
        tasks = tasks.filter(t => t.name.toLowerCase().includes(s) || t.description?.toLowerCase().includes(s));
      }
      return tasks;
    }
  }

  async createTask(input: CreateTaskInput): Promise<Task> {
    try {
      const task = await this.request<Task>('/tasks', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      const current = this.getOfflineTasks();
      this.saveOfflineTasks([task, ...current]);
      return task;
    } catch (err) {
      console.warn('Backend unavailable, saving task locally in offline mode:', err);
      const newTask: Task = {
        id: 'task_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
        user_id: this.getUser()?.id || 'offline_user',
        name: input.name,
        description: input.description || '',
        status: input.status || 'To Do',
        place: input.place || 'Personal',
        progress_done: input.progress_done || 0,
        progress_total: input.progress_total || 1,
        due_at: input.due_at || null,
        remind_at: input.remind_at || null,
        ringtone: input.ringtone || 'chime',
        tags: input.tags || [],
        attachment_count: input.attachment_count || 0,
        comment_count: input.comment_count || 0,
        assignees: input.assignees || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const current = this.getOfflineTasks();
      this.saveOfflineTasks([newTask, ...current]);
      return newTask;
    }
  }

  async updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
    try {
      const task = await this.request<Task>(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(input),
      });
      const current = this.getOfflineTasks();
      this.saveOfflineTasks(current.map(t => t.id === id ? task : t));
      return task;
    } catch (err) {
      console.warn('Backend unavailable, updating task locally in offline mode:', err);
      const current = this.getOfflineTasks();
      let updatedTask: Task | null = null;
      const updated = current.map(t => {
        if (t.id === id) {
          updatedTask = { ...t, ...input, updated_at: new Date().toISOString() };
          return updatedTask;
        }
        return t;
      });
      this.saveOfflineTasks(updated);
      return updatedTask || ({ id, user_id: 'offline_user', name: 'Updated Task', description: '', status: 'To Do', place: 'Personal', progress_done: 0, progress_total: 1, ringtone: 'chime', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), ...input } as Task);
    }
  }

  async deleteTask(id: string): Promise<{ success: boolean; deleted_id: string }> {
    try {
      const res = await this.request<{ success: boolean; deleted_id: string }>(`/tasks/${id}`, {
        method: 'DELETE',
      });
      const current = this.getOfflineTasks();
      this.saveOfflineTasks(current.filter(t => t.id !== id));
      return res;
    } catch (err) {
      console.warn('Backend unavailable, deleting task locally in offline mode:', err);
      const current = this.getOfflineTasks();
      this.saveOfflineTasks(current.filter(t => t.id !== id));
      return { success: true, deleted_id: id };
    }
  }

  async respondToReminder(
    id: string,
    action: 'accept' | 'reject' | 'remind',
    remind_at?: string
  ): Promise<Task> {
    try {
      const res = await this.request<{ status: string; task: Task }>(`/tasks/${id}/respond`, {
        method: 'POST',
        body: JSON.stringify({ action, remind_at }),
      });
      return res.task;
    } catch {
      return this.updateTask(id, {
        status: action === 'accept' ? 'In Progress' : undefined,
        remind_at,
      });
    }
  }

  // Invites
  async inviteUser(taskId: string, toEmail: string): Promise<Invite> {
    return this.request<Invite>('/tasks/' + taskId + '/invite', {
      method: 'POST',
      body: JSON.stringify({ task_id: taskId, to_email: toEmail }),
    });
  }

  async getInvites(): Promise<Invite[]> {
    try {
      return await this.request<Invite[]>('/invites');
    } catch {
      return [];
    }
  }

  async respondToInvite(inviteId: string, state: 'accepted' | 'rejected'): Promise<Invite> {
    return this.request<Invite>(`/invites/${inviteId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ state }),
    });
  }

  // Dashboard
  async getDashboard(): Promise<DashboardStats> {
    try {
      return await this.request<DashboardStats>('/dashboard');
    } catch (err) {
      console.warn('Backend dashboard unavailable, computing offline metrics:', err);
      const tasks = this.getOfflineTasks();
      const total = tasks.length;
      const completed = tasks.filter(t => t.status === 'Complete').length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      const statuses: TaskStatus[] = ['To Do', 'In Progress', 'Review', 'Complete'];
      const places: Place[] = ['College', 'Work', 'Personal'];
      const count_by_status = statuses.map(s => ({ status: s, count: tasks.filter(t => t.status === s).length }));
      const count_by_place = places.map(p => ({ place: p, count: tasks.filter(t => t.place === p).length }));
      const average_progress = total > 0 ? Math.round(tasks.reduce((acc, t) => acc + (t.progress_total > 0 ? (t.progress_done / t.progress_total) * 100 : 0), 0) / total) : 0;

      return {
        total_tasks: total,
        completed_percentage: rate,
        count_by_status,
        count_by_place,
        average_progress,
      };
    }
  }

  async getDashboardStats(): Promise<DashboardStats> {
    return this.getDashboard();
  }

  // WhatsApp Webhook Simulator
  async postWhatsAppWebhook(payload: any): Promise<any> {
    return this.request<any>('/whatsapp/webhook', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}

export const api = new ApiService();
