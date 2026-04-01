import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// 魔法在这里：这里定义了你网页标签栏的名字和描述
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
      <body className={inter.className}>{children}</body>
    </html>
  );
}