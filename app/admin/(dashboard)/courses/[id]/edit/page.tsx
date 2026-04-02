"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { fetchOne, updateItem } from "@/hooks/admin/useAdminCRUD";
import { STREAMS as FALLBACK_STREAMS, COURSE_LEVELS as FALLBACK_COURSE_LEVELS } from "@/types/admin";
import { useMasterData } from "@/hooks/useMasterData";

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: masterData } = useMasterData();
  const STREAMS = masterData?.streams.map((s) => s.name) ?? [...FALLBACK_STREAMS];
  const COURSE_LEVELS = masterData?.courseLevels.map((l) => l.name) ?? [...FALLBACK_COURSE_LEVELS];
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", stream: "", level: "UG", duration: "", description: "",
    topColleges: 10, avgFees: 100000, avgSalary: null as number | null,
    icon: "", color: "#3B82F6", isFeatured: false, isActive: true,
  });

  useEffect(() => {
    async function load() {
      const data = await fetchOne<Record<string, unknown>>("/api/admin/courses", id);
      if (data) {
        setForm({
          name: String(data.name || ""), stream: String(data.stream || ""),
          level: String(data.level || "UG"), duration: String(data.duration || ""),
          description: String(data.description || ""),
          topColleges: Number(data.topColleges || 10), avgFees: Number(data.avgFees || 100000),
          avgSalary: data.avgSalary as number | null,
          icon: String(data.icon || ""), color: String(data.color || "#3B82F6"),
          isFeatured: Boolean(data.isFeatured), isActive: data.isActive !== false,
        });
      }
      setFetching(false);
    }
    load();
  }, [id]);

  const update = (key: string, value: unknown) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    const result = await updateItem("/api/admin/courses", id, form);
    if (result.success) router.push("/admin/courses"); else setError(result.error || "Failed to update");
    setLoading(false);
  };

  if (fetching) {
    return (
      <div className="max-w-3xl mx-auto">
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
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/courses" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"><ArrowLeft className="w-4 h-4" /> Back to Courses</Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Course</h1>
        <p className="text-sm text-gray-500 mt-0.5">{form.name}</p>
      </div>
      {error && <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Course Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><label className={labelClass}>Course Name *</label><input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} required className={inputClass} /></div>
            <div><label className={labelClass}>Stream *</label><select value={form.stream} onChange={(e) => update("stream", e.target.value)} required className={inputClass}><option value="">Select Stream</option>{STREAMS.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
            <div><label className={labelClass}>Level *</label><select value={form.level} onChange={(e) => update("level", e.target.value)} className={inputClass}>{COURSE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}</select></div>
            <div><label className={labelClass}>Duration *</label><input type="text" value={form.duration} onChange={(e) => update("duration", e.target.value)} required className={inputClass} placeholder="e.g., 4 Years" /></div>
            <div><label className={labelClass}>Avg Fees (INR) *</label><input type="number" value={form.avgFees} onChange={(e) => update("avgFees", Number(e.target.value))} className={inputClass} /></div>
            <div><label className={labelClass}>Avg Salary (INR LPA)</label><input type="number" value={form.avgSalary ?? ""} onChange={(e) => update("avgSalary", e.target.value ? Number(e.target.value) : null)} className={inputClass} /></div>
            <div><label className={labelClass}>Top Colleges Count</label><input type="number" value={form.topColleges} onChange={(e) => update("topColleges", Number(e.target.value))} className={inputClass} /></div>
          </div>
          <div><label className={labelClass}>Description</label><textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={4} className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none" /></div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={form.isFeatured} onChange={(e) => update("isFeatured", e.target.checked)} className="sr-only peer" /><div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" /></label>
              <span className="text-sm font-medium text-gray-700">Featured Course</span>
            </div>
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={form.isActive} onChange={(e) => update("isActive", e.target.checked)} className="sr-only peer" /><div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-green-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" /></label>
              <span className="text-sm font-medium text-gray-700">Active (visible to students)</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/admin/courses" className="h-10 px-5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center transition-colors">Cancel</Link>
          <button type="submit" disabled={loading} className="h-10 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/25">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Update Course</button>
        </div>
      </form>
    </div>
  );
}
