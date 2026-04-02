"use client";

import { useState } from "react";
import { GraduationCap, Star, MapPin, Download } from "lucide-react";
import { useAdminCRUD } from "@/hooks/admin/useAdminCRUD";
import { AdminDataTable, type Column } from "@/components/admin/shared/AdminDataTable";
import { ConfirmDialog } from "@/components/admin/shared/ConfirmDialog";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { formatCurrency } from "@/lib/utils";
import { STREAMS, COLLEGE_TYPES } from "@/types/admin";

interface CollegeRow {
  id: string;
  name: string;
  city: string;
  state: string;
  type: string;
  nirfRank: number | null;
  rating: number;
  feesMin: number;
  feesMax: number;
  isFeatured: boolean;
  isActive: boolean;
  streams: string[];
}

export default function AdminCollegesPage() {
  const crud = useAdminCRUD<CollegeRow>({ endpoint: "/api/admin/colleges" });
  const [deleteTarget, setDeleteTarget] = useState<CollegeRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await crud.deleteItem(deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
  };

  const columns: Column<CollegeRow>[] = [
    {
      key: "name",
      label: "College",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center shrink-0 border border-blue-100/50">
            <GraduationCap className="w-4 h-4 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate max-w-[250px]">{item.name}</p>
            <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />
              {item.city}, {item.state}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      sortable: true,
      render: (item) => (
        <StatusBadge status={item.type === "Government" ? "active" : "draft"} label={item.type} showDot={false} />
      ),
    },
    {
      key: "nirfRank",
      label: "NIRF",
      sortable: true,
      render: (item) => (
        <span className="text-sm font-semibold text-gray-700">
          {item.nirfRank ? (
            <span className="inline-flex items-center gap-1">
              <span className="text-[10px] text-gray-400">#</span>
              {item.nirfRank}
            </span>
          ) : (
            <span className="text-gray-300">&mdash;</span>
          )}
        </span>
      ),
    },
    {
      key: "rating",
      label: "Rating",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-sm font-semibold text-gray-700">{item.rating.toFixed(1)}</span>
        </div>
      ),
    },
    {
      key: "feesMin",
      label: "Fees Range",
      render: (item) => (
        <span className="text-xs font-medium text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">
          {formatCurrency(item.feesMin)} - {formatCurrency(item.feesMax)}
        </span>
      ),
    },
    {
      key: "isFeatured",
      label: "Featured",
      render: (item) => (
        <StatusBadge
          status={item.isFeatured ? "featured" : "draft"}
          label={item.isFeatured ? "Featured" : "Regular"}
          pulse={item.isFeatured}
        />
      ),
    },
    {
      key: "isActive",
      label: "Status",
      render: (item) => (
        <label className="inline-flex items-center gap-2.5 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={item.isActive}
              onChange={() => crud.toggleActive(item.id, !item.isActive)}
              className="sr-only peer"
            />
            <div className="w-8 h-[18px] bg-gray-200 peer-checked:bg-blue-600 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-[14px] after:w-[14px] after:transition-all peer-checked:after:translate-x-[14px] shadow-inner" />
          </div>
          <StatusBadge
            status={item.isActive ? "active" : "inactive"}
            label={item.isActive ? "Active" : "Inactive"}
            pulse={item.isActive}
          />
        </label>
      ),
    },
  ];

  return (
    <>
      <AdminDataTable
        title="Colleges"
        description="Manage all colleges listed on the portal"
        columns={columns}
        data={crud.data}
        total={crud.total}
        page={crud.page}
        limit={crud.limit}
        loading={crud.loading}
        searchValue={crud.search}
        onSearchChange={crud.setSearch}
        onPageChange={crud.setPage}
        onSort={crud.setSort}
        sortBy={crud.sortBy}
        sortOrder={crud.sortOrder}
        createHref="/admin/colleges/new"
        createLabel="Add College"
        editHref={(item) => `/admin/colleges/${item.id}/edit`}
        onDelete={setDeleteTarget}
        onRefresh={crud.refetch}
        emptyMessage="No colleges found"
        filters={
          <>
            <select
              onChange={(e) => crud.setFilter("stream", e.target.value)}
              className="admin-select"
            >
              <option value="">All Streams</option>
              {STREAMS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              onChange={(e) => crud.setFilter("type", e.target.value)}
              className="admin-select"
            >
              <option value="">All Types</option>
              {COLLEGE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select
              onChange={(e) => crud.setFilter("active", e.target.value)}
              className="admin-select"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </>
        }
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete College"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This will permanently remove it from all public listings and cannot be undone.`}
        loading={deleting}
        variant="danger"
      />
    </>
  );
}
