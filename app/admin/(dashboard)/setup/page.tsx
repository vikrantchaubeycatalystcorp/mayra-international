"use client";

import { useState, useEffect } from "react";
import { Mail, Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface EmailConfig {
  toEmail: string;
  fromEmail: string;
  replyToEmail: string;
  emailEnabled: boolean;
  studentAutoReplyEnabled: boolean;
}

const DEFAULT_CONFIG: EmailConfig = {
  toEmail: "",
  fromEmail: "",
  replyToEmail: "",
  emailEnabled: true,
  studentAutoReplyEnabled: true,
};

export default function EmailSetupPage() {
  const [config, setConfig] = useState<EmailConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/setup/email");
        const json = await res.json();
        if (json.success && json.data) {
          setConfig(json.data);
        }
      } catch {
        // First time setup - use defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!config.toEmail) errs.toEmail = "Admin email is required";
    else if (!emailRegex.test(config.toEmail)) errs.toEmail = "Invalid email format";

    if (!config.fromEmail) errs.fromEmail = "Sender email is required";
    else if (!emailRegex.test(config.fromEmail)) errs.fromEmail = "Invalid email format";

    if (config.replyToEmail && !emailRegex.test(config.replyToEmail)) {
      errs.replyToEmail = "Invalid email format";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;

    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/setup/email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: "success", text: "Email configuration saved successfully" });
      } else {
        setMessage({ type: "error", text: json.error?.message || "Failed to save" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  function handleChange(field: keyof EmailConfig, value: string | boolean) {
    setConfig((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="h-64 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
            <Mail className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Email Setup</h1>
            <p className="text-sm text-gray-500">Configure email notifications for leads and enquiries</p>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`flex items-center gap-2 rounded-xl px-4 py-3 mb-6 text-sm font-medium ${
          message.type === "success"
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
            : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {message.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {/* Email Addresses */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Email Addresses</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Admin Notification Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={config.toEmail}
              onChange={(e) => handleChange("toEmail", e.target.value)}
              placeholder="admissions@mayra.com"
              className={`w-full h-10 px-3.5 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 ${
                errors.toEmail ? "border-red-300" : "border-gray-200"
              }`}
            />
            {errors.toEmail && <p className="text-xs text-red-500 mt-1">{errors.toEmail}</p>}
            <p className="text-xs text-gray-400 mt-1">Where lead notifications will be sent</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Sender Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={config.fromEmail}
              onChange={(e) => handleChange("fromEmail", e.target.value)}
              placeholder="noreply@mayra.com"
              className={`w-full h-10 px-3.5 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 ${
                errors.fromEmail ? "border-red-300" : "border-gray-200"
              }`}
            />
            {errors.fromEmail && <p className="text-xs text-red-500 mt-1">{errors.fromEmail}</p>}
            <p className="text-xs text-gray-400 mt-1">Used as the &quot;From&quot; address in all outgoing emails</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Reply-To Email <span className="text-gray-400 text-xs font-normal">(optional)</span>
            </label>
            <input
              type="email"
              value={config.replyToEmail}
              onChange={(e) => handleChange("replyToEmail", e.target.value)}
              placeholder="support@mayra.com"
              className={`w-full h-10 px-3.5 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 ${
                errors.replyToEmail ? "border-red-300" : "border-gray-200"
              }`}
            />
            {errors.replyToEmail && <p className="text-xs text-red-500 mt-1">{errors.replyToEmail}</p>}
            <p className="text-xs text-gray-400 mt-1">Where replies from students will go</p>
          </div>
        </div>

        {/* Toggles */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Email Preferences</h3>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Enable Email Sending</p>
              <p className="text-xs text-gray-400 mt-0.5">Toggle to temporarily disable all outgoing emails</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={config.emailEnabled}
              onClick={() => handleChange("emailEnabled", !config.emailEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                config.emailEnabled ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                config.emailEnabled ? "translate-x-5" : "translate-x-0"
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Student Auto-Reply</p>
              <p className="text-xs text-gray-400 mt-0.5">Send confirmation email to students after form submission</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={config.studentAutoReplyEnabled}
              onClick={() => handleChange("studentAutoReplyEnabled", !config.studentAutoReplyEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                config.studentAutoReplyEnabled ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                config.studentAutoReplyEnabled ? "translate-x-5" : "translate-x-0"
              }`} />
            </button>
          </div>
        </div>

        {/* SMTP Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <p className="text-xs text-amber-700">
            <strong>Note:</strong> SMTP credentials (host, port, username, password) must be configured via environment variables: <code className="bg-amber-100 px-1 rounded">SMTP_HOST</code>, <code className="bg-amber-100 px-1 rounded">SMTP_PORT</code>, <code className="bg-amber-100 px-1 rounded">SMTP_USER</code>, <code className="bg-amber-100 px-1 rounded">SMTP_PASS</code>
          </p>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-10 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/25"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
