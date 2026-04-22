import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 图片优化配置
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // 生产环境性能优化
  productionBrowserSourceMaps: false,
  
  // 启用 React 严格模式（开发环境）
  reactStrictMode: true,
  
  // 压缩输出
  output: 'standalone',
  
  // 实验性优化
  experimental: {
    optimizePackageImports: ['react-syntax-highlighter', 'medium-zoom'],
  },
};

export default nextConfig;
