'use client';

import { useEffect } from 'react';

/**
 * 结构化数据组件（JSON-LD）
 * 自动将数据注入到页面<head>中
 */
export function StructuredData({ data }: { data: Record<string, any> }) {
  useEffect(() => {
    // 创建 script 标签
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    
    // 添加到页面
    document.head.appendChild(script);
    
    // 清理函数
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [data]);

  return null; // 不渲染任何可见内容
}

/**
 * 文章结构化数据组件
 */
export function ArticleStructuredData({
  title,
  description,
  url,
  publishedTime,
  modifiedTime,
  author = 'Xubeibei',
  image,
}: {
  title: string;
  description: string;
  url: string;
  publishedTime: string;
  modifiedTime?: string;
  author?: string;
  image?: string;
}) {
  const articleData = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: title,
    description,
    url,
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    author: {
      '@type': 'Person',
      name: author,
    },
    publisher: {
      '@type': 'Person',
      name: author,
    },
    image: image
      ? {
          '@type': 'ImageObject',
          url: image,
        }
      : undefined,
    articleBody: description,
    wordCount: description.split(' ').length,
    inLanguage: 'zh-CN',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };

  return <StructuredData data={articleData} />;
}

/**
 * 网站结构化数据组件
 */
export function WebSiteStructuredData({
  name = "Xubeibei's Dev Log",
  url = 'https://your-domain.com',
  description = 'Sensing the World // C++ & Algorithms',
}: {
  name?: string;
  url?: string;
  description?: string;
}) {
  const webSiteData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    description,
    author: {
      '@type': 'Person',
      name: 'Xubeibei',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return <StructuredData data={webSiteData} />;
}

/**
 * 面包屑导航结构化数据
 */
export function BreadcrumbStructuredData({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return <StructuredData data={breadcrumbData} />;
}
