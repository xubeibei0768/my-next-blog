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

async function getPostContent(id: string) {
  try {
    const mdblocks = await n2m.pageToMarkdown(id);
    return n2m.toMarkdownString(mdblocks).parent || "";
  } catch (error) {
    return "获取文章内容失败，请检查网络或配置。";
  }
}

// 提取目录的神器也升级了，能自动过滤掉特殊的 Markdown 符号
function extractHeadings(mdString: string) {
  const regex = /^(##|###)\s+(.+)$/gm;
  const headings = [];
  let match;
  while ((match = regex.exec(mdString)) !== null) {
    let rawText = match[2];
    // 去掉加粗和斜体符号，拿到纯净的标题名字
    let cleanText = rawText.replace(/[*_~`]/g, '').trim(); 
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
  const content = await getPostContent(id); 
  const headings = extractHeadings(content); 

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
            
            {/* 注入 Notion 风格的核心代码段：去掉了生硬的阴影，采用扁平化排版 */}
            <main className="flex-1 w-full max-w-[800px] bg-white rounded-xl p-8 md:p-12 relative z-10 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              {/* prose-slate 定义了全局的克制灰黑调，prose-p 等专门调整了行距 */}
              <article className="prose prose-slate max-w-none prose-p:leading-relaxed prose-p:text-[#37352f] prose-a:text-gray-500 hover:prose-a:text-gray-900 prose-img:rounded-xl prose-li:text-[#37352f]">
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