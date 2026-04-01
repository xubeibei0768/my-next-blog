import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import InteractiveBackground from "./InteractiveBackground";

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