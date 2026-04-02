export default function PublicLoading() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      {/* Hero skeleton */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-800 h-72 sm:h-80" />
      {/* Content skeleton */}
      <div className="container mx-auto py-10 px-4">
        <div className="h-8 bg-gray-200 rounded-lg w-64 mx-auto mb-6" />
        <div className="h-4 bg-gray-200 rounded w-96 mx-auto mb-10 max-w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-64 shadow-sm" />
          ))}
        </div>
      </div>
    </div>
  );
}
