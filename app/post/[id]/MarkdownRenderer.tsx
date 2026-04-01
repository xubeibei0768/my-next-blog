'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// 零依赖 ID 生成器：把中文或英文标题转成合法的锚点
const generateId = (children: any) => {
  const text = Array.isArray(children) ? children.join('') : children;
  return String(text).toLowerCase().replace(/\s+/g, '-');
};

export default function MarkdownRenderer({ content }: { content: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="animate-pulse space-y-4 my-8">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <p className="text-gray-400 text-sm mt-8 font-mono">正在加载极客排版引擎...</p>
      </div>
    );
  }

  return (
    <ReactMarkdown
      components={{
        // 核心魔法：拦截 h2 和 h3，自动打上 id 锚点！并增加 scroll-mt 留出导航栏的距离
        h2: ({node, children, ...props}) => <h2 id={generateId(children)} className="scroll-mt-28" {...props}>{children}</h2>,
        h3: ({node, children, ...props}) => <h3 id={generateId(children)} className="scroll-mt-28" {...props}>{children}</h3>,
        code(props: any) {
          const { children, className, node, ...rest } = props;
          const match = /language-(\w+)/.exec(className || '');
          return match ? (
            <SyntaxHighlighter
              style={vscDarkPlus}
              language={match[1]}
              PreTag="div"
              className="rounded-xl shadow-xl my-6 text-sm"
              {...rest}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className={`${className} bg-gray-100 text-blue-600 px-1.5 py-0.5 rounded-md text-sm font-mono`} {...rest}>
              {children}
            </code>
          );
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
}