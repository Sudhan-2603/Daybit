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

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://127.0.0.1:4000' : 'https://daybit.onrender.com');

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
    return false;
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
    localStorage.removeItem('daybit_is_offline');
    localStorage.removeItem('daybit_offline_tasks');
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
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) return null;
    try {
      const u = JSON.parse(raw);
      if (!u || u.id === 'offline_user' || u.email?.includes('offline') || !this.accessToken) {
        this.clearTokens();
        return null;
      }
      return u;
    } catch {
      this.clearTokens();
      return null;
    }
  }

  async checkEmail(email: string): Promise<{ exists: boolean }> {
    try {
      return await this.request<{ exists: boolean }>('/auth/check-email', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
    } catch {
      return { exists: false };
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');

    if (this.accessToken) {
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

  async getTasks(params?: { place?: Place | 'All'; status?: TaskStatus; search?: string }): Promise<Task[]> {
    const query = new URLSearchParams();
    if (params?.place && params.place !== 'All') query.set('place', params.place);
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);

    const qs = query.toString();
    return this.request<Task[]>(`/tasks${qs ? `?${qs}` : ''}`);
  }

  async createTask(input: CreateTaskInput): Promise<Task> {
    return this.request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
    return this.request<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  }

  async deleteTask(id: string): Promise<{ success: boolean; deleted_id: string }> {
    return this.request<{ success: boolean; deleted_id: string }>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  async getDashboard(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/dashboard');
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
