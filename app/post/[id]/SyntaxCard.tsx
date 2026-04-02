'use client'; // 这个组件专门管交互，必须是客户端组件！

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// 🔥 降维打击魔法：我们换成了 Tomorrow Night 的 cjs (CommonJS) 配色，它能百分百在 Vercel 里生成静态样式，杜绝样式幽灵！
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { CopyToClipboard } from 'react-copy-to-clipboard';

export default function SyntaxCard({ language, children }: { language: string, children: string }) {
  const [copied, setCopied] = useState(false);

  // 当点击复制时的回调函数
  const onCopy = () => {
    setCopied(true);
    // 2 秒后恢复原样
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    // 🔥 彻底灭掉蓝色边框：这里的 border-gray-100/10 是极淡的灰黑色边框，和背景融为一体！
    <div className="relative group rounded-xl my-8 overflow-hidden !bg-[#1E1E1E] border border-gray-100/10 shadow-lg">
      
      {/* 2. 我们给代码块加上了一个 Notion 风格的高级头部导航栏 */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-gray-100/5 bg-[#2D2D2D]">
        {/* 左侧：展示语言名字 */}
        <span className="text-xs font-mono font-bold text-gray-500 uppercase tracking-wider">{language}</span>
        
        {/* 右侧：复制键 */}
        <CopyToClipboard text={children} onCopy={onCopy}>
          <button className="flex items-center gap-1.5 px-3 py-1 rounded-md text-gray-400 hover:text-blue-500 hover:bg-gray-100/5 transition-all text-xs font-medium cursor-pointer">
            {copied ? (
              // 复制成功后的状态
              <>
                <span className="text-green-500 text-xs">✓</span>
                <span className="text-gray-300">Copied!</span>
              </>
            ) : (
              // 未复制时的状态
              <>
                <span className="text-gray-400">📋</span>
                <span>Copy</span>
              </>
            )}
          </button>
        </CopyToClipboard>
      </div>

      {/* 3. 核心高亮区域：Tomorrow Night 配色 */}
      <SyntaxHighlighter
        style={vscDarkPlus} 
        language={language}
        PreTag="div"
        // 🔥 这里必须写 !bg-transparent，强制代码高亮组件不带背景，用我们外层 divs 的黑色！
        className="text-[13px] !leading-[1.7] !p-6 !bg-transparent !m-0"
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}