"use client";

import { useState } from "react";
import { FileText, Calendar, Users } from "lucide-react";
import { useAdminCRUD } from "@/hooks/admin/useAdminCRUD";
import { AdminDataTable, type Column } from "@/components/admin/shared/AdminDataTable";
import { ConfirmDialog } from "@/components/admin/shared/ConfirmDialog";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { STREAMS, COURSE_LEVELS } from "@/types/admin";

interface ExamRow { id: string; name: string; fullName: string; conductingBody: string; level: string; streams: string[]; mode: string; examDate: string | null; applicationFeeGeneral: number; isFeatured: boolean; isActive: boolean; }

export default function AdminExamsPage() {
  const crud = useAdminCRUD<ExamRow>({ endpoint: "/api/admin/exams" });
  const [deleteTarget, setDeleteTarget] = useState<ExamRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return; setDeleting(true); await crud.deleteItem(deleteTarget.id); setDeleting(false); setDeleteTarget(null);
  };

  const columns: Column<ExamRow>[] = [
    {
      key: "name", label: "Exam", sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-100 to-violet-50 flex items-center justify-center"><FileText className="w-4 h-4 text-violet-600" /></div>
          <div><p className="text-sm font-semibold text-gray-900">{item.name}</p><p className="text-xs text-gray-400 truncate max-w-[200px]">{item.fullName}</p></div>
        </div>
      ),
    },
    { key: "conductingBody", label: "Conducting Body", render: (item) => <span className="text-sm text-gray-600">{item.conductingBody}</span> },
    { key: "level", label: "Level", sortable: true, render: (item) => <span className="text-xs font-medium bg-gray-50 px-2 py-1 rounded">{item.level}</span> },
    { key: "mode", label: "Mode", render: (item) => <span className="text-sm text-gray-600">{item.mode}</span> },
    { key: "examDate", label: "Exam Date", render: (item) => <span className="text-sm text-gray-600 flex items-center gap-1"><Calendar className="w-3 h-3" />{item.examDate || "TBA"}</span> },
    { key: "applicationFeeGeneral", label: "Fee", render: (item) => <span className="text-sm font-medium">Rs.{item.applicationFeeGeneral}</span> },
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
      <AdminDataTable title="Exams" description="Manage entrance exams" columns={columns} data={crud.data} total={crud.total} page={crud.page} limit={crud.limit} loading={crud.loading} searchValue={crud.search} onSearchChange={crud.setSearch} onPageChange={crud.setPage} onSort={crud.setSort} sortBy={crud.sortBy} sortOrder={crud.sortOrder} createHref="/admin/exams/new" createLabel="Add Exam" editHref={(item) => `/admin/exams/${item.id}/edit`} onDelete={setDeleteTarget} emptyMessage="No exams found"
        filters={<div className="flex gap-2"><select onChange={(e) => crud.setFilter("stream", e.target.value)} className="admin-select"><option value="">All Streams</option>{STREAMS.map((s) => <option key={s} value={s}>{s}</option>)}</select><select onChange={(e) => crud.setFilter("level", e.target.value)} className="admin-select"><option value="">All Levels</option>{COURSE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}</select><select onChange={(e) => crud.setFilter("active", e.target.value)} className="admin-select"><option value="">All Status</option><option value="true">Active</option><option value="false">Inactive</option></select></div>}
      />
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Exam" message={`Delete "${deleteTarget?.name}"?`} loading={deleting} />
    </>
  );
}
