import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import Link from "next/link";
import MarkdownRenderer from "./MarkdownRenderer";

// 1. 初始化 Notion
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const n2m = new NotionToMarkdown({ notionClient: notion });

// 🔥 终极魔法 1：开启 ISR 缓存！每 60 秒才允许后台偷偷去 Notion 检查一次更新
export const revalidate = 60;

// 🔥 终极魔法 2：静态路由生成 (SSG)。在 Vercel 打包时，提前把所有文章 ID 找出来，提前生成静态网页！
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
  
  // 告诉 Next.js 提前打包这些文章
  return data.results.map((post: any) => ({
    id: post.id,
  }));
}

// 3. 拉取文章详情
async function getPostContent(id: string) {
  try {
    const mdblocks = await n2m.pageToMarkdown(id);
    const mdString = n2m.toMarkdownString(mdblocks);
    return mdString.parent || "这篇文章似乎没有内容哦。";
  } catch (error) {
    console.error("抓取文章内容失败:", error);
    return "获取文章内容失败，请检查网络或配置。";
  }
}

// 4. 页面主体
export default async function PostDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const content = await getPostContent(id); 

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto flex h-16 items-center px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-mono text-lg font-bold text-gray-900 hover:opacity-70 transition-opacity">
            <div className="size-7 rounded bg-gray-900 text-white flex items-center justify-center text-sm">X</div>
            <span>Dev Log</span>
          </Link>
          <Link href="/" className="ml-6 text-sm text-gray-500 hover:text-gray-900 transition-colors">← 返回</Link>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto px-4 sm:px-6 py-16 md:py-24 relative z-10">
        <article className="prose prose-slate prose-lg max-w-none">
          <MarkdownRenderer content={content} />
        </article>
        <div className="h-32"></div>
      </main>
    </div>
  );
}