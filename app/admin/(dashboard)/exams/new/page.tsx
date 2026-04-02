"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Plus, X } from "lucide-react";
import { createItem } from "@/hooks/admin/useAdminCRUD";
import { STREAMS as FALLBACK_STREAMS, COURSE_LEVELS as FALLBACK_COURSE_LEVELS, EXAM_MODES as FALLBACK_EXAM_MODES } from "@/types/admin";
import { useMasterData } from "@/hooks/useMasterData";

export default function NewExamPage() {
  const router = useRouter();
  const { data: masterData } = useMasterData();
  const STREAMS = masterData?.streams.map((s) => s.name) ?? [...FALLBACK_STREAMS];
  const COURSE_LEVELS = masterData?.courseLevels.map((l) => l.name) ?? [...FALLBACK_COURSE_LEVELS];
  const EXAM_MODES = masterData?.examModes.map((m) => m.name) ?? [...FALLBACK_EXAM_MODES];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", fullName: "", conductingBody: "", level: "UG", streams: [] as string[],
    mode: "Offline", frequency: "Annual", registrationStart: "", registrationEnd: "",
    examDate: "", resultDate: "", applicationFeeGeneral: 0, applicationFeeSCST: null as number | null,
    totalSeats: null as number | null, participatingColleges: null as number | null,
    eligibility: "", description: "",
    syllabus: [] as { section: string; topics: string[] }[], isFeatured: false, isActive: true,
  });

  const update = (key: string, value: unknown) => setForm((p) => ({ ...p, [key]: value }));
  const toggleStream = (s: string) => setForm((p) => ({ ...p, streams: p.streams.includes(s) ? p.streams.filter((x) => x !== s) : [...p.streams, s] }));

  const addSection = () => setForm((p) => ({ ...p, syllabus: [...p.syllabus, { section: "", topics: [] }] }));
  const removeSection = (i: number) => setForm((p) => ({ ...p, syllabus: p.syllabus.filter((_, idx) => idx !== i) }));
  const updateSection = (i: number, key: string, value: unknown) => setForm((p) => ({ ...p, syllabus: p.syllabus.map((s, idx) => idx === i ? { ...s, [key]: value } : s) }));
  const addTopic = (i: number, topic: string) => {
    if (!topic.trim()) return;
    setForm((p) => ({ ...p, syllabus: p.syllabus.map((s, idx) => idx === i ? { ...s, topics: [...s.topics, topic.trim()] } : s) }));
  };
  const removeTopic = (sIdx: number, tIdx: number) => setForm((p) => ({ ...p, syllabus: p.syllabus.map((s, idx) => idx === sIdx ? { ...s, topics: s.topics.filter((_, ti) => ti !== tIdx) } : s) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    const result = await createItem("/api/admin/exams", { ...form, registrationStart: form.registrationStart || null, registrationEnd: form.registrationEnd || null, examDate: form.examDate || null, resultDate: form.resultDate || null });
    if (result.success) router.push("/admin/exams"); else setError(result.error || "Failed to create");
    setLoading(false);
  };

  const inputClass = "w-full h-10 px-3.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/exams" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"><ArrowLeft className="w-4 h-4" /> Back to Exams</Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Exam</h1>
      </div>
      {error && <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelClass}>Exam Name (Abbreviation) *</label><input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} required className={inputClass} placeholder="e.g., JEE Main" /></div>
            <div><label className={labelClass}>Full Name *</label><input type="text" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} required className={inputClass} placeholder="Joint Entrance Examination Main" /></div>
            <div><label className={labelClass}>Conducting Body *</label><input type="text" value={form.conductingBody} onChange={(e) => update("conductingBody", e.target.value)} required className={inputClass} placeholder="e.g., NTA" /></div>
            <div><label className={labelClass}>Level *</label><select value={form.level} onChange={(e) => update("level", e.target.value)} className={inputClass}>{COURSE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}</select></div>
            <div><label className={labelClass}>Mode *</label><select value={form.mode} onChange={(e) => update("mode", e.target.value)} className={inputClass}>{EXAM_MODES.map((m) => <option key={m} value={m}>{m}</option>)}</select></div>
            <div><label className={labelClass}>Frequency</label><input type="text" value={form.frequency} onChange={(e) => update("frequency", e.target.value)} className={inputClass} /></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Streams *</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {STREAMS.map((s) => (
              <button key={s} type="button" onClick={() => toggleStream(s)} className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${form.streams.includes(s) ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>{s}</button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Dates & Fees</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelClass}>Registration Start</label><input type="text" value={form.registrationStart} onChange={(e) => update("registrationStart", e.target.value)} className={inputClass} placeholder="e.g., Jan 15, 2026" /></div>
            <div><label className={labelClass}>Registration End</label><input type="text" value={form.registrationEnd} onChange={(e) => update("registrationEnd", e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Exam Date</label><input type="text" value={form.examDate} onChange={(e) => update("examDate", e.target.value)} className={inputClass} placeholder="e.g., Apr 2026" /></div>
            <div><label className={labelClass}>Result Date</label><input type="text" value={form.resultDate} onChange={(e) => update("resultDate", e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Application Fee (General) *</label><input type="number" value={form.applicationFeeGeneral} onChange={(e) => update("applicationFeeGeneral", Number(e.target.value))} className={inputClass} /></div>
            <div><label className={labelClass}>Application Fee (SC/ST)</label><input type="number" value={form.applicationFeeSCST ?? ""} onChange={(e) => update("applicationFeeSCST", e.target.value ? Number(e.target.value) : null)} className={inputClass} /></div>
          </div>
        </div>

        {/* Syllabus Builder */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Syllabus</h3>
            <button type="button" onClick={addSection} className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"><Plus className="w-3.5 h-3.5" /> Add Section</button>
          </div>
          {form.syllabus.map((section, sIdx) => (
            <div key={sIdx} className="border border-gray-100 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <input type="text" value={section.section} onChange={(e) => updateSection(sIdx, "section", e.target.value)} placeholder="Section name (e.g., Physics)" className="text-sm font-medium bg-transparent outline-none flex-1" />
                <button type="button" onClick={() => removeSection(sIdx)} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {section.topics.map((topic, tIdx) => (
                  <span key={tIdx} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs">
                    {topic}
                    <button type="button" onClick={() => removeTopic(sIdx, tIdx)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                  </span>
                ))}
                <input type="text" placeholder="Add topic + Enter" className="text-xs outline-none bg-transparent min-w-[120px]" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTopic(sIdx, e.currentTarget.value); e.currentTarget.value = ""; } }} />
              </div>
            </div>
          ))}
          {form.syllabus.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No syllabus sections added yet</p>}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Visibility</h3>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={form.isFeatured} onChange={(e) => update("isFeatured", e.target.checked)} className="sr-only peer" /><div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" /></label>
              <span className="text-sm font-medium text-gray-700">Featured Exam</span>
            </div>
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={form.isActive} onChange={(e) => update("isActive", e.target.checked)} className="sr-only peer" /><div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-green-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" /></label>
              <span className="text-sm font-medium text-gray-700">Active (visible to students)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/admin/exams" className="h-10 px-5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center transition-colors">Cancel</Link>
          <button type="submit" disabled={loading} className="h-10 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/25">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Exam</button>
        </div>
      </form>
    </div>
  );
}
