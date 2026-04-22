'use client';

import { useState, useEffect } from 'react';

/**
 * 滚动到顶部按钮
 * - 平滑滚动
 * - 显示/隐藏动画
 * - 键盘可访问性
 */
export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const toggleVisibility = () => {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      
      setScrollProgress(progress);
      setIsVisible(scrollTop > 300);
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    toggleVisibility();

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      scrollToTop();
    }
  };

  return (
    <button
      onClick={scrollToTop}
      onKeyDown={handleKeyDown}
      aria-label="返回顶部"
      className={`fixed bottom-20 right-4 sm:right-6 p-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all duration-300 z-40 focus:outline-none focus:ring-4 focus:ring-blue-500/30 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
      }`}
    >
      {/* 环形进度条 */}
      <svg className="w-6 h-6" viewBox="0 0 36 36">
        {/* 背景圆环 */}
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="3"
        />
        {/* 进度圆环 */}
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray={`${scrollProgress}, 100`}
          strokeLinecap="round"
        />
      </svg>
      
      {/* 向上箭头图标 */}
      <svg 
        className="absolute inset-0 m-auto w-4 h-4" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  );
}

/**
 * 阅读时间估算组件
 */
export function ReadingTimeProgress({ totalWords, wordsPerMinute = 300 }: { totalWords: number; wordsPerMinute?: number }) {
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    const calculateProgress = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      const scrolled = scrollTop / (documentHeight - windowHeight);
      setProgress(Math.min(scrolled * 100, 100));
      
      const estimatedMinutes = totalWords / wordsPerMinute;
      const remainingMinutes = estimatedMinutes * (1 - scrolled);
      setTimeRemaining(Math.ceil(remainingMinutes));
    };

    window.addEventListener('scroll', calculateProgress, { passive: true });
    calculateProgress();

    return () => window.removeEventListener('scroll', calculateProgress);
  }, [totalWords, wordsPerMinute]);

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-20 sm:w-64 z-40">
      {/* 进度条 */}
      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* 剩余时间提示 */}
      {progress > 10 && progress < 90 && (
        <div className="mt-2 text-xs text-gray-500 text-right hidden sm:block">
          剩余约 {timeRemaining} 分钟
        </div>
      )}
    </div>
  );
}

/**
 * 智能目录高亮 Hook
 */
export function useTableOfContents(headings: { id: string; level: number; text: string }[]) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0px -80% 0px', // 视口顶部 20% 处触发
        threshold: 0,
      }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  return activeId;
}
