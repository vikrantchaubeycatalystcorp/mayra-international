"use client";

import { useState, useEffect, useCallback } from "react";
import { BadgeCheck, Plus, Edit3, Trash2, X, Loader2, Search } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/shared/ConfirmDialog";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";

interface TrustBadge {
  id: string;
  label: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
}

interface FormData {
  label: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
}

const EMPTY_FORM: FormData = { label: "", icon: "", sortOrder: 0, isActive: true };

export default function AdminTrustBadgesPage() {
  const [items, setItems] = useState<TrustBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<TrustBadge | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/trust-badges", { credentials: "include" });
      const json = await res.json();
      if (json.success) setItems(json.data || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/trust-badges/${deleteTarget.id}`, { method: "DELETE", credentials: "include" });
      await fetchData();
    } finally { setDeleting(false); setDeleteTarget(null); }
  };

  const openCreate = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true); };
  const openEdit = (item: TrustBadge) => {
    setForm({ label: item.label, icon: item.icon || "", sortOrder: item.sortOrder, isActive: item.isActive });
    setEditId(item.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const url = editId ? `/api/admin/trust-badges/${editId}` : "/api/admin/trust-badges";
      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: "success", text: editId ? "Badge updated." : "Badge created." });
        setShowForm(false);
        fetchData();
      } else { setMessage({ type: "error", text: json.error?.message || "Failed." }); }
    } catch { setMessage({ type: "error", text: "Network error." }); } finally { setSaving(false); }
  };

  const set = (key: keyof FormData, value: string | number | boolean) => setForm((prev) => ({ ...prev, [key]: value }));
  const inputClass = "w-full h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
            <BadgeCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Trust Badges</h1>
            <p className="text-sm text-gray-500">Manage trust indicators shown on the site</p>
          </div>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 h-10 px-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98]">
          <Plus className="w-4 h-4" /> Add Badge
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center"><Loader2 className="w-6 h-6 text-blue-500 animate-spin mx-auto" /></div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <Search className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No trust badges found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {items.sort((a, b) => a.sortOrder - b.sortOrder).map((item) => (
              <div key={item.id} className="flex items-center justify-between px-4 py-3 hover:bg-blue-50/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-lg">
                    {item.icon || <BadgeCheck className="w-4 h-4 text-emerald-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-400">Order: #{item.sortOrder}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={item.isActive ? "active" : "inactive"} label={item.isActive ? "Active" : "Inactive"} />
                  <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteTarget(item)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{editId ? "Edit Trust Badge" : "Add Trust Badge"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className={labelClass}>Label</label><input className={inputClass} value={form.label} onChange={(e) => set("label", e.target.value)} required placeholder="e.g. 100% Verified Listings" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>Icon</label><input className={inputClass} value={form.icon} onChange={(e) => set("icon", e.target.value)} placeholder="Icon name or emoji" /></div>
                <div><label className={labelClass}>Sort Order</label><input className={inputClass} type="number" value={form.sortOrder} onChange={(e) => set("sortOrder", parseInt(e.target.value) || 0)} /></div>
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

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Badge" message={`Delete "${deleteTarget?.label}"?`} loading={deleting} />
    </div>
  );
}
