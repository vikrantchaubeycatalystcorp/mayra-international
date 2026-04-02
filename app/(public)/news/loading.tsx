export default function NewsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-800 h-48" />
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-36 shadow-sm" />
            ))}
          </div>
          <div className="bg-white rounded-2xl h-80 shadow-sm" />
        </div>
      </div>
    </div>
  );
}
