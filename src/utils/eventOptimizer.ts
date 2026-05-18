import React from 'react';

export class EventOptimizer {
  private static instance: EventOptimizer;
  private timers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private rafIds: Map<string, number> = new Map();

  private constructor() {}

  static getInstance(): EventOptimizer {
    if (!EventOptimizer.instance) {
      EventOptimizer.instance = new EventOptimizer();
    }
    return EventOptimizer.instance;
  }

  debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number,
    key: string = 'default'
  ): T {
    return ((...args: Parameters<T>) => {
      if (this.timers.has(key)) {
        clearTimeout(this.timers.get(key)!);
      }

      this.timers.set(
        key,
        setTimeout(() => {
          func(...args);
          this.timers.delete(key);
        }, delay)
      );
    }) as T;
  }

  throttle<T extends (...args: any[]) => any>(
    func: T,
    delay: number,
    key: string = 'default'
  ): T {
    let lastCall = 0;

    return ((...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func(...args);
      } else {
        if (this.rafIds.has(key)) {
          cancelAnimationFrame(this.rafIds.get(key)!);
        }

        this.rafIds.set(
          key,
          requestAnimationFrame(() => {
            func(...args);
            this.rafIds.delete(key);
          })
        );
      }
    }) as T;
  }

  raf<T extends (...args: any[]) => any>(
    func: T,
    key: string = 'default'
  ): T {
    return ((...args: Parameters<T>) => {
      if (this.rafIds.has(key)) {
        cancelAnimationFrame(this.rafIds.get(key)!);
      }

      this.rafIds.set(
        key,
        requestAnimationFrame(() => {
          func(...args);
          this.rafIds.delete(key);
        })
      );
    }) as T;
  }

  cleanup() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    
    this.rafIds.forEach(id => cancelAnimationFrame(id));
    this.rafIds.clear();
  }
}

export const eventOptimizer = EventOptimizer.getInstance();

export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const callbackRef = React.useRef(callback);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>();

  React.useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return React.useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  ) as T;
}

export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const callbackRef = React.useRef(callback);
  const lastRunRef = React.useRef(0);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>();

  React.useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return React.useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      
      if (now - lastRunRef.current >= delay) {
        lastRunRef.current = now;
        callbackRef.current(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          lastRunRef.current = Date.now();
          callbackRef.current(...args);
        }, delay - (now - lastRunRef.current));
      }
    },
    [delay]
  ) as T;
}