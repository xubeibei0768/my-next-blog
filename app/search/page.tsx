import Link from "next/link";

// 1. 抓取所有文章
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

// 2. 复用首页的文章卡片组件
function PostCard({ post }: { post: any }) {
  const props = post.properties;
  const titleProp = props.Name || props.title;
  const title = titleProp?.title?.[0]?.plain_text || "无标题文章";
  const date = post.created_time ? new Date(post.created_time).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }) : "";
  
  const categoryField = props.Category || props.category || props['分类'] || props['类别'];
  const category = categoryField?.select?.name;
  const tagsField = props.Tags || props.tags || props['标签'];
  const tags = tagsField?.multi_select || [];

  return (
    <Link href={`/post/${post.id}`} className="block h-full">
      <article className="group p-8 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col justify-between relative z-10">
        <div>
          {category && (
            <span className="inline-block px-3 py-1 mb-4 rounded-full bg-blue-50 text-blue-600 text-[11px] font-bold tracking-wider uppercase">
              {category}
            </span>
          )}
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 group-hover:text-blue-600 transition-colors">
            {title}
          </h2>
          {tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.map((tag: any) => (
                <span key={tag.id} className="px-2 py-0.5 rounded bg-gray-50 border border-gray-100 text-gray-400 text-xs font-mono">
                  #{tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
        <footer className="mt-10 flex items-center justify-between text-sm text-gray-400 font-mono">
          <span>{date}</span>
          <span className="font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0">阅读全文 →</span>
        </footer>
      </article>
    </Link>
  );
}

// 3. 搜索页主体逻辑
export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string, c?: string }> }) {
  // 解析 URL 里的搜索词 (q) 和分类词 (c)
  const params = await searchParams;
  const q = params?.q || '';
  const c = params?.c || '';
  
  const posts = await getPosts();

  // 自动从所有文章中提取出不重复的“分类”列表
  const categories = Array.from(new Set(posts.map((p: any) => {
    const cat = p.properties.Category || p.properties.category || p.properties['分类'] || p.properties['类别'];
    return cat?.select?.name;
  }).filter(Boolean))) as string[];

  // 核心过滤逻辑：标题模糊匹配 + 分类精准匹配
  const filteredPosts = posts.filter((post: any) => {
    const titleProp = post.properties.Name || post.properties.title;
    const title = (titleProp?.title?.[0]?.plain_text || "").toLowerCase();
    const catField = post.properties.Category || post.properties.category || post.properties['分类'] || post.properties['类别'];
    const category = catField?.select?.name || '';

    const matchQ = q ? title.includes(q.toLowerCase()) : true;
    const matchC = c ? category === c : true;
    return matchQ && matchC;
  });

  return (
    <div className="min-h-screen relative bg-[#fafafa]">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-mono text-xl font-bold tracking-tight text-gray-900 group">
            <div className="size-8 rounded bg-gray-900 text-white flex items-center justify-center group-hover:bg-blue-600 transition-colors">X</div>
            <span>Dev Log</span>
          </Link>
          <nav className="flex items-center gap-6 md:gap-8 text-sm font-medium text-gray-500">
            <Link href="/" className="hover:text-blue-600 transition-colors">首页</Link>
            <Link href="/search" className="text-gray-900 font-bold">分类</Link>
            <Link href="/search" className="text-gray-900 font-bold flex items-center gap-1.5 cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              搜索
            </Link>
          </nav>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-20 relative z-10">
        
        {/* Apple 风格的超大搜索框 */}
        <form action="/search" className="relative mb-12 max-w-3xl mx-auto">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="搜索文章标题..."
            className="w-full h-16 pl-14 pr-6 text-lg rounded-2xl border border-gray-200 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all bg-white"
            autoFocus
          />
          <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          {/* 如果当前有分类过滤，搜索时保持该分类 */}
          {c && <input type="hidden" name="c" value={c} />} 
        </form>

        {/* 动态提取的分类标签栏 */}
        {categories.length > 0 && (
          <div className="mb-16 flex flex-col items-center">
            <h3 className="text-sm font-bold text-gray-400 mb-6 uppercase tracking-wider">探索分类</h3>
            <div className="flex flex-wrap justify-center gap-3">
              <Link 
                href={`/search${q ? `?q=${q}` : ''}`} 
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${!c ? 'bg-gray-900 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                全部
              </Link>
              {categories.map(cat => (
                <Link 
                  key={cat} 
                  href={`/search?c=${cat}${q ? `&q=${q}` : ''}`} 
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${c === cat ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 搜索结果展示 */}
        <div className="border-t border-gray-200 pt-16">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {q || c ? '检索结果' : '所有文章'}
            </h2>
            <span className="text-gray-400 font-mono text-sm">共找到 {filteredPosts.length} 篇</span>
          </div>
          
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8">
              {filteredPosts.map((post: any) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="py-32 text-center">
              <div className="text-6xl mb-6">📭</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">没有找到相关文章</h3>
              <p className="text-gray-500">换个关键词或者分类试试吧</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}