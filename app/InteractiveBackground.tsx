'use client';

import { useEffect, useRef } from 'react';

export default function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false }); // 关闭 alpha 通道优化渲染性能
    if (!ctx) return;

    let animationFrameId: number;
    let points: Point[] = [];
    
    // 鼠标真实位置与插值（带阻尼的平滑移动）
    let mouseX = -1000;
    let mouseY = -1000;
    let targetMouseX = -1000;
    let targetMouseY = -1000;
    
    let canvasWidth = 0;
    let canvasHeight = 0;
    let cols = 0;
    let rows = 0;

    // --- 顶级交互的物理参数 ---
    const SPACING = 40;     // 网格基础间距
    const RADIUS = 180;     // 鼠标引力场半径
    const SPRING = 0.08;    // 弹性回复系数（越小越柔和）
    const FRICTION = 0.75;  // 摩擦力阻尼（控制震荡感）

    class Point {
      x: number; y: number; baseX: number; baseY: number;
      vx: number; vy: number;

      constructor(x: number, y: number) {
        this.x = x; this.y = y;
        this.baseX = x; this.baseY = y;
        this.vx = 0; this.vy = 0;
      }

      update() {
        // 1. 鼠标排斥物理逻辑
        let dx = mouseX - this.x;
        let dy = mouseY - this.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < RADIUS) {
          // 越靠近中心，排斥力越大
          let force = (RADIUS - dist) / RADIUS;
          let angle = Math.atan2(dy, dx);
          this.vx -= Math.cos(angle) * force * 1.5;
          this.vy -= Math.sin(angle) * force * 1.5;
        }

        // 2. 弹簧恢复力逻辑（回到原始网格位置）
        this.vx += (this.baseX - this.x) * SPRING;
        this.vy += (this.baseY - this.y) * SPRING;

        // 3. 摩擦力减速
        this.vx *= FRICTION;
        this.vy *= FRICTION;

        // 应用速度
        this.x += this.vx;
        this.y += this.vy;
      }
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      
      canvasWidth = rect.width;
      canvasHeight = rect.height;
      canvas.width = canvasWidth * ratio;
      canvas.height = canvasHeight * ratio;
      ctx.scale(ratio, ratio);
      
      initGrid();
    };

    const initGrid = () => {
      points = [];
      cols = Math.ceil(canvasWidth / SPACING) + 1;
      rows = Math.ceil(canvasHeight / SPACING) + 1;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          // 初始化网格点阵
          points.push(new Point(i * SPACING, j * SPACING));
        }
      }
    };

    const animate = () => {
      // 填充底色（替代 clearRect，解决闪烁并提升性能）
      ctx.fillStyle = '#fafafa';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // 核心质感：给鼠标坐标加“缓动阻尼”，让光晕和力场显得极其平滑沉稳
      mouseX += (targetMouseX - mouseX) * 0.15;
      mouseY += (targetMouseY - mouseY) * 0.15;

      // 更新所有节点的物理状态
      points.forEach(p => p.update());

      // --- 绘制动态拓扑网格 ---
      ctx.strokeStyle = 'rgba(150, 150, 150, 0.12)'; // 极其克制的极客灰网格
      ctx.lineWidth = 1;
      ctx.beginPath();
      
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          let idx = i * rows + j;
          let p = points[idx];
          
          // 向右连线
          if (i < cols - 1) {
            let rightP = points[(i + 1) * rows + j];
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(rightP.x, rightP.y);
          }
          // 向下连线
          if (j < rows - 1) {
            let bottomP = points[i * rows + (j + 1)];
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(bottomP.x, bottomP.y);
          }
        }
      }
      ctx.stroke();

      // --- 绘制大厂级流体光晕 (Spotlight) ---
      if (mouseX > 0 && mouseY > 0) {
        const gradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 400);
        // 中心是很淡的科技蓝，向外过渡到浅紫，最后透明
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.08)');
        gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.03)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    // 坐标拾取
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = e.clientY - rect.top;
      
      // 防止首次移入屏幕时产生瞬间跳跃
      if (mouseX === -1000) {
        mouseX = targetMouseX;
        mouseY = targetMouseY;
      }
    };
    
    const handleMouseLeave = () => {
      targetMouseX = -1000;
      targetMouseY = -1000;
    };

    resize(); 
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    animate(); 

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
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