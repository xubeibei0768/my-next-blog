'use client';

import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

// LayoutShift 接口定义
interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
  sources: Array<LayoutShiftAttribution>;
}

interface LayoutShiftAttribution {
  node: Node;
  previousRect: DOMRectReadOnly;
  currentRect: DOMRectReadOnly;
}

/**
 * 性能监控组件
 * 实时收集并报告核心 Web 指标
 */
export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<Partial<PerformanceMetrics>>({});
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // 如果浏览器支持 Performance API
    if (typeof performance !== 'undefined' && performance.getEntriesByType) {
      // TTFB (Time to First Byte)
      const navigationEntries = performance.getEntriesByType('navigation');
      if (navigationEntries.length > 0) {
        const navEntry = navigationEntries[0] as PerformanceNavigationTiming;
        setMetrics(prev => ({
          ...prev,
          ttfb: navEntry.responseStart - navEntry.requestStart,
        }));
      }

      // FCP (First Contentful Paint)
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        setMetrics(prev => ({
          ...prev,
          fcp: fcpEntry.startTime,
        }));
      }
    }

    // LCP (Largest Contentful Paint)
    const observeLCP = () => {
      if ('PerformanceObserver' in window) {
        try {
          const lcpObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            setMetrics(prev => ({
              ...prev,
              lcp: lastEntry.startTime,
            }));
          });
          
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
          
          // 30 秒后停止观察
          setTimeout(() => lcpObserver.disconnect(), 30000);
        } catch (e) {
          console.warn('LCP Observer not supported');
        }
      }
    };

    // CLS (Cumulative Layout Shift)
    const observeCLS = () => {
      if ('PerformanceObserver' in window) {
        try {
          let clsValue = 0;
          
          const clsObserver = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              // 检查是否没有最近的用户输入（LayoutShift 特定属性）
              const layoutShiftEntry = entry as LayoutShift;
              if (!layoutShiftEntry.hadRecentInput) {
                clsValue += layoutShiftEntry.value;
              }
            }
            setMetrics(prev => ({
              ...prev,
              cls: clsValue,
            }));
          });
          
          clsObserver.observe({ entryTypes: ['layout-shift'] });
          
          // 30 秒后停止观察
          setTimeout(() => clsObserver.disconnect(), 30000);
        } catch (e) {
          console.warn('CLS Observer not supported');
        }
      }
    };

    // FID (First Input Delay) - 简化版本
    const observeFID = () => {
      if ('PerformanceObserver' in window) {
        try {
          const fidObserver = new PerformanceObserver((entryList) => {
            const entry = entryList.getEntries()[0] as any;
            if (entry) {
              setMetrics(prev => ({
                ...prev,
                fid: entry.processingStart - entry.startTime,
              }));
            }
          });
          
          fidObserver.observe({ entryTypes: ['first-input'] });
          
          // 30 秒后停止观察
          setTimeout(() => fidObserver.disconnect(), 30000);
        } catch (e) {
          console.warn('FID Observer not supported');
        }
      }
    };

    // 延迟初始化观察者，等待页面加载
    setTimeout(() => {
      observeLCP();
      observeCLS();
      observeFID();
    }, 100);

  }, []);

  // 性能评级
  const getRating = (value: number, thresholds: { good: number; poor: number }) => {
    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.poor) return 'needs-improvement';
    return 'poor';
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'text-green-600';
      case 'needs-improvement': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-400';
    }
  };

  if (!isClient) return null;

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-white rounded-lg shadow-lg border border-gray-200 text-xs z-40 hidden md:block">
      <h3 className="font-bold text-gray-900 mb-2">性能指标</h3>
      <div className="space-y-1.5">
        {metrics.ttfb && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-gray-600">TTFB:</span>
            <span className={`font-mono font-medium ${getRatingColor(getRating(metrics.ttfb, { good: 200, poor: 500 }))}`}>
              {metrics.ttfb.toFixed(0)}ms
            </span>
          </div>
        )}
        {metrics.fcp && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-gray-600">FCP:</span>
            <span className={`font-mono font-medium ${getRatingColor(getRating(metrics.fcp, { good: 1000, poor: 2500 }))}`}>
              {metrics.fcp.toFixed(0)}ms
            </span>
          </div>
        )}
        {metrics.lcp && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-gray-600">LCP:</span>
            <span className={`font-mono font-medium ${getRatingColor(getRating(metrics.lcp, { good: 2500, poor: 4000 }))}`}>
              {metrics.lcp.toFixed(0)}ms
            </span>
          </div>
        )}
        {metrics.cls !== undefined && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-gray-600">CLS:</span>
            <span className={`font-mono font-medium ${getRatingColor(getRating(metrics.cls!, { good: 0.1, poor: 0.25 }))}`}>
              {metrics.cls!.toFixed(3)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 页面加载进度条组件
 */
export function PageLoadingProgress() {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const handleStart = () => {
      setProgress(0);
      setIsComplete(false);
    };

    const handleProgress = () => {
      // 模拟进度更新
      setProgress(prev => Math.min(prev + Math.random() * 30, 90));
    };

    const handleComplete = () => {
      setProgress(100);
      setIsComplete(true);
      setTimeout(() => setProgress(0), 500);
    };

    // 监听页面加载
    window.addEventListener('beforeunload', handleStart);
    
    // 初始加载完成后
    if (document.readyState === 'complete') {
      handleComplete();
    } else {
      window.addEventListener('load', handleComplete);
    }

    // 模拟导航进度
    const observer = new MutationObserver(handleProgress);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('beforeunload', handleStart);
      window.removeEventListener('load', handleComplete);
      observer.disconnect();
    };
  }, []);

  if (progress === 0 && !isComplete) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-gray-100 z-50">
      <div
        className={`h-full transition-all duration-300 ${
          isComplete ? 'bg-green-500' : 'bg-blue-500'
        }`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
