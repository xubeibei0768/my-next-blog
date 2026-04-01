'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// 终极纯文本提取器（处理各种嵌套标签，生成完美的目录书签锚点）
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
        
        // 🔥 核心修复 1：拦截所有的外层 <pre> 代码块（Block Code）
        pre: ({ children, ...props }: any) => {
          // 确保它是一个真正的代码块节点
          const isCodeNode = children && children.type === 'code';
          if (!isCodeNode) return <pre {...props}>{children}</pre>;

          // 提取代码语言和代码原文
          const { className, children: codeText } = children.props;
          const match = /language-(\w+)/.exec(className || '');
          const language = match ? match[1] : 'text'; // 如果没写语言，强制变成纯文本模式！

          return (
            <SyntaxHighlighter
              style={vscDarkPlus}
              language={language}
              PreTag="div"
              className="rounded-lg shadow-sm my-6 text-sm !bg-[#1E1E1E]"
            >
              {String(codeText).replace(/\n$/, '')}
            </SyntaxHighlighter>
          );
        },

        // 🔥 核心修复 2：因为真正的代码块已经被 pre 拦截了，能走到这里的绝对只有“行内代码”（Inline Code）
        code: ({ className, children, ...props }: any) => {
          return (
            <code className={`bg-[#F1F1F0] text-[#EB5757] px-1.5 py-0.5 rounded text-sm font-mono break-words ${className || ''}`} {...props}>
              {children}
            </code>
          );
        },

        // Notion 风格的引用块
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