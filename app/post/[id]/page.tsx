import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from "react-markdown";
import Link from "next/link";

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

function CodeBlock({ node, inline, className, children, ...props }: any) {
  const match = /language-(\w+)/.exec(className || '');
  return !inline && match ? (
    <SyntaxHighlighter
      style={vscDarkPlus}
      language={match[1]}
      PreTag="div"
      className="rounded-xl shadow-xl my-6 text-sm"
      {...props}
    >
      {String(children).replace(/\n$/, '')}
    </SyntaxHighlighter>
  ) : (
    <code className={`${className} bg-muted text-foreground px-1.5 py-0.5 rounded-md text-sm font-mono`} {...props}>
      {children}
    </code>
  );
}

export default async function PostDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const content = await getPostContent(id);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="container max-w-7xl mx-auto flex h-16 items-center px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-mono text-lg font-bold text-foreground">
            <div className="size-7 rounded-full bg-foreground text-background flex items-center justify-center text-sm">X</div>
            <span>Dev Log</span>
          </Link>
          <Link href="/" className="ml-6 text-sm text-foreground/50 hover:text-foreground transition-colors">← 返回</Link>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        {/* 关键修复：这里的 prose prose-invert 会强制在深色背景下把文字变白 */}
        <article className="prose prose-invert prose-lg max-w-none">
          <ReactMarkdown
            components={{
              code: CodeBlock,
            }}
          >
            {content}
          </ReactMarkdown>
        </article>
        
        <div className="h-32"></div>
      </main>
    </div>
  );
}