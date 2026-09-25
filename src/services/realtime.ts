type EventCallback = (payload: any) => void;

class RealtimeService {
  private ws: WebSocket | null = null;
  private eventSource: EventSource | null = null;
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private currentUserId: string | null = null;
  private reconnectTimer: any = null;

  init(userId?: string) {
    this.currentUserId = userId || null;
    this.connect();
  }

  private connect() {
    if (typeof window === 'undefined') return;

    // Connect WebSocket
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        if (this.currentUserId && this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ event: 'identify', userId: this.currentUserId }));
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          this.emit(parsed.event, parsed.payload);
        } catch {
          // ignore
        }
      };

      this.ws.onclose = () => {
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        this.ws?.close();
      };
    } catch {
      this.scheduleReconnect();
    }

    // Connect SSE as resilient complementary channel
    try {
      const sseUrl = `/api/events${this.currentUserId ? `?userId=${this.currentUserId}` : ''}`;
      this.eventSource = new EventSource(sseUrl);

      this.eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          this.emit(parsed.event, parsed.payload);
        } catch {
          // ignore
        }
      };
    } catch {
      // ignore
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 3000);
  }

  on(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  emit(event: string, payload: any) {
    const cbs = this.listeners.get(event);
    if (cbs) {
      cbs.forEach((cb) => cb(payload));
    }
    // Also trigger global wildcard
    const wildcard = this.listeners.get('*');
    if (wildcard) {
      wildcard.forEach((cb) => cb({ event, payload }));
    }
  }

  send(event: string, payload: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, payload, userId: this.currentUserId }));
    }
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}

export const realtime = new RealtimeService();
