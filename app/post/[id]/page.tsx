import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import ReactMarkdown from "react-markdown";

// 1. 初始化 Notion 客户端 和 转换器
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const n2m = new NotionToMarkdown({ notionClient: notion });

// 2. 核心抓取函数：根据 ID 获取 Notion Blocks 并转成 Markdown
async function getPostContent(id: string) {
  try {
    const mdblocks = await n2m.pageToMarkdown(id);
    const mdString = n2m.toMarkdownString(mdblocks);
    return mdString.parent || "这篇文章似乎没有内容哦。";
  } catch (error) {
    console.error("抓取文章内容失败:", error);
    return "获取文章内容失败，请检查网络或代理设置。";
  }
}

// 3. 页面组件 (注意 Next.js 15 中 params 是一个 Promise，需要 await)
export default async function PostDetail({ params }: { params: Promise<{ id: string }> }) {
  // 解析出路由中的 ID
  const { id } = await params;
  
  // 拉取文章 Markdown 内容
  const content = await getPostContent(id);

  return (
    <main className="max-w-3xl mx-auto mt-20 p-6">
      {/* 顶部的返回按钮 */}
      <a href="/" className="text-gray-500 hover:text-gray-900 transition-colors mb-10 inline-block font-mono text-sm">
        ← 返回博客首页
      </a>

      {/* 核心排版区：
        这里的 prose prose-lg 就是 @tailwindcss/typography 提供的魔法类名
        它会自动把里面的 h1, h2, p, code 排版得极其优雅 
      */}
      <article className="prose prose-slate prose-lg max-w-none mt-8">
        <ReactMarkdown>{content}</ReactMarkdown>
      </article>
      
      {/* 底部留白 */}
      <div className="h-32"></div>
    </main>
  );
}