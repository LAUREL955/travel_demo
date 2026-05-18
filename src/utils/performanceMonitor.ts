export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();
  private observers: PerformanceObserver[] = [];

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  init() {
    if (typeof window === 'undefined' || !window.performance) {
      console.warn('Performance API not available');
      return;
    }

    this.observePageLoad();
    this.observeResourceTiming();
    this.observeLongTasks();
  }

  private observePageLoad() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
        
        this.metrics.set('pageLoadTime', pageLoadTime);
        this.metrics.set('domReadyTime', domReadyTime);
        
        console.log(`页面加载时间: ${pageLoadTime}ms`);
        console.log(`DOM准备时间: ${domReadyTime}ms`);
        
        this.checkPerformanceThresholds();
      }, 0);
    });
  }

  private observeResourceTiming() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (entry.duration > 1000) {
            console.warn(`慢速资源加载: ${entry.name} - ${entry.duration.toFixed(2)}ms`);
          }
        });
      });

      observer.observe({ entryTypes: ['resource'] });
      this.observers.push(observer);
    } catch (e) {
      console.warn('Resource timing observation not supported');
    }
  }

  private observeLongTasks() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          console.warn(`长任务检测: ${entry.duration.toFixed(2)}ms - ${entry.name}`);
        });
      });

      observer.observe({ entryTypes: ['longtask'] });
      this.observers.push(observer);
    } catch (e) {
      console.warn('Long task observation not supported');
    }
  }

  private checkPerformanceThresholds() {
    const pageLoadTime = this.metrics.get('pageLoadTime') || 0;
    const domReadyTime = this.metrics.get('domReadyTime') || 0;

    if (pageLoadTime > 2000) {
      console.warn(`页面加载时间超过目标: ${pageLoadTime}ms > 2000ms`);
    }

    if (domReadyTime > 1000) {
      console.warn(`DOM准备时间超过目标: ${domReadyTime}ms > 1000ms`);
    }
  }

  mark(name: string) {
    if (window.performance) {
      window.performance.mark(name);
    }
  }

  measure(name: string, startMark: string, endMark: string) {
    if (window.performance) {
      window.performance.measure(name, startMark, endMark);
      const measure = window.performance.getEntriesByName(name)[0];
      if (measure) {
        this.metrics.set(name, measure.duration);
        console.log(`${name}: ${measure.duration.toFixed(2)}ms`);
      }
    }
  }

  getMetrics() {
    return Object.fromEntries(this.metrics);
  }

  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();