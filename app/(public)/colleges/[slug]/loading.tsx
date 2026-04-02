export default function CollegeDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-800 h-56" />
      <div className="container mx-auto py-8 px-4">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex gap-4 items-start mb-4">
            <div className="h-16 w-16 bg-gray-200 rounded-xl" />
            <div className="flex-1">
              <div className="h-7 bg-gray-200 rounded w-72 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-48" />
            </div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl h-64 shadow-sm" />
            <div className="bg-white rounded-2xl h-48 shadow-sm" />
          </div>
          <div className="bg-white rounded-2xl h-80 shadow-sm" />
        </div>
      </div>
    </div>
  );
}
