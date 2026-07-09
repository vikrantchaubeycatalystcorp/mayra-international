"use client";

import { useState } from "react";
import { Plus, X, Loader2, ImageOff } from "lucide-react";
import { useAdminCRUD } from "@/hooks/admin/useAdminCRUD";
import { AdminDataTable, type Column } from "@/components/admin/shared/AdminDataTable";
import { ConfirmDialog } from "@/components/admin/shared/ConfirmDialog";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { normalizeImageUrl } from "@/lib/utils";

interface HeroBanner {
  id: string;
  badgeText: string | null;
  heading: string;
  headingHighlight: string | null;
  subheading: string | null;
  bgImage: string | null;
  ctaText: string;
  isActive: boolean;
  sortOrder: number;
}

interface FormData {
  badgeText: string;
  heading: string;
  headingHighlight: string;
  subheading: string;
  bgImage: string;
  ctaText: string;
  isActive: boolean;
  sortOrder: number;
}

const EMPTY_FORM: FormData = {
  badgeText: "",
  heading: "Find Your Dream College",
  headingHighlight: "Dream College",
  subheading: "",
  bgImage: "",
  ctaText: "Search",
  isActive: true,
  sortOrder: 0,
};

export default function AdminHeroBannersPage() {
  const crud = useAdminCRUD<HeroBanner>({ endpoint: "/api/admin/hero-banners" });
  const [deleteTarget, setDeleteTarget] = useState<HeroBanner | null>(null);
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

  const openEdit = (item: HeroBanner) => {
    setForm({
      badgeText: item.badgeText || "",
      heading: item.heading || "",
      headingHighlight: item.headingHighlight || "",
      subheading: item.subheading || "",
      bgImage: item.bgImage || "",
      ctaText: item.ctaText || "Search",
      isActive: item.isActive,
      sortOrder: item.sortOrder,
    });
    setEditId(item.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.heading.trim()) {
      setMessage({ type: "error", text: "Heading is required." });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const url = editId ? `/api/admin/hero-banners/${editId}` : "/api/admin/hero-banners";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: "success", text: editId ? "Banner updated." : "Banner created." });
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

  const inputClass = "w-full h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  const previewSrc = normalizeImageUrl(form.bgImage);

  const columns: Column<HeroBanner>[] = [
    {
      key: "bgImage",
      label: "Image",
      render: (item) =>
        item.bgImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={normalizeImageUrl(item.bgImage)}
            alt=""
            className="h-10 w-16 rounded-md object-cover border border-gray-200"
          />
        ) : (
          <div className="h-10 w-16 rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-300">
            <ImageOff className="w-4 h-4" />
          </div>
        ),
    },
    {
      key: "badgeText",
      label: "Badge",
      render: (item) => <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">{item.badgeText || "—"}</span>,
    },
    {
      key: "heading",
      label: "Heading",
      render: (item) => (
        <div className="max-w-[300px]">
          <p className="text-sm font-semibold text-gray-900 truncate">{item.heading}</p>
          {item.headingHighlight && <p className="text-xs text-blue-600 truncate">Highlight: {item.headingHighlight}</p>}
        </div>
      ),
    },
    {
      key: "subheading",
      label: "Subheading",
      render: (item) => <p className="text-sm text-gray-500 truncate max-w-[200px]">{item.subheading || "—"}</p>,
    },
    {
      key: "sortOrder",
      label: "Order",
      sortable: true,
      render: (item) => <span className="text-sm text-gray-600">#{item.sortOrder}</span>,
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
        title="Hero Banners"
        description="Manage the homepage hero — background image, heading and badge"
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
        createHref={undefined}
        createLabel="Add Banner"
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        emptyMessage="No hero banners found"
      />

      {/* Floating Add Button */}
      <div className="flex justify-end -mt-[52px] mr-4 relative z-10 pointer-events-none">
        <button
          onClick={openCreate}
          className="pointer-events-auto inline-flex items-center gap-2 h-10 px-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Add Banner
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{editId ? "Edit Banner" : "Add Banner"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Background image — the primary control */}
              <div>
                <label className={labelClass}>Background Image URL</label>
                <input
                  type="url"
                  className={inputClass}
                  value={form.bgImage}
                  onChange={(e) => set("bgImage", e.target.value)}
                  placeholder="Direct image URL or Google Drive share link"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Use a wide landscape photo (≈1920×1080, 16:9, at least 1600px wide). It is center-cropped to fill the hero — never stretched. Leave blank to use the default image.
                </p>
                <div className="mt-2 relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                  {previewSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewSrc} alt="Hero preview" className="w-full h-full object-cover object-center" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-gray-300">
                      <ImageOff className="w-6 h-6" />
                      <span className="text-xs text-gray-400">No image — default hero photo will be used</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className={labelClass}>Badge Text</label>
                <input className={inputClass} value={form.badgeText} onChange={(e) => set("badgeText", e.target.value)} placeholder="e.g. NIRF 2025 Rankings Released" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Heading <span className="text-red-500">*</span></label>
                  <input className={inputClass} value={form.heading} onChange={(e) => set("heading", e.target.value)} required />
                </div>
                <div>
                  <label className={labelClass}>Highlighted Phrase</label>
                  <input className={inputClass} value={form.headingHighlight} onChange={(e) => set("headingHighlight", e.target.value)} placeholder="Part of heading to accent" />
                </div>
              </div>
              <p className="-mt-2 text-xs text-gray-400">The highlighted phrase must appear inside the heading to be accented (e.g. heading &quot;Find Your Dream College&quot; + highlight &quot;Dream College&quot;).</p>
              <div>
                <label className={labelClass}>Subheading</label>
                <textarea
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all min-h-[60px]"
                  value={form.subheading}
                  onChange={(e) => set("subheading", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelClass}>Button Text</label>
                  <input className={inputClass} value={form.ctaText} onChange={(e) => set("ctaText", e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Sort Order</label>
                  <input className={inputClass} type="number" value={form.sortOrder} onChange={(e) => set("sortOrder", parseInt(e.target.value) || 0)} />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="rounded border-gray-300" />
                    Active
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowForm(false)} className="h-9 px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-60 flex items-center gap-2">
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Banner"
        message={`Are you sure you want to delete this banner?`}
        loading={deleting}
      />
    </>
  );
}
