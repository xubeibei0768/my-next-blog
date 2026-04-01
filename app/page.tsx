// 连 import 都不需要了，直接丢掉官方 SDK！
import Link from "next/link";
async function getPosts() {
  // 用 Next.js 增强版的原生 fetch 直接发底层 HTTP 请求
  const res = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28', // 指定官方 API 版本
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
    // 魔法：开启 Next.js 的增量静态再生 (ISR)，每 10 秒自动在后台拿一次最新数据
    next: { revalidate: 10 } 
  });

  if (!res.ok) {
    throw new Error(`底层请求失败: ${res.statusText}`);
  }

  const data = await res.json();
  return data.results;
}

export default async function Home() {
  const posts = await getPosts();

  return (
    <main className="max-w-2xl mx-auto mt-20 p-6">
      <h1 className="text-4xl font-extrabold mb-10 text-gray-900">Xubeibei's Dev Log</h1>
      
      <div className="flex flex-col gap-4">
        {posts.map((post: any) => {
          // 提取文章标题
          const title = post.properties.title?.title?.[0]?.plain_text || "无标题文章";
          
          return (
            <Link href={`/post/${post.id}`} key={post.id}>
              <div className="p-6 border border-gray-200 rounded-xl hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer bg-white">
                <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
                <p className="text-gray-500 mt-2 text-sm">ID: {post.id}</p>
              </div>
            </Link>
          );
        })}
      </div>
      
      {posts.length === 0 && (
        <p className="text-gray-500 mt-10">你的 Notion 数据库里还没有状态为 Published 的文章哦。</p>
      )}
    </main>
  );
}