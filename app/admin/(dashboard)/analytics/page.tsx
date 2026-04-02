"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Users, MessageSquare, GraduationCap, BookOpen, FileText, Newspaper } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface Stats { colleges: number; courses: number; exams: number; news: number; users: number; enquiries: number; newsletter: number; pendingEnquiries: number; }

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<Stats>({ colleges: 0, courses: 0, exams: 0, news: 0, users: 0, enquiries: 0, newsletter: 0, pendingEnquiries: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/analytics/overview");
        if (res.ok) {
          const data = await res.json();
          if (data.success) setStats(data.data.stats);
        }
      } catch {} finally { setLoading(false); }
    }
    load();
  }, []);

  const metrics = [
    { label: "Total Colleges", value: stats.colleges, icon: GraduationCap, color: "bg-blue-50 text-blue-600" },
    { label: "Total Courses", value: stats.courses, icon: BookOpen, color: "bg-emerald-50 text-emerald-600" },
    { label: "Total Exams", value: stats.exams, icon: FileText, color: "bg-violet-50 text-violet-600" },
    { label: "Published Articles", value: stats.news, icon: Newspaper, color: "bg-amber-50 text-amber-600" },
    { label: "Registered Users", value: stats.users, icon: Users, color: "bg-pink-50 text-pink-600" },
    { label: "Total Enquiries", value: stats.enquiries, icon: MessageSquare, color: "bg-cyan-50 text-cyan-600" },
    { label: "Pending Enquiries", value: stats.pendingEnquiries, icon: MessageSquare, color: "bg-orange-50 text-orange-600" },
    { label: "Newsletter Subs", value: stats.newsletter, icon: TrendingUp, color: "bg-teal-50 text-teal-600" },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><BarChart3 className="w-5 h-5 text-blue-600" /></div>
        <div><h1 className="text-xl font-bold text-gray-900">Analytics</h1><p className="text-sm text-gray-500">Platform overview and metrics</p></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className={`w-10 h-10 rounded-xl ${m.color} flex items-center justify-center mb-3`}><m.icon className="w-5 h-5" /></div>
            <p className="text-2xl font-bold text-gray-900">{loading ? <span className="inline-block w-12 h-7 bg-gray-100 rounded animate-pulse" /> : formatNumber(m.value)}</p>
            <p className="text-sm text-gray-500 mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-xl border border-gray-100 p-8 text-center">
        <BarChart3 className="w-12 h-12 text-gray-200 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900">Detailed Charts Coming Soon</h3>
        <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto">
          Traffic analytics, content performance charts, user growth trends, and geographic distribution will be available in a future update.
        </p>
      </div>
    </div>
  );
}
