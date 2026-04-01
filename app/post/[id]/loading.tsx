export default function Loading() {
  return (
    <div className="min-h-screen">
      <main className="container max-w-3xl mx-auto px-4 sm:px-6 py-16 md:py-24 animate-pulse">
        {/* 返回按钮占位 */}
        <div className="h-6 bg-gray-200 rounded w-24 mb-12"></div>
        {/* 标题占位 */}
        <div className="h-10 bg-gray-200 rounded w-3/4 mb-8"></div>
        {/* 正文占位 */}
        <div className="space-y-4 mt-8">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </main>
    </div>
  );
}