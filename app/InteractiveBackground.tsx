'use client';

import { useEffect, useRef } from 'react';

export default function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;
    let mouseX = -1000;
    let mouseY = -1000;
    let clickRipple: { x: number, y: number, radius: number } | null = null;
    let canvasWidth = 0;
    let canvasHeight = 0;

    // 1. 核心修复：用真实的容器尺寸，彻底避开“滚动条压缩”的坑
    const resize = () => {
      // 获取 Canvas 元素在屏幕上的真实物理边界
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      
      canvasWidth = rect.width;
      canvasHeight = rect.height;

      // 让画布的高清像素 100% 吻合屏幕的显示像素
      canvas.width = canvasWidth * ratio;
      canvas.height = canvasHeight * ratio;
      
      ctx.scale(ratio, ratio);
      initParticles(); 
    };

    // 2. 粒子类
    class Particle {
      x: number; y: number; size: number; baseX: number; baseY: number;
      color: string; originalColor: string; velocityX: number; velocityY: number;

      constructor(x: number, y: number) {
        this.x = x; this.y = y; this.size = 1.5;
        this.baseX = x; this.baseY = y;
        this.color = 'rgba(59, 130, 246, 0.15)'; 
        this.originalColor = this.color;
        this.velocityX = (Math.random() - 0.5) * 0.2; 
        this.velocityY = (Math.random() - 0.5) * 0.2;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }

      update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        if (this.x > canvasWidth || this.x < 0) this.velocityX *= -1;
        if (this.y > canvasHeight || this.y < 0) this.velocityY *= -1;

        let dx = mouseX - this.x;
        let dy = mouseY - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        const maxRepulseDistance = 150; 

        if (distance < maxRepulseDistance) {
          let forceFactor = (maxRepulseDistance - distance) / maxRepulseDistance;
          let forceX = dx / distance * forceFactor * 10; 
          let forceY = dy / distance * forceFactor * 10;
          this.x -= forceX;
          this.y -= forceY;
          this.color = `rgba(59, 130, 246, ${0.15 + forceFactor * 0.6})`; 
        } else {
          if (this.x !== this.baseX || this.y !== this.baseY) {
            this.x += (this.baseX - this.x) * 0.05; 
            this.y += (this.baseY - this.y) * 0.05;
          }
          this.color = this.originalColor;
        }

        if (clickRipple) {
          let cdx = clickRipple.x - this.x;
          let cdy = clickRipple.y - this.y;
          let cDistance = Math.sqrt(cdx * cdx + cdy * cdy);
          const rippleWidth = 10;

          if (cDistance < clickRipple.radius && cDistance > clickRipple.radius - rippleWidth) {
            let rippleForceFactor = (rippleWidth - Math.abs(cDistance - (clickRipple.radius - rippleWidth/2))) / rippleWidth;
            let rippleForceX = cdx / cDistance * rippleForceFactor * 2;
            let rippleForceY = cdy / cDistance * rippleForceFactor * 2;
            this.x += rippleForceX; 
            this.y += rippleForceY;
          }
        }

        this.draw();
      }
    }

    const initParticles = () => {
      particles = [];
      const gap = 24; 
      for (let y = 0; y < canvasHeight; y += gap) {
        for (let x = 0; x < canvasWidth; x += gap) {
          particles.push(new Particle(x + Math.random()*2, y + Math.random()*2)); 
        }
      }
    };

    const drawLines = (particle: Particle) => {
      if (!ctx) return;
      let dx = mouseX - particle.x;
      let dy = mouseY - particle.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      const maxConnectDistance = 120; 

      if (distance < maxConnectDistance) {
        let opacity = 1 - (distance / maxConnectDistance);
        ctx.strokeStyle = `rgba(59, 130, 246, ${opacity * 0.08})`; 
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(mouseX, mouseY);
        ctx.stroke();
      }
    };

    const updateRipple = () => {
      if (clickRipple) {
        clickRipple.radius += 5; 
        if (clickRipple.radius > 200) clickRipple = null;
      }
    };

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvasWidth, canvasHeight); 

      updateRipple();

      particles.forEach(particle => {
        particle.update(); 
        drawLines(particle); 
      });

      animationFrameId = requestAnimationFrame(animate); 
    };

    // 3. 核心修复：精准扣除画布在屏幕上的边距，拿到 100% 准确的鼠标坐标
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };
    
    const handleMouseLeave = () => {
      mouseX = -1000; 
      mouseY = -1000;
    };
    
    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      clickRipple = { x: e.clientX - rect.left, y: e.clientY - rect.top, radius: 0 };
    };

    // 初始化运行
    resize(); 
    animate(); 

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('click', handleClick);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      // 加上 w-full h-full，让 Tailwind 严格锁死物理宽度，不给滚动条留余地
      className="pointer-events-none fixed inset-0 z-0 w-full h-full bg-[#fafafa]"
    />
  );
}