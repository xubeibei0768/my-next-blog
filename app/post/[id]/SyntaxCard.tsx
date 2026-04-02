'use client';

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// 这里已经给你换成了纯正的 VS Code 彩虹配色！
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { CopyToClipboard } from 'react-copy-to-clipboard';

export default function SyntaxCard({ language, children }: { language: string, children: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-xl my-8 overflow-hidden !bg-[#1E1E1E] border border-gray-100/10 shadow-lg">
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-gray-100/5 bg-[#2D2D2D]">
        <span className="text-xs font-mono font-bold text-gray-500 uppercase tracking-wider">{language}</span>
        
        <CopyToClipboard text={children} onCopy={onCopy}>
          <button className="flex items-center gap-1.5 px-3 py-1 rounded-md text-gray-400 hover:text-blue-500 hover:bg-gray-100/5 transition-all text-xs font-medium cursor-pointer">
            {copied ? (
              <>
                <span className="text-green-500 text-xs">✓</span>
                <span className="text-gray-300">Copied!</span>
              </>
            ) : (
              <>
                <span className="text-gray-400">📋</span>
                <span>Copy</span>
              </>
            )}
          </button>
        </CopyToClipboard>
      </div>

      <SyntaxHighlighter
        style={vscDarkPlus} 
        language={language}
        PreTag="div"
        className="text-[13px] !leading-[1.7] !p-6 !bg-transparent !m-0"
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}