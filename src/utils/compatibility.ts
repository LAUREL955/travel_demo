export class CompatibilityChecker {
  private static instance: CompatibilityChecker;
  private compatibility: CompatibilityInfo = {
    browser: this.getBrowserInfo(),
    device: this.getDeviceInfo(),
    features: this.checkFeatures(),
    wechat: this.checkWechat()
  };

  private constructor() {}

  static getInstance(): CompatibilityChecker {
    if (!CompatibilityChecker.instance) {
      CompatibilityChecker.instance = new CompatibilityChecker();
    }
    return CompatibilityChecker.instance;
  }

  private getBrowserInfo(): BrowserInfo {
    if (typeof navigator === 'undefined') {
      return {
        browser: 'server',
        version: 'unknown',
        userAgent: 'server-side'
      };
    }
    
    const ua = navigator.userAgent;
    let browser = 'unknown';
    let version = 'unknown';

    if (ua.includes('Chrome')) {
      browser = 'Chrome';
      version = ua.match(/Chrome\/(\d+\.\d+\.\d+\.\d+)/)?.[1] || 'unknown';
    } else if (ua.includes('Firefox')) {
      browser = 'Firefox';
      version = ua.match(/Firefox\/(\d+\.\d+)/)?.[1] || 'unknown';
    } else if (ua.includes('Safari')) {
      browser = 'Safari';
      version = ua.match(/Version\/(\d+\.\d+)/)?.[1] || 'unknown';
    } else if (ua.includes('Edge')) {
      browser = 'Edge';
      version = ua.match(/Edge\/(\d+\.\d+\.\d+\.\d+)/)?.[1] || 'unknown';
    }

    return { browser, version, userAgent: ua };
  }

  private getDeviceInfo(): DeviceInfo {
    if (typeof navigator === 'undefined' || typeof window === 'undefined') {
      return {
        os: 'server',
        osVersion: 'unknown',
        isMobile: false,
        isTablet: false,
        isDesktop: false,
        platform: 'server',
        screenWidth: 1920,
        screenHeight: 1080,
        pixelRatio: 1
      };
    }
    
    const ua = navigator.userAgent;
    const platform = navigator.platform;
    
    let os = 'unknown';
    let osVersion = 'unknown';

    if (ua.includes('iPhone') || ua.includes('iPad')) {
      os = 'iOS';
      const match = ua.match(/OS (\d+)_(\d+)_?(\d+)?/);
      if (match) {
        osVersion = `${match[1]}.${match[2]}`;
      }
    } else if (ua.includes('Android')) {
      os = 'Android';
      const match = ua.match(/Android (\d+\.\d+)/);
      if (match) {
        osVersion = match[1];
      }
    } else if (platform.includes('Win')) {
      os = 'Windows';
    } else if (platform.includes('Mac')) {
      os = 'macOS';
    }

    const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(ua);

    return {
      os,
      osVersion,
      isMobile,
      isTablet,
      isDesktop: !isMobile && !isTablet,
      platform,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      pixelRatio: window.devicePixelRatio || 1
    };
  }

  private checkFeatures(): Features {
    if (typeof navigator === 'undefined' || typeof window === 'undefined') {
      return {
        geolocation: false,
        localStorage: false,
        sessionStorage: false,
        webGL: false,
        webWorker: false,
        serviceWorker: false,
        touchEvents: false,
        intersectionObserver: false,
        requestAnimationFrame: false,
        performance: false,
        promise: false,
        fetch: false
      };
    }
    
    return {
      geolocation: 'geolocation' in navigator,
      localStorage: 'localStorage' in window,
      sessionStorage: 'sessionStorage' in window,
      webGL: this.checkWebGL(),
      webWorker: 'Worker' in window,
      serviceWorker: 'serviceWorker' in navigator,
      touchEvents: 'ontouchstart' in window,
      intersectionObserver: 'IntersectionObserver' in window,
      requestAnimationFrame: 'requestAnimationFrame' in window,
      performance: 'performance' in window,
      promise: 'Promise' in window,
      fetch: 'fetch' in window
    };
  }

  private checkWebGL(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch (e) {
      return false;
    }
  }

  private checkWechat(): WechatInfo {
    const ua = navigator.userAgent;
    const isWechat = /MicroMessenger/i.test(ua);
    let version = 'unknown';

    if (isWechat) {
      const match = ua.match(/MicroMessenger\/(\d+\.\d+\.\d+)/);
      if (match) {
        version = match[1];
      }
    }

    return {
      isWechat,
      version,
      isSupported: isWechat && this.compareVersions(version, '7.0.0') >= 0
    };
  }

  private compareVersions(version1: string, version2: string): number {
    const v1 = version1.split('.').map(Number);
    const v2 = version2.split('.').map(Number);

    for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
      const num1 = v1[i] || 0;
      const num2 = v2[i] || 0;

      if (num1 > num2) return 1;
      if (num1 < num2) return -1;
    }

    return 0;
  }

  getCompatibility(): CompatibilityInfo {
    return this.compatibility;
  }

  isSupported(): boolean {
    const { device, features, wechat } = this.compatibility;

    if (device.os === 'iOS' && device.osVersion) {
      const [major, minor] = device.osVersion.split('.').map(Number);
      if (major < 10 || (major === 10 && minor < 0)) {
        return false;
      }
    }

    if (device.os === 'Android' && device.osVersion) {
      const [major, minor] = device.osVersion.split('.').map(Number);
      if (major < 6 || (major === 6 && minor < 0)) {
        return false;
      }
    }

    if (wechat.isWechat && !wechat.isSupported) {
      console.warn('微信版本过低，建议升级到7.0.0或更高版本');
    }

    if (!features.geolocation) {
      console.warn('浏览器不支持地理定位功能');
    }

    if (!features.localStorage) {
      console.warn('浏览器不支持本地存储功能');
    }

    return true;
  }

  getUnsupportedFeatures(): string[] {
    const unsupported: string[] = [];
    const { features } = this.compatibility;

    if (!features.geolocation) unsupported.push('地理定位');
    if (!features.localStorage) unsupported.push('本地存储');
    if (!features.webGL) unsupported.push('WebGL');
    if (!features.serviceWorker) unsupported.push('Service Worker');
    if (!features.touchEvents) unsupported.push('触摸事件');

    return unsupported;
  }

  applyPolyfills(): void {
    if (!this.compatibility.features.requestAnimationFrame) {
      window.requestAnimationFrame = function(callback) {
        return setTimeout(callback, 16);
      };
    }

    if (!this.compatibility.features.performance) {
      (window as any).performance = {
        now: () => Date.now()
      };
    }

    if (!this.compatibility.features.promise) {
      console.warn('Promise不支持，建议添加Promise polyfill');
    }
  }
}

export interface BrowserInfo {
  browser: string;
  version: string;
  userAgent: string;
}

export interface DeviceInfo {
  os: string;
  osVersion: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  platform: string;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
}

export interface Features {
  geolocation: boolean;
  localStorage: boolean;
  sessionStorage: boolean;
  webGL: boolean;
  webWorker: boolean;
  serviceWorker: boolean;
  touchEvents: boolean;
  intersectionObserver: boolean;
  requestAnimationFrame: boolean;
  performance: boolean;
  promise: boolean;
  fetch: boolean;
}

export interface WechatInfo {
  isWechat: boolean;
  version: string;
  isSupported: boolean;
}

export interface CompatibilityInfo {
  browser: BrowserInfo;
  device: DeviceInfo;
  features: Features;
  wechat: WechatInfo;
}

export const compatibilityChecker = CompatibilityChecker.getInstance();