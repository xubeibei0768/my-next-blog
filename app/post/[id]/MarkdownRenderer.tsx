'use client';

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// 🔥 降维打击魔法：我们换成了 Tomorrow Night 的 cjs (CommonJS) 配色，它能百分百在 Vercel 里生成静态样式，杜绝样式幽灵！
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import mediumZoom from 'medium-zoom'; 
import { CopyToClipboard } from 'react-copy-to-clipboard'; // 安装好的复制插件

// 提取目录锚点
function extractText(children: any): string {
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) return children.map(extractText).join('');
  if (children && children.props && children.props.children) return extractText(children.props.children);
  return '';
}

const generateId = (children: any) => extractText(children).trim().replace(/\s+/g, '-').toLowerCase();

// 🔥 定义一个局部的、极致干净的的代码块组件（带有悬浮复制键）
const CleanCodeBlock = ({ language, value }: { language: string; value: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    // 🔥 极致干净的核心：这个 group 用于在鼠标悬浮时显示复制按钮
    // 去掉所有边框和生硬的黑色大底板，采用扁平化设计
    <div className="relative group my-8 rounded-lg overflow-hidden bg-[#1E1E1E] shadow-inner border border-gray-100/5">
      
      {/* 右上角：极度克制的语言标识 */}
      <span className="absolute top-2 right-2 text-[10px] font-mono font-bold text-gray-600 uppercase tracking-wider z-10 select-none">
        {language || 'text'}
      </span>

      {/* 🔥 大厂极客范：极致克制的悬浮复制键，默认隐藏（opacity-0），鼠标悬浮时出现 */}
      <div className="absolute top-3 right-12 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
        <CopyToClipboard text={value} onCopy={handleCopy}>
          <button className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all text-xs font-medium cursor-pointer ${copied ? 'bg-green-600 text-white' : 'bg-gray-700/60 text-gray-300 hover:bg-gray-700'}`}>
            {copied ? (
              <><span>✓</span><span>Copied</span></>
            ) : (
              <><span>📋</span><span>Copy</span></>
            )}
          </button>
        </CopyToClipboard>
      </div>

      {/* 核心高亮：使用 VS Code 彩虹配色 */}
      <SyntaxHighlighter
        style={vscDarkPlus} 
        language={language}
        PreTag="div"
        // 🔥 排版微调：极致干净，去掉多余内边距
        className="text-[13px] !leading-[1.8] !p-6 !m-0 !bg-transparent"
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

export default function MarkdownRenderer({ content }: { content: string }) {
  const [mounted, setMounted] = useState(false);
  const markdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // 激活图片放大特效
    if (mounted && content && markdownRef.current) {
      // 这里的 timer 机制不变，保证 Notion 图片加载完后挂载
      const timer = setTimeout(() => {
        const images = markdownRef.current?.querySelectorAll('img') || [];
        if (images.length > 0) {
          mediumZoom(images, {
            margin: 24, 
            background: 'rgba(250, 250, 250, 0.95)', 
          });
        }
      }, 500);
      
      return () => clearTimeout(timer); 
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
    // 添加 hover:prose-img:cursor-zoom-in，并添加 relative z-10，确保层级正确
    <div ref={markdownRef} className="hover:prose-img:cursor-zoom-in relative z-10">
      <ReactMarkdown
        components={{
          h2: ({node, children, ...props}) => <h2 id={generateId(children)} className="scroll-mt-24 font-bold mt-14 mb-6 text-2xl" {...props}>{children}</h2>,
          h3: ({node, children, ...props}) => <h3 id={generateId(children)} className="scroll-mt-24 font-semibold mt-10 mb-4 text-xl text-gray-800" {...props}>{children}</h3>,
          strong: ({node, children, ...props}) => <strong className="font-semibold text-gray-900 bg-gray-100/50 px-1 rounded mx-0.5" {...props}>{children}</strong>,
          hr: ({node, ...props}) => <hr className="my-12 border-gray-100" {...props} />,
          img: ({node, src, alt, ...props}) => (
            <span className="flex flex-col items-center my-10">
              <img src={src} alt={alt} className="rounded-xl max-h-[600px] object-contain" loading="lazy" {...props} />
              {alt && <span className="text-sm text-gray-400 mt-3">{alt}</span>}
            </span>
          ),

          // 🔥 终极替换：我们要把代码块的渲染，交给刚才写的带有复制功能的 SyntaxCard！
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : 'text'; // 没写语言默认当纯文本处理

            // 1. 如果是占满一整行的代码块
            if (!inline) {
              return (
                <CleanCodeBlock language={language} value={String(children).replace(/\n$/, '')} />
              );
            }

            // 2. 如果是夹在一段话中间的“行内代码”
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