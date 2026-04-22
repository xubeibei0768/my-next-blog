import { MetadataRoute } from 'next';

/**
 * 动态生成站点地图
 * 包含所有文章页面和静态页面
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://your-domain.com';
  
  // 静态页面
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ];

  // 动态获取所有文章
  let postPages: MetadataRoute.Sitemap = [];
  
  try {
    const res = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filter: {
            and: [
              { property: "status", select: { equals: "Published" } },
              { property: "type", select: { equals: "Post" } }
            ]
          }
        }),
        next: { revalidate: 3600 }, // 每小时重新验证
      }
    );

    if (res.ok) {
      const data = await res.json();
      
interface SitemapPost {
  id: string;
  created_time: string;
  last_edited_time?: string;
}

      postPages = data.results.map((post: SitemapPost) => ({
        url: `${baseUrl}/post/${post.id}`,
        lastModified: new Date(post.last_edited_time || post.created_time),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }));
    }
  } catch (error) {
    console.error('Error fetching posts for sitemap:', error);
  }

  return [...staticPages, ...postPages];
}
