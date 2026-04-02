"use client";

import { Users, Mail, Target } from "lucide-react";
import { useAdminCRUD } from "@/hooks/admin/useAdminCRUD";
import { AdminDataTable, type Column } from "@/components/admin/shared/AdminDataTable";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { formatDate } from "@/lib/utils";

interface UserRow { id: string; name: string; email: string; provider: string; goal: string | null; isActive: boolean; isVerified: boolean; savedColleges: string[]; lastLoginAt: string | null; createdAt: string; }

export default function AdminUsersPage() {
  const crud = useAdminCRUD<UserRow>({ endpoint: "/api/admin/users" });

  const columns: Column<UserRow>[] = [
    {
      key: "name", label: "User", sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-pink-100 to-pink-50 flex items-center justify-center"><Users className="w-4 h-4 text-pink-600" /></div>
          <div><p className="text-sm font-semibold text-gray-900">{item.name}</p><p className="text-xs text-gray-400 flex items-center gap-1"><Mail className="w-3 h-3" />{item.email}</p></div>
        </div>
      ),
    },
    { key: "provider", label: "Provider", render: (item) => <span className="text-xs font-medium bg-gray-50 px-2 py-1 rounded capitalize">{item.provider}</span> },
    { key: "goal", label: "Goal", render: (item) => <span className="text-sm text-gray-600 flex items-center gap-1">{item.goal ? <><Target className="w-3 h-3 text-gray-400" />{item.goal}</> : "—"}</span> },
    { key: "savedColleges", label: "Saved", render: (item) => <span className="text-sm font-medium">{item.savedColleges?.length || 0}</span> },
    { key: "isActive", label: "Status", render: (item) => <StatusBadge status={item.isActive ? "active" : "inactive"} label={item.isActive ? "Active" : "Inactive"} /> },
    { key: "createdAt", label: "Joined", sortable: true, render: (item) => <span className="text-xs text-gray-500">{formatDate(item.createdAt)}</span> },
  ];

  return (
    <AdminDataTable title="Users" description="Manage registered users" columns={columns} data={crud.data} total={crud.total} page={crud.page} limit={crud.limit} loading={crud.loading} searchValue={crud.search} onSearchChange={crud.setSearch} onPageChange={crud.setPage} viewHref={(item) => `/admin/users/${item.id}`} emptyMessage="No users registered yet" />
  );
}
