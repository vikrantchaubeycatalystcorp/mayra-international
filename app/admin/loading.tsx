export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-gray-100 animate-pulse flex">
      <div className="w-64 bg-white border-r border-gray-200 hidden lg:block" />
      <div className="flex-1 p-6">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6" />
        <div className="bg-white rounded-xl h-96 shadow-sm" />
      </div>
    </div>
  );
}
