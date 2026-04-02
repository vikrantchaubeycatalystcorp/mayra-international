export default function ExamsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-800 h-48" />
      <div className="container mx-auto py-8 px-4">
        <div className="h-10 bg-gray-200 rounded-xl w-80 max-w-full mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-52 shadow-sm" />
          ))}
        </div>
      </div>
    </div>
  );
}
