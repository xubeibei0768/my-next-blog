import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import Link from "next/link";
import MarkdownRenderer from "./MarkdownRenderer";
import ArticleSidebar from "./ArticleSidebar"; // 引入刚才写的侧边栏组件

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

async function getPostContent(id: string) {
  try {
    const mdblocks = await n2m.pageToMarkdown(id);
    return n2m.toMarkdownString(mdblocks).parent || "";
  } catch (error) {
    return "获取文章内容失败，请检查网络或配置。";
  }
}

// 服务端正则：从 Markdown 原文中暴力提取 ## 和 ### 标题交给书签
function extractHeadings(mdString: string) {
  const regex = /^(##|###)\s+(.+)$/gm;
  const headings = [];
  let match;
  while ((match = regex.exec(mdString)) !== null) {
    const text = match[2];
    headings.push({
      level: match[1].length, 
      text: text,
      id: text.toLowerCase().replace(/\s+/g, '-') 
    });
  }
  return headings;
}

export default async function PostDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const content = await getPostContent(id); 
  const headings = extractHeadings(content); // 提取目录！

  return (
    <div className="min-h-screen">
      {/* 1. 绝对置顶的毛玻璃导航栏 */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="container max-w-7xl mx-auto flex h-16 items-center px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-mono text-lg font-bold text-gray-900 hover:opacity-70 transition-opacity">
            <div className="size-7 rounded bg-gray-900 text-white flex items-center justify-center text-sm">X</div>
            <span>Dev Log</span>
          </Link>
          <div className="ml-auto">
             <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors px-4 py-2 rounded-lg hover:bg-gray-100">
               ← 返回首页
             </Link>
          </div>
        </div>
      </header>

      {/* 留出固定导航栏的高度 */}
      <div className="pt-24 pb-32">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          {/* 大屏下采用左右两列布局 */}
          <div className="flex flex-col lg:flex-row gap-12 items-start justify-center">
            
            {/* 2. 左侧：纯白高定底板 */}
            <main className="flex-1 w-full max-w-3xl bg-white border border-gray-200 shadow-sm rounded-2xl p-8 md:p-12 relative z-10">
              <article className="prose prose-slate prose-lg max-w-none">
                <MarkdownRenderer content={content} />
              </article>
            </main>

            {/* 3. 右侧：智能悬浮书签 */}
            <ArticleSidebar headings={headings} />

          </div>
        </div>
      </div>
    </div>
  );
}