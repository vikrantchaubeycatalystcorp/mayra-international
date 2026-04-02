"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  UserPlus,
  Check,
  X,
} from "lucide-react";

export default function AdminRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "EDITOR" as "ADMIN" | "EDITOR" | "VIEWER",
  });

  const [showPassword, setShowPassword] = useState(false);

  const passwordChecks = {
    length: form.password.length >= 8,
    upper: /[A-Z]/.test(form.password),
    lower: /[a-z]/.test(form.password),
    number: /[0-9]/.test(form.password),
    special: /[^A-Za-z0-9]/.test(form.password),
  };

  const allPasswordValid = Object.values(passwordChecks).every(Boolean);
  const passwordsMatch = form.password === form.confirmPassword && form.confirmPassword !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Registration failed");
      setSuccess(true);
      setTimeout(() => router.push("/admin/admins"), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/admin/admins"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Admin Users
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Register New Admin</h1>
        <p className="text-sm text-gray-500 mt-1">
          Create a new admin account with specific role permissions
        </p>
      </div>

      {success && (
        <div className="mb-5 p-4 rounded-xl bg-green-50 border border-green-100 text-sm text-green-700 flex items-center gap-2.5">
          <Check className="w-5 h-5" />
          Admin registered successfully! Redirecting...
        </div>
      )}

      {error && (
        <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Personal Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="John Doe"
                required
                className="w-full h-10 px-3.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full h-10 px-3.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="admin@mayrainternational.com"
              required
              className="w-full h-10 px-3.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Role <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(["ADMIN", "EDITOR", "VIEWER"] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => update("role", role)}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    form.role === role
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-600"
                  }`}
                >
                  <p className="text-sm font-semibold">{role.replace("_", " ")}</p>
                  <p className="text-[10px] mt-0.5 text-gray-400">
                    {role === "ADMIN" && "Full CRUD access"}
                    {role === "EDITOR" && "Create & edit content"}
                    {role === "VIEWER" && "Read-only access"}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Security
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="Create a strong password"
                required
                className="w-full h-10 px-3.5 pr-10 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="mt-2.5 grid grid-cols-2 gap-1.5">
              {[
                { key: "length", label: "Min 8 characters" },
                { key: "upper", label: "Uppercase letter" },
                { key: "lower", label: "Lowercase letter" },
                { key: "number", label: "Number" },
                { key: "special", label: "Special character" },
              ].map(({ key, label }) => (
                <div
                  key={key}
                  className={`flex items-center gap-1.5 text-xs ${
                    passwordChecks[key as keyof typeof passwordChecks]
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  {passwordChecks[key as keyof typeof passwordChecks] ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <X className="w-3 h-3" />
                  )}
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => update("confirmPassword", e.target.value)}
              placeholder="Confirm your password"
              required
              className={`w-full h-10 px-3.5 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 transition-all ${
                form.confirmPassword
                  ? passwordsMatch
                    ? "border-green-300 focus:ring-green-500/20 focus:border-green-400"
                    : "border-red-300 focus:ring-red-500/20 focus:border-red-400"
                  : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-400"
              }`}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 justify-end">
          <Link
            href="/admin/admins"
            className="h-10 px-5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || !allPasswordValid || !passwordsMatch}
            className="h-10 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Register Admin
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
