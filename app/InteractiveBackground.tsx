'use client';

import { useCallback, useEffect } from 'react';
import { useOptimizedAnimation } from './hooks/useOptimizedAnimation';

class Point {
  x: number; y: number; baseX: number; baseY: number;
  vx: number; vy: number;

  constructor(x: number, y: number) {
    this.x = x; this.y = y;
    this.baseX = x; this.baseY = y;
    this.vx = 0; this.vy = 0;
  }

  update(mouseX: number, mouseY: number, RADIUS: number, SPRING: number, FRICTION: number) {
    let dx = mouseX - this.x;
    let dy = mouseY - this.y;
    let dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < RADIUS) {
      let force = (RADIUS - dist) / RADIUS;
      let angle = Math.atan2(dy, dx);
      this.vx -= Math.cos(angle) * force * 1.5;
      this.vy -= Math.sin(angle) * force * 1.5;
    }

    this.vx += (this.baseX - this.x) * SPRING;
    this.vy += (this.baseY - this.y) * SPRING;
    this.vx *= FRICTION;
    this.vy *= FRICTION;
    this.x += this.vx;
    this.y += this.vy;
  }
}

export default function InteractiveBackground() {
  const mouseRef = {
    x: -1000, y: -1000,
    targetX: -1000, targetY: -1000
  };

  const pointsRef = { points: [] as Point[], cols: 0, rows: 0 };
  
  const SPACING = 40;
  const RADIUS = 180;
  const SPRING = 0.08;
  const FRICTION = 0.75;

  const handleFrame = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, width, height);

    mouseRef.x += (mouseRef.targetX - mouseRef.x) * 0.15;
    mouseRef.y += (mouseRef.targetY - mouseRef.y) * 0.15;

    pointsRef.points.forEach(p => p.update(mouseRef.x, mouseRef.y, RADIUS, SPRING, FRICTION));

    ctx.strokeStyle = 'rgba(150, 150, 150, 0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    for (let i = 0; i < pointsRef.cols; i++) {
      for (let j = 0; j < pointsRef.rows; j++) {
        let idx = i * pointsRef.rows + j;
        let p = pointsRef.points[idx];
        
        if (i < pointsRef.cols - 1) {
          let rightP = pointsRef.points[(i + 1) * pointsRef.rows + j];
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(rightP.x, rightP.y);
        }
        if (j < pointsRef.rows - 1) {
          let bottomP = pointsRef.points[i * pointsRef.rows + (j + 1)];
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(bottomP.x, bottomP.y);
        }
      }
    }
    ctx.stroke();

    if (mouseRef.x > 0 && mouseRef.y > 0) {
      const gradient = ctx.createRadialGradient(mouseRef.x, mouseRef.y, 0, mouseRef.x, mouseRef.y, 400);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.08)');
      gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.03)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }
  }, []);

  const handleResize = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const points: Point[] = [];
    const cols = Math.ceil(width / SPACING) + 1;
    const rows = Math.ceil(height / SPACING) + 1;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        points.push(new Point(i * SPACING, j * SPACING));
      }
    }
    
    pointsRef.points = points;
    pointsRef.cols = cols;
    pointsRef.rows = rows;
  }, []);

  const canvasRef = useOptimizedAnimation({
    onFrame: handleFrame,
    onResize: handleResize,
    maxFps: 60,
  });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.targetX = e.clientX - rect.left;
    mouseRef.targetY = e.clientY - rect.top;
    
    if (mouseRef.x === -1000) {
      mouseRef.x = mouseRef.targetX;
      mouseRef.y = mouseRef.targetY;
    }
  }, []);
  
  const handleMouseLeave = useCallback(() => {
    mouseRef.targetX = -1000;
    mouseRef.targetY = -1000;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 w-full h-full"
    />
  );
}
