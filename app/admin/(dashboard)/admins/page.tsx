"use client";

import { Shield, Calendar } from "lucide-react";
import { useAdminCRUD } from "@/hooks/admin/useAdminCRUD";
import { AdminDataTable, type Column } from "@/components/admin/shared/AdminDataTable";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { formatDate } from "@/lib/utils";

interface AdminRow { id: string; name: string; email: string; role: string; isActive: boolean; lastLoginAt: string | null; createdAt: string; }

export default function AdminUsersListPage() {
  const crud = useAdminCRUD<AdminRow>({ endpoint: "/api/admin/admins" });

  const columns: Column<AdminRow>[] = [
    {
      key: "name", label: "Admin",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center"><Shield className="w-4 h-4 text-indigo-600" /></div>
          <div><p className="text-sm font-semibold text-gray-900">{item.name}</p><p className="text-xs text-gray-400">{item.email}</p></div>
        </div>
      ),
    },
    { key: "role", label: "Role", render: (item) => <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-1 rounded">{item.role.replace("_", " ")}</span> },
    { key: "isActive", label: "Status", render: (item) => <StatusBadge status={item.isActive ? "active" : "inactive"} label={item.isActive ? "Active" : "Inactive"} /> },
    { key: "lastLoginAt", label: "Last Login", render: (item) => <span className="text-xs text-gray-500">{item.lastLoginAt ? formatDate(item.lastLoginAt) : "Never"}</span> },
    { key: "createdAt", label: "Created", render: (item) => <span className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(item.createdAt)}</span> },
  ];

  return (
    <AdminDataTable title="Admin Users" description="Manage admin accounts" columns={columns} data={crud.data} total={crud.total} page={crud.page} limit={crud.limit} loading={crud.loading} searchValue={crud.search} onSearchChange={crud.setSearch} onPageChange={crud.setPage} createHref="/admin/admins/register" createLabel="Register Admin" emptyMessage="No admins found" />
  );
}
