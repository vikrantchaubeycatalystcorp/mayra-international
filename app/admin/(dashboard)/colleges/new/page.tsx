"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, GraduationCap, MapPin, IndianRupee, Globe, Building } from "lucide-react";
import { createItem } from "@/hooks/admin/useAdminCRUD";
import { STREAMS as FALLBACK_STREAMS, COLLEGE_TYPES as FALLBACK_COLLEGE_TYPES, INDIAN_STATES as FALLBACK_INDIAN_STATES } from "@/types/admin";
import { useMasterData } from "@/hooks/useMasterData";

export default function NewCollegePage() {
  const router = useRouter();
  const { data: masterData } = useMasterData();
  const STREAMS = masterData?.streams.map((s) => s.name) ?? [...FALLBACK_STREAMS];
  const COLLEGE_TYPES = masterData?.collegeTypes.map((t) => t.name) ?? [...FALLBACK_COLLEGE_TYPES];
  const INDIAN_STATES = masterData?.states.map((s) => s.name) ?? [...FALLBACK_INDIAN_STATES];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "", type: "Private" as string, established: 2000, city: "", state: "", address: "",
    countryCode: "IN", streams: [] as string[], nirfRank: null as number | null, rating: 4.0,
    reviewCount: 50, feesMin: 50000, feesMax: 500000, avgPackage: null as number | null,
    topPackage: null as number | null, placementRate: null as number | null,
    accreditation: [] as string[], courses: [] as string[], description: "",
    highlights: [] as string[], website: "", phone: "", totalStudents: null as number | null,
    faculty: null as number | null, latitude: null as number | null, longitude: null as number | null,
    isFeatured: false, isActive: true, logo: "",
  });

  const update = (key: string, value: unknown) => setForm((p) => ({ ...p, [key]: value }));

  const toggleStream = (stream: string) => {
    setForm((p) => ({
      ...p,
      streams: p.streams.includes(stream)
        ? p.streams.filter((s) => s !== stream)
        : [...p.streams, stream],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await createItem("/api/admin/colleges", form);
    if (result.success) {
      router.push("/admin/colleges");
    } else {
      setError(result.error || "Failed to create college");
    }
    setLoading(false);
  };

  const inputClass = "admin-input";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin/colleges" className="inline-flex items-center gap-1.5 text-[13px] text-gray-400 hover:text-gray-600 mb-4 transition-colors group">
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" /> Back to Colleges
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Add New College</h1>
            <p className="text-sm text-gray-500 mt-0.5">Fill in the details to create a new college entry</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 animate-in fade-in slide-in-from-top-2 duration-200">
          <p className="font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Info */}
        <div className="admin-card p-6 space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
              <Building className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Basic Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelClass}>College Name <span className="text-red-500">*</span></label>
              <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} required className={inputClass} placeholder="e.g., Indian Institute of Technology Madras" />
            </div>
            <div>
              <label className={labelClass}>Type <span className="text-red-500">*</span></label>
              <select value={form.type} onChange={(e) => update("type", e.target.value)} className={inputClass}>
                {COLLEGE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Established Year <span className="text-red-500">*</span></label>
              <input type="number" value={form.established} onChange={(e) => update("established", Number(e.target.value))} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={4} className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none" placeholder="Brief description of the college..." />
          </div>
          <div className="flex items-center gap-8">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => update("isFeatured", e.target.checked)} className="sr-only peer" />
                <div className="w-9 h-5 bg-gray-200 peer-checked:bg-blue-600 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full shadow-inner" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Featured College</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input type="checkbox" checked={form.isActive} onChange={(e) => update("isActive", e.target.checked)} className="sr-only peer" />
                <div className="w-9 h-5 bg-gray-200 peer-checked:bg-emerald-600 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full shadow-inner" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Active (visible to students)</span>
            </label>
          </div>
        </div>

        {/* Location */}
        <div className="admin-card p-6 space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Location</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>City <span className="text-red-500">*</span></label>
              <input type="text" value={form.city} onChange={(e) => update("city", e.target.value)} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>State <span className="text-red-500">*</span></label>
              <select value={form.state} onChange={(e) => update("state", e.target.value)} required className={inputClass}>
                <option value="">Select State</option>
                {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Address <span className="text-red-500">*</span></label>
              <input type="text" value={form.address} onChange={(e) => update("address", e.target.value)} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Latitude</label>
              <input type="number" step="any" value={form.latitude ?? ""} onChange={(e) => update("latitude", e.target.value ? Number(e.target.value) : null)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Longitude</label>
              <input type="number" step="any" value={form.longitude ?? ""} onChange={(e) => update("longitude", e.target.value ? Number(e.target.value) : null)} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Streams */}
        <div className="admin-card p-6 space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
              <Globe className="w-3.5 h-3.5 text-violet-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Streams <span className="text-red-500">*</span></h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {STREAMS.map((stream) => (
              <button key={stream} type="button" onClick={() => toggleStream(stream)}
                className={`px-3 py-2.5 rounded-xl text-xs font-medium border transition-all duration-200 ${form.streams.includes(stream)
                  ? "border-blue-400 bg-blue-50 text-blue-700 shadow-sm shadow-blue-500/10"
                  : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {stream}
              </button>
            ))}
          </div>
          {form.streams.length > 0 && (
            <p className="text-xs text-gray-400">{form.streams.length} stream{form.streams.length > 1 ? "s" : ""} selected</p>
          )}
        </div>

        {/* Fees & Placement */}
        <div className="admin-card p-6 space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
              <IndianRupee className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Fees & Placement</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Min Fees (INR) <span className="text-red-500">*</span></label>
              <input type="number" value={form.feesMin} onChange={(e) => update("feesMin", Number(e.target.value))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Max Fees (INR) <span className="text-red-500">*</span></label>
              <input type="number" value={form.feesMax} onChange={(e) => update("feesMax", Number(e.target.value))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>NIRF Rank</label>
              <input type="number" value={form.nirfRank ?? ""} onChange={(e) => update("nirfRank", e.target.value ? Number(e.target.value) : null)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Avg Package (INR)</label>
              <input type="number" value={form.avgPackage ?? ""} onChange={(e) => update("avgPackage", e.target.value ? Number(e.target.value) : null)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Top Package (INR)</label>
              <input type="number" value={form.topPackage ?? ""} onChange={(e) => update("topPackage", e.target.value ? Number(e.target.value) : null)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Placement Rate (%)</label>
              <input type="number" step="0.1" value={form.placementRate ?? ""} onChange={(e) => update("placementRate", e.target.value ? Number(e.target.value) : null)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Rating (0-5)</label>
              <input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => update("rating", Number(e.target.value))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Website</label>
              <input type="url" value={form.website} onChange={(e) => update("website", e.target.value)} className={inputClass} placeholder="https://" />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 pb-6">
          <p className="text-xs text-gray-400">Fields marked with <span className="text-red-500">*</span> are required</p>
          <div className="flex items-center gap-3">
            <Link href="/admin/colleges" className="h-10 px-5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center transition-all active:scale-[0.98]">
              Cancel
            </Link>
            <button type="submit" disabled={loading}
              className="h-10 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/25 active:scale-[0.98]"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save College
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
