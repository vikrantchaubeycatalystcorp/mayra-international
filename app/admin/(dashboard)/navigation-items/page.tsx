"use client";

import { useState } from "react";
import { Navigation, ChevronRight, Plus, Edit3, Trash2, X, Loader2, Search } from "lucide-react";
import { useAdminCRUD } from "@/hooks/admin/useAdminCRUD";
import { ConfirmDialog } from "@/components/admin/shared/ConfirmDialog";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  section: string;
  sortOrder: number;
  isMega: boolean;
  isActive: boolean;
  parentId: string | null;
  children?: NavItem[];
}

interface FormData {
  label: string;
  href: string;
  icon: string;
  section: string;
  sortOrder: number;
  isMega: boolean;
  isActive: boolean;
  parentId: string;
}

const EMPTY_FORM: FormData = {
  label: "",
  href: "",
  icon: "",
  section: "MAIN",
  sortOrder: 0,
  isMega: false,
  isActive: true,
  parentId: "",
};

export default function AdminNavigationPage() {
  const crud = useAdminCRUD<NavItem>({ endpoint: "/api/admin/navigation", limit: 100 });
  const [deleteTarget, setDeleteTarget] = useState<NavItem | null>(null);
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

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (item: NavItem) => {
    setForm({
      label: item.label,
      href: item.href,
      icon: item.icon || "",
      section: item.section,
      sortOrder: item.sortOrder,
      isMega: item.isMega,
      isActive: item.isActive,
      parentId: item.parentId || "",
    });
    setEditId(item.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const payload = { ...form, parentId: form.parentId || null };
      const url = editId ? `/api/admin/navigation/${editId}` : "/api/admin/navigation";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: "success", text: editId ? "Navigation item updated." : "Navigation item created." });
        setShowForm(false);
        crud.refetch();
      } else {
        setMessage({ type: "error", text: json.error?.message || "Operation failed." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error." });
    } finally {
      setSaving(false);
    }
  };

  const set = (key: keyof FormData, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const inputClass =
    "w-full h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  // Build tree from flat list
  const rootItems = crud.data.filter((item) => !item.parentId);
  const childMap = new Map<string, NavItem[]>();
  crud.data.forEach((item) => {
    if (item.parentId) {
      const arr = childMap.get(item.parentId) || [];
      arr.push(item);
      childMap.set(item.parentId, arr);
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
            <Navigation className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Navigation Items</h1>
            <p className="text-sm text-gray-500">Manage site navigation menu structure</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 h-10 px-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm font-medium ${
            message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{editId ? "Edit Navigation Item" : "Add Navigation Item"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Label</label>
                  <input className={inputClass} value={form.label} onChange={(e) => set("label", e.target.value)} required />
                </div>
                <div>
                  <label className={labelClass}>Href</label>
                  <input className={inputClass} value={form.href} onChange={(e) => set("href", e.target.value)} required />
                </div>
                <div>
                  <label className={labelClass}>Icon</label>
                  <input className={inputClass} value={form.icon} onChange={(e) => set("icon", e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Section</label>
                  <select className={inputClass} value={form.section} onChange={(e) => set("section", e.target.value)}>
                    <option value="MAIN">Main</option>
                    <option value="MORE">More</option>
                    <option value="FOOTER">Footer</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Sort Order</label>
                  <input className={inputClass} type="number" value={form.sortOrder} onChange={(e) => set("sortOrder", parseInt(e.target.value) || 0)} />
                </div>
                <div>
                  <label className={labelClass}>Parent</label>
                  <select className={inputClass} value={form.parentId} onChange={(e) => set("parentId", e.target.value)}>
                    <option value="">None (Top Level)</option>
                    {rootItems.map((item) => (
                      <option key={item.id} value={item.id}>{item.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.isMega} onChange={(e) => set("isMega", e.target.checked)} className="rounded border-gray-300" />
                  Mega Menu
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="rounded border-gray-300" />
                  Active
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowForm(false)} className="h-9 px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-60 flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tree View */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {crud.loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin mx-auto" />
          </div>
        ) : rootItems.length === 0 ? (
          <div className="p-12 text-center">
            <Search className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No navigation items found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {rootItems
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((item) => {
                const children = childMap.get(item.id) || [];
                return (
                  <div key={item.id}>
                    <div className="flex items-center justify-between px-4 py-3 hover:bg-blue-50/30 transition-colors">
                      <div className="flex items-center gap-3">
                        {children.length > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                          <p className="text-xs text-gray-400">{item.href} &middot; {item.section}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">#{item.sortOrder}</span>
                        <StatusBadge status={item.isActive ? "active" : "inactive"} label={item.isActive ? "Active" : "Inactive"} />
                        {item.isMega && <StatusBadge status="featured" label="Mega" />}
                        <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(item)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {children
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map((child) => (
                        <div key={child.id} className="flex items-center justify-between px-4 py-3 pl-12 bg-gray-50/50 hover:bg-blue-50/20 transition-colors">
                          <div>
                            <p className="text-sm font-medium text-gray-700">{child.label}</p>
                            <p className="text-xs text-gray-400">{child.href}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">#{child.sortOrder}</span>
                            <StatusBadge status={child.isActive ? "active" : "inactive"} label={child.isActive ? "Active" : "Inactive"} />
                            <button onClick={() => openEdit(child)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteTarget(child)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                );
              })}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Navigation Item"
        message={`Are you sure you want to delete "${deleteTarget?.label}"? This may affect site navigation.`}
        loading={deleting}
      />
    </div>
  );
}
