"use client";

import { useState, useEffect } from "react";
import { Building2, Save, Loader2 } from "lucide-react";

interface CompanyInfo {
  id?: string;
  name: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  phoneLabel: string;
  address: string;
  logo: string;
  footerLogo: string;
  copyrightText: string;
  foundedYear: number | "";
  siteUrl: string;
  twitterHandle: string;
}

const EMPTY: CompanyInfo = {
  name: "",
  tagline: "",
  description: "",
  email: "",
  phone: "",
  phoneLabel: "",
  address: "",
  logo: "",
  footerLogo: "",
  copyrightText: "",
  foundedYear: "",
  siteUrl: "",
  twitterHandle: "",
};

export default function AdminCompanyInfoPage() {
  const [form, setForm] = useState<CompanyInfo>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/company-info", { credentials: "include" });
      const json = await res.json();
      if (json.success && json.data) {
        setForm({ ...EMPTY, ...json.data });
      }
    } catch {
      console.error("Failed to fetch company info");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/company-info", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: "success", text: "Company info updated successfully." });
        if (json.data) setForm({ ...EMPTY, ...json.data });
      } else {
        setMessage({ type: "error", text: json.error?.message || "Failed to update." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const set = (key: keyof CompanyInfo, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const inputClass =
    "w-full h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Company Info</h1>
            <p className="text-sm text-gray-500">Manage your site&apos;s core identity and contact information</p>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm font-medium ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Company Name</label>
            <input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Tagline</label>
            <input className={inputClass} value={form.tagline} onChange={(e) => set("tagline", e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Description</label>
            <textarea
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all min-h-[80px]"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input className={inputClass} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input className={inputClass} value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Phone Label</label>
            <input className={inputClass} value={form.phoneLabel} onChange={(e) => set("phoneLabel", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Founded Year</label>
            <input
              className={inputClass}
              type="number"
              value={form.foundedYear}
              onChange={(e) => set("foundedYear", e.target.value ? parseInt(e.target.value) : "")}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Address</label>
            <input className={inputClass} value={form.address} onChange={(e) => set("address", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Logo URL</label>
            <input className={inputClass} value={form.logo} onChange={(e) => set("logo", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Footer Logo URL</label>
            <input className={inputClass} value={form.footerLogo} onChange={(e) => set("footerLogo", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Copyright Text</label>
            <input className={inputClass} value={form.copyrightText} onChange={(e) => set("copyrightText", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Site URL</label>
            <input className={inputClass} value={form.siteUrl} onChange={(e) => set("siteUrl", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Twitter Handle</label>
            <input className={inputClass} value={form.twitterHandle} onChange={(e) => set("twitterHandle", e.target.value)} placeholder="@handle" />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 h-10 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98] disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
