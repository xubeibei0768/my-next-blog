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

    // 1. 设置 Canvas 尺寸并处理 Retina 屏幕
    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * ratio;
      canvas.height = window.innerHeight * ratio;
      ctx.scale(ratio, ratio);
      initParticles(); // 窗口大小改变后重新初始化粒子
    };

    // 2. 粒子类：定义粒子的属性和物理行为
    class Particle {
      x: number;
      y: number;
      size: number;
      baseX: number;
      baseY: number;
      color: string;
      originalColor: string;
      velocityX: number;
      velocityY: number;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.size = 1.5; // 粒子大小
        this.baseX = x; // 记录粒子的原始网格位置
        this.baseY = y;
        // 采用通透的蓝色调
        this.color = 'rgba(59, 130, 246, 0.15)'; 
        this.originalColor = this.color;
        // 粒子自身有微小的漂移
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
        // --- 核心物理交互 ---

        // A. 粒子自身漂移与边界处理
        this.x += this.velocityX;
        this.y += this.velocityY;
        if (this.x > window.innerWidth || this.x < 0) this.velocityX *= -1;
        if (this.y > window.innerHeight || this.y < 0) this.velocityY *= -1;

        // B. 鼠标排斥特效 (Repulsion)
        let dx = mouseX - this.x;
        let dy = mouseY - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        const maxRepulseDistance = 150; // 鼠标影响范围

        if (distance < maxRepulseDistance) {
          // 距离越近，排斥力越大
          let forceFactor = (maxRepulseDistance - distance) / maxRepulseDistance;
          let forceX = dx / distance * forceFactor * 10; 
          let forceY = dy / distance * forceFactor * 10;
          this.x -= forceX;
          this.y -= forceY;
          this.color = `rgba(59, 130, 246, ${0.15 + forceFactor * 0.6})`; // 鼠标靠近时粒子变亮
        } else {
          // C. 归位特效 (Homing)：鼠标离开后，粒子缓慢回到原始网格位置
          if (this.x !== this.baseX || this.y !== this.baseY) {
            this.x += (this.baseX - this.x) * 0.05; // 0.05 是归位的弹性系数
            this.y += (this.baseY - this.y) * 0.05;
          }
          this.color = this.originalColor;
        }

        // D. 点击涟漪特效 (Ripple)
        if (clickRipple) {
          let cdx = clickRipple.x - this.x;
          let cdy = clickRipple.y - this.y;
          let cDistance = Math.sqrt(cdx * cdx + cdy * cdy);
          const rippleWidth = 10; // 涟漪宽度

          if (cDistance < clickRipple.radius && cDistance > clickRipple.radius - rippleWidth) {
            let rippleForceFactor = (rippleWidth - Math.abs(cDistance - (clickRipple.radius - rippleWidth/2))) / rippleWidth;
            let rippleForceX = cdx / cDistance * rippleForceFactor * 2;
            let rippleForceY = cdy / cDistance * rippleForceFactor * 2;
            this.x += rippleForceX; // 点击时产生微小的吸引/排斥力
            this.y += rippleForceY;
          }
        }

        this.draw();
      }
    }

    // 3. 初始化粒子点阵（Stripe 风格的 24px 点阵）
    const initParticles = () => {
      particles = [];
      const gap = 24; // 网格间距
      for (let y = 0; y < window.innerHeight; y += gap) {
        for (let x = 0; x < window.innerWidth; x += gap) {
          particles.push(new Particle(x + Math.random()*2, y + Math.random()*2)); // 加入微小随机，更自然
        }
      }
    };

    // 4. 连线特效：如果粒子和鼠标距离近，则绘制一条微弱的连线
    const drawLines = (particle: Particle) => {
      if (!ctx) return;
      let dx = mouseX - particle.x;
      let dy = mouseY - particle.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      const maxConnectDistance = 120; // 连线距离

      if (distance < maxConnectDistance) {
        let opacity = 1 - (distance / maxConnectDistance);
        ctx.strokeStyle = `rgba(59, 130, 246, ${opacity * 0.08})`; // 极淡的蓝色连线
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(mouseX, mouseY);
        ctx.stroke();
      }
    };

    // 5. 点击涟漪更新逻辑
    const updateRipple = () => {
      if (clickRipple) {
        clickRipple.radius += 5; // 涟漪扩散速度
        if (clickRipple.radius > 200) { // 涟漪消失半径
          clickRipple = null;
        }
      }
    };

    // 6. 主动画循环 (Animation Loop)
    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight); // 清空 Canvas

      updateRipple();

      particles.forEach(particle => {
        particle.update(); // 更新粒子位置并绘制
        drawLines(particle); // 绘制连线
      });

      animationFrameId = requestAnimationFrame(animate); // 循环调用
    };

    // 7. 绑定交互事件
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    const handleMouseLeave = () => {
      mouseX = -1000; // 鼠标离开后将光标藏起来
      mouseY = -1000;
    };
    const handleClick = (e: MouseEvent) => {
      // 记录点击位置并启动涟漪
      clickRipple = { x: e.clientX, y: e.clientY, radius: 0 };
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('click', handleClick);

    resize(); // 初始化尺寸
    animate(); // 启动动画

    // 8. 清理机制：防止切换页面导致内存泄漏
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
      className="pointer-events-none fixed inset-0 z-0 bg-[#fafafa]"
    />
  );
}