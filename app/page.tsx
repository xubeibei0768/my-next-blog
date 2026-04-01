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

// 头部：干净通透
function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-mono text-xl font-bold tracking-tight text-gray-900 group">
          <div className="size-8 rounded bg-gray-900 text-white flex items-center justify-center group-hover:bg-blue-600 transition-colors">X</div>
          <span>Dev Log</span>
        </Link>
      </div>
    </header>
  );
}

// 简介区：专业极简
function Bio() {
  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-20 relative">
      <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-10">
        <div className="size-24 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-4xl">💻</div>
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">Xubeibei's Dev Log</h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl leading-relaxed">
            Sensing the World // C++ & Algorithms.<br/>
            Sharing thoughts on intelligent perception, code, and life.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-xs font-mono text-gray-600">#C++</span>
            <span className="px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-xs font-mono text-gray-600">#Algorithms</span>
            <span className="px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-xs font-mono text-gray-600">#Perception</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 卡片：苹果风微阴影
function PostCard({ post }: { post: any }) {
  const titleProp = post.properties.Name || post.properties.title;
  const title = titleProp?.title?.[0]?.plain_text || "无标题文章";
  const date = post.created_time ? new Date(post.created_time).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }) : "";
  
  return (
    <Link href={`/post/${post.id}`}>
      <article className="group p-8 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 group-hover:text-blue-600 transition-colors">
          {title}
        </h2>
        <footer className="mt-10 flex items-center justify-between text-sm text-gray-400 font-mono">
          <span>{date}</span>
          <span className="font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0">阅读全文 →</span>
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
      <main className="container max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <div className="border-t border-gray-200 pt-16">
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