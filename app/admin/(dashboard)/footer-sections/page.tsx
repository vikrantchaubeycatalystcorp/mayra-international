"use client";

import { useState, useEffect, useCallback } from "react";
import { PanelBottom, Plus, Edit3, Trash2, X, Loader2, Search, ChevronDown, ChevronRight, Link as LinkIcon } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/shared/ConfirmDialog";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";

interface FooterLink {
  id: string;
  label: string;
  href: string;
  sortOrder: number;
}

interface FooterSection {
  id: string;
  title: string;
  sortOrder: number;
  isActive: boolean;
  links: FooterLink[];
}

interface SectionFormData {
  title: string;
  sortOrder: number;
  isActive: boolean;
}

interface LinkFormData {
  label: string;
  href: string;
  sortOrder: number;
}

const EMPTY_SECTION: SectionFormData = { title: "", sortOrder: 0, isActive: true };
const EMPTY_LINK: LinkFormData = { label: "", href: "", sortOrder: 0 };

export default function AdminFooterSectionsPage() {
  const [items, setItems] = useState<FooterSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<{ type: "section" | "link"; id: string; label: string; sectionId?: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [editSectionId, setEditSectionId] = useState<string | null>(null);
  const [sectionForm, setSectionForm] = useState<SectionFormData>(EMPTY_SECTION);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [editLinkId, setEditLinkId] = useState<string | null>(null);
  const [linkSectionId, setLinkSectionId] = useState<string>("");
  const [linkForm, setLinkForm] = useState<LinkFormData>(EMPTY_LINK);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/footer-sections", { credentials: "include" });
      const json = await res.json();
      if (json.success) setItems(json.data || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const url = deleteTarget.type === "section"
        ? `/api/admin/footer-sections/${deleteTarget.id}`
        : `/api/admin/footer-sections/${deleteTarget.sectionId}/links/${deleteTarget.id}`;
      await fetch(url, { method: "DELETE", credentials: "include" });
      await fetchData();
    } finally { setDeleting(false); setDeleteTarget(null); }
  };

  // Section CRUD
  const openCreateSection = () => { setSectionForm(EMPTY_SECTION); setEditSectionId(null); setShowSectionForm(true); };
  const openEditSection = (s: FooterSection) => {
    setSectionForm({ title: s.title, sortOrder: s.sortOrder, isActive: s.isActive });
    setEditSectionId(s.id);
    setShowSectionForm(true);
  };

  const handleSectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const url = editSectionId ? `/api/admin/footer-sections/${editSectionId}` : "/api/admin/footer-sections";
      const res = await fetch(url, {
        method: editSectionId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(sectionForm),
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: "success", text: editSectionId ? "Section updated." : "Section created." });
        setShowSectionForm(false);
        fetchData();
      } else { setMessage({ type: "error", text: json.error?.message || "Failed." }); }
    } catch { setMessage({ type: "error", text: "Network error." }); } finally { setSaving(false); }
  };

  // Link CRUD
  const openCreateLink = (sectionId: string) => { setLinkForm(EMPTY_LINK); setEditLinkId(null); setLinkSectionId(sectionId); setShowLinkForm(true); };
  const openEditLink = (sectionId: string, link: FooterLink) => {
    setLinkForm({ label: link.label, href: link.href, sortOrder: link.sortOrder });
    setEditLinkId(link.id);
    setLinkSectionId(sectionId);
    setShowLinkForm(true);
  };

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const url = editLinkId
        ? `/api/admin/footer-sections/${linkSectionId}/links/${editLinkId}`
        : `/api/admin/footer-sections/${linkSectionId}/links`;
      const res = await fetch(url, {
        method: editLinkId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(linkForm),
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: "success", text: editLinkId ? "Link updated." : "Link created." });
        setShowLinkForm(false);
        fetchData();
      } else { setMessage({ type: "error", text: json.error?.message || "Failed." }); }
    } catch { setMessage({ type: "error", text: "Network error." }); } finally { setSaving(false); }
  };

  const inputClass = "w-full h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
            <PanelBottom className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Footer Sections</h1>
            <p className="text-sm text-gray-500">Manage footer column sections and their links</p>
          </div>
        </div>
        <button onClick={openCreateSection} className="inline-flex items-center gap-2 h-10 px-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98]">
          <Plus className="w-4 h-4" /> Add Section
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
            <p className="text-sm text-gray-400">No footer sections found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.sort((a, b) => a.sortOrder - b.sortOrder).map((section) => (
              <div key={section.id}>
                <div className="flex items-center justify-between px-4 py-3 hover:bg-blue-50/30 transition-colors cursor-pointer" onClick={() => toggleExpanded(section.id)}>
                  <div className="flex items-center gap-3">
                    {expanded.has(section.id) ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{section.title}</p>
                      <p className="text-xs text-gray-400">{section.links?.length || 0} links &middot; Order: #{section.sortOrder}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <StatusBadge status={section.isActive ? "active" : "inactive"} label={section.isActive ? "Active" : "Inactive"} />
                    <button onClick={() => openCreateLink(section.id)} className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600" title="Add Link">
                      <Plus className="w-4 h-4" />
                    </button>
                    <button onClick={() => openEditSection(section)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteTarget({ type: "section", id: section.id, label: section.title })} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                {expanded.has(section.id) && (
                  <div className="bg-gray-50/50 border-t border-gray-100">
                    {section.links?.length ? (
                      section.links.sort((a, b) => a.sortOrder - b.sortOrder).map((link) => (
                        <div key={link.id} className="flex items-center justify-between px-4 py-2.5 pl-12 hover:bg-blue-50/20 transition-colors">
                          <div className="flex items-center gap-2">
                            <LinkIcon className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-sm text-gray-700">{link.label}</span>
                            <span className="text-xs text-gray-400">{link.href}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-400">#{link.sortOrder}</span>
                            <button onClick={() => openEditLink(section.id, link)} className="p-1 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600"><Edit3 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setDeleteTarget({ type: "link", id: link.id, label: link.label, sectionId: section.id })} className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="px-12 py-3 text-xs text-gray-400">No links in this section</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section Form Modal */}
      {showSectionForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowSectionForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setShowSectionForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{editSectionId ? "Edit Section" : "Add Section"}</h3>
            <form onSubmit={handleSectionSubmit} className="space-y-4">
              <div><label className={labelClass}>Title</label><input className={inputClass} value={sectionForm.title} onChange={(e) => setSectionForm((p) => ({ ...p, title: e.target.value }))} required /></div>
              <div><label className={labelClass}>Sort Order</label><input className={inputClass} type="number" value={sectionForm.sortOrder} onChange={(e) => setSectionForm((p) => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))} /></div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={sectionForm.isActive} onChange={(e) => setSectionForm((p) => ({ ...p, isActive: e.target.checked }))} className="rounded border-gray-300" /> Active
              </label>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowSectionForm(false)} className="h-9 px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-60 flex items-center gap-2">
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}{editSectionId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Link Form Modal */}
      {showLinkForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowLinkForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setShowLinkForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{editLinkId ? "Edit Link" : "Add Link"}</h3>
            <form onSubmit={handleLinkSubmit} className="space-y-4">
              <div><label className={labelClass}>Label</label><input className={inputClass} value={linkForm.label} onChange={(e) => setLinkForm((p) => ({ ...p, label: e.target.value }))} required /></div>
              <div><label className={labelClass}>Href</label><input className={inputClass} value={linkForm.href} onChange={(e) => setLinkForm((p) => ({ ...p, href: e.target.value }))} required /></div>
              <div><label className={labelClass}>Sort Order</label><input className={inputClass} type="number" value={linkForm.sortOrder} onChange={(e) => setLinkForm((p) => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))} /></div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowLinkForm(false)} className="h-9 px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-60 flex items-center gap-2">
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}{editLinkId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title={`Delete ${deleteTarget?.type === "section" ? "Section" : "Link"}`} message={`Delete "${deleteTarget?.label}"?`} loading={deleting} />
    </div>
  );
}
