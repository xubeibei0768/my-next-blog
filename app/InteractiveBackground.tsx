'use client';

import { useState, useEffect } from 'react';

export default function InteractiveBackground() {
  // 初始将光圈藏在屏幕外，防止刷新闪烁
  const [mousePosition, setMousePosition] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
      style={{
        // 这就是核心魔法：绘制一个跟随鼠标的蓝色渐变光晕
        background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.08), transparent 40%)`,
      }}
    />
  );
}