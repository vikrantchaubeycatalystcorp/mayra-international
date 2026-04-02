"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, Save, Loader2, User, Building2, Mail, Phone, Calendar } from "lucide-react";
import { fetchOne, updateItem } from "@/hooks/admin/useAdminCRUD";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { formatDate } from "@/lib/utils";
import { ENQUIRY_STATUSES, PRIORITIES } from "@/types/admin";

interface EnquiryDetail { id: string; studentName: string; email: string; phone: string | null; collegeName: string; program: string | null; message: string; status: string; priority: string; response: string | null; notes: string | null; createdAt: string; }

export default function EnquiryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [enquiry, setEnquiry] = useState<EnquiryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [response, setResponse] = useState("");
  const [status, setStatus] = useState("PENDING");
  const [priority, setPriority] = useState("NORMAL");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function load() {
      const data = await fetchOne<EnquiryDetail>("/api/admin/enquiries", id);
      if (data) {
        setEnquiry(data);
        setStatus(data.status);
        setPriority(data.priority);
        setResponse(data.response || "");
        setNotes(data.notes || "");
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    await updateItem("/api/admin/enquiries", id, { response, status, priority, notes });
    setSaving(false);
    router.push("/admin/enquiries");
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48" /><div className="h-64 bg-gray-100 rounded-2xl" /></div>;
  if (!enquiry) return <div className="text-center py-12"><p className="text-gray-500">Enquiry not found</p></div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/enquiries" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"><ArrowLeft className="w-4 h-4" /> Back to Enquiries</Link>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Enquiry Details</h1>
          <StatusBadge status={enquiry.status} />
        </div>
      </div>

      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Student Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3"><User className="w-4 h-4 text-gray-400" /><div><p className="text-xs text-gray-400">Name</p><p className="text-sm font-medium text-gray-800">{enquiry.studentName}</p></div></div>
            <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-gray-400" /><div><p className="text-xs text-gray-400">Email</p><p className="text-sm font-medium text-gray-800">{enquiry.email}</p></div></div>
            <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-gray-400" /><div><p className="text-xs text-gray-400">Phone</p><p className="text-sm font-medium text-gray-800">{enquiry.phone || "—"}</p></div></div>
            <div className="flex items-center gap-3"><Calendar className="w-4 h-4 text-gray-400" /><div><p className="text-xs text-gray-400">Date</p><p className="text-sm font-medium text-gray-800">{formatDate(enquiry.createdAt)}</p></div></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Enquiry</h3>
          <div className="flex items-center gap-3"><Building2 className="w-4 h-4 text-gray-400" /><span className="text-sm"><strong>College:</strong> {enquiry.collegeName}</span></div>
          {enquiry.program && <p className="text-sm text-gray-700"><strong>Program:</strong> {enquiry.program}</p>}
          <div className="bg-gray-50 rounded-xl p-4"><p className="text-sm text-gray-700 leading-relaxed">{enquiry.message || "No message provided"}</p></div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Response & Status</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full h-10 px-3.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400">
                {ENQUIRY_STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full h-10 px-3.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400">
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Response to Student</label>
            <textarea value={response} onChange={(e) => setResponse(e.target.value)} rows={4} placeholder="Type your response..." className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Internal Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Internal notes (not visible to student)..." className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none" />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link href="/admin/enquiries" className="h-10 px-5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center transition-colors">Cancel</Link>
          <button onClick={handleSave} disabled={saving} className="h-10 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/25">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Save & Respond
          </button>
        </div>
      </div>
    </div>
  );
}
