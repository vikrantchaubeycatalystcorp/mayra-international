"use client";

import { useState } from "react";
import { Globe } from "lucide-react";
import { useAdminCRUD } from "@/hooks/admin/useAdminCRUD";
import { AdminDataTable, type Column } from "@/components/admin/shared/AdminDataTable";
import { ConfirmDialog } from "@/components/admin/shared/ConfirmDialog";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";

interface SARow { id: string; name: string; flag: string; universities: number; avgCost: string; isFeatured: boolean; isActive: boolean; sortOrder: number; }

export default function AdminStudyAbroadPage() {
  const crud = useAdminCRUD<SARow>({ endpoint: "/api/admin/study-abroad" });
  const [deleteTarget, setDeleteTarget] = useState<SARow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return; setDeleting(true); await crud.deleteItem(deleteTarget.id); setDeleting(false); setDeleteTarget(null);
  };

  const columns: Column<SARow>[] = [
    { key: "name", label: "Country", sortable: true, render: (item) => (
      <div className="flex items-center gap-3">
        <span className="text-2xl">{item.flag}</span>
        <span className="text-sm font-semibold text-gray-900">{item.name}</span>
      </div>
    )},
    { key: "universities", label: "Universities", sortable: true, render: (item) => <span className="text-sm font-medium">{item.universities}</span> },
    { key: "avgCost", label: "Avg Cost", render: (item) => <span className="text-sm text-gray-600">{item.avgCost}</span> },
    { key: "sortOrder", label: "Order", sortable: true },
    { key: "isFeatured", label: "Featured", render: (item) => <StatusBadge status={item.isFeatured ? "featured" : "active"} label={item.isFeatured ? "Featured" : "Regular"} /> },
    { key: "isActive", label: "Active", render: (item) => (
      <label className="inline-flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={item.isActive} onChange={() => crud.toggleActive(item.id, !item.isActive)} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
        <StatusBadge status={item.isActive ? "active" : "inactive"} label={item.isActive ? "Active" : "Inactive"} />
      </label>
    )},
  ];

  return (
    <>
      <AdminDataTable title="Study Abroad" description="Manage study abroad destinations" columns={columns} data={crud.data} total={crud.total} page={crud.page} limit={crud.limit} loading={crud.loading} searchValue={crud.search} onSearchChange={crud.setSearch} onPageChange={crud.setPage} createHref="/admin/study-abroad/new" createLabel="Add Country" editHref={(item) => `/admin/study-abroad/${item.id}/edit`} onDelete={setDeleteTarget} emptyMessage="No countries found"
        filters={<select onChange={(e) => crud.setFilter("active", e.target.value)} className="admin-select"><option value="">All Status</option><option value="true">Active</option><option value="false">Inactive</option></select>}
      />
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Country" message={`Delete "${deleteTarget?.name}"?`} loading={deleting} />
    </>
  );
}
