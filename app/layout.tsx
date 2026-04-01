import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import InteractiveBackground from "./InteractiveBackground"; // 引入我们刚才写的高级交互背景

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Xubeibei's Dev Log",
  description: "Sensing the World // C++ & Algorithms",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      {/* 给 body 加上 relative，确保层级正确 */}
      <body className={`${inter.className} relative`}>
        <InteractiveBackground />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}