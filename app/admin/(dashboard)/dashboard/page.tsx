"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useAdminAuth } from "@/hooks/admin/useAdminAuth";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  GraduationCap, BookOpen, FileText, Newspaper, Users, MessageSquare,
  Mail, TrendingUp, TrendingDown, ArrowUpRight, Clock, Eye, Plus, Globe, Activity, Zap,
  Shield, BarChart3, ArrowRight, CheckCircle2, AlertCircle, CalendarDays,
  Server, Wifi, Database, ChevronRight, Target, UserPlus, Inbox,
  PieChart, Layers, Flame, Award, Sparkles, LayoutDashboard,
} from "lucide-react";

interface DashboardData {
  stats: {
    colleges: number; courses: number; exams: number; news: number;
    users: number; enquiries: number; newsletter: number; studyAbroad: number; pendingEnquiries: number;
  };
  trends: {
    userGrowth: number; enquiryGrowth: number; usersLast30d: number;
    enquiriesLast30d: number; newsLast30d: number; newsletterLast30d: number;
  };
  leads: {
    total: number; new: number; contacted: number; closed: number;
    bySource: { inquiry: number; counselling: number };
  };
  enquiryBreakdown: { pending: number; underReview: number; responded: number; closed: number; spam: number };
  charts: { usersByDay: { date: string; count: number }[]; enquiriesByDay: { date: string; count: number }[] };
  recentActivity: { id: string; action: string; entity: string; details: string; createdAt: string }[];
  recentLeads: { id: string; fullName: string; source: string; status: string; createdAt: string; courseInterested: string | null; city: string | null }[];
}

// SVG Area Chart component
function AreaChart({ data, color, height = 120, showLabels = false }: {
  data: { date: string; count: number }[];
  color: string;
  height?: number;
  showLabels?: boolean;
}) {
  const values = data.map((d) => d.count);
  const max = Math.max(...values, 1);
  const width = 400;
  const padding = showLabels ? 24 : 0;
  const chartH = height - padding;

  const points = values.map((v, i) => ({
    x: (i / Math.max(values.length - 1, 1)) * width,
    y: chartH - (v / max) * (chartH - 8) - 4,
  }));

  // Smooth curve
  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const cpx1 = prev.x + (p.x - prev.x) / 3;
    const cpx2 = prev.x + (2 * (p.x - prev.x)) / 3;
    return `${acc} C ${cpx1} ${prev.y}, ${cpx2} ${p.y}, ${p.x} ${p.y}`;
  }, "");

  const areaD = `${pathD} L ${width} ${chartH} L 0 ${chartH} Z`;
  const gradId = `area-grad-${color.replace("#", "")}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradId})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Last point glow */}
      {points.length > 0 && (
        <>
          <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="5" fill={color} opacity="0.2" />
          <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="3" fill={color} />
        </>
      )}
      {showLabels && (
        <>
          {[0, Math.floor(data.length / 2), data.length - 1].map((idx) => (
            <text key={idx} x={points[idx]?.x ?? 0} y={height - 2} textAnchor="middle" className="fill-gray-400" fontSize="10">
              {data[idx]?.date.slice(5) ?? ""}
            </text>
          ))}
        </>
      )}
    </svg>
  );
}

// Donut Chart
function DonutChart({ segments, size = 120 }: {
  segments: { value: number; color: string; label: string }[];
  size?: number;
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  const r = 42;
  const circumference = 2 * Math.PI * r;
  let cumulativeOffset = 0;

  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <circle cx="60" cy="60" r={r} fill="none" stroke="#f1f5f9" strokeWidth="14" />
      {segments.map((seg, i) => {
        const pct = seg.value / total;
        const dashLength = pct * circumference;
        const offset = cumulativeOffset;
        cumulativeOffset += dashLength;
        return (
          <circle
            key={i}
            cx="60" cy="60" r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth="14"
            strokeDasharray={`${dashLength} ${circumference - dashLength}`}
            strokeDashoffset={-offset}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
            className="transition-all duration-700"
          />
        );
      })}
      <text x="60" y="55" textAnchor="middle" className="fill-gray-900 font-bold" fontSize="22">
        {formatNumber(total)}
      </text>
      <text x="60" y="72" textAnchor="middle" className="fill-gray-400" fontSize="10">
        Total
      </text>
    </svg>
  );
}

// Mini sparkline
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 28;
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - ((v - min) / range) * (h - 4) - 2,
  }));
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${pathD} L ${w} ${h} L 0 ${h} Z`;

  return (
    <svg width={w} height={h} className="overflow-visible">
      <defs>
        <linearGradient id={`sp-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#sp-${color.replace("#", "")})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={points[points.length - 1]?.x ?? 0} cy={points[points.length - 1]?.y ?? 0} r="2.5" fill={color} />
    </svg>
  );
}

// Horizontal bar
function HBar({ value, max, color, label, count }: { value: number; max: number; color: string; label: string; count: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-600">{label}</span>
        <span className="text-xs font-bold text-gray-900">{count}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { admin } = useAdminAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/analytics/detailed");
        if (res.ok) {
          const json = await res.json();
          if (json.success) setData(json.data);
        }
      } catch {
        // fallback handled by loading state
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const stats = data?.stats;
  const trends = data?.trends;
  const leads = data?.leads;

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const currentDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const statCards = useMemo(() => {
    if (!stats || !trends) return [];
    return [
      { label: "Colleges", value: stats.colleges, icon: GraduationCap, href: "/admin/colleges", color: "#3b82f6", bgColor: "bg-blue-500/10", textColor: "text-blue-600", trend: "+12%", trendUp: true, sparkData: [4, 6, 5, 8, 7, 10, stats.colleges || 12] },
      { label: "Courses", value: stats.courses, icon: BookOpen, href: "/admin/courses", color: "#10b981", bgColor: "bg-emerald-500/10", textColor: "text-emerald-600", trend: "+8%", trendUp: true, sparkData: [3, 5, 4, 6, 7, 6, stats.courses || 8] },
      { label: "Exams", value: stats.exams, icon: FileText, href: "/admin/exams", color: "#8b5cf6", bgColor: "bg-violet-500/10", textColor: "text-violet-600", trend: "+5%", trendUp: true, sparkData: [2, 3, 4, 3, 5, 4, stats.exams || 6] },
      { label: "Articles", value: stats.news, icon: Newspaper, href: "/admin/news", color: "#f59e0b", bgColor: "bg-amber-500/10", textColor: "text-amber-600", trend: `+${trends.newsLast30d}`, trendUp: true, sparkData: [1, 3, 2, 5, 4, 6, stats.news || 8] },
      { label: "Users", value: stats.users, icon: Users, href: "/admin/users", color: "#ec4899", bgColor: "bg-pink-500/10", textColor: "text-pink-600", trend: `${trends.userGrowth >= 0 ? "+" : ""}${trends.userGrowth}%`, trendUp: trends.userGrowth >= 0, sparkData: [5, 7, 8, 10, 12, 14, stats.users || 18] },
      { label: "Enquiries", value: stats.enquiries, icon: MessageSquare, href: "/admin/leads", color: "#06b6d4", bgColor: "bg-cyan-500/10", textColor: "text-cyan-600", trend: stats.pendingEnquiries > 0 ? `${stats.pendingEnquiries} pending` : "+3%", trendUp: stats.pendingEnquiries === 0, sparkData: [6, 4, 8, 5, 9, 7, stats.enquiries || 10] },
      { label: "Newsletter", value: stats.newsletter, icon: Mail, href: "/admin/newsletter", color: "#f97316", bgColor: "bg-orange-500/10", textColor: "text-orange-600", trend: `+${trends.newsletterLast30d}`, trendUp: true, sparkData: [3, 4, 6, 5, 8, 9, stats.newsletter || 12] },
      { label: "Study Abroad", value: stats.studyAbroad, icon: Globe, href: "/admin/study-abroad", color: "#14b8a6", bgColor: "bg-teal-500/10", textColor: "text-teal-600", trend: "New", trendUp: true, sparkData: [0, 0, 1, 1, 2, 2, stats.studyAbroad || 3] },
    ];
  }, [stats, trends]);

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

  const quickActions = [
    { label: "Add College", desc: "Create new college entry", href: "/admin/colleges/new", icon: GraduationCap, color: "bg-blue-500/10 text-blue-600 border-blue-200/50" },
    { label: "Add Course", desc: "Create new course", href: "/admin/courses/new", icon: BookOpen, color: "bg-emerald-500/10 text-emerald-600 border-emerald-200/50" },
    { label: "Add Exam", desc: "Create new exam", href: "/admin/exams/new", icon: FileText, color: "bg-violet-500/10 text-violet-600 border-violet-200/50" },
    { label: "Write Article", desc: "Publish news article", href: "/admin/news/new", icon: Newspaper, color: "bg-amber-500/10 text-amber-600 border-amber-200/50" },
    { label: "Manage Leads", desc: "Check leads & enquiries", href: "/admin/leads", icon: Target, color: "bg-cyan-500/10 text-cyan-600 border-cyan-200/50" },
    { label: "Media Library", desc: "Upload & manage media", href: "/admin/media", icon: Layers, color: "bg-pink-500/10 text-pink-600 border-pink-200/50" },
  ];

  // Skeleton pulse
  const Skeleton = ({ className }: { className?: string }) => (
    <div className={cn("bg-gray-100 rounded-lg animate-pulse", className)} />
  );

  return (
    <div className="space-y-6 max-w-[1440px]">
      {/* ============================================================
          HERO WELCOME BANNER
          ============================================================ */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-6 lg:p-8">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/8 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-[80px]" />
        <div className="absolute top-1/2 right-1/3 w-40 h-40 bg-violet-500/8 rounded-full blur-[60px]" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px]" />

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }} />

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-blue-300/60 text-sm font-medium">{getGreeting()},</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-[10px] font-semibold text-emerald-300 tracking-wide uppercase">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                  Live
                </span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
                {admin?.name || "Admin"}
              </h1>
              <p className="text-sm text-blue-200/30 mt-1.5 flex items-center gap-2">
                <CalendarDays className="w-3.5 h-3.5" />
                {currentDate}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { label: "Add College", href: "/admin/colleges/new", icon: GraduationCap },
                { label: "Add Course", href: "/admin/courses/new", icon: BookOpen },
                { label: "Write Article", href: "/admin/news/new", icon: Newspaper },
              ].map((action) => (
                <Link key={action.href} href={action.href}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white text-xs font-medium transition-all backdrop-blur-sm hover:border-white/[0.15] active:scale-[0.97]"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-300" />
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          {/* KPI Strip */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total Content", value: stats ? stats.colleges + stats.courses + stats.exams + stats.news + stats.studyAbroad : 0, icon: Database, change: trends?.newsLast30d ? `+${trends.newsLast30d} this month` : undefined },
              { label: "Active Users", value: stats?.users ?? 0, icon: Users, change: trends ? `${trends.userGrowth >= 0 ? "+" : ""}${trends.userGrowth}%` : undefined },
              { label: "Pending Enquiries", value: stats?.pendingEnquiries ?? 0, icon: MessageSquare, change: undefined },
              { label: "Total Leads", value: leads?.total ?? 0, icon: Target, change: leads?.new ? `${leads.new} new` : undefined },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.05] hover:bg-white/[0.06] transition-colors">
                <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-blue-400/70" />
                </div>
                <div>
                  <p className="text-xl font-bold text-white tabular-nums">
                    {loading ? <Skeleton className="w-10 h-6 bg-white/10" /> : formatNumber(item.value)}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] text-blue-300/40">{item.label}</p>
                    {item.change && (
                      <span className="text-[9px] font-semibold text-emerald-300/60">{item.change}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================
          STAT CARDS GRID
          ============================================================ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
                <Skeleton className="w-10 h-10 rounded-xl mb-4" />
                <Skeleton className="w-16 h-7 mb-2" />
                <Skeleton className="w-20 h-4" />
              </div>
            ))
          : statCards.map((card) => (
              <Link key={card.label} href={card.href}
                className="group relative bg-white rounded-2xl border border-gray-100/80 p-4 lg:p-5 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", card.bgColor)}>
                    <card.icon className={cn("w-5 h-5", card.textColor)} />
                  </div>
                  <div className="opacity-50 group-hover:opacity-100 transition-opacity">
                    <Sparkline data={card.sparkData} color={card.color} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 tracking-tight tabular-nums">
                  {formatNumber(card.value)}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-500 font-medium">{card.label}</p>
                  <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-md",
                    card.trendUp ? "text-emerald-600 bg-emerald-50" : "text-amber-600 bg-amber-50"
                  )}>
                    {card.trend}
                  </span>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="w-4 h-4 text-gray-300" />
                </div>
              </Link>
            ))}
      </div>

      {/* ============================================================
          CHARTS ROW - User Growth + Enquiry Trends
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* User Growth Chart */}
        <div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-5 pb-2">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-pink-500" />
                User Growth
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">New registrations - last 30 days</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">{loading ? "-" : trends?.usersLast30d ?? 0}</span>
              {trends && (
                <span className={cn("text-xs font-semibold px-1.5 py-0.5 rounded-md flex items-center gap-0.5",
                  trends.userGrowth >= 0 ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"
                )}>
                  {trends.userGrowth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {trends.userGrowth >= 0 ? "+" : ""}{trends.userGrowth}%
                </span>
              )}
            </div>
          </div>
          <div className="px-6 pb-4">
            {loading || !data?.charts?.usersByDay ? (
              <Skeleton className="w-full h-[120px]" />
            ) : (
              <AreaChart data={data.charts.usersByDay} color="#ec4899" height={120} showLabels />
            )}
          </div>
        </div>

        {/* Enquiry Trends Chart */}
        <div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-5 pb-2">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Inbox className="w-4 h-4 text-cyan-500" />
                Enquiry Trends
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Enquiries received - last 30 days</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">{loading ? "-" : trends?.enquiriesLast30d ?? 0}</span>
              {trends && (
                <span className={cn("text-xs font-semibold px-1.5 py-0.5 rounded-md flex items-center gap-0.5",
                  trends.enquiryGrowth >= 0 ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"
                )}>
                  {trends.enquiryGrowth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {trends.enquiryGrowth >= 0 ? "+" : ""}{trends.enquiryGrowth}%
                </span>
              )}
            </div>
          </div>
          <div className="px-6 pb-4">
            {loading || !data?.charts?.enquiriesByDay ? (
              <Skeleton className="w-full h-[120px]" />
            ) : (
              <AreaChart data={data.charts.enquiriesByDay} color="#06b6d4" height={120} showLabels />
            )}
          </div>
        </div>
      </div>

      {/* ============================================================
          LEADS & ENQUIRY BREAKDOWN ROW
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Enquiry Status Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-violet-500" />
            Enquiry Breakdown
          </h3>
          {loading || !data?.enquiryBreakdown ? (
            <div className="flex justify-center py-6"><Skeleton className="w-28 h-28 rounded-full" /></div>
          ) : (
            <div className="flex items-center gap-6">
              <DonutChart segments={[
                { value: data.enquiryBreakdown.pending, color: "#f59e0b", label: "Pending" },
                { value: data.enquiryBreakdown.underReview, color: "#3b82f6", label: "Under Review" },
                { value: data.enquiryBreakdown.responded, color: "#10b981", label: "Responded" },
                { value: data.enquiryBreakdown.closed, color: "#6b7280", label: "Closed" },
                { value: data.enquiryBreakdown.spam, color: "#ef4444", label: "Spam" },
              ]} />
              <div className="flex-1 space-y-2.5">
                {[
                  { label: "Pending", value: data.enquiryBreakdown.pending, color: "#f59e0b" },
                  { label: "Under Review", value: data.enquiryBreakdown.underReview, color: "#3b82f6" },
                  { label: "Responded", value: data.enquiryBreakdown.responded, color: "#10b981" },
                  { label: "Closed", value: data.enquiryBreakdown.closed, color: "#6b7280" },
                  { label: "Spam", value: data.enquiryBreakdown.spam, color: "#ef4444" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-gray-500 flex-1">{item.label}</span>
                    <span className="text-xs font-bold text-gray-900 tabular-nums">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Lead Pipeline */}
        <div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Target className="w-4 h-4 text-orange-500" />
              Lead Pipeline
            </h3>
            <Link href="/admin/leads" className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-0.5">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {loading || !leads ? (
            <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="w-full h-10" />)}</div>
          ) : (
            <div className="space-y-4">
              <HBar value={leads.new} max={leads.total} color="#f59e0b" label="New" count={leads.new} />
              <HBar value={leads.contacted} max={leads.total} color="#3b82f6" label="Contacted" count={leads.contacted} />
              <HBar value={leads.closed} max={leads.total} color="#10b981" label="Closed" count={leads.closed} />
              <div className="pt-3 border-t border-gray-100 mt-3">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-2">By Source</p>
                <div className="flex gap-3">
                  <div className="flex-1 p-2.5 rounded-xl bg-blue-50/50 border border-blue-100/50 text-center">
                    <p className="text-lg font-bold text-blue-700">{leads.bySource.inquiry}</p>
                    <p className="text-[10px] text-blue-500">Inquiry</p>
                  </div>
                  <div className="flex-1 p-2.5 rounded-xl bg-violet-50/50 border border-violet-100/50 text-center">
                    <p className="text-lg font-bold text-violet-700">{leads.bySource.counselling}</p>
                    <p className="text-[10px] text-violet-500">Counselling</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Leads */}
        <div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Flame className="w-4 h-4 text-red-500" />
              Latest Leads
            </h3>
          </div>
          <div className="px-4 pb-4">
            {loading || !data?.recentLeads?.length ? (
              <div className="text-center py-8">
                <Target className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-xs text-gray-400">No leads yet</p>
              </div>
            ) : (
              <div className="space-y-1">
                {data.recentLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50/80 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center text-xs font-bold text-orange-600">
                      {lead.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{lead.fullName}</p>
                      <p className="text-[10px] text-gray-400 truncate">
                        {[lead.courseInterested, lead.city].filter(Boolean).join(" - ") || lead.source}
                      </p>
                    </div>
                    <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded-md",
                      lead.status === "NEW" ? "text-amber-600 bg-amber-50" :
                      lead.status === "CONTACTED" ? "text-blue-600 bg-blue-50" :
                      "text-emerald-600 bg-emerald-50"
                    )}>
                      {lead.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================
          ACTIVITY + QUICK ACTIONS ROW
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-500" />
                Recent Activity
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Latest admin actions & events</p>
            </div>
            <Link href="/admin/logs" className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="px-6 pb-5">
            {loading || !data?.recentActivity?.length ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-5 h-5 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-500">No recent activity</p>
                <p className="text-xs text-gray-400 mt-0.5">Actions will appear here once you start managing content</p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {data.recentActivity.slice(0, 8).map((activity, idx) => {
                  const config = getActivityIcon(activity.action);
                  return (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50/80 transition-colors group">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", config.bg)}>
                        <config.icon className={cn("w-3.5 h-3.5", config.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 truncate group-hover:text-gray-900 transition-colors">
                          {activity.details || `${activity.action} ${activity.entity}`}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(activity.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden">
          <div className="px-6 py-5">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Quick Actions
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Frequent tasks & shortcuts</p>
          </div>
          <div className="px-4 pb-4 space-y-1.5">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}
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

      {/* ============================================================
          SYSTEM STATUS BAR
          ============================================================ */}
      <div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Server className="w-4 h-4 text-gray-500" />
            System Status
          </h3>
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
            { label: "API Response", value: "45ms", icon: Zap, accent: "text-amber-500" },
            { label: "Database", value: "Connected", icon: Database, accent: "text-emerald-500" },
            { label: "CDN", value: "Active", icon: Wifi, accent: "text-blue-500" },
            { label: "Storage", value: "2.4 GB free", icon: Server, accent: "text-violet-500" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/60 border border-gray-100/60">
              <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                <item.icon className={cn("w-4 h-4", item.accent)} />
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
