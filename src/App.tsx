import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { store } from './store'
import Home from './pages/Home/Home'
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary'
import { performanceMonitor } from './utils/performanceMonitor'
import { networkMonitor } from './utils/networkMonitor'
import { cacheManager } from './utils/cacheManager'
import { compatibilityChecker } from './utils/compatibility'
import './App.css'

function App() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const compatibility = compatibilityChecker.getCompatibility();
      console.log('设备兼容性信息:', compatibility);
      
      if (!compatibilityChecker.isSupported()) {
        const unsupported = compatibilityChecker.getUnsupportedFeatures();
        console.warn('不支持的功能特性:', unsupported);
        
        if (unsupported.length > 0) {
          alert(`您的浏览器不支持以下功能：${unsupported.join('、')}，可能影响使用体验。`);
        }
      }

      compatibilityChecker.applyPolyfills();

      performanceMonitor.init();
      
      const unsubscribe = networkMonitor.subscribe((status) => {
        console.log('Network status changed:', status);
        
        if (!status.online) {
          console.warn('网络连接断开');
        }
        
        if (status.effectiveType === 'slow-2g' || status.effectiveType === '2g') {
          console.warn('网络连接较慢，建议优化资源加载');
        }
      });

      cacheManager.clearExpired();

      return () => {
        unsubscribe();
        performanceMonitor.destroy();
      };
    }
  }, []);

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <div className="App">
          <Home />
        </div>
      </Provider>
    </ErrorBoundary>
  )
}

export default App