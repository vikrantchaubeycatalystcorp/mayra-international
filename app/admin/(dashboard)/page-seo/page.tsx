"use client";

import { useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { useAdminCRUD } from "@/hooks/admin/useAdminCRUD";
import { AdminDataTable, type Column } from "@/components/admin/shared/AdminDataTable";
import { ConfirmDialog } from "@/components/admin/shared/ConfirmDialog";
import { X, Loader2, Plus } from "lucide-react";

interface PageSEO {
  id: string;
  pageSlug: string;
  title: string;
  description: string;
}

interface FormData {
  pageSlug: string;
  title: string;
  description: string;
}

const EMPTY_FORM: FormData = { pageSlug: "", title: "", description: "" };

export default function AdminPageSEOPage() {
  const crud = useAdminCRUD<PageSEO>({ endpoint: "/api/admin/page-seo" });
  const [deleteTarget, setDeleteTarget] = useState<PageSEO | null>(null);
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
  const openEdit = (item: PageSEO) => {
    setForm({ pageSlug: item.pageSlug, title: item.title, description: item.description || "" });
    setEditId(item.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const url = editId ? `/api/admin/page-seo/${editId}` : "/api/admin/page-seo";
      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: "success", text: editId ? "SEO entry updated." : "SEO entry created." });
        setShowForm(false);
        crud.refetch();
      } else { setMessage({ type: "error", text: json.error?.message || "Failed." }); }
    } catch { setMessage({ type: "error", text: "Network error." }); } finally { setSaving(false); }
  };

  const set = (key: keyof FormData, value: string) => setForm((prev) => ({ ...prev, [key]: value }));
  const inputClass = "w-full h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  const columns: Column<PageSEO>[] = [
    {
      key: "pageSlug",
      label: "Page Slug",
      sortable: true,
      render: (item) => <span className="text-xs font-mono font-medium text-teal-700 bg-teal-50 px-2 py-1 rounded">{item.pageSlug}</span>,
    },
    {
      key: "title",
      label: "SEO Title",
      sortable: true,
      render: (item) => (
        <div>
          <p className="text-sm font-semibold text-gray-900 truncate max-w-[300px]">{item.title}</p>
          <p className="text-xs text-gray-400">{item.title?.length || 0} chars</p>
        </div>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (item) => (
        <div>
          <p className="text-sm text-gray-500 truncate max-w-[300px]">{item.description || "—"}</p>
          <p className="text-xs text-gray-400">{item.description?.length || 0} chars</p>
        </div>
      ),
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
        title="Page SEO"
        description="Manage SEO metadata for all pages"
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
        emptyMessage="No SEO entries found"
      />

      <div className="flex justify-end -mt-[52px] mr-4 relative z-10 pointer-events-none">
        <button onClick={openCreate} className="pointer-events-auto inline-flex items-center gap-2 h-10 px-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98]">
          <Plus className="w-4 h-4" /> Add SEO Entry
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{editId ? "Edit SEO Entry" : "Add SEO Entry"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className={labelClass}>Page Slug</label><input className={inputClass} value={form.pageSlug} onChange={(e) => set("pageSlug", e.target.value)} required placeholder="e.g. /courses or /about" /></div>
              <div>
                <label className={labelClass}>SEO Title</label>
                <input className={inputClass} value={form.title} onChange={(e) => set("title", e.target.value)} required />
                <p className="text-xs text-gray-400 mt-1">{form.title.length}/60 characters recommended</p>
              </div>
              <div>
                <label className={labelClass}>Meta Description</label>
                <textarea className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all min-h-[80px]" value={form.description} onChange={(e) => set("description", e.target.value)} />
                <p className="text-xs text-gray-400 mt-1">{form.description.length}/160 characters recommended</p>
              </div>
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

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete SEO Entry" message={`Delete SEO for "${deleteTarget?.pageSlug}"?`} loading={deleting} />
    </>
  );
}
