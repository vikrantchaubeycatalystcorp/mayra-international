"use client";

import { useState } from "react";
import { Mail, Calendar } from "lucide-react";
import { useAdminCRUD } from "@/hooks/admin/useAdminCRUD";
import { AdminDataTable, type Column } from "@/components/admin/shared/AdminDataTable";
import { ConfirmDialog } from "@/components/admin/shared/ConfirmDialog";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { formatDate } from "@/lib/utils";

interface SubRow { id: string; email: string; name: string | null; isActive: boolean; subscribedAt: string; source: string; }

export default function AdminNewsletterPage() {
  const crud = useAdminCRUD<SubRow>({ endpoint: "/api/admin/newsletter" });
  const [deleteTarget, setDeleteTarget] = useState<SubRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return; setDeleting(true); await crud.deleteItem(deleteTarget.id); setDeleting(false); setDeleteTarget(null);
  };

  const columns: Column<SubRow>[] = [
    {
      key: "email", label: "Subscriber",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center"><Mail className="w-4 h-4 text-orange-600" /></div>
          <div><p className="text-sm font-semibold text-gray-900">{item.email}</p>{item.name && <p className="text-xs text-gray-400">{item.name}</p>}</div>
        </div>
      ),
    },
    { key: "source", label: "Source", render: (item) => <span className="text-xs font-medium bg-gray-50 px-2 py-1 rounded capitalize">{item.source}</span> },
    { key: "subscribedAt", label: "Subscribed", sortable: true, render: (item) => <span className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(item.subscribedAt)}</span> },
    { key: "isActive", label: "Status", render: (item) => <StatusBadge status={item.isActive ? "active" : "inactive"} label={item.isActive ? "Active" : "Unsubscribed"} /> },
  ];

  return (
    <>
      <AdminDataTable title="Newsletter Subscribers" description="Manage email subscribers" columns={columns} data={crud.data} total={crud.total} page={crud.page} limit={crud.limit} loading={crud.loading} searchValue={crud.search} onSearchChange={crud.setSearch} onPageChange={crud.setPage} onDelete={setDeleteTarget} emptyMessage="No subscribers yet"
        filters={<select onChange={(e) => crud.setFilter("active", e.target.value)} className="admin-select"><option value="">All</option><option value="true">Active</option><option value="false">Unsubscribed</option></select>}
      />
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Remove Subscriber" message={`Remove "${deleteTarget?.email}" from newsletter?`} loading={deleting} />
    </>
  );
}
