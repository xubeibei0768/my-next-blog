import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import Link from "next/link";
import dynamic from "next/dynamic"; // 引入 Next.js 的动态加载神器

// 终极魔法：强行把渲染器扔给浏览器，彻底禁止服务端预渲染！
const MarkdownRenderer = dynamic(() => import("./MarkdownRenderer"), {
  ssr: false, 
  loading: () => (
    // 在浏览器加载完插件前，展示一个科技感十足的骨架屏占位
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      <p className="text-gray-400 text-sm mt-8 font-mono">正在加载极客排版与代码高亮引擎...</p>
    </div>
  )
});

// 1. 初始化 Notion 客户端
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const n2m = new NotionToMarkdown({ notionClient: notion });

// 2. 服务端专属：拉取 Notion 数据（这部分非常安全，不会报错）
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

// 3. 页面主入口
export default async function PostDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const content = await getPostContent(id); // 在服务端秒拉数据

  return (
    <div className="min-h-screen">
      {/* 头部导航 */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto flex h-16 items-center px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-mono text-lg font-bold text-gray-900 hover:opacity-70 transition-opacity">
            <div className="size-7 rounded bg-gray-900 text-white flex items-center justify-center text-sm">X</div>
            <span>Dev Log</span>
          </Link>
          <Link href="/" className="ml-6 text-sm text-gray-500 hover:text-gray-900 transition-colors">← 返回</Link>
        </div>
      </header>

      {/* 核心内容区 */}
      <main className="container max-w-3xl mx-auto px-4 sm:px-6 py-16 md:py-24 relative z-10">
        <article className="prose prose-slate prose-lg max-w-none">
          {/* 这里放入被物理隔离的安全组件，数据通过 props 传给它 */}
          <MarkdownRenderer content={content} />
        </article>
        <div className="h-32"></div>
      </main>
    </div>
  );
}