import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import InteractiveBackground from "./InteractiveBackground";

// 字体配置：直接使用系统字体，避免 Google Fonts 网络连接问题
// 在开发和生产环境都使用系统字体以确保构建成功
const inter = { 
  className: 'font-sans',
  style: { fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }
};

export const metadata: Metadata = {
  title: {
    default: "Xubeibei's Dev Log",
    template: "%s | Xubeibei's Dev Log"
  },
  description: "Sensing the World // C++ & Algorithms",
  // SEO 优化元标签
  metadataBase: new URL('https://your-domain.com'),
  keywords: ['C++', 'Algorithms', 'Programming', 'Tech Blog', 'Development'],
  authors: [{ name: 'Xubeibei' }],
  creator: 'Xubeibei',
  // Open Graph 配置
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: "Xubeibei's Dev Log",
  },
  // Twitter Card 配置
  twitter: {
    card: 'summary_large_image',
    creator: '@yourhandle',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 关键修复：加上 scroll-smooth，书签跳转就会像幻灯片一样丝滑滑动，而不是生硬地闪现
    <html lang="zh" className="scroll-smooth">
      <body className={`${inter.className} relative`}>
        <InteractiveBackground />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}