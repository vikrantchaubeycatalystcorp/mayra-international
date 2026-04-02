"use client";

import { useState, useEffect, useCallback } from "react";
import { ImageIcon, Plus, Edit3, Trash2, X, Loader2, Search, Upload, Copy, ExternalLink } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/shared/ConfirmDialog";

interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: string;
  altText: string;
  createdAt: string;
}

interface FormData {
  name: string;
  url: string;
  type: string;
  altText: string;
}

const EMPTY_FORM: FormData = { name: "", url: "", type: "IMAGE", altText: "" };

export default function AdminMediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (searchQuery) params.set("search", searchQuery);
      const res = await fetch(`/api/admin/media?${params}`, { credentials: "include" });
      const json = await res.json();
      if (json.success) setItems(json.data || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [searchQuery]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/media/${deleteTarget.id}`, { method: "DELETE", credentials: "include" });
      await fetchData();
    } finally { setDeleting(false); setDeleteTarget(null); }
  };

  const openCreate = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true); };
  const openEdit = (item: MediaItem) => {
    setForm({ name: item.name, url: item.url, type: item.type, altText: item.altText || "" });
    setEditId(item.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const url = editId ? `/api/admin/media/${editId}` : "/api/admin/media";
      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: "success", text: editId ? "Media updated." : "Media created." });
        setShowForm(false);
        fetchData();
      } else { setMessage({ type: "error", text: json.error?.message || "Failed." }); }
    } catch { setMessage({ type: "error", text: "Network error." }); } finally { setSaving(false); }
  };

  const copyUrl = (item: MediaItem) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const set = (key: keyof FormData, value: string) => setForm((prev) => ({ ...prev, [key]: value }));
  const inputClass = "w-full h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  const isImage = (type: string) => type === "IMAGE" || type.startsWith("image");

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-violet-50 flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Media Library</h1>
            <p className="text-sm text-gray-500">Manage uploaded images and media files</p>
          </div>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 h-10 px-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98]">
          <Upload className="w-4 h-4" /> Add Media
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search media..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden p-4">
        {loading ? (
          <div className="p-8 text-center"><Loader2 className="w-6 h-6 text-blue-500 animate-spin mx-auto" /></div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <ImageIcon className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No media found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {items.map((item) => (
              <div key={item.id} className="group relative border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                  {isImage(item.type) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.url} alt={item.altText || item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4">
                      <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                      <p className="text-xs text-gray-400">{item.type}</p>
                    </div>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-medium text-gray-900 truncate">{item.name}</p>
                  <p className="text-[10px] text-gray-400 truncate">{item.altText || "No alt text"}</p>
                </div>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => copyUrl(item)} className="p-1.5 rounded-lg bg-white/90 shadow-sm hover:bg-white text-gray-500 hover:text-gray-700" title="Copy URL">
                    {copiedId === item.id ? <span className="text-[10px] text-green-600 px-1">Copied</span> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-white/90 shadow-sm hover:bg-white text-gray-500 hover:text-gray-700" title="Open">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg bg-white/90 shadow-sm hover:bg-white text-gray-500 hover:text-blue-600" title="Edit">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDeleteTarget(item)} className="p-1.5 rounded-lg bg-white/90 shadow-sm hover:bg-white text-gray-500 hover:text-red-600" title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{editId ? "Edit Media" : "Add Media"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className={labelClass}>Name</label><input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} required /></div>
              <div><label className={labelClass}>URL</label><input className={inputClass} value={form.url} onChange={(e) => set("url", e.target.value)} required placeholder="https://..." /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Type</label>
                  <select className={inputClass} value={form.type} onChange={(e) => set("type", e.target.value)}>
                    <option value="IMAGE">Image</option>
                    <option value="VIDEO">Video</option>
                    <option value="DOCUMENT">Document</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div><label className={labelClass}>Alt Text</label><input className={inputClass} value={form.altText} onChange={(e) => set("altText", e.target.value)} /></div>
              </div>
              {form.url && isImage(form.type) && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.url} alt="Preview" className="w-full h-32 object-cover" />
                </div>
              )}
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

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Media" message={`Delete "${deleteTarget?.name}"? This cannot be undone.`} loading={deleting} />
    </div>
  );
}
