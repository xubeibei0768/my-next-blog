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

    const mdblocks = await n2m.pageToMarkdown(id);
    const content = n2m.toMarkdownString(mdblocks).parent || "";
    
    return { title, date, content };
  } catch (error) {
    return { title: "文章加载失败", date: "", content: "获取文章内容失败，请检查网络或配置。" };
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
  const { title, date, content } = await getPostData(id); 
  const headings = extractHeadings(content); 

  // 计算一个大概的阅读时间（按每分钟 400 字算）
  const readTime = Math.max(1, Math.ceil(content.length / 400));

  return (
    <div className="min-h-screen">
      <header className="fixed top-0 inset-x-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <div className="container max-w-7xl mx-auto flex h-14 items-center px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-mono text-base font-bold text-gray-900 hover:opacity-70 transition-opacity">
            <div className="size-6 rounded bg-gray-900 text-white flex items-center justify-center text-xs">X</div>
            <span>Dev Log</span>
          </Link>
          <div className="ml-auto">
             <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-md hover:bg-gray-100">
               返回首页
             </Link>
          </div>
        </div>
      </header>

      <div className="pt-24 pb-32">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-12 items-start justify-center">
            
            {/* 🔥 增大了卡片的 padding (lg:p-14)，增加呼吸感留白 */}
            <main className="flex-1 w-full max-w-[820px] bg-white rounded-xl p-8 md:p-10 lg:p-14 relative z-10 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              
              {/* 🔥 新增：极具仪式感的文章头部信息区 */}
              <header className="mb-10 pb-10 border-b border-gray-100/80">
                <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
                  {title}
                </h1>
                <div className="flex items-center gap-5 text-sm text-gray-500 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-300">📅</span> {date}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-300">⏱️</span> 阅读约 {readTime} 分钟
                  </div>
                </div>
              </header>

              {/* 正文渲染区 */}
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