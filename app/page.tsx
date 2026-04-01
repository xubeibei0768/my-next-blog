import Link from "next/link";

// 1. 数据拉取函数 (必须要有这个！)
async function getPosts() {
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
    next: { revalidate: 10 } 
  });

  if (!res.ok) {
    console.error("Notion API 请求失败", res.status);
    return [];
  }

  const data = await res.json();
  return data.results;
}

// 2. 导航栏
function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-mono text-xl font-bold tracking-tight text-foreground">
          <div className="size-8 rounded-full bg-foreground text-background flex items-center justify-center">X</div>
          <span>Dev Log</span>
        </Link>
      </div>
    </header>
  );
}

// 3. 个人简介
function Bio() {
  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-12">
        <div className="size-24 rounded-full bg-muted border-4 border-card shadow-lg flex items-center justify-center text-5xl">🧑‍💻</div>
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">Xubeibei's Dev Log</h1>
          <p className="mt-4 text-xl text-foreground/70 max-w-3xl">
            Sensing the World // C++ & Algorithms. 
            Sharing thoughts on intelligent perception, code, and life.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full bg-muted text-xs font-mono text-foreground">#C++</span>
            <span className="px-3 py-1 rounded-full bg-muted text-xs font-mono text-foreground">#Algorithms</span>
            <span className="px-3 py-1 rounded-full bg-muted text-xs font-mono text-foreground">#NextJS</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 4. 文章卡片
function PostCard({ post }: { post: any }) {
  const titleProp = post.properties.Name || post.properties.title;
  const title = titleProp?.title?.[0]?.plain_text || "无标题文章";
  const date = post.created_time ? new Date(post.created_time).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }) : "";
  
  return (
    <Link href={`/post/${post.id}`}>
      <article className="group p-6 border border-border rounded-2xl bg-card hover:border-foreground/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out h-full flex flex-col justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-foreground group-hover:text-foreground/80">
          {title}
        </h2>
        <footer className="mt-6 flex items-center justify-between text-sm text-foreground/50 font-mono">
          <span>{date}</span>
          <span className="font-medium text-foreground group-hover:text-foreground/80">阅读全文 →</span>
        </footer>
      </article>
    </Link>
  );
}

// 5. 首页主函数
export default async function Home() {
  const posts = await getPosts();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Bio />
      
      <main className="container max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <div className="border-t border-border pt-12">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground/50 mb-10">最新文章</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {posts.map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}