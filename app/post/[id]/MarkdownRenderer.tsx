'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

function extractText(children: any): string {
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) return children.map(extractText).join('');
  if (children && children.props && children.props.children) return extractText(children.props.children);
  return '';
}

const generateId = (children: any) => extractText(children).trim().replace(/\s+/g, '-').toLowerCase();

export default function MarkdownRenderer({ content }: { content: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="animate-pulse space-y-4 my-8">
        <div className="h-4 bg-gray-100 rounded w-full"></div>
        <div className="h-4 bg-gray-100 rounded w-full"></div>
        <div className="h-4 bg-gray-100 rounded w-5/6"></div>
      </div>
    );
  }

  return (
    <ReactMarkdown
      components={{
        h2: ({node, children, ...props}) => <h2 id={generateId(children)} className="scroll-mt-28 font-semibold mt-12 mb-6 text-2xl border-b pb-2" {...props}>{children}</h2>,
        h3: ({node, children, ...props}) => <h3 id={generateId(children)} className="scroll-mt-28 font-medium mt-8 mb-4 text-xl" {...props}>{children}</h3>,
        
        // 🔥 终极核心修复：删掉所有花里胡哨的 pre 拦截，用官方推荐的 inline 属性判断！
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || '');
          const language = match ? match[1] : 'text'; // 没写语言默认当纯文本处理

          // 1. 如果不是行内代码（也就是 Notion 里那种占满一整行的代码块）
          if (!inline) {
            return (
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={language}
                PreTag="div"
                className="rounded-lg shadow-sm my-6 text-sm !bg-[#1E1E1E]"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            );
          }

          // 2. 如果是夹在一段话中间的“行内代码”
          return (
            <code className={`bg-[#F1F1F0] text-[#EB5757] px-1.5 py-0.5 rounded text-sm font-mono break-words ${className || ''}`} {...props}>
              {children}
            </code>
          );
        },

        blockquote: ({node, children, ...props}) => (
          <blockquote className="border-l-4 border-gray-800 bg-gray-50 pl-4 py-1 my-6 text-gray-600 italic rounded-r-lg" {...props}>
            {children}
          </blockquote>
        )
      }}
    >
      {content}
    </ReactMarkdown>
  );
}