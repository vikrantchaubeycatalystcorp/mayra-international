"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { fetchOne, updateItem } from "@/hooks/admin/useAdminCRUD";
import { STREAMS as FALLBACK_STREAMS, COLLEGE_TYPES as FALLBACK_COLLEGE_TYPES, INDIAN_STATES as FALLBACK_INDIAN_STATES } from "@/types/admin";
import { useMasterData } from "@/hooks/useMasterData";

export default function EditCollegePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: masterData } = useMasterData();
  const STREAMS = masterData?.streams.map((s) => s.name) ?? [...FALLBACK_STREAMS];
  const COLLEGE_TYPES = masterData?.collegeTypes.map((t) => t.name) ?? [...FALLBACK_COLLEGE_TYPES];
  const INDIAN_STATES = masterData?.states.map((s) => s.name) ?? [...FALLBACK_INDIAN_STATES];
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "", type: "Private", established: 2000, city: "", state: "", address: "",
    countryCode: "IN", streams: [] as string[], nirfRank: null as number | null, rating: 4.0,
    reviewCount: 50, feesMin: 50000, feesMax: 500000, avgPackage: null as number | null,
    topPackage: null as number | null, placementRate: null as number | null,
    accreditation: [] as string[], courses: [] as string[], description: "",
    highlights: [] as string[], website: "", phone: "", totalStudents: null as number | null,
    faculty: null as number | null, latitude: null as number | null, longitude: null as number | null,
    isFeatured: false, isActive: true, logo: "",
  });

  useEffect(() => {
    async function load() {
      const data = await fetchOne<Record<string, unknown>>("/api/admin/colleges", id);
      if (data) {
        setForm({
          name: String(data.name || ""), type: String(data.type || "Private"),
          established: Number(data.established || 2000), city: String(data.city || ""),
          state: String(data.state || ""), address: String(data.address || ""),
          countryCode: String(data.countryCode || "IN"),
          streams: (data.streams as string[]) || [], nirfRank: data.nirfRank as number | null,
          rating: Number(data.rating || 4.0), reviewCount: Number(data.reviewCount || 50),
          feesMin: Number(data.feesMin || 50000), feesMax: Number(data.feesMax || 500000),
          avgPackage: data.avgPackage as number | null, topPackage: data.topPackage as number | null,
          placementRate: data.placementRate as number | null,
          accreditation: (data.accreditation as string[]) || [],
          courses: (data.courses as string[]) || [],
          description: String(data.description || ""),
          highlights: (data.highlights as string[]) || [],
          website: String(data.website || ""), phone: String(data.phone || ""),
          totalStudents: data.totalStudents as number | null,
          faculty: data.faculty as number | null,
          latitude: data.latitude as number | null, longitude: data.longitude as number | null,
          isFeatured: Boolean(data.isFeatured), isActive: data.isActive !== false, logo: String(data.logo || ""),
        });
      }
      setFetching(false);
    }
    load();
  }, [id]);

  const update = (key: string, value: unknown) => setForm((p) => ({ ...p, [key]: value }));
  const toggleStream = (stream: string) => {
    setForm((p) => ({ ...p, streams: p.streams.includes(stream) ? p.streams.filter((s) => s !== stream) : [...p.streams, stream] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await updateItem("/api/admin/colleges", id, form);
    if (result.success) router.push("/admin/colleges");
    else setError(result.error || "Failed to update college");
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
        <Link href="/admin/colleges" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Colleges
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit College</h1>
        <p className="text-sm text-gray-500 mt-0.5">{form.name}</p>
      </div>

      {error && <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelClass}>College Name <span className="text-red-500">*</span></label>
              <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Type <span className="text-red-500">*</span></label>
              <select value={form.type} onChange={(e) => update("type", e.target.value)} className={inputClass}>
                {COLLEGE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Established Year</label>
              <input type="number" value={form.established} onChange={(e) => update("established", Number(e.target.value))} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={4} className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none" />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => update("isFeatured", e.target.checked)} className="sr-only peer" />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
              </label>
              <span className="text-sm font-medium text-gray-700">Featured College</span>
            </div>
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => update("isActive", e.target.checked)} className="sr-only peer" />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-green-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
              </label>
              <span className="text-sm font-medium text-gray-700">Active (visible to students)</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className={labelClass}>City *</label><input type="text" value={form.city} onChange={(e) => update("city", e.target.value)} required className={inputClass} /></div>
            <div><label className={labelClass}>State *</label><select value={form.state} onChange={(e) => update("state", e.target.value)} required className={inputClass}><option value="">Select State</option>{INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
            <div><label className={labelClass}>Address *</label><input type="text" value={form.address} onChange={(e) => update("address", e.target.value)} required className={inputClass} /></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Streams *</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {STREAMS.map((stream) => (
              <button key={stream} type="button" onClick={() => toggleStream(stream)} className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${form.streams.includes(stream) ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                {stream}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Fees & Placement</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className={labelClass}>Min Fees *</label><input type="number" value={form.feesMin} onChange={(e) => update("feesMin", Number(e.target.value))} className={inputClass} /></div>
            <div><label className={labelClass}>Max Fees *</label><input type="number" value={form.feesMax} onChange={(e) => update("feesMax", Number(e.target.value))} className={inputClass} /></div>
            <div><label className={labelClass}>NIRF Rank</label><input type="number" value={form.nirfRank ?? ""} onChange={(e) => update("nirfRank", e.target.value ? Number(e.target.value) : null)} className={inputClass} /></div>
            <div><label className={labelClass}>Avg Package (INR)</label><input type="number" value={form.avgPackage ?? ""} onChange={(e) => update("avgPackage", e.target.value ? Number(e.target.value) : null)} className={inputClass} /></div>
            <div><label className={labelClass}>Placement Rate (%)</label><input type="number" step="0.1" value={form.placementRate ?? ""} onChange={(e) => update("placementRate", e.target.value ? Number(e.target.value) : null)} className={inputClass} /></div>
            <div><label className={labelClass}>Rating (0-5)</label><input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => update("rating", Number(e.target.value))} className={inputClass} /></div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/admin/colleges" className="h-10 px-5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center transition-colors">Cancel</Link>
          <button type="submit" disabled={loading} className="h-10 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/25">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Update College
          </button>
        </div>
      </form>
    </div>
  );
}
