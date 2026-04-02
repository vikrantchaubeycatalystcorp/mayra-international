"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth, adminLogin } from "@/hooks/admin/useAdminAuth";
import { Eye, EyeOff, Lock, Mail, ArrowRight, Shield, Sparkles, CheckCircle2 } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const { setAdmin } = useAdminAuth();
  const router = useRouter();

  // Animated counter for stats
  const [counters, setCounters] = useState({ colleges: 0, courses: 0, exams: 0, students: 0 });
  useEffect(() => {
    const targets = { colleges: 200, courses: 100, exams: 50, students: 1000 };
    const duration = 1500;
    const steps = 30;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCounters({
        colleges: Math.round(targets.colleges * eased),
        courses: Math.round(targets.courses * eased),
        exams: Math.round(targets.exams * eased),
        students: Math.round(targets.students * eased),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await adminLogin(email, password);
      setAdmin(data);
      router.push("/admin/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Branding Panel */}
      <div className="hidden lg:flex lg:w-[520px] xl:w-[580px] relative bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex-col justify-between p-10 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.25) 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }} />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/3 w-40 h-40 bg-violet-500/8 rounded-full blur-2xl" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/20">
              <span className="text-lg font-bold text-white">M</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Mayra International</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                <p className="text-[11px] text-blue-300/60 font-medium">Admin Portal v2.0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight tracking-tight">
              Manage your education<br />
              portal with confidence
            </h2>
            <p className="mt-4 text-blue-200/50 text-sm leading-relaxed max-w-md">
              Access comprehensive tools to manage colleges, courses, exams,
              and student enquiries all from one powerful dashboard.
            </p>
          </div>

          {/* Animated Stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Colleges", value: `${counters.colleges}+`, desc: "Managed" },
              { label: "Courses", value: `${counters.courses}+`, desc: "Listed" },
              { label: "Exams", value: `${counters.exams}+`, desc: "Tracked" },
              { label: "Students", value: `${(counters.students / 1000).toFixed(counters.students >= 1000 ? 0 : 1)}K+`, desc: "Active" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/[0.04] backdrop-blur-sm rounded-xl p-4 border border-white/[0.06] hover:bg-white/[0.06] transition-colors"
              >
                <p className="text-2xl font-bold text-white tabular-nums">{stat.value}</p>
                <p className="text-[11px] text-blue-300/50 mt-0.5">
                  {stat.label} {stat.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Features List */}
          <div className="space-y-3">
            {[
              "Role-based access control with 4 admin levels",
              "Real-time analytics & activity monitoring",
              "Comprehensive content management system",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-blue-500/15 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-blue-400" />
                </div>
                <p className="text-xs text-blue-200/40">{feature}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-[11px] text-slate-500/80">
            &copy; {new Date().getFullYear()} Mayra International. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 via-white to-blue-50/20">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-base font-bold text-white">M</span>
            </div>
            <div>
              <p className="text-base font-bold text-gray-900">Mayra International</p>
              <p className="text-xs text-gray-500">Admin Portal</p>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-medium mb-4 border border-blue-100/50">
              <Shield className="w-3.5 h-3.5" />
              Secure Admin Access
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome back</h1>
            <p className="text-sm text-gray-500 mt-1.5">
              Sign in to your admin account to continue
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold">!</span>
              </div>
              <div>
                <p className="font-medium">{error}</p>
                <p className="text-xs text-red-500 mt-0.5">Please check your credentials and try again</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@mayrainternational.com"
                  required
                  autoFocus
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full h-12 pl-11 pr-11 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-0.5"
                >
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-4 h-4 rounded border-2 border-gray-300 peer-checked:border-blue-600 peer-checked:bg-blue-600 transition-all flex items-center justify-center">
                    {rememberMe && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-600 group-hover:text-gray-800 transition-colors">Remember me for 30 days</span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-[0.98]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-center gap-2">
              <Shield className="w-3.5 h-3.5 text-gray-400" />
              <p className="text-[11px] text-gray-400">
                Protected by enterprise-grade security with encrypted sessions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
