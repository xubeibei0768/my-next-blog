'use client';

import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import ReactMarkdown from "react-markdown";
import mediumZoom from 'medium-zoom'; 

// 懒加载语法高亮组件，减少初始包体积
const SyntaxCard = lazy(() => import("./SyntaxCard")); 

function extractText(children: React.ReactNode): string {
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) return children.map(extractText).join('');
  if (children && typeof children === 'object' && 'props' in children) {
    const childProps = (children as { props: { children?: React.ReactNode } }).props;
    if (childProps.children) {
      return extractText(childProps.children);
    }
  }
  return '';
}

const generateId = (children: React.ReactNode) => extractText(children).trim().replace(/\s+/g, '-').toLowerCase();

export default function MarkdownRenderer({ content }: { content: string }) {
  const [mounted, setMounted] = useState(false);
  const markdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && content && markdownRef.current) {
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
    <div ref={markdownRef} className="hover:prose-img:cursor-zoom-in relative z-20">
      <ReactMarkdown
        components={{
          h2: ({children, ...props}) => <h2 id={generateId(children)} className="scroll-mt-24 font-bold mt-14 mb-6 text-2xl" {...props}>{children}</h2>,
          h3: ({children, ...props}) => <h3 id={generateId(children)} className="scroll-mt-24 font-semibold mt-10 mb-4 text-xl text-gray-800" {...props}>{children}</h3>,
          strong: ({children, ...props}) => <strong className="font-semibold text-gray-900 bg-gray-100/50 px-1 rounded mx-0.5" {...props}>{children}</strong>,
          hr: (props) => <hr className="my-12 border-gray-100" {...props} />,
          img: ({src, alt, ...props}) => (
            <span className="flex flex-col items-center my-10">
              <img
                src={src}
                alt={alt}
                className="rounded-xl max-h-[600px] object-contain"
                loading="lazy"
                {...props}
              />
              {alt && <span className="text-sm text-gray-400 mt-3">{alt}</span>}
            </span>
          ),

          // 扒掉默认的 <pre> 标签外壳
          pre: ({ children }: any) => <>{children}</>,

          // 🔥🔥🔥 核心修复：极其鲁棒的代码块/行内代码判定
          code({ node, className, children, ...props }: React.ComponentProps<'code'> & { node?: any }) {
            const match = /language-(\w+)/.exec(className || '');
            
            // 终极判断：只要带有语言标记，或者内容里包含换行符，就一定是代码块！
            const isBlock = match || String(children).includes('\n');

            if (isBlock) {
              return (
                <Suspense fallback={<div className="h-32 bg-gray-100 rounded-lg animate-pulse" />}>
                  <SyntaxCard language={match ? match[1] : 'text'}>
                    {String(children).replace(/\n$/, '')}
                  </SyntaxCard>
                </Suspense>
              );
            }

            // 否则就是行内代码（完美还原 Notion 的红字浅灰底风格）
            return (
              <code className="px-1.5 py-0.5 mx-0.5 rounded bg-gray-100 text-[#EB5757] font-mono text-[0.85em] border border-gray-200 break-words" {...props}>
                {children}
              </code>
            );
          },

          // 顺手优化了 Callout (引用块) 的颜值
          blockquote: ({node, children, ...props}) => (
            <blockquote className="my-6 px-5 py-4 border-l-4 border-blue-500 bg-blue-50/50 rounded-r-lg text-gray-800 text-sm md:text-base leading-relaxed" {...props}>
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