import type { SyncEvent } from '../types';
import { api } from './api';

type Listener = (event: SyncEvent) => void;
type StatusListener = () => void;

const getWebSocketBase = (): string | null => {
  if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL;

  const apiBase = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://127.0.0.1:4000' : '');
  if (!apiBase) return null;

  const url = new URL(apiBase);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.pathname = '/ws';
  url.search = '';
  return url.toString();
};

class WebSocketService {
  private socket: WebSocket | null = null;
  private listeners: Set<Listener> = new Set();
  private connectListeners: Set<StatusListener> = new Set();
  private disconnectListeners: Set<StatusListener> = new Set();
  private reconnectTimer: number | null = null;

  public connect(explicitToken?: string) {
    if (api.isDesktopApp()) return;
    const token = explicitToken || api.getAccessToken();
    if (!token) {
      this.disconnect();
      return;
    }

    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const wsBase = getWebSocketBase();
    if (!wsBase) return;
    const wsUrl = `${wsBase}?token=${encodeURIComponent(token)}`;

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('[WebSocket] Connected for live task sync');
        this.connectListeners.forEach((fn) => fn());
      };

      this.socket.onmessage = (event) => {
        try {
          const syncEvent: SyncEvent = JSON.parse(event.data);
          this.notify(syncEvent);
        } catch (err) {
          console.error('[WebSocket] Failed to parse message', err);
        }
      };

      this.socket.onclose = () => {
        this.disconnectListeners.forEach((fn) => fn());
        this.scheduleReconnect();
      };

      this.socket.onerror = (err) => {
        console.warn('[WebSocket] Connection error', err);
        this.socket?.close();
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  public onConnected(fn: StatusListener) {
    this.connectListeners.add(fn);
  }

  public onDisconnected(fn: StatusListener) {
    this.disconnectListeners.add(fn);
  }

  public disconnect() {
    if (this.reconnectTimer) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socket) {
      this.socket.onclose = null;
      this.socket.close();
      this.socket = null;
    }
    this.disconnectListeners.forEach((fn) => fn());
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      if (api.getAccessToken()) {
        this.connect();
      }
    }, 3000);
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(event: SyncEvent) {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in WS subscriber callback:', err);
      }
    });
  }
}

export const wsService = new WebSocketService();
