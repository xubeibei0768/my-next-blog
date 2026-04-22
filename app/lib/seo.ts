import { Metadata } from 'next';

interface SEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  keywords?: string[];
}

/**
 * 生成完整的 SEO 元数据
 * 包含：基础元标签、Open Graph、Twitter Card、结构化数据
 */
export function generatePageSEO({
  title,
  description,
  canonicalUrl,
  ogImage = '/og-image.jpg',
  publishedTime,
  modifiedTime,
  authors = ['Xubeibei'],
  keywords = [],
}: SEOProps): Metadata {
  const seo: Metadata = {
    title,
    description,
    keywords: [...keywords, 'C++', 'Algorithms', 'Programming', 'Tech Blog'],
    authors: authors.map(name => ({ name })),
    creator: 'Xubeibei',
    
    // 规范链接，防止重复内容
    ...(canonicalUrl && { alternates: { canonical: canonicalUrl } }),
    
    // Open Graph - 社交媒体分享优化
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime,
      modifiedTime,
      authors,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'zh_CN',
      siteName: "Xubeibei's Dev Log",
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      creator: '@yourhandle',
    },
    
    // 机器人索引控制
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };

  return seo;
}

/**
 * 生成文章结构化数据（JSON-LD）
 * 帮助搜索引擎理解内容结构
 */
export function generateArticleSchema({
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
  return {
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
}

/**
 * 生成网站结构化数据
 */
export function generateWebSiteSchema({
  name = "Xubeibei's Dev Log",
  url = 'https://your-domain.com',
  description = 'Sensing the World // C++ & Algorithms',
}) {
  return {
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
    } as any,
  };
}

/**
 * 生成面包屑导航结构化数据
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
