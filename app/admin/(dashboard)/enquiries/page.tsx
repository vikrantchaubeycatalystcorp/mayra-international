"use client";

import { useState } from "react";
import { MessageSquare, User, Building2 } from "lucide-react";
import { useAdminCRUD } from "@/hooks/admin/useAdminCRUD";
import { AdminDataTable, type Column } from "@/components/admin/shared/AdminDataTable";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { formatDate } from "@/lib/utils";
import { ENQUIRY_STATUSES, PRIORITIES } from "@/types/admin";

interface EnquiryRow { id: string; studentName: string; email: string; collegeName: string; program: string | null; status: string; priority: string; createdAt: string; }

export default function AdminEnquiriesPage() {
  const crud = useAdminCRUD<EnquiryRow>({ endpoint: "/api/admin/enquiries" });

  const columns: Column<EnquiryRow>[] = [
    {
      key: "studentName", label: "Student",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-100 to-cyan-50 flex items-center justify-center"><User className="w-4 h-4 text-cyan-600" /></div>
          <div><p className="text-sm font-semibold text-gray-900">{item.studentName}</p><p className="text-xs text-gray-400">{item.email}</p></div>
        </div>
      ),
    },
    { key: "collegeName", label: "College", render: (item) => <span className="text-sm text-gray-700 flex items-center gap-1"><Building2 className="w-3 h-3 text-gray-400" />{item.collegeName}</span> },
    { key: "program", label: "Program", render: (item) => <span className="text-sm text-gray-600">{item.program || "—"}</span> },
    { key: "status", label: "Status", sortable: true, render: (item) => <StatusBadge status={item.status} /> },
    { key: "priority", label: "Priority", sortable: true, render: (item) => <StatusBadge status={item.priority} /> },
    { key: "createdAt", label: "Date", sortable: true, render: (item) => <span className="text-xs text-gray-500">{formatDate(item.createdAt)}</span> },
  ];

  return (
    <AdminDataTable title="Enquiries" description="Manage student enquiries" columns={columns} data={crud.data} total={crud.total} page={crud.page} limit={crud.limit} loading={crud.loading} searchValue={crud.search} onSearchChange={crud.setSearch} onPageChange={crud.setPage} onSort={crud.setSort} sortBy={crud.sortBy} sortOrder={crud.sortOrder} viewHref={(item) => `/admin/enquiries/${item.id}`} emptyMessage="No enquiries yet"
      filters={
        <div className="flex gap-2">
          <select onChange={(e) => crud.setFilter("status", e.target.value)} className="admin-select">
            <option value="">All Status</option>{ENQUIRY_STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </select>
          <select onChange={(e) => crud.setFilter("priority", e.target.value)} className="admin-select">
            <option value="">All Priority</option>{PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      }
    />
  );
}
