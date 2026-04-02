"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Plus, X } from "lucide-react";
import { createItem } from "@/hooks/admin/useAdminCRUD";

export default function NewStudyAbroadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [courseInput, setCourseInput] = useState("");
  const [form, setForm] = useState({
    name: "", flag: "", universities: 0, avgCost: "", popularCourses: [] as string[],
    description: "", topUniversities: [] as { name: string; rank?: number }[],
    whyStudyHere: "", visaInfo: "", scholarships: "", livingCost: "",
    isFeatured: false, isActive: true, sortOrder: 0,
  });

  const update = (key: string, value: unknown) => setForm((p) => ({ ...p, [key]: value }));

  const addCourse = () => {
    if (courseInput.trim() && !form.popularCourses.includes(courseInput.trim())) {
      setForm((p) => ({ ...p, popularCourses: [...p.popularCourses, courseInput.trim()] }));
      setCourseInput("");
    }
  };

  const addUniversity = () => setForm((p) => ({ ...p, topUniversities: [...p.topUniversities, { name: "", rank: undefined }] }));
  const removeUniversity = (i: number) => setForm((p) => ({ ...p, topUniversities: p.topUniversities.filter((_, idx) => idx !== i) }));
  const updateUniversity = (i: number, key: string, value: unknown) => setForm((p) => ({ ...p, topUniversities: p.topUniversities.map((u, idx) => idx === i ? { ...u, [key]: value } : u) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    const result = await createItem("/api/admin/study-abroad", form);
    if (result.success) router.push("/admin/study-abroad"); else setError(result.error || "Failed to create");
    setLoading(false);
  };

  const inputClass = "w-full h-10 px-3.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";
  const textareaClass = "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/study-abroad" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"><ArrowLeft className="w-4 h-4" /> Back to Study Abroad</Link>
        <h1 className="text-2xl font-bold text-gray-900">Add Country</h1>
      </div>
      {error && <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelClass}>Country Name *</label><input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} required className={inputClass} placeholder="e.g., United States" /></div>
            <div><label className={labelClass}>Flag Emoji *</label><input type="text" value={form.flag} onChange={(e) => update("flag", e.target.value)} required className={inputClass} placeholder="e.g., US" /></div>
            <div><label className={labelClass}>Number of Universities *</label><input type="number" value={form.universities} onChange={(e) => update("universities", Number(e.target.value))} className={inputClass} /></div>
            <div><label className={labelClass}>Average Cost *</label><input type="text" value={form.avgCost} onChange={(e) => update("avgCost", e.target.value)} required className={inputClass} placeholder="e.g., $20,000 - $50,000/year" /></div>
            <div><label className={labelClass}>Sort Order</label><input type="number" value={form.sortOrder} onChange={(e) => update("sortOrder", Number(e.target.value))} className={inputClass} /></div>
          </div>
          <div><label className={labelClass}>Description</label><textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={4} className={textareaClass} placeholder="Brief description about studying in this country..." /></div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={form.isFeatured} onChange={(e) => update("isFeatured", e.target.checked)} className="sr-only peer" /><div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" /></label>
              <span className="text-sm font-medium text-gray-700">Featured Country</span>
            </div>
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={form.isActive} onChange={(e) => update("isActive", e.target.checked)} className="sr-only peer" /><div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-green-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" /></label>
              <span className="text-sm font-medium text-gray-700">Active (visible to students)</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Popular Courses</h3>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {form.popularCourses.map((c, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium">{c}<button type="button" onClick={() => setForm((p) => ({ ...p, popularCourses: p.popularCourses.filter((_, idx) => idx !== i) }))}><X className="w-3 h-3" /></button></span>
            ))}
          </div>
          <input type="text" value={courseInput} onChange={(e) => setCourseInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCourse(); } }} placeholder="Add course + Enter" className={inputClass} />
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Top Universities</h3>
            <button type="button" onClick={addUniversity} className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"><Plus className="w-3.5 h-3.5" /> Add University</button>
          </div>
          {form.topUniversities.map((uni, i) => (
            <div key={i} className="flex items-center gap-3 border border-gray-100 rounded-xl p-3">
              <input type="text" value={uni.name} onChange={(e) => updateUniversity(i, "name", e.target.value)} placeholder="University name" className="flex-1 text-sm outline-none bg-transparent" />
              <input type="number" value={uni.rank ?? ""} onChange={(e) => updateUniversity(i, "rank", e.target.value ? Number(e.target.value) : undefined)} placeholder="Rank" className="w-20 text-sm outline-none bg-transparent text-right" />
              <button type="button" onClick={() => removeUniversity(i)} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
            </div>
          ))}
          {form.topUniversities.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No universities added yet</p>}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Additional Information</h3>
          <div><label className={labelClass}>Why Study Here</label><textarea value={form.whyStudyHere} onChange={(e) => update("whyStudyHere", e.target.value)} rows={3} className={textareaClass} placeholder="Key reasons to study in this country..." /></div>
          <div><label className={labelClass}>Visa Information</label><textarea value={form.visaInfo} onChange={(e) => update("visaInfo", e.target.value)} rows={3} className={textareaClass} placeholder="Student visa requirements and process..." /></div>
          <div><label className={labelClass}>Scholarships</label><textarea value={form.scholarships} onChange={(e) => update("scholarships", e.target.value)} rows={3} className={textareaClass} placeholder="Available scholarships for international students..." /></div>
          <div><label className={labelClass}>Living Cost</label><textarea value={form.livingCost} onChange={(e) => update("livingCost", e.target.value)} rows={2} className={textareaClass} placeholder="Estimated monthly living expenses..." /></div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/admin/study-abroad" className="h-10 px-5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center transition-colors">Cancel</Link>
          <button type="submit" disabled={loading} className="h-10 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/25">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Country</button>
        </div>
      </form>
    </div>
  );
}
