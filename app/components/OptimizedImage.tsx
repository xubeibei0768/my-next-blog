'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
}

/**
 * 优化的图片组件
 * - 支持懒加载
 * - 自动 WebP/AVIF 格式转换
 * - 渐进式加载效果
 * - 错误处理
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 75,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  // 使用 Intersection Observer 实现智能懒加载
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const img = imgRef.current;
          if (img && img.dataset.src) {
            img.src = img.dataset.src;
            observer.unobserve(img);
          }
        }
      },
      { rootMargin: '50px' }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [priority]);

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className}`}
        style={{ width, height }}
      >
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs">图片加载失败</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-gray-100 ${className}`} style={{ width, height }}>
      {/* 骨架屏 */}
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
      )}
      
      <Image
        ref={imgRef}
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        quality={quality}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        priority={priority}
      />
    </div>
  );
}

/**
 * 响应式图片网格组件
 * 自动根据屏幕尺寸调整布局
 */
export function ResponsiveImageGrid({
  images,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
}: {
  images: Array<{ src: string; alt: string; width: number; height: number }>;
  columns?: { mobile: number; tablet: number; desktop: number };
}) {
  return (
    <div className="grid gap-4 sm:gap-6 sm:[grid-template-columns:repeat(2,minmax(0,1fr))] lg:[grid-template-columns:repeat(3,minmax(0,1fr))]"
      style={{
        gridTemplateColumns: `repeat(${columns.mobile}, minmax(0, 1fr))`,
      }}
    >
      {images.map((image, index) => (
        <OptimizedImage
          key={index}
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          className="rounded-lg shadow-md hover:shadow-xl transition-shadow"
        />
      ))}
    </div>
  );
}

/**
 * 图片画廊组件（支持 medium-zoom）
 */
export function ImageGallery({
  src,
  alt,
  className = '',
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    let zoom: any;
    
    const initZoom = async () => {
      const mediumZoom = (await import('medium-zoom')).default;
      if (imgRef.current) {
        zoom = mediumZoom(imgRef.current, {
          margin: 24,
          background: 'rgba(250, 250, 250, 0.95)',
          scrollOffset: 0,
        });
      }
    };

    initZoom();

    return () => {
      if (zoom) {
        zoom.detach();
      }
    };
  }, []);

  return (
    <div className={`relative group ${className}`}>
      <OptimizedImage
        src={src}
        alt={alt}
        className="cursor-zoom-in rounded-xl"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-xl pointer-events-none" />
    </div>
  );
}
