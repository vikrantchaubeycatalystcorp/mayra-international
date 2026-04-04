"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, X, ImageIcon } from "lucide-react";
import { fetchOne, updateItem } from "@/hooks/admin/useAdminCRUD";
import { NEWS_CATEGORIES as FALLBACK_NEWS_CATEGORIES } from "@/types/admin";
import { useMasterData } from "@/hooks/useMasterData";

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: masterData } = useMasterData();
  const NEWS_CATEGORIES = masterData?.newsCategories.map((c) => c.name) ?? [...FALLBACK_NEWS_CATEGORIES];
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [form, setForm] = useState({
    title: "", category: "News" as string, summary: "", content: "", author: "Editorial Team",
    publishedAt: "", imageUrl: "", imageColor: "#3B82F6", tags: [] as string[], isLive: false, isActive: true,
  });

  useEffect(() => {
    async function load() {
      const data = await fetchOne<Record<string, unknown>>("/api/admin/news", id);
      if (data) {
        setForm({
          title: String(data.title || ""), category: String(data.category || "News"),
          summary: String(data.summary || ""), content: String(data.content || ""),
          author: String(data.author || "Editorial Team"),
          publishedAt: String(data.publishedAt || ""),
          imageUrl: String(data.imageUrl || ""),
          imageColor: String(data.imageColor || "#3B82F6"),
          tags: (data.tags as string[]) || [],
          isLive: Boolean(data.isLive), isActive: data.isActive !== false,
        });
      }
      setFetching(false);
    }
    load();
  }, [id]);

  const update = (key: string, value: unknown) => setForm((p) => ({ ...p, [key]: value }));
  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm((p) => ({ ...p, tags: [...p.tags, tagInput.trim()] }));
      setTagInput("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    const result = await updateItem("/api/admin/news", id, form);
    if (result.success) router.push("/admin/news"); else setError(result.error || "Failed to update");
    setLoading(false);
  };

  if (fetching) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-64 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  const inputClass = "w-full h-10 px-3.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/news" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"><ArrowLeft className="w-4 h-4" /> Back to News</Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Article</h1>
        <p className="text-sm text-gray-500 mt-0.5">{form.title}</p>
      </div>
      {error && <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Article Details</h3>
          <div>
            <label className={labelClass}>Title *</label>
            <input type="text" value={form.title} onChange={(e) => update("title", e.target.value)} required className={inputClass} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className={labelClass}>Category *</label><select value={form.category} onChange={(e) => update("category", e.target.value)} className={inputClass}>{NEWS_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
            <div><label className={labelClass}>Author</label><input type="text" value={form.author} onChange={(e) => update("author", e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Published Date *</label><input type="date" value={form.publishedAt} onChange={(e) => update("publishedAt", e.target.value)} className={inputClass} /></div>
          </div>
          <div>
            <label className={labelClass}>Summary *</label>
            <textarea value={form.summary} onChange={(e) => update("summary", e.target.value)} required rows={2} className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none" />
          </div>
          <div>
            <label className={labelClass}>Content *</label>
            <textarea value={form.content} onChange={(e) => update("content", e.target.value)} required rows={12} className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none font-mono" />
          </div>
          <div>
            <label className={labelClass}>Image URL</label>
            <div className="flex gap-3">
              <input type="url" value={form.imageUrl} onChange={(e) => update("imageUrl", e.target.value)} className={inputClass} placeholder="https://example.com/image.jpg" />
            </div>
            {form.imageUrl && (
              <div className="mt-2 relative rounded-xl border border-gray-200 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.imageUrl} alt="Preview" className="w-full h-40 object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                <button type="button" onClick={() => update("imageUrl", "")} className="absolute top-2 right-2 p-1 rounded-lg bg-white/90 shadow-sm hover:bg-white text-gray-500 hover:text-red-600"><X className="w-4 h-4" /></button>
              </div>
            )}
            {!form.imageUrl && (
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Add image URL or leave empty to use gradient color</span>
              </div>
            )}
          </div>
          <div>
            <label className={labelClass}>Tags</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.tags.map((tag, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs">{tag}<button type="button" onClick={() => setForm((p) => ({ ...p, tags: p.tags.filter((_, idx) => idx !== i) }))}><X className="w-3 h-3" /></button></span>
              ))}
            </div>
            <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} placeholder="Add tag + Enter" className={inputClass} />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={form.isLive} onChange={(e) => update("isLive", e.target.checked)} className="sr-only peer" /><div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-green-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" /></label>
              <span className="text-sm font-medium text-gray-700">Publish Live</span>
            </div>
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={form.isActive} onChange={(e) => update("isActive", e.target.checked)} className="sr-only peer" /><div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-green-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" /></label>
              <span className="text-sm font-medium text-gray-700">Active (visible to students)</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/admin/news" className="h-10 px-5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center transition-colors">Cancel</Link>
          <button type="submit" disabled={loading} className="h-10 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/25">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Update Article</button>
        </div>
      </form>
    </div>
  );
}
