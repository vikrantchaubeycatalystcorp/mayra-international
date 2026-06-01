"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useAdminCRUD } from "@/hooks/admin/useAdminCRUD";
import { AdminDataTable, type Column } from "@/components/admin/shared/AdminDataTable";
import { ConfirmDialog } from "@/components/admin/shared/ConfirmDialog";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { parseYouTubeId, youTubeThumb } from "@/lib/youtube";
import { X, Loader2, Youtube, PlaySquare } from "lucide-react";

interface YouTubeShort {
  id: string;
  title: string;
  url: string;
  videoId: string;
  type: string;
  thumbnail: string;
  description: string;
  category: string | null;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
}

interface FormData {
  title: string;
  url: string;
  type: string;
  category: string;
  description: string;
  sortOrder: number;
  isFeatured: boolean;
  isActive: boolean;
}

const EMPTY_FORM: FormData = {
  title: "",
  url: "",
  type: "short",
  category: "",
  description: "",
  sortOrder: 0,
  isFeatured: false,
  isActive: true,
};

export default function AdminYouTubeShortsPage() {
  const crud = useAdminCRUD<YouTubeShort>({ endpoint: "/api/admin/youtube-shorts" });
  const [deleteTarget, setDeleteTarget] = useState<YouTubeShort | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const previewId = parseYouTubeId(form.url);

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
    setMessage(null);
    setShowForm(true);
  };

  const openEdit = (item: YouTubeShort) => {
    setForm({
      title: item.title,
      url: item.url,
      type: item.type,
      category: item.category || "",
      description: item.description || "",
      sortOrder: item.sortOrder,
      isFeatured: item.isFeatured,
      isActive: item.isActive,
    });
    setEditId(item.id);
    setMessage(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parseYouTubeId(form.url)) {
      setMessage({ type: "error", text: "Enter a valid YouTube or Shorts link." });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        ...form,
        category: form.category || null,
        sortOrder: Number(form.sortOrder) || 0,
      };
      const url = editId ? `/api/admin/youtube-shorts/${editId}` : "/api/admin/youtube-shorts";
      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: "success", text: editId ? "Video updated." : "Video added." });
        setShowForm(false);
        crud.refetch();
      } else {
        setMessage({ type: "error", text: json.error?.message || "Failed." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error." });
    } finally {
      setSaving(false);
    }
  };

  const set = (key: keyof FormData, value: string | number | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const inputClass =
    "w-full h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  const columns: Column<YouTubeShort>[] = [
    {
      key: "thumbnail",
      label: "Preview",
      render: (item) => (
        <div className="relative w-20 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
          <Image
            src={item.thumbnail || youTubeThumb(item.videoId)}
            alt={item.title}
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>
      ),
    },
    {
      key: "title",
      label: "Title",
      render: (item) => (
        <div>
          <p className="text-sm font-medium text-gray-900 truncate max-w-[240px]">{item.title}</p>
          {item.category && <p className="text-xs text-gray-400 truncate max-w-[240px]">{item.category}</p>}
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      sortable: true,
      render: (item) => (
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded ${
            item.type === "short" ? "bg-red-50 text-red-700" : "bg-indigo-50 text-indigo-700"
          }`}
        >
          {item.type === "short" ? <Youtube className="w-3 h-3" /> : <PlaySquare className="w-3 h-3" />}
          {item.type === "short" ? "Short" : "Video"}
        </span>
      ),
    },
    {
      key: "sortOrder",
      label: "Order",
      sortable: true,
      render: (item) => <span className="text-sm text-gray-600">{item.sortOrder}</span>,
    },
    {
      key: "isFeatured",
      label: "Featured",
      render: (item) =>
        item.isFeatured ? (
          <StatusBadge status="featured" label="Featured" />
        ) : (
          <span className="text-sm text-gray-400">—</span>
        ),
    },
    {
      key: "isActive",
      label: "Status",
      render: (item) => (
        <StatusBadge status={item.isActive ? "active" : "inactive"} label={item.isActive ? "Active" : "Inactive"} />
      ),
    },
  ];

  return (
    <>
      {message && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm font-medium ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <AdminDataTable
        title="YouTube Shorts"
        description="Manage the video carousel shown to students on the home page"
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
        onCreate={openCreate}
        createLabel="Add Video"
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        emptyMessage="No videos yet — add your first YouTube Short"
      />

      {showForm && mounted && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative my-auto bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{editId ? "Edit Video" : "Add Video"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>Title</label>
                <input
                  className={inputClass}
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="e.g. Campus Tour — Day in the Life"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>YouTube / Shorts URL</label>
                <input
                  className={inputClass}
                  value={form.url}
                  onChange={(e) => set("url", e.target.value)}
                  placeholder="Paste any YouTube or Shorts link"
                  required
                />
                {form.url && !previewId && (
                  <p className="text-xs text-red-500 mt-1">Not a recognised YouTube link.</p>
                )}
                {previewId && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="relative w-24 h-14 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={youTubeThumb(previewId)}
                        alt="Preview"
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>
                    <span className="text-xs text-gray-500">ID: {previewId}</span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Type</label>
                  <select className={inputClass} value={form.type} onChange={(e) => set("type", e.target.value)}>
                    <option value="short">Short (vertical 9:16)</option>
                    <option value="video">Video (16:9)</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Category</label>
                  <input
                    className={inputClass}
                    value={form.category}
                    onChange={(e) => set("category", e.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all min-h-[60px]"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Optional"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 items-end">
                <div>
                  <label className={labelClass}>Sort Order</label>
                  <input
                    className={inputClass}
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => set("sortOrder", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2 pb-1">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={(e) => set("isFeatured", e.target.checked)}
                      className="rounded border-gray-300"
                    />{" "}
                    Featured
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => set("isActive", e.target.checked)}
                      className="rounded border-gray-300"
                    />{" "}
                    Active
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="h-9 px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
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
        </div>,
        document.body
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Video"
        message="Remove this video from the home page carousel?"
        loading={deleting}
      />
    </>
  );
}
