export default function CollegesLoading() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-800 h-48" />
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters sidebar skeleton */}
          <div className="w-full lg:w-64 shrink-0">
            <div className="bg-white rounded-2xl h-96 shadow-sm" />
          </div>
          {/* Cards grid skeleton */}
          <div className="flex-1 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-40 shadow-sm" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
