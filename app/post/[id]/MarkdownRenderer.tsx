'use client';

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from "react-markdown";
// 🔥 这里把 vscDarkPlus（VSCode配色）换成了经典的 Tomorrow Night，它颜色更柔和，告别死亡紫红
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import mediumZoom from 'medium-zoom'; // 🔥 新增插件导入
import SyntaxCard from "./SyntaxCard"; // 🔥 引入我们刚刚写的神级代码组件！

// 提取目录锚点
function extractText(children: any): string {
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) return children.map(extractText).join('');
  if (children && children.props && children.props.children) return extractText(children.props.children);
  return '';
}

const generateId = (children: any) => extractText(children).trim().replace(/\s+/g, '-').toLowerCase();

export default function MarkdownRenderer({ content }: { content: string }) {
  const [mounted, setMounted] = useState(false);
  const markdownRef = useRef<HTMLDivElement>(null); // 🔥 用于包裹 Markdown 的容器

  useEffect(() => {
    // 核心逻辑：记录组件是否已经抵达浏览器
    setMounted(true);
  }, []);

  // 核心逻辑 2：当内容加载完毕，并且确保已经在浏览器挂载时，激活图片放大特效
  useEffect(() => {
    // 🔥 此处是神级修复，解决了“图片不能放大”的问题：必须在 content 有值且已经在浏览器端挂载后才启动！
    if (mounted && content && markdownRef.current) {
      // 在浏览器端稍作等待，确保 Notion 的图片已经全部下载完毕
      const timer = setTimeout(() => {
        const images = markdownRef.current?.querySelectorAll('img') || [];
        if (images.length > 0) {
          mediumZoom(images, {
            margin: 24, // 放大时图片与屏幕边缘的距离
            background: 'rgba(250, 250, 250, 0.95)', // 放大时的半透明背景色
          });
        }
      }, 500); // 延迟 500ms 启动
      
      return () => clearTimeout(timer); // 清理定时器
    }
  }, [mounted, content]);

  if (!mounted) {
    return (
      <div className="animate-pulse space-y-4 my-8 relative z-20">
        <div className="h-4 bg-gray-100 rounded w-full"></div>
        <div className="h-4 bg-gray-100 rounded w-full"></div>
        <div className="h-4 bg-gray-100 rounded w-5/6"></div>
      </div>
    );
  }

  return (
    // 🔥 给容器加上 ref，并添加 hover:prose-img:cursor-zoom-in，让鼠标移到图片上时显示放大镜图标
    // 🔥 同时添加 relative z-20，确保层级正确
    <div ref={markdownRef} className="hover:prose-img:cursor-zoom-in relative z-20">
      <ReactMarkdown
        components={{
          h2: ({node, children, ...props}) => <h2 id={generateId(children)} className="scroll-mt-24 font-bold mt-14 mb-6 text-2xl" {...props}>{children}</h2>,
          h3: ({node, children, ...props}) => <h3 id={generateId(children)} className="scroll-mt-24 font-semibold mt-10 mb-4 text-xl text-gray-800" {...props}>{children}</h3>,
          strong: ({node, children, ...props}) => <strong className="font-semibold text-gray-900 bg-gray-100/50 px-1 rounded mx-0.5" {...props}>{children}</strong>,
          hr: ({node, ...props}) => <hr className="my-12 border-gray-100" {...props} />,
          img: ({node, src, alt, ...props}) => (
            <span className="flex flex-col items-center my-10">
              {/* 这里去掉之前的 border 和 shadow，保持图片清爽 */}
              <img src={src} alt={alt} className="rounded-xl max-h-[600px] object-contain" loading="lazy" {...props} />
              {alt && <span className="text-sm text-gray-400 mt-3">{alt}</span>}
            </span>
          ),

          // 🔥 终极核心替换：我们要把代码块的渲染，交给刚才写的带有复制功能的 SyntaxCard！
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : 'text'; // 没写语言默认当纯文本处理

            // 1. 如果是占满一整行的代码块
            if (!inline) {
              return (
                <SyntaxCard language={language}>
                  {String(children).replace(/\n$/, '')}
                </SyntaxCard>
              );
            }

            // 2. 如果是夹在一段话中间的“行内代码”
            // 🔥 这里重构行内代码颜色（图里的 fminunc）：
            // 文字：改成沉稳的 "#0055cc"（极客蓝），告别突兀的红色。背景：改成极淡的 "#f1f5f9" (Tailwind slate-100)
            return (
              <code className={`bg-[#f1f5f9] text-[#0055cc] px-1.5 py-0.5 rounded text-[13.5px] font-mono mx-0.5 break-words ${className || ''}`} {...props}>
                {children}
              </code>
            );
          },

          blockquote: ({node, children, ...props}) => (
            <blockquote className="border-l-4 border-gray-300 bg-gray-50 pl-5 py-2 my-8 text-gray-600 italic rounded-r-xl" {...props}>
              {children}
            </blockquote>
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}