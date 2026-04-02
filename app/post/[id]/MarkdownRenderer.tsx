'use client';

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from "react-markdown";
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import mediumZoom from 'medium-zoom'; 
import SyntaxCard from "./SyntaxCard"; 

function extractText(children: any): string {
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) return children.map(extractText).join('');
  if (children && children.props && children.props.children) return extractText(children.props.children);
  return '';
}

const generateId = (children: any) => extractText(children).trim().replace(/\s+/g, '-').toLowerCase();

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

          // 🔥🔥🔥 终极杀手锏：直接把外层的 <pre> 标签扒掉！
          // 这行代码意味着：不要给代码块套任何框架默认的样式框，直接渲染里面的 SyntaxCard！
          pre: ({ children }: any) => <>{children}</>,

          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : 'text'; 

            if (!inline) {
              return (
                <SyntaxCard language={language}>
                  {String(children).replace(/\n$/, '')}
                </SyntaxCard>
              );
            }

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