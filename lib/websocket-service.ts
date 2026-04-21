class WebSocketService {
  private socket: WebSocket | null = null;
  private listeners: Map<string, Array<(payload: unknown) => void>> = new Map();

  // Reconnection and Heartbeat state
  private url: string | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 5000; // 5 seconds
  private pingIntervalId: NodeJS.Timeout | null = null;
  private readonly pingInterval = 30000; // 30 seconds

  connect(url: string): Promise<void> {
    this.url = url;
    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        console.log("WebSocket connected");
        this.reconnectAttempts = 0; // Reset attempts on successful connection
        this.startHeartbeat();
        resolve();
      };

      this.socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        reject(error);
      };

      this.socket.onclose = () => {
        console.log("WebSocket disconnected");
        this.stopHeartbeat();
        this.handleReconnect();
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const { type, payload } = data;

          if (this.listeners.has(type)) {
            this.listeners.get(type)?.forEach((listener) => listener(payload));
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.url) {
      this.reconnectAttempts++;
      console.log(`WebSocket reconnecting... Attempt ${this.reconnectAttempts}`);
      setTimeout(() => {
        if (this.url) {
          this.connect(this.url).catch(console.error);
        }
      }, this.reconnectDelay);
    } else {
      console.error("WebSocket max reconnect attempts reached.");
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.pingIntervalId = setInterval(() => {
      this.send("ping", { timestamp: Date.now() });
    }, this.pingInterval);
  }

  private stopHeartbeat(): void {
    if (this.pingIntervalId) {
      clearInterval(this.pingIntervalId);
      this.pingIntervalId = null;
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.stopHeartbeat();
      this.socket.close();
      this.socket = null;
    }
    this.url = null;
  }

  send(type: string, payload: unknown): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, payload }));
    } else {
      console.error("WebSocket is not connected");
    }
  }

  on(type: string, listener: (payload: unknown) => void): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }

    this.listeners.get(type)?.push(listener);
  }

  off(type: string, listener: (payload: unknown) => void): void {
    if (this.listeners.has(type)) {
      const listeners = this.listeners.get(type) || [];
      const index = listeners.indexOf(listener);

      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }
}

// Singleton instance
export const webSocketService = new WebSocketService();
