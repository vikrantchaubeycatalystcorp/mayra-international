"use client";

import { useState, useEffect, useCallback } from "react";
import { ClipboardList, Plus, Edit3, Trash2, X, Loader2, Search } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/shared/ConfirmDialog";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";

interface LeadOption {
  id: string;
  label: string;
  value: string;
  sortOrder: number;
  isActive: boolean;
}

interface FormData {
  label: string;
  value: string;
  sortOrder: number;
  isActive: boolean;
}

const EMPTY_FORM: FormData = { label: "", value: "", sortOrder: 0, isActive: true };

type TabKey = "qualifications" | "interests";

const TABS: { key: TabKey; label: string; apiPath: string; entityName: string }[] = [
  { key: "qualifications", label: "Qualifications", apiPath: "/api/admin/lead-qualifications", entityName: "Qualification" },
  { key: "interests", label: "Interests", apiPath: "/api/admin/lead-interests", entityName: "Interest" },
];

export default function AdminLeadOptionsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("qualifications");
  const [items, setItems] = useState<Record<TabKey, LeadOption[]>>({ qualifications: [], interests: [] });
  const [loading, setLoading] = useState<Record<TabKey, boolean>>({ qualifications: true, interests: true });
  const [deleteTarget, setDeleteTarget] = useState<LeadOption | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const currentTab = TABS.find((t) => t.key === activeTab)!;

  const fetchData = useCallback(async (tabKey: TabKey) => {
    setLoading((prev) => ({ ...prev, [tabKey]: true }));
    const tab = TABS.find((t) => t.key === tabKey)!;
    try {
      const res = await fetch(tab.apiPath, { credentials: "include" });
      const json = await res.json();
      if (json.success) setItems((prev) => ({ ...prev, [tabKey]: json.data || [] }));
    } catch { /* ignore */ } finally { setLoading((prev) => ({ ...prev, [tabKey]: false })); }
  }, []);

  useEffect(() => { fetchData("qualifications"); fetchData("interests"); }, [fetchData]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`${currentTab.apiPath}/${deleteTarget.id}`, { method: "DELETE", credentials: "include" });
      await fetchData(activeTab);
    } finally { setDeleting(false); setDeleteTarget(null); }
  };

  const openCreate = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true); };
  const openEdit = (item: LeadOption) => {
    setForm({ label: item.label, value: item.value, sortOrder: item.sortOrder, isActive: item.isActive });
    setEditId(item.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const url = editId ? `${currentTab.apiPath}/${editId}` : currentTab.apiPath;
      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: "success", text: editId ? `${currentTab.entityName} updated.` : `${currentTab.entityName} created.` });
        setShowForm(false);
        fetchData(activeTab);
      } else { setMessage({ type: "error", text: json.error?.message || "Failed." }); }
    } catch { setMessage({ type: "error", text: "Network error." }); } finally { setSaving(false); }
  };

  const generateValue = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/(^_|_$)/g, "");

  const set = (key: keyof FormData, value: string | number | boolean) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "label" && !editId) {
        next.value = generateValue(value as string);
      }
      return next;
    });
  };

  const currentItems = items[activeTab];
  const currentLoading = loading[activeTab];

  const inputClass = "w-full h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-100 to-rose-50 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Lead Options</h1>
            <p className="text-sm text-gray-500">Manage lead qualifications and interests</p>
          </div>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 h-10 px-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98]">
          <Plus className="w-4 h-4" /> Add {currentTab.entityName}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setMessage(null); }}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {currentLoading ? (
          <div className="p-8 text-center"><Loader2 className="w-6 h-6 text-blue-500 animate-spin mx-auto" /></div>
        ) : currentItems.length === 0 ? (
          <div className="p-12 text-center">
            <Search className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No {currentTab.label.toLowerCase()} found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {currentItems.sort((a, b) => a.sortOrder - b.sortOrder).map((item) => (
              <div key={item.id} className="flex items-center justify-between px-4 py-3 hover:bg-blue-50/30 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-400">Value: {item.value} &middot; Order: #{item.sortOrder}</p>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{editId ? `Edit ${currentTab.entityName}` : `Add ${currentTab.entityName}`}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className={labelClass}>Label</label><input className={inputClass} value={form.label} onChange={(e) => set("label", e.target.value)} required placeholder="e.g. 12th Pass" /></div>
              <div><label className={labelClass}>Value</label><input className={inputClass} value={form.value} onChange={(e) => set("value", e.target.value)} required placeholder="12th_pass" /></div>
              <div><label className={labelClass}>Sort Order</label><input className={inputClass} type="number" value={form.sortOrder} onChange={(e) => set("sortOrder", parseInt(e.target.value) || 0)} /></div>
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

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title={`Delete ${currentTab.entityName}`} message={`Delete "${deleteTarget?.label}"? This may affect lead forms.`} loading={deleting} />
    </div>
  );
}
