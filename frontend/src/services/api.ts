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

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

class ApiService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.accessToken = localStorage.getItem('daybit_access_token');
    this.refreshToken = localStorage.getItem('daybit_refresh_token');
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

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  // Task APIs
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

  async respondToReminder(
    id: string,
    action: 'accept' | 'reject' | 'remind',
    remind_at?: string
  ): Promise<Task> {
    const res = await this.request<{ status: string; task: Task }>(`/tasks/${id}/respond`, {
      method: 'POST',
      body: JSON.stringify({ action, remind_at }),
    });
    return res.task;
  }

  // Invites
  async inviteUser(taskId: string, toEmail: string): Promise<Invite> {
    return this.request<Invite>('/tasks/' + taskId + '/invite', {
      method: 'POST',
      body: JSON.stringify({ task_id: taskId, to_email: toEmail }),
    });
  }

  async getInvites(): Promise<Invite[]> {
    return this.request<Invite[]>('/invites');
  }

  async respondToInvite(inviteId: string, state: 'accepted' | 'rejected'): Promise<Invite> {
    return this.request<Invite>(`/invites/${inviteId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ state }),
    });
  }

  // Dashboard
  async getDashboard(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/dashboard');
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
