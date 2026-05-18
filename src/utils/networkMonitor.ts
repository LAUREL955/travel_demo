export class NetworkMonitor {
  private static instance: NetworkMonitor;
  private listeners: Set<(status: NetworkStatus) => void> = new Set();
  private currentStatus: NetworkStatus = {
    online: navigator.onLine,
    type: this.getNetworkType(),
    effectiveType: this.getEffectiveType()
  };

  private constructor() {
    this.init();
  }

  static getInstance(): NetworkMonitor {
    if (!NetworkMonitor.instance) {
      NetworkMonitor.instance = new NetworkMonitor();
    }
    return NetworkMonitor.instance;
  }

  private init() {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => this.updateStatus({ online: true }));
    window.addEventListener('offline', () => this.updateStatus({ online: false }));

    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection.addEventListener('change', () => {
        this.updateStatus({
          type: this.getNetworkType(),
          effectiveType: this.getEffectiveType()
        });
      });
    }
  }

  private getNetworkType(): string {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return connection.type || 'unknown';
    }
    return 'unknown';
  }

  private getEffectiveType(): string {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return connection.effectiveType || 'unknown';
    }
    return 'unknown';
  }

  private updateStatus(updates: Partial<NetworkStatus>) {
    this.currentStatus = { ...this.currentStatus, ...updates };
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentStatus));
  }

  subscribe(listener: (status: NetworkStatus) => void) {
    this.listeners.add(listener);
    listener(this.currentStatus);
    return () => this.listeners.delete(listener);
  }

  getStatus(): NetworkStatus {
    return this.currentStatus;
  }

  isSlowConnection(): boolean {
    const slowTypes = ['slow-2g', '2g', '3g'];
    return slowTypes.includes(this.currentStatus.effectiveType);
  }

  isOnline(): boolean {
    return this.currentStatus.online;
  }
}

export interface NetworkStatus {
  online: boolean;
  type: string;
  effectiveType: string;
}

export const networkMonitor = NetworkMonitor.getInstance();