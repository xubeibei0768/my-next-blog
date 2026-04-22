'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useDebounce } from '../hooks/useOptimizedAnimation';

interface SearchResult {
  id: string;
  title: string;
  category?: string;
  tags?: string[];
  date: string;
}

interface InstantSearchProps {
  initialResults?: SearchResult[];
  categories?: string[];
}

/**
 * 即时搜索组件
 * - 输入时实时搜索（防抖优化）
 * - 搜索结果高亮
 * - 键盘导航支持
 * - 移动端优化
 */
export function InstantSearch({ initialResults = [], categories = [] }: InstantSearchProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // 防抖搜索（300ms 延迟）
  const debouncedSetQuery = useDebounce((value: string) => {
    setDebouncedQuery(value);
  }, 300);

  // 处理输入变化
  useEffect(() => {
    debouncedSetQuery(query);
  }, [query, debouncedSetQuery]);

  // 执行搜索
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    // 模拟搜索延迟（实际项目中应该调用 API）
    const timer = setTimeout(() => {
      // 这里应该调用实际的搜索 API
      // 示例：fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
      setIsSearching(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [debouncedQuery]);

  // 键盘导航
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen && e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
        
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          window.location.href = `/post/${results[selectedIndex].id}`;
        }
        break;
        
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  }, [isOpen, results, selectedIndex]);

  // 点击外部关闭搜索结果
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current && 
        !resultsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 高亮匹配文本
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 text-gray-900 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="relative w-full max-w-2xl">
      {/* 搜索框 */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="搜索文章..."
          className="w-full h-12 sm:h-14 pl-12 pr-12 text-base sm:text-lg rounded-2xl border border-gray-200 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all bg-white"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
        />
        
        {/* 搜索图标 */}
        <svg 
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        
        {/* 清除按钮 */}
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              inputRef.current?.focus();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="清除搜索"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        
        {/* 加载指示器 */}
        {isSearching && (
          <div className="absolute right-12 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* 搜索结果下拉 */}
      {isOpen && (query.trim() || isSearching) && (
        <div
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
        >
          {isSearching ? (
            <div className="p-6 text-center">
              <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-sm text-gray-500">正在搜索...</p>
            </div>
          ) : results.length === 0 && query.trim() ? (
            <div className="p-6 text-center">
              <div className="text-4xl mb-2">📭</div>
              <p className="text-sm text-gray-500">没有找到相关文章</p>
              <p className="text-xs text-gray-400 mt-1">试试其他关键词吧</p>
            </div>
          ) : (
            <ul className="max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <li
                  key={result.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 last:border-b-0 ${
                    index === selectedIndex ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    window.location.href = `/post/${result.id}`;
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {highlightText(result.title, debouncedQuery)}
                      </h3>
                      {result.category && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-600">
                          {result.category}
                        </span>
                      )}
                    </div>
                    <time className="text-xs text-gray-400 whitespace-nowrap">
                      {result.date}
                    </time>
                  </div>
                </li>
              ))}
            </ul>
          )}
          
          {/* 搜索提示 */}
          {results.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 flex items-center justify-between">
              <span>使用 ↑ ↓ 导航，Enter 选择</span>
              <Link 
                href={`/search?q=${encodeURIComponent(query)}`}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                查看所有结果 →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
