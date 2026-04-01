import Link from "next/link";

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

  if (!res.ok) return [];
  const data = await res.json();
  return data.results;
}

// 头部：加入毛玻璃模糊特效
function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/40 backdrop-blur-md">
      <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3 font-mono text-xl font-bold tracking-tight text-white group">
          <div className="size-8 rounded-lg bg-white/10 border border-white/20 text-white flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">X</div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50">Dev Log</span>
        </Link>
      </div>
    </header>
  );
}

// 简介区：光影质感
function Bio() {
  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-20 relative">
      {/* 背后隐隐发光的光晕特效 */}
      <div className="absolute top-1/2 left-10 -translate-y-1/2 w-72 h-72 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>
      
      <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-12 relative z-10">
        <div className="size-24 rounded-full bg-white/5 border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)] flex items-center justify-center text-5xl">🧑‍💻</div>
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">Xubeibei's Dev Log</h1>
          <p className="mt-4 text-lg text-white/60 max-w-2xl leading-relaxed">
            Sensing the World // C++ & Algorithms.<br/>
            Sharing thoughts on intelligent perception, code, and life.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-white/80">#C++</span>
            <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-white/80">#Algorithms</span>
            <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-white/80">#Perception</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 卡片：高级半透明材质与边框流光悬浮
function PostCard({ post }: { post: any }) {
  const titleProp = post.properties.Name || post.properties.title;
  const title = titleProp?.title?.[0]?.plain_text || "无标题文章";
  const date = post.created_time ? new Date(post.created_time).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }) : "";
  
  return (
    <Link href={`/post/${post.id}`}>
      <article className="group p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-sm hover:bg-white/[0.04] hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] transition-all duration-500 h-full flex flex-col justify-between">
        <h2 className="text-2xl font-semibold tracking-tight text-white/90 group-hover:text-white transition-colors">
          {title}
        </h2>
        <footer className="mt-10 flex items-center justify-between text-sm text-white/40 font-mono">
          <span>{date}</span>
          <span className="font-medium text-white/0 group-hover:text-white/80 transition-all transform translate-x-4 group-hover:translate-x-0">阅读全文 →</span>
        </footer>
      </article>
    </Link>
  );
}

export default async function Home() {
  const posts = await getPosts();

  return (
    <div className="min-h-screen">
      <Header />
      <Bio />
      <main className="container max-w-7xl mx-auto px-4 sm:px-6 pb-24 relative z-10">
        <div className="border-t border-white/10 pt-16">
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