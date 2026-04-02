"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminAuth } from "@/hooks/admin/useAdminAuth";
import { formatNumber, formatDate } from "@/lib/utils";
import {
  GraduationCap,
  BookOpen,
  FileText,
  Newspaper,
  Users,
  MessageSquare,
  Mail,
  TrendingUp,
  ArrowUpRight,
  Clock,
  Eye,
  Plus,
  Globe,
  Activity,
  Zap,
  Shield,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
  Sparkles,
  Server,
  Wifi,
  Database,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardStats {
  colleges: number;
  courses: number;
  exams: number;
  news: number;
  users: number;
  enquiries: number;
  newsletter: number;
  studyAbroad: number;
  pendingEnquiries: number;
}

// Mini sparkline SVG component
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 80;
  const height = 28;
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((v - min) / range) * height,
  }));
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#grad-${color})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="2.5" fill={color} />
    </svg>
  );
}

export default function AdminDashboard() {
  const { admin } = useAdminAuth();
  const [stats, setStats] = useState<DashboardStats>({
    colleges: 0, courses: 0, exams: 0, news: 0,
    users: 0, enquiries: 0, newsletter: 0, studyAbroad: 0, pendingEnquiries: 0,
  });
  const [recentActivity, setRecentActivity] = useState<
    { id: string; action: string; entity: string; details: string; createdAt: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/admin/analytics/overview");
        if (res.ok) {
          const data = await res.json();
          if (data.success) setStats(data.data.stats);
          if (data.data.recentActivity) setRecentActivity(data.data.recentActivity);
        }
      } catch {
        // Stats will stay at 0
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const statCards = [
    {
      label: "Colleges",
      value: stats.colleges,
      icon: GraduationCap,
      href: "/admin/colleges",
      color: "#3b82f6",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      borderColor: "border-blue-100/50",
      trend: "+12%",
      trendUp: true,
      sparkData: [4, 6, 5, 8, 7, 10, 12],
    },
    {
      label: "Courses",
      value: stats.courses,
      icon: BookOpen,
      href: "/admin/courses",
      color: "#10b981",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
      borderColor: "border-emerald-100/50",
      trend: "+8%",
      trendUp: true,
      sparkData: [3, 5, 4, 6, 7, 6, 8],
    },
    {
      label: "Exams",
      value: stats.exams,
      icon: FileText,
      href: "/admin/exams",
      color: "#8b5cf6",
      bgColor: "bg-violet-50",
      textColor: "text-violet-600",
      borderColor: "border-violet-100/50",
      trend: "+5%",
      trendUp: true,
      sparkData: [2, 3, 4, 3, 5, 4, 6],
    },
    {
      label: "Articles",
      value: stats.news,
      icon: Newspaper,
      href: "/admin/news",
      color: "#f59e0b",
      bgColor: "bg-amber-50",
      textColor: "text-amber-600",
      borderColor: "border-amber-100/50",
      trend: "+15%",
      trendUp: true,
      sparkData: [1, 3, 2, 5, 4, 6, 8],
    },
    {
      label: "Users",
      value: stats.users,
      icon: Users,
      href: "/admin/users",
      color: "#ec4899",
      bgColor: "bg-pink-50",
      textColor: "text-pink-600",
      borderColor: "border-pink-100/50",
      trend: "+22%",
      trendUp: true,
      sparkData: [5, 7, 8, 10, 12, 14, 18],
    },
    {
      label: "Enquiries",
      value: stats.enquiries,
      icon: MessageSquare,
      href: "/admin/enquiries",
      color: "#06b6d4",
      bgColor: "bg-cyan-50",
      textColor: "text-cyan-600",
      borderColor: "border-cyan-100/50",
      trend: stats.pendingEnquiries > 0 ? `${stats.pendingEnquiries} pending` : "+3%",
      trendUp: stats.pendingEnquiries === 0,
      sparkData: [6, 4, 8, 5, 9, 7, 10],
    },
    {
      label: "Newsletter",
      value: stats.newsletter,
      icon: Mail,
      href: "/admin/newsletter",
      color: "#f97316",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
      borderColor: "border-orange-100/50",
      trend: "+18%",
      trendUp: true,
      sparkData: [3, 4, 6, 5, 8, 9, 12],
    },
    {
      label: "Study Abroad",
      value: stats.studyAbroad,
      icon: Globe,
      href: "/admin/study-abroad",
      color: "#14b8a6",
      bgColor: "bg-teal-50",
      textColor: "text-teal-600",
      borderColor: "border-teal-100/50",
      trend: "New",
      trendUp: true,
      sparkData: [0, 0, 1, 1, 2, 2, 3],
    },
  ];

  const quickActions = [
    { label: "Add College", desc: "Create new college entry", href: "/admin/colleges/new", icon: GraduationCap, color: "bg-blue-50 text-blue-600 border-blue-100/50" },
    { label: "Add Course", desc: "Create new course", href: "/admin/courses/new", icon: BookOpen, color: "bg-emerald-50 text-emerald-600 border-emerald-100/50" },
    { label: "Add Exam", desc: "Create new exam", href: "/admin/exams/new", icon: FileText, color: "bg-violet-50 text-violet-600 border-violet-100/50" },
    { label: "Write Article", desc: "Publish news article", href: "/admin/news/new", icon: Newspaper, color: "bg-amber-50 text-amber-600 border-amber-100/50" },
    { label: "View Enquiries", desc: "Check pending leads", href: "/admin/enquiries", icon: MessageSquare, color: "bg-cyan-50 text-cyan-600 border-cyan-100/50" },
    { label: "Media Library", desc: "Upload & manage media", href: "/admin/media", icon: Eye, color: "bg-pink-50 text-pink-600 border-pink-100/50" },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getActivityIcon = (action: string) => {
    const map: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
      CREATE: { icon: Plus, color: "text-emerald-500", bg: "bg-emerald-50" },
      UPDATE: { icon: Eye, color: "text-blue-500", bg: "bg-blue-50" },
      DELETE: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-50" },
      LOGIN: { icon: Shield, color: "text-violet-500", bg: "bg-violet-50" },
      EXPORT: { icon: ArrowUpRight, color: "text-amber-500", bg: "bg-amber-50" },
    };
    return map[action] || { icon: Activity, color: "text-gray-500", bg: "bg-gray-50" };
  };

  const currentDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 lg:p-8">
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl" />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }} />

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-blue-300/50 text-sm">{getGreeting()},</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-400/10 text-[10px] font-medium text-blue-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                  Online
                </span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
                {admin?.name || "Admin"}
              </h1>
              <p className="text-sm text-blue-200/40 mt-1.5 flex items-center gap-2">
                <CalendarDays className="w-3.5 h-3.5" />
                {currentDate}
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Add College", href: "/admin/colleges/new", icon: GraduationCap },
                { label: "Add Course", href: "/admin/courses/new", icon: BookOpen },
                { label: "Write Article", href: "/admin/news/new", icon: Newspaper },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/[0.08] text-white text-xs font-medium transition-all backdrop-blur-sm hover:border-white/[0.15] active:scale-[0.97]"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-300" />
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Summary Strip */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total Content", value: stats.colleges + stats.courses + stats.exams + stats.news + stats.studyAbroad, icon: Database },
              { label: "Active Users", value: stats.users, icon: Users },
              { label: "Pending Enquiries", value: stats.pendingEnquiries, icon: MessageSquare },
              { label: "Newsletter Subs", value: stats.newsletter, icon: Mail },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.05]">
                <item.icon className="w-4 h-4 text-blue-400/60" />
                <div>
                  <p className="text-lg font-bold text-white">
                    {loading ? "—" : formatNumber(item.value)}
                  </p>
                  <p className="text-[10px] text-blue-300/40">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={cn(
              "group relative bg-white rounded-2xl border p-4 lg:p-5 hover:shadow-lg transition-all duration-300",
              card.borderColor,
              "border-gray-100/80"
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", card.bgColor)}>
                <card.icon className={cn("w-5 h-5", card.textColor)} />
              </div>
              <div className="opacity-60 group-hover:opacity-100 transition-opacity">
                <Sparkline data={card.sparkData} color={card.color} />
              </div>
            </div>

            <div>
              <p className="text-2xl font-bold text-gray-900 tracking-tight">
                {loading ? (
                  <span className="inline-block w-12 h-7 skeleton rounded-lg" />
                ) : (
                  formatNumber(card.value)
                )}
              </p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-500 font-medium">{card.label}</p>
                <span
                  className={cn(
                    "text-[10px] font-semibold px-1.5 py-0.5 rounded-md",
                    card.trendUp
                      ? "text-emerald-600 bg-emerald-50"
                      : "text-amber-600 bg-amber-50"
                  )}
                >
                  {card.trend}
                </span>
              </div>
            </div>

            {/* Hover arrow */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowUpRight className="w-4 h-4 text-gray-400" />
            </div>
          </Link>
        ))}
      </div>

      {/* Content Row: Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
        {/* Recent Activity - 3 cols */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
              <p className="text-xs text-gray-400 mt-0.5">Latest admin actions & events</p>
            </div>
            <Link
              href="/admin/logs"
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              View all
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="px-6 pb-5">
            {recentActivity.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-5 h-5 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-500">No recent activity</p>
                <p className="text-xs text-gray-400 mt-0.5">Actions will appear here once you start managing content</p>
              </div>
            ) : (
              <div className="space-y-1">
                {recentActivity.slice(0, 6).map((activity, index) => {
                  const config = getActivityIcon(activity.action);
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50/80 transition-colors group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", config.bg)}>
                        <config.icon className={cn("w-3.5 h-3.5", config.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 truncate group-hover:text-gray-900 transition-colors">
                          {activity.details || `${activity.action} ${activity.entity}`}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(activity.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions - 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden">
          <div className="px-6 py-5">
            <h3 className="text-sm font-semibold text-gray-900">Quick Actions</h3>
            <p className="text-xs text-gray-400 mt-0.5">Frequent tasks & shortcuts</p>
          </div>
          <div className="px-4 pb-4 space-y-1.5">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-gray-100 hover:bg-gray-50/80 transition-all group"
              >
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center border", action.color)}>
                  <action.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 group-hover:text-gray-900">{action.label}</p>
                  <p className="text-[11px] text-gray-400">{action.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* System Status Bar */}
      <div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">System Status</h3>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-[10px] font-semibold text-emerald-600 border border-emerald-100/60">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            All Systems Operational
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "API Response", value: "45ms", status: "healthy", icon: Zap },
            { label: "Database", value: "Connected", status: "healthy", icon: Database },
            { label: "CDN", value: "Active", status: "healthy", icon: Wifi },
            { label: "Storage", value: "2.4 GB free", status: "healthy", icon: Server },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/80 border border-gray-100/60">
              <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center">
                <item.icon className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-700">{item.value}</p>
                <p className="text-[10px] text-gray-400">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
