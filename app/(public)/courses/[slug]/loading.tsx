export default function CourseDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-800 h-56" />
      <div className="container mx-auto py-8 px-4">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="h-7 bg-gray-200 rounded w-72 mb-3" />
          <div className="h-4 bg-gray-200 rounded w-full mb-2" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl h-64 shadow-sm" />
          </div>
          <div className="bg-white rounded-2xl h-64 shadow-sm" />
        </div>
      </div>
    </div>
  );
}
