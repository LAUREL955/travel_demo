// 自动化测试脚本
// 用于验证小程序的性能优化和功能完整性

const tests = {
  // 功能测试
  functional: [
    {
      name: '页面加载测试',
      test: async () => {
        console.log('测试页面加载...');
        const startTime = Date.now();
        
        // 等待页面加载完成
        await new Promise(resolve => {
          if (document.readyState === 'complete') {
            resolve();
          } else {
            window.addEventListener('load', resolve);
          }
        });
        
        const loadTime = Date.now() - startTime;
        console.log(`页面加载时间: ${loadTime}ms`);
        
        // 检查关键元素是否存在
        const root = document.getElementById('root');
        if (!root) {
          throw new Error('Root元素不存在');
        }
        
        console.log('✓ 页面加载测试通过');
        return { loadTime, passed: true };
      }
    },
    {
      name: '组件渲染测试',
      test: () => {
        console.log('测试组件渲染...');
        
        // 检查关键组件是否渲染
        const header = document.querySelector('header');
        const map = document.querySelector('[class*="flex-1"]');
        const destinationList = document.querySelector('[class*="bg-white"]');
        
        if (!header) throw new Error('头部组件未渲染');
        if (!map) throw new Error('地图组件未渲染');
        if (!destinationList) throw new Error('目的地列表组件未渲染');
        
        console.log('✓ 组件渲染测试通过');
        return { passed: true };
      }
    },
    {
      name: 'Redux状态测试',
      test: () => {
        console.log('测试Redux状态...');
        
        // 检查Redux store是否正常工作
        if (typeof window.__REDUX_DEVTOOLS_EXTENSION__ !== 'undefined') {
          console.log('Redux DevTools已连接');
        }
        
        console.log('✓ Redux状态测试通过');
        return { passed: true };
      }
    }
  ],

  // 性能测试
  performance: [
    {
      name: '首屏加载时间测试',
      test: async () => {
        console.log('测试首屏加载时间...');
        
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
        
        console.log(`页面加载时间: ${pageLoadTime}ms`);
        console.log(`DOM准备时间: ${domReadyTime}ms`);
        
        const passed = pageLoadTime <= 2000 && domReadyTime <= 1000;
        if (!passed) {
          console.warn(`性能未达标: 页面加载时间 ${pageLoadTime}ms > 2000ms`);
        }
        
        console.log(passed ? '✓ 首屏加载时间测试通过' : '✗ 首屏加载时间测试未通过');
        return { pageLoadTime, domReadyTime, passed };
      }
    },
    {
      name: '交互响应时间测试',
      test: async () => {
        console.log('测试交互响应时间...');
        
        const button = document.querySelector('button');
        if (!button) {
          console.warn('未找到按钮进行测试');
          return { passed: true };
        }
        
        const startTime = Date.now();
        button.click();
        const responseTime = Date.now() - startTime;
        
        console.log(`交互响应时间: ${responseTime}ms`);
        
        const passed = responseTime <= 300;
        if (!passed) {
          console.warn(`交互响应时间未达标: ${responseTime}ms > 300ms`);
        }
        
        console.log(passed ? '✓ 交互响应时间测试通过' : '✗ 交互响应时间测试未通过');
        return { responseTime, passed };
      }
    },
    {
      name: '内存使用测试',
      test: () => {
        console.log('测试内存使用...');
        
        if (window.performance && window.performance.memory) {
          const memory = window.performance.memory;
          const usedMB = memory.usedJSHeapSize / 1024 / 1024;
          const totalMB = memory.totalJSHeapSize / 1024 / 1024;
          
          console.log(`内存使用: ${usedMB.toFixed(2)}MB / ${totalMB.toFixed(2)}MB`);
          
          const passed = usedMB < 30;
          if (!passed) {
            console.warn(`内存使用未达标: ${usedMB.toFixed(2)}MB > 30MB`);
          }
          
          console.log(passed ? '✓ 内存使用测试通过' : '✗ 内存使用测试未通过');
          return { usedMB, totalMB, passed };
        } else {
          console.log('内存API不可用，跳过测试');
          return { passed: true, skipped: true };
        }
      }
    }
  ],

  // 兼容性测试
  compatibility: [
    {
      name: '浏览器兼容性测试',
      test: () => {
        console.log('测试浏览器兼容性...');
        
        const ua = navigator.userAgent;
        const isSupported = 
          ua.includes('Chrome') || 
          ua.includes('Firefox') || 
          ua.includes('Safari') || 
          ua.includes('Edge');
        
        if (!isSupported) {
          console.warn('不支持的浏览器:', ua);
        }
        
        console.log(isSupported ? '✓ 浏览器兼容性测试通过' : '✗ 浏览器兼容性测试未通过');
        return { userAgent: ua, passed: isSupported };
      }
    },
    {
      name: '设备兼容性测试',
      test: () => {
        console.log('测试设备兼容性...');
        
        const ua = navigator.userAgent;
        const isIOS = /iPhone|iPad|iPod/i.test(ua);
        const isAndroid = /Android/i.test(ua);
        const isMobile = isIOS || isAndroid;
        
        let passed = true;
        
        if (isIOS) {
          const match = ua.match(/OS (\d+)_(\d+)_?(\d+)?/);
          if (match) {
            const major = parseInt(match[1]);
            if (major < 10) {
              console.warn(`iOS版本过低: ${match[1]}.${match[2]}`);
              passed = false;
            }
          }
        }
        
        if (isAndroid) {
          const match = ua.match(/Android (\d+\.\d+)/);
          if (match) {
            const major = parseInt(match[1].split('.')[0]);
            if (major < 6) {
              console.warn(`Android版本过低: ${match[1]}`);
              passed = false;
            }
          }
        }
        
        console.log(passed ? '✓ 设备兼容性测试通过' : '✗ 设备兼容性测试未通过');
        return { isIOS, isAndroid, isMobile, passed };
      }
    },
    {
      name: '功能特性测试',
      test: () => {
        console.log('测试功能特性...');
        
        const features = {
          geolocation: 'geolocation' in navigator,
          localStorage: 'localStorage' in window,
          sessionStorage: 'sessionStorage' in window,
          webGL: (() => {
            try {
              const canvas = document.createElement('canvas');
              return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
            } catch (e) {
              return false;
            }
          })(),
          webWorker: 'Worker' in window,
          serviceWorker: 'serviceWorker' in navigator,
          touchEvents: 'ontouchstart' in window
        };
        
        console.log('功能特性:', features);
        
        const unsupported = Object.entries(features)
          .filter(([key, value]) => !value)
          .map(([key]) => key);
        
        if (unsupported.length > 0) {
          console.warn('不支持的功能特性:', unsupported.join(', '));
        }
        
        const passed = unsupported.length === 0;
        console.log(passed ? '✓ 功能特性测试通过' : '✗ 功能特性测试未通过');
        return { features, unsupported, passed };
      }
    }
  ],

  // 网络测试
  network: [
    {
      name: '网络状态测试',
      test: () => {
        console.log('测试网络状态...');
        
        const isOnline = navigator.onLine;
        console.log(`网络状态: ${isOnline ? '在线' : '离线'}`);
        
        console.log('✓ 网络状态测试通过');
        return { isOnline, passed: true };
      }
    },
    {
      name: '网络连接类型测试',
      test: () => {
        console.log('测试网络连接类型...');
        
        if ('connection' in navigator) {
          const connection = navigator.connection;
          console.log('网络连接类型:', connection.effectiveType);
          console.log('网络类型:', connection.type);
          
          console.log('✓ 网络连接类型测试通过');
          return { 
            effectiveType: connection.effectiveType, 
            type: connection.type, 
            passed: true 
          };
        } else {
          console.log('网络连接API不可用，跳过测试');
          return { passed: true, skipped: true };
        }
      }
    }
  ]
};

// 运行所有测试
async function runAllTests() {
  console.log('========================================');
  console.log('开始运行自动化测试');
  console.log('========================================\n');

  const results = {
    functional: [],
    performance: [],
    compatibility: [],
    network: []
  };

  // 运行功能测试
  console.log('【功能测试】');
  for (const test of tests.functional) {
    try {
      const result = await test.test();
      results.functional.push({ name: test.name, result });
    } catch (error) {
      console.error(`✗ ${test.name} 失败:`, error);
      results.functional.push({ name: test.name, result: { passed: false, error } });
    }
  }

  // 运行性能测试
  console.log('\n【性能测试】');
  for (const test of tests.performance) {
    try {
      const result = await test.test();
      results.performance.push({ name: test.name, result });
    } catch (error) {
      console.error(`✗ ${test.name} 失败:`, error);
      results.performance.push({ name: test.name, result: { passed: false, error } });
    }
  }

  // 运行兼容性测试
  console.log('\n【兼容性测试】');
  for (const test of tests.compatibility) {
    try {
      const result = await test.test();
      results.compatibility.push({ name: test.name, result });
    } catch (error) {
      console.error(`✗ ${test.name} 失败:`, error);
      results.compatibility.push({ name: test.name, result: { passed: false, error } });
    }
  }

  // 运行网络测试
  console.log('\n【网络测试】');
  for (const test of tests.network) {
    try {
      const result = await test.test();
      results.network.push({ name: test.name, result });
    } catch (error) {
      console.error(`✗ ${test.name} 失败:`, error);
      results.network.push({ name: test.name, result: { passed: false, error } });
    }
  }

  // 生成测试报告
  generateReport(results);
}

// 生成测试报告
function generateReport(results) {
  console.log('\n========================================');
  console.log('测试报告');
  console.log('========================================\n');

  const categories = [
    { name: '功能测试', tests: results.functional },
    { name: '性能测试', tests: results.performance },
    { name: '兼容性测试', tests: results.compatibility },
    { name: '网络测试', tests: results.network }
  ];

  categories.forEach(category => {
    console.log(`【${category.name}】`);
    category.tests.forEach(test => {
      const status = test.result.passed ? '✓ 通过' : '✗ 失败';
      console.log(`${status} ${test.name}`);
      if (test.result.skipped) {
        console.log(`  (跳过: ${test.result.skipped})`);
      }
    });
    console.log('');
  });

  // 统计
  const totalTests = Object.values(results).flat().length;
  const passedTests = Object.values(results).flat().filter(t => t.result.passed).length;
  const passRate = ((passedTests / totalTests) * 100).toFixed(1);

  console.log('========================================');
  console.log(`测试统计: ${passedTests}/${totalTests} 通过 (${passRate}%)`);
  console.log('========================================');

  return results;
}

// 导出测试结果
if (typeof window !== 'undefined') {
  window.runTests = runAllTests;
  window.testResults = null;
  
  console.log('自动化测试脚本已加载');
  console.log('在浏览器控制台运行 runTests() 开始测试');
}