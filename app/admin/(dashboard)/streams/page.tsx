"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Layers,
  Plus,
  Edit3,
  Trash2,
  X,
  Loader2,
  Search,
  Cpu,
  Stethoscope,
  Briefcase,
  Scale,
  Monitor,
  FlaskConical,
  BarChart3,
  BookOpen,
  Building2,
  LucideIcon,
} from "lucide-react";
import { ConfirmDialog } from "@/components/admin/shared/ConfirmDialog";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";

interface Stream {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
}

interface FormData {
  name: string;
  slug: string;
  icon: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
}

const EMPTY_FORM: FormData = { name: "", slug: "", icon: "", color: "#3B82F6", sortOrder: 0, isActive: true };

const streamIconMap: Record<string, LucideIcon> = {
  cpu: Cpu,
  stethoscope: Stethoscope,
  briefcase: Briefcase,
  scale: Scale,
  monitor: Monitor,
  flaskconical: FlaskConical,
  "flask-conical": FlaskConical,
  barchart3: BarChart3,
  "bar-chart-3": BarChart3,
  bookopen: BookOpen,
  "book-open": BookOpen,
  building2: Building2,
  "building-2": Building2,
};

export default function AdminStreamsPage() {
  const [items, setItems] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Stream | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/streams", { credentials: "include" });
      const json = await res.json();
      if (json.success) setItems(json.data || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/streams/${deleteTarget.id}`, { method: "DELETE", credentials: "include" });
      await fetchData();
    } finally { setDeleting(false); setDeleteTarget(null); }
  };

  const openCreate = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true); };
  const openEdit = (item: Stream) => {
    setForm({ name: item.name, slug: item.slug, icon: item.icon || "", color: item.color || "#3B82F6", sortOrder: item.sortOrder, isActive: item.isActive });
    setEditId(item.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const url = editId ? `/api/admin/streams/${editId}` : "/api/admin/streams";
      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: "success", text: editId ? "Stream updated." : "Stream created." });
        setShowForm(false);
        fetchData();
      } else { setMessage({ type: "error", text: json.error?.message || "Failed." }); }
    } catch { setMessage({ type: "error", text: "Network error." }); } finally { setSaving(false); }
  };

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const set = (key: keyof FormData, value: string | number | boolean) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "name" && !editId) {
        next.slug = generateSlug(value as string);
      }
      return next;
    });
  };

  const inputClass = "w-full h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  const renderStreamIcon = (iconValue: string, color: string) => {
    const normalized = iconValue?.trim().toLowerCase() ?? "";
    const IconComponent = streamIconMap[normalized];

    if (IconComponent) {
      return <IconComponent className="w-4 h-4" style={{ color }} />;
    }

    if (normalized.length === 0) {
      return <Layers className="w-4 h-4" style={{ color }} />;
    }

    return <span className="text-xs font-semibold text-gray-600">{iconValue.trim().slice(0, 1).toUpperCase()}</span>;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center">
            <Layers className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Streams</h1>
            <p className="text-sm text-gray-500">Manage academic streams / categories</p>
          </div>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 h-10 px-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98]">
          <Plus className="w-4 h-4" /> Add Stream
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
            <p className="text-sm text-gray-400">No streams found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {items.sort((a, b) => a.sortOrder - b.sortOrder).map((item) => (
              <div key={item.id} className="flex items-center justify-between px-4 py-3 hover:bg-blue-50/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg overflow-hidden shrink-0" style={{ backgroundColor: `${item.color}15` }}>
                    {renderStreamIcon(item.icon, item.color)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-400">/{item.slug} &middot; Order: #{item.sortOrder}</p>
                  </div>
                  <div className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: item.color }} title={item.color} />
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{editId ? "Edit Stream" : "Add Stream"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className={labelClass}>Name</label><input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} required placeholder="e.g. Engineering" /></div>
              <div><label className={labelClass}>Slug</label><input className={inputClass} value={form.slug} onChange={(e) => set("slug", e.target.value)} required placeholder="engineering" /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className={labelClass}>Icon</label><input className={inputClass} value={form.icon} onChange={(e) => set("icon", e.target.value)} placeholder="Icon/emoji" /></div>
                <div>
                  <label className={labelClass}>Color</label>
                  <div className="flex gap-2">
                    <input type="color" value={form.color} onChange={(e) => set("color", e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                    <input className={inputClass} value={form.color} onChange={(e) => set("color", e.target.value)} placeholder="#3B82F6" />
                  </div>
                </div>
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

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Stream" message={`Delete "${deleteTarget?.name}"? This may affect associated colleges and courses.`} loading={deleting} />
    </div>
  );
}
