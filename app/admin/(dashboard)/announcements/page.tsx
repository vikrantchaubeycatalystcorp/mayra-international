"use client";

import { useState } from "react";
import { Megaphone } from "lucide-react";
import { useAdminCRUD } from "@/hooks/admin/useAdminCRUD";
import { AdminDataTable, type Column } from "@/components/admin/shared/AdminDataTable";
import { ConfirmDialog } from "@/components/admin/shared/ConfirmDialog";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { X, Loader2, Plus } from "lucide-react";

interface Announcement {
  id: string;
  message: string;
  type: string;
  linkText: string;
  linkHref: string;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
}

interface FormData {
  message: string;
  type: string;
  linkText: string;
  linkHref: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

const EMPTY_FORM: FormData = { message: "", type: "INFO", linkText: "", linkHref: "", isActive: true, startDate: "", endDate: "" };

export default function AdminAnnouncementsPage() {
  const crud = useAdminCRUD<Announcement>({ endpoint: "/api/admin/announcements" });
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);
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
  const openEdit = (item: Announcement) => {
    setForm({
      message: item.message,
      type: item.type,
      linkText: item.linkText || "",
      linkHref: item.linkHref || "",
      isActive: item.isActive,
      startDate: item.startDate ? item.startDate.slice(0, 10) : "",
      endDate: item.endDate ? item.endDate.slice(0, 10) : "",
    });
    setEditId(item.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        ...form,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
      };
      const url = editId ? `/api/admin/announcements/${editId}` : "/api/admin/announcements";
      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: "success", text: editId ? "Announcement updated." : "Announcement created." });
        setShowForm(false);
        crud.refetch();
      } else { setMessage({ type: "error", text: json.error?.message || "Failed." }); }
    } catch { setMessage({ type: "error", text: "Network error." }); } finally { setSaving(false); }
  };

  const set = (key: keyof FormData, value: string | boolean) => setForm((prev) => ({ ...prev, [key]: value }));
  const inputClass = "w-full h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  const TYPE_COLORS: Record<string, string> = {
    INFO: "bg-blue-50 text-blue-700",
    WARNING: "bg-yellow-50 text-yellow-700",
    SUCCESS: "bg-green-50 text-green-700",
    ERROR: "bg-red-50 text-red-700",
  };

  const columns: Column<Announcement>[] = [
    {
      key: "message",
      label: "Message",
      render: (item) => <p className="text-sm text-gray-900 truncate max-w-[300px]">{item.message}</p>,
    },
    {
      key: "type",
      label: "Type",
      sortable: true,
      render: (item) => <span className={`text-xs font-semibold px-2 py-1 rounded ${TYPE_COLORS[item.type] || "bg-gray-50 text-gray-700"}`}>{item.type}</span>,
    },
    {
      key: "linkText",
      label: "Link",
      render: (item) => item.linkText ? (
        <div>
          <p className="text-sm text-blue-600 font-medium">{item.linkText}</p>
          <p className="text-xs text-gray-400 truncate max-w-[150px]">{item.linkHref}</p>
        </div>
      ) : <span className="text-sm text-gray-400">—</span>,
    },
    {
      key: "startDate",
      label: "Schedule",
      render: (item) => (
        <div className="text-xs text-gray-500">
          {item.startDate ? <span>From: {new Date(item.startDate).toLocaleDateString()}</span> : null}
          {item.endDate ? <span className="block">To: {new Date(item.endDate).toLocaleDateString()}</span> : null}
          {!item.startDate && !item.endDate ? "Always" : null}
        </div>
      ),
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
        title="Announcements"
        description="Manage site-wide announcement banners"
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
        emptyMessage="No announcements found"
      />

      <div className="flex justify-end -mt-[52px] mr-4 relative z-10 pointer-events-none">
        <button onClick={openCreate} className="pointer-events-auto inline-flex items-center gap-2 h-10 px-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98]">
          <Plus className="w-4 h-4" /> Add Announcement
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{editId ? "Edit Announcement" : "Add Announcement"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className={labelClass}>Message</label><textarea className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all min-h-[60px]" value={form.message} onChange={(e) => set("message", e.target.value)} required /></div>
              <div>
                <label className={labelClass}>Type</label>
                <select className={inputClass} value={form.type} onChange={(e) => set("type", e.target.value)}>
                  <option value="INFO">Info</option>
                  <option value="WARNING">Warning</option>
                  <option value="SUCCESS">Success</option>
                  <option value="ERROR">Error</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>Link Text</label><input className={inputClass} value={form.linkText} onChange={(e) => set("linkText", e.target.value)} placeholder="Optional" /></div>
                <div><label className={labelClass}>Link Href</label><input className={inputClass} value={form.linkHref} onChange={(e) => set("linkHref", e.target.value)} placeholder="Optional" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>Start Date</label><input className={inputClass} type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} /></div>
                <div><label className={labelClass}>End Date</label><input className={inputClass} type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} /></div>
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

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Announcement" message={`Delete this announcement?`} loading={deleting} />
    </>
  );
}
