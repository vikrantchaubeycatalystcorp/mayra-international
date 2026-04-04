"use client";

import { useState } from "react";
import { Newspaper, Eye, Calendar } from "lucide-react";
import { useAdminCRUD } from "@/hooks/admin/useAdminCRUD";
import { AdminDataTable, type Column } from "@/components/admin/shared/AdminDataTable";
import { ConfirmDialog } from "@/components/admin/shared/ConfirmDialog";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { truncate, formatDate } from "@/lib/utils";
import { NEWS_CATEGORIES } from "@/types/admin";

interface NewsRow { id: string; title: string; category: string; author: string; publishedAt: string; imageUrl?: string | null; isLive: boolean; isActive: boolean; views: number | null; tags: string[]; }

export default function AdminNewsPage() {
  const crud = useAdminCRUD<NewsRow>({ endpoint: "/api/admin/news" });
  const [deleteTarget, setDeleteTarget] = useState<NewsRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return; setDeleting(true); await crud.deleteItem(deleteTarget.id); setDeleting(false); setDeleteTarget(null);
  };

  const columns: Column<NewsRow>[] = [
    {
      key: "title", label: "Article", sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.imageUrl} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center flex-shrink-0"><Newspaper className="w-4 h-4 text-amber-600" /></div>
          )}
          <div><p className="text-sm font-semibold text-gray-900 max-w-[280px] truncate">{item.title}</p><p className="text-xs text-gray-400">{item.author}</p></div>
        </div>
      ),
    },
    { key: "category", label: "Category", sortable: true, render: (item) => <span className="text-xs font-medium bg-gray-50 px-2 py-1 rounded">{item.category}</span> },
    { key: "publishedAt", label: "Published", sortable: true, render: (item) => <span className="text-sm text-gray-600 flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(item.publishedAt)}</span> },
    { key: "views", label: "Views", sortable: true, render: (item) => <span className="text-sm text-gray-600 flex items-center gap-1"><Eye className="w-3 h-3" />{item.views ?? 0}</span> },
    { key: "isLive", label: "Publish", render: (item) => <StatusBadge status={item.isLive ? "live" : "draft"} label={item.isLive ? "Live" : "Draft"} /> },
    { key: "isActive", label: "Active", render: (item) => (
      <label className="inline-flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={item.isActive} onChange={() => crud.toggleActive(item.id, !item.isActive)} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
        <StatusBadge status={item.isActive ? "active" : "inactive"} label={item.isActive ? "Active" : "Inactive"} />
      </label>
    )},
  ];

  return (
    <>
      <AdminDataTable title="News & Articles" description="Manage articles and news content" columns={columns} data={crud.data} total={crud.total} page={crud.page} limit={crud.limit} loading={crud.loading} searchValue={crud.search} onSearchChange={crud.setSearch} onPageChange={crud.setPage} onSort={crud.setSort} sortBy={crud.sortBy} sortOrder={crud.sortOrder} createHref="/admin/news/new" createLabel="New Article" editHref={(item) => `/admin/news/${item.id}/edit`} onDelete={setDeleteTarget} emptyMessage="No articles found"
        filters={<div className="flex gap-2"><select onChange={(e) => crud.setFilter("category", e.target.value)} className="admin-select"><option value="">All Categories</option>{NEWS_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select><select onChange={(e) => crud.setFilter("active", e.target.value)} className="admin-select"><option value="">All Status</option><option value="true">Active</option><option value="false">Inactive</option></select></div>}
      />
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Article" message={`Delete "${truncate(deleteTarget?.title || "", 50)}"?`} loading={deleting} />
    </>
  );
}
