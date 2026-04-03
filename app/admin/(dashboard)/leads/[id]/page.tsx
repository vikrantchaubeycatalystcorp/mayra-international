"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Save, Loader2, User, Mail, Phone, Calendar,
  MapPin, GraduationCap, BookOpen, MessageSquare, FileText,
} from "lucide-react";
import { fetchOne, updateItem } from "@/hooks/admin/useAdminCRUD";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { formatDate } from "@/lib/utils";
import { LEAD_STATUSES } from "@/types/admin";

interface LeadDetail {
  id: string;
  source: string;
  fullName: string;
  email: string | null;
  phone: string;
  city: string | null;
  state: string | null;
  currentClass: string | null;
  courseInterested: string | null;
  message: string | null;
  rawPayload: unknown;
  adminEmailStatus: string;
  studentEmailStatus: string;
  emailFailureReason: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
}

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("NEW");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function load() {
      const data = await fetchOne<LeadDetail>("/api/admin/leads", id);
      if (data) {
        setLead(data);
        setStatus(data.status);
        setNotes(data.notes || "");
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    await updateItem("/api/admin/leads", id, { status, notes });
    setSaving(false);
    router.push("/admin/leads");
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="h-64 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Lead not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/leads"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Leads
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Lead Details</h1>
            <p className="text-sm text-gray-500 mt-0.5">ID: {lead.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={lead.source} label={lead.source === "FREE_COUNSELLING" ? "Counselling" : "Inquiry"} size="md" />
            <StatusBadge status={lead.status} size="md" />
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {/* Student Information */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Student Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Name</p>
                <p className="text-sm font-medium text-gray-800">{lead.fullName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-sm font-medium text-gray-800">{lead.email || "Not provided"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Phone</p>
                <p className="text-sm font-medium text-gray-800">{lead.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Submitted</p>
                <p className="text-sm font-medium text-gray-800">{formatDate(lead.createdAt)}</p>
              </div>
            </div>
            {(lead.city || lead.state) && (
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Location</p>
                  <p className="text-sm font-medium text-gray-800">
                    {[lead.city, lead.state].filter(Boolean).join(", ")}
                  </p>
                </div>
              </div>
            )}
            {lead.currentClass && (
              <div className="flex items-center gap-3">
                <GraduationCap className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Class / Qualification</p>
                  <p className="text-sm font-medium text-gray-800">{lead.currentClass}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lead Details */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Lead Details
          </h3>
          {lead.courseInterested && (
            <div className="flex items-center gap-3">
              <BookOpen className="w-4 h-4 text-gray-400" />
              <span className="text-sm">
                <strong>Course Interest:</strong> {lead.courseInterested}
              </span>
            </div>
          )}
          {lead.message && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Message</span>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-700 leading-relaxed">{lead.message}</p>
              </div>
            </div>
          )}
        </div>

        {/* Email Status */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Email Delivery Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Admin Notification</p>
                <StatusBadge status={lead.adminEmailStatus} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Student Confirmation</p>
                <StatusBadge status={lead.studentEmailStatus} />
              </div>
            </div>
          </div>
          {lead.emailFailureReason && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-xs text-red-700">
                <strong>Error:</strong> {lead.emailFailureReason}
              </p>
            </div>
          )}
        </div>

        {/* Status & Notes */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Status & Notes
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            >
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Internal Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add notes about this lead..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin/leads"
            className="h-10 px-5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center transition-colors"
          >
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-10 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/25"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
