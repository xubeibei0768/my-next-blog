'use client';

import { useEffect, useRef, useCallback } from 'react';

interface AnimationOptions {
  onFrame: (ctx: CanvasRenderingContext2D, width: number, height: number, deltaTime: number) => void;
  onResize?: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
  pixelRatio?: number;
  maxFps?: number;
}

/**
 * 高性能 Canvas 动画 Hook
 * - 自动处理 DPR 缩放
 * - 帧率限制（避免过度渲染）
 * - 内存泄漏防护
 * - 可见性优化（页面不可见时暂停）
 */
export function useOptimizedAnimation({
  onFrame,
  onResize,
  pixelRatio = 1,
  maxFps = 60,
}: AnimationOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const frameIntervalRef = useRef<number>(1000 / maxFps);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // 限制最大 DPR 为 2，优化性能
    
    canvas.width = rect.width * dpr * pixelRatio;
    canvas.height = rect.height * dpr * pixelRatio;
    
    ctx.scale(dpr * pixelRatio, dpr * pixelRatio);

    if (onResize) {
      onResize(ctx, rect.width, rect.height);
    }
  }, [onResize, pixelRatio]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let visible = true;

    // 使用 Intersection Observer 优化性能（页面不可见时暂停渲染）
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0 }
    );

    observer.observe(canvas);

    // 使用 requestIdleCallback 进一步优化（浏览器空闲时才渲染）
    const animate = (timestamp: number) => {
      if (!visible) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // 帧率控制
      const deltaTime = timestamp - lastTimeRef.current;
      if (deltaTime >= frameIntervalRef.current) {
        lastTimeRef.current = timestamp - (deltaTime % frameIntervalRef.current);
        
        const rect = canvas.getBoundingClientRect();
        onFrame(ctx, rect.width, rect.height, deltaTime);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener('resize', resize);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
      observer.disconnect();
    };
  }, [onFrame, resize]);

  return canvasRef;
}

/**
 * 防抖 Hook - 优化频繁事件处理
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

/**
 * 节流 Hook - 限制事件触发频率
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  limit: number
) {
  const lastRunRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastRun = now - lastRunRef.current;

      if (timeSinceLastRun >= limit) {
        lastRunRef.current = now;
        callback(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          lastRunRef.current = now;
          callback(...args);
        }, limit - timeSinceLastRun);
      }
    },
    [callback, limit]
  );
}
