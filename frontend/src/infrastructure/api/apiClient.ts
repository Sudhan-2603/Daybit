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
} from '../../domain/models';
import { STORAGE_KEYS } from '../../domain/constants';
import { offlineStorage } from '../storage/offlineStorage';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:4000';

export class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    this.refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  public isDesktopApp(): boolean {
    return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
  }

  public hasRemoteBackend(): boolean {
    return Boolean(import.meta.env.VITE_API_URL);
  }

  public isOfflineSession(): boolean {
    return offlineStorage.isOfflineSession() || !navigator.onLine || !this.accessToken;
  }

  public getOfflineTasks(): Task[] {
    return offlineStorage.getTasks();
  }

  public saveOfflineTasks(tasks: Task[]): void {
    offlineStorage.saveTasks(tasks);
  }

  public enableOfflineMode(): User {
    return offlineStorage.enableOfflineSession();
  }

  public setTokens(tokensOrAccess: TokenPair | string, refresh?: string) {
    if (typeof tokensOrAccess === 'string') {
      this.accessToken = tokensOrAccess;
      this.refreshToken = refresh || null;
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokensOrAccess);
      if (refresh) localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh);
    } else {
      this.accessToken = tokensOrAccess.access_token;
      this.refreshToken = tokensOrAccess.refresh_token;
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokensOrAccess.access_token);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokensOrAccess.refresh_token);
      if (tokensOrAccess.user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(tokensOrAccess.user));
      }
    }
    localStorage.removeItem(STORAGE_KEYS.IS_OFFLINE);
  }

  public clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  public logout() {
    this.clearTokens();
    this.enableOfflineMode();
  }

  public getToken(): string | null {
    return this.accessToken;
  }

  public getAccessToken(): string | null {
    return this.accessToken;
  }

  public getUser(): User | null {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (offlineStorage.isOfflineSession() || !navigator.onLine) {
      throw new Error('Daybit is running in offline mode.');
    }

    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');

    if (this.accessToken && !this.accessToken.startsWith('offline_token_')) {
      headers.set('Authorization', `Bearer ${this.accessToken}`);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    try {
      let res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      if (res.status === 401 && this.refreshToken && !endpoint.startsWith('/auth/')) {
        const refreshed = await this.tryRefresh();
        if (refreshed) {
          headers.set('Authorization', `Bearer ${this.accessToken}`);
          res = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers,
          });
        }
      }

      if (!res.ok) {
        let errorMsg = `HTTP Error ${res.status}`;
        try {
          const errorJson = await res.json();
          if (errorJson.error) errorMsg = errorJson.error;
        } catch {}
        throw new Error(errorMsg);
      }

      return res.json();
    } finally {
      clearTimeout(timeout);
    }
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
    } catch {}
    return false;
  }

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
    try {
      const data = await this.request<TokenPair>('/auth/firebase', {
        method: 'POST',
        body: JSON.stringify({ id_token: idToken }),
      });
      this.setTokens(data);
      return data;
    } catch {
      const user = offlineStorage.getOfflineUser();
      const tokenPair: TokenPair = {
        access_token: 'firebase_session_' + Date.now(),
        refresh_token: 'firebase_refresh',
        user,
      };
      this.setTokens(tokenPair);
      return tokenPair;
    }
  }

  async getMe(): Promise<User> {
    try {
      return await this.request<User>('/auth/me');
    } catch {
      return this.getUser() || offlineStorage.enableOfflineSession();
    }
  }

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
    } catch {
      let tasks = offlineStorage.getTasks();
      if (params?.place && params.place !== 'All') {
        tasks = tasks.filter((t) => t.place === params.place);
      }
      if (params?.status) {
        tasks = tasks.filter((t) => t.status === params.status);
      }
      if (params?.search) {
        const s = params.search.toLowerCase();
        tasks = tasks.filter(
          (t) => t.name.toLowerCase().includes(s) || t.description?.toLowerCase().includes(s)
        );
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
      const current = offlineStorage.getTasks();
      offlineStorage.saveTasks([task, ...current]);
      return task;
    } catch {
      return offlineStorage.createTask(input, this.getUser()?.id || 'offline_user');
    }
  }

  async updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
    try {
      const task = await this.request<Task>(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(input),
      });
      offlineStorage.updateTask(id, task);
      return task;
    } catch {
      return offlineStorage.updateTask(id, input);
    }
  }

  async deleteTask(id: string): Promise<{ success: boolean; deleted_id: string }> {
    try {
      const res = await this.request<{ success: boolean; deleted_id: string }>(`/tasks/${id}`, {
        method: 'DELETE',
      });
      offlineStorage.deleteTask(id);
      return res;
    } catch {
      return offlineStorage.deleteTask(id);
    }
  }

  async getDashboard(): Promise<DashboardStats> {
    try {
      return await this.request<DashboardStats>('/dashboard');
    } catch {
      return offlineStorage.getDashboardStats();
    }
  }

  async getDashboardStats(): Promise<DashboardStats> {
    return this.getDashboard();
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

  async postWhatsAppWebhook(payload: any): Promise<any> {
    return this.request<any>('/whatsapp/webhook', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

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
}

export const api = new ApiClient();
