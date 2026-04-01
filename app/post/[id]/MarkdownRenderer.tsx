'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function MarkdownRenderer({ content }: { content: string }) {
  // 核心魔法：记录当前是不是已经到了用户的浏览器端
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // useEffect 永远只会在浏览器端执行！
    setMounted(true);
  }, []);

  // 如果还在 Vercel 的服务端打包阶段，直接返回骨架屏，绝对不碰高亮插件！
  if (!mounted) {
    return (
      <div className="animate-pulse space-y-4 my-8">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        <p className="text-gray-400 text-sm mt-8 font-mono">正在加载极客排版与代码高亮引擎...</p>
      </div>
    );
  }

  // 成功抵达浏览器，警报解除，开始疯狂渲染！
  return (
    <ReactMarkdown
      components={{
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
            <code className={`${className} bg-gray-200 text-gray-900 px-1.5 py-0.5 rounded-md text-sm font-mono`} {...rest}>
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