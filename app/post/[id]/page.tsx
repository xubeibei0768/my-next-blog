import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import Link from "next/link";
import MarkdownRenderer from "./MarkdownRenderer"; // 引入刚才写的客户端渲染器

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const n2m = new NotionToMarkdown({ notionClient: notion });

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

      <main className="container max-w-3xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        {/* 把样式约束交回给 prose，内部渲染交给安全组件 */}
        <article className="prose prose-slate prose-lg max-w-none">
          <MarkdownRenderer content={content} />
        </article>
        <div className="h-32"></div>
      </main>
    </div>
  );
}