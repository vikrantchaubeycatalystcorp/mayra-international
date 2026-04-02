"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { useAdminCRUD } from "@/hooks/admin/useAdminCRUD";
import { AdminDataTable, type Column } from "@/components/admin/shared/AdminDataTable";
import { ConfirmDialog } from "@/components/admin/shared/ConfirmDialog";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { X, Loader2, Plus } from "lucide-react";

interface WorldCollegeStat {
  id: string;
  countryCode: string;
  countryName: string;
  collegeCount: number;
  topCity: string;
  flagEmoji: string;
  isActive: boolean;
}

interface FormData {
  countryCode: string;
  countryName: string;
  collegeCount: number;
  topCity: string;
  flagEmoji: string;
  isActive: boolean;
}

const EMPTY_FORM: FormData = { countryCode: "", countryName: "", collegeCount: 0, topCity: "", flagEmoji: "", isActive: true };

export default function AdminWorldCollegeStatsPage() {
  const crud = useAdminCRUD<WorldCollegeStat>({ endpoint: "/api/admin/world-college-stats" });
  const [deleteTarget, setDeleteTarget] = useState<WorldCollegeStat | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await crud.deleteItem(deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
  };

  const openCreate = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true); };
  const openEdit = (item: WorldCollegeStat) => {
    setForm({ countryCode: item.countryCode, countryName: item.countryName, collegeCount: item.collegeCount, topCity: item.topCity || "", flagEmoji: item.flagEmoji || "", isActive: item.isActive });
    setEditId(item.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const url = editId ? `/api/admin/world-college-stats/${editId}` : "/api/admin/world-college-stats";
      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: "success", text: editId ? "Entry updated." : "Entry created." });
        setShowForm(false);
        crud.refetch();
      } else { setMessage({ type: "error", text: json.error?.message || "Failed." }); }
    } catch { setMessage({ type: "error", text: "Network error." }); } finally { setSaving(false); }
  };

  const set = (key: keyof FormData, value: string | number | boolean) => setForm((prev) => ({ ...prev, [key]: value }));
  const inputClass = "w-full h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  const columns: Column<WorldCollegeStat>[] = [
    {
      key: "countryName",
      label: "Country",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <span className="text-lg">{item.flagEmoji || "🌍"}</span>
          <div>
            <p className="text-sm font-semibold text-gray-900">{item.countryName}</p>
            <p className="text-xs text-gray-400">{item.countryCode}</p>
          </div>
        </div>
      ),
    },
    {
      key: "collegeCount",
      label: "Colleges",
      sortable: true,
      render: (item) => <span className="text-sm font-bold text-blue-600">{item.collegeCount.toLocaleString()}</span>,
    },
    {
      key: "topCity",
      label: "Top City",
      render: (item) => <span className="text-sm text-gray-600">{item.topCity || "—"}</span>,
    },
    {
      key: "isActive",
      label: "Status",
      render: (item) => <StatusBadge status={item.isActive ? "active" : "inactive"} label={item.isActive ? "Active" : "Inactive"} />,
    },
  ];

  return (
    <>
      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      <AdminDataTable
        title="World College Stats"
        description="Manage country-wise college statistics"
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
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        emptyMessage="No world college stats found"
      />

      <div className="flex justify-end -mt-[52px] mr-4 relative z-10 pointer-events-none">
        <button onClick={openCreate} className="pointer-events-auto inline-flex items-center gap-2 h-10 px-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98]">
          <Plus className="w-4 h-4" /> Add Country
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{editId ? "Edit Country" : "Add Country"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>Country Code</label><input className={inputClass} value={form.countryCode} onChange={(e) => set("countryCode", e.target.value.toUpperCase())} required placeholder="US" maxLength={2} /></div>
                <div><label className={labelClass}>Flag Emoji</label><input className={inputClass} value={form.flagEmoji} onChange={(e) => set("flagEmoji", e.target.value)} placeholder="🇺🇸" /></div>
              </div>
              <div><label className={labelClass}>Country Name</label><input className={inputClass} value={form.countryName} onChange={(e) => set("countryName", e.target.value)} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>College Count</label><input className={inputClass} type="number" value={form.collegeCount} onChange={(e) => set("collegeCount", parseInt(e.target.value) || 0)} required /></div>
                <div><label className={labelClass}>Top City</label><input className={inputClass} value={form.topCity} onChange={(e) => set("topCity", e.target.value)} /></div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="rounded border-gray-300" /> Active
              </label>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowForm(false)} className="h-9 px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-60 flex items-center gap-2">
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}{editId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Country" message={`Delete "${deleteTarget?.countryName}"?`} loading={deleting} />
    </>
  );
}
