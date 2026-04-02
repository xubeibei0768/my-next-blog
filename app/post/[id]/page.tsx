import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import Link from "next/link";
import MarkdownRenderer from "./MarkdownRenderer";
import ArticleSidebar from "./ArticleSidebar";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const n2m = new NotionToMarkdown({ notionClient: notion });

export const revalidate = 60;

export async function generateStaticParams() {
  const res = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}/query`, {
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
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.results.map((post: any) => ({ id: post.id }));
}

// 🔥 核心升级：同时抓取页面的属性（标题、时间）和正文内容
async function getPostData(id: string) {
  try {
    const page: any = await notion.pages.retrieve({ page_id: id });
    const titleProp = page.properties.Name || page.properties.title;
    const title = titleProp?.title?.[0]?.plain_text || "无标题文章";
    const date = page.created_time ? new Date(page.created_time).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }) : "";

    // 🔥 新增：抓取文章的分类和标签
    const category = page.properties.Category?.select?.name || null;
    const tags = page.properties.Tags?.multi_select || [];

    const mdblocks = await n2m.pageToMarkdown(id);
    const content = n2m.toMarkdownString(mdblocks).parent || "";
    
    return { title, date, content, category, tags }; // 把 category 和 tags 传出去
  } catch (error) {
    return { title: "文章加载失败", date: "", content: "获取文章内容失败，请检查网络或配置。", category: null, tags: [] };
  }
}

function extractHeadings(mdString: string) {
  const regex = /^(##|###)\s+(.+)$/gm;
  const headings = [];
  let match;
  while ((match = regex.exec(mdString)) !== null) {
    let cleanText = match[2].replace(/[*_~`]/g, '').trim(); 
    headings.push({
      level: match[1].length, 
      text: cleanText,
      id: cleanText.replace(/\s+/g, '-').toLowerCase()
    });
  }
  return headings;
}

export default async function PostDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // 🔥 这里接收 category 和 tags
  const { title, date, content, category, tags } = await getPostData(id); 
  const headings = extractHeadings(content); 
  const readTime = Math.max(1, Math.ceil(content.length / 400));

  return (
    <div className="min-h-screen">
      {/* ... 上面的导航栏代码保持不变 ... */}
      
      <div className="pt-24 pb-32">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-12 items-start justify-center">
            
            <main className="flex-1 w-full max-w-[820px] bg-white rounded-xl p-8 md:p-10 lg:p-14 relative z-10 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              
              {/* 🔥 升级版的文章头部：加入分类和标签 */}
              <header className="mb-10 pb-10 border-b border-gray-100/80">
                {category && (
                  <div className="mb-5">
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-bold tracking-wider uppercase">
                      {category}
                    </span>
                  </div>
                )}
                
                <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
                  {title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-5 text-sm text-gray-500 font-mono mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-300">📅</span> {date}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-300">⏱️</span> 阅读约 {readTime} 分钟
                  </div>
                </div>

                {/* 渲染标签 */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag: any) => (
                      <span key={tag.id} className="px-2.5 py-1 rounded-md bg-gray-50 border border-gray-100 text-gray-500 text-xs font-mono">
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </header>

              <article className="prose prose-slate max-w-none prose-p:leading-[1.8] prose-p:text-[#37352f] prose-a:text-blue-600 hover:prose-a:text-blue-800 prose-a:no-underline hover:prose-a:underline prose-li:text-[#37352f]">
                <MarkdownRenderer content={content} />
              </article>
            </main>

            <ArticleSidebar headings={headings} />

          </div>
        </div>
      </div>
    </div>
  );
}