'use client';

import { useEffect, useState } from 'react';

// 接收从服务端解析过来的目录数据
export default function ArticleSidebar({ headings }: { headings: { level: number, text: string, id: string }[] }) {
  const [activeId, setActiveId] = useState<string>('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // 1. 计算丝滑的阅读进度条
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentProgress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      setProgress(currentProgress);

      // 2. 探照灯：实时计算当前读到了哪个标题
      const headingElements = headings.map(h => document.getElementById(h.id));
      const currentHeading = headingElements.reverse().find(el => {
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.top <= 150; // 距离顶部 150px 以内触发高亮
      });
      
      if (currentHeading) setActiveId(currentHeading.id);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // 初始化调用一次
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  return (
    <aside className="sticky top-28 w-64 hidden lg:block shrink-0">
      {/* 顶部阅读进度条 */}
      <div className="h-1 w-full bg-gray-200 rounded-full mb-8 overflow-hidden">
        <div className="h-full bg-blue-600 transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
      </div>

      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
        <span>📑</span> 文章导航
      </h3>
      
      <nav className="flex flex-col gap-2.5 border-l-2 border-gray-100 pl-4 relative">
        {headings.map((heading, idx) => (
          <a
            key={idx}
            href={`#${heading.id}`}
            className={`text-sm transition-all duration-200 ${
              heading.level === 3 ? 'ml-4 text-xs' : ''
            } ${
              activeId === heading.id 
                ? 'text-blue-600 font-bold translate-x-1' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {heading.text}
          </a>
        ))}
        {headings.length === 0 && <p className="text-sm text-gray-400">暂无目录结构</p>}
      </nav>
    </aside>
  );
}