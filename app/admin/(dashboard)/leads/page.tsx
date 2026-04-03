"use client";

import { useState, useEffect, useMemo } from "react";
import {
  User, Phone, Download, TrendingUp, TrendingDown, Users, Inbox,
  BarChart3, Mail, MailX, MessageSquare, ArrowUpRight,
  Zap, Target, Clock, CheckCircle2, XCircle, MinusCircle,
  ChevronRight, Sparkles, Activity,
} from "lucide-react";
import Link from "next/link";
import { useAdminCRUD } from "@/hooks/admin/useAdminCRUD";
import { AdminDataTable, type Column } from "@/components/admin/shared/AdminDataTable";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { formatDate } from "@/lib/utils";
import { LEAD_SOURCES, LEAD_STATUSES } from "@/types/admin";
import { cn } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, RadialBarChart, RadialBar, PolarAngleAxis,
} from "recharts";

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

interface LeadRow {
  id: string;
  source: string;
  fullName: string;
  email: string | null;
  phone: string;
  courseInterested: string | null;
  status: string;
  adminEmailStatus: string;
  studentEmailStatus: string;
  createdAt: string;
}

interface AnalyticsData {
  summary: {
    totalLeads: number;
    todayLeads: number;
    thisWeekLeads: number;
    thisMonthLeads: number;
    lastMonthLeads: number;
    monthGrowth: number;
    conversionRate: number;
  };
  byStatus: { new: number; contacted: number; closed: number };
  bySource: { inquiry: number; counselling: number };
  emailHealth: { sent: number; failed: number; skipped: number };
  contactInfo: { withEmail: number; withoutEmail: number };
  dailyTrend: { date: string; count: number }[];
  topCourses: { name: string; count: number }[];
  topCities: { name: string; count: number }[];
  topStates: { name: string; count: number }[];
  recentLeads: {
    id: string;
    fullName: string;
    source: string;
    status: string;
    courseInterested: string | null;
    createdAt: string;
  }[];
}

// ────────────────────────────────────────────────────────────
// Custom Tooltip
// ────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-xl text-xs">
      <p className="text-gray-400">{label}</p>
      <p className="font-bold text-sm">{payload[0].value} leads</p>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Mini Sparkline (for stat cards)
// ────────────────────────────────────────────────────────────

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 64;
  const h = 24;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1 || 1)) * w,
    y: h - ((v - min) / range) * h,
  }));
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <defs>
        <linearGradient id={`spark-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`${d} L ${pts[pts.length - 1].x} ${h} L 0 ${h} Z`}
        fill={`url(#spark-${color.replace("#", "")})`}
      />
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="2.5" fill={color} />
    </svg>
  );
}

// ────────────────────────────────────────────────────────────
// Stat Card
// ────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  subtitle,
  trend,
  trendUp,
  color,
  bgColor,
  sparkData,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  suffix?: string;
  subtitle?: string;
  trend?: string;
  trendUp?: boolean;
  color: string;
  bgColor: string;
  sparkData?: number[];
}) {
  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:shadow-gray-100/50 hover:border-gray-200/80 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", bgColor)}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {sparkData && sparkData.length > 1 && <MiniSparkline data={sparkData} color={color} />}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-gray-900">
          {value}{suffix && <span className="text-base font-semibold text-gray-400">{suffix}</span>}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
      <div className="mt-2 flex items-center gap-2">
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-md",
              trendUp ? "text-emerald-700 bg-emerald-50" : "text-red-700 bg-red-50"
            )}
          >
            {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend}
          </span>
        )}
        {subtitle && <span className="text-[11px] text-gray-400">{subtitle}</span>}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Chart Colors
// ────────────────────────────────────────────────────────────

const COLORS = {
  indigo: "#6366f1",
  purple: "#a855f7",
  blue: "#3b82f6",
  emerald: "#10b981",
  amber: "#f59e0b",
  red: "#ef4444",
  slate: "#94a3b8",
  pink: "#ec4899",
  cyan: "#06b6d4",
  violet: "#8b5cf6",
};

const BAR_COLORS = [COLORS.indigo, COLORS.blue, COLORS.violet, COLORS.purple, COLORS.cyan, COLORS.pink];

// ────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────

export default function AdminLeadsPage() {
  const crud = useAdminCRUD<LeadRow>({ endpoint: "/api/admin/leads" });
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await fetch("/api/admin/leads/analytics");
        if (res.ok) {
          const json = await res.json();
          if (json.success) setAnalytics(json.data);
        }
      } catch {
        // Analytics will stay null
      } finally {
        setAnalyticsLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  const trendChartData = useMemo(() => {
    if (!analytics) return [];
    return analytics.dailyTrend.map((d) => ({
      date: new Date(d.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      leads: d.count,
    }));
  }, [analytics]);

  const trendSparkData = useMemo(() => analytics?.dailyTrend.map((d) => d.count) || [], [analytics]);

  const sourceChartData = useMemo(() => {
    if (!analytics) return [];
    return [
      { name: "Inquiry", value: analytics.bySource.inquiry, color: COLORS.indigo },
      { name: "Counselling", value: analytics.bySource.counselling, color: COLORS.purple },
    ];
  }, [analytics]);

  const statusChartData = useMemo(() => {
    if (!analytics) return [];
    return [
      { name: "New", value: analytics.byStatus.new, fill: COLORS.amber },
      { name: "Contacted", value: analytics.byStatus.contacted, fill: COLORS.blue },
      { name: "Closed", value: analytics.byStatus.closed, fill: COLORS.slate },
    ];
  }, [analytics]);

  const emailChartData = useMemo(() => {
    if (!analytics) return [];
    return [
      { name: "Sent", value: analytics.emailHealth.sent, color: COLORS.emerald },
      { name: "Failed", value: analytics.emailHealth.failed, color: COLORS.red },
      { name: "Skipped", value: analytics.emailHealth.skipped, color: COLORS.slate },
    ];
  }, [analytics]);

  const conversionRadialData = useMemo(() => {
    if (!analytics) return [];
    return [{ name: "Conversion", value: analytics.summary.conversionRate, fill: COLORS.emerald }];
  }, [analytics]);

  const handleExport = () => {
    const params = new URLSearchParams();
    window.open(`/api/admin/leads/export?${params.toString()}`, "_blank");
  };

  const columns: Column<LeadRow>[] = [
    {
      key: "fullName",
      label: "Student",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center">
            <User className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{item.fullName}</p>
            <p className="text-xs text-gray-400">{item.email || "No email"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      render: (item) => (
        <span className="text-sm text-gray-700 flex items-center gap-1">
          <Phone className="w-3 h-3 text-gray-400" />
          {item.phone}
        </span>
      ),
    },
    {
      key: "source",
      label: "Source",
      sortable: true,
      render: (item) => <StatusBadge status={item.source} label={item.source === "FREE_COUNSELLING" ? "Counselling" : "Inquiry"} />,
    },
    {
      key: "courseInterested",
      label: "Course",
      render: (item) => (
        <span className="text-sm text-gray-600">{item.courseInterested || "\u2014"}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: "adminEmailStatus",
      label: "Email",
      render: (item) => (
        <div className="flex gap-1">
          <StatusBadge status={item.adminEmailStatus} label="Admin" size="sm" showDot={false} />
          <StatusBadge status={item.studentEmailStatus} label="Student" size="sm" showDot={false} />
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      sortable: true,
      render: (item) => (
        <span className="text-xs text-gray-500">{formatDate(item.createdAt)}</span>
      ),
    },
  ];

  const a = analytics;

  return (
    <div className="space-y-6">
      {/* ──── Header ──── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            Leads Intelligence
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Real-time analytics and lead management</p>
        </div>
        <button
          onClick={() => setShowAnalytics(!showAnalytics)}
          className="h-9 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors"
        >
          <Activity className="w-4 h-4" />
          {showAnalytics ? "Hide" : "Show"} Analytics
        </button>
      </div>

      {/* ──── Analytics Dashboard ──── */}
      {showAnalytics && (
        <div className="space-y-5">
          {analyticsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl" />
                  <div className="h-7 bg-gray-100 rounded mt-3 w-16" />
                  <div className="h-3 bg-gray-50 rounded mt-2 w-24" />
                </div>
              ))}
            </div>
          ) : a ? (
            <>
              {/* ── KPI Cards ── */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  icon={Users}
                  label="Total Leads"
                  value={a.summary.totalLeads}
                  subtitle="All time"
                  trend={a.summary.monthGrowth !== 0 ? `${a.summary.monthGrowth > 0 ? "+" : ""}${a.summary.monthGrowth}%` : undefined}
                  trendUp={a.summary.monthGrowth > 0}
                  color={COLORS.indigo}
                  bgColor="bg-indigo-50"
                  sparkData={trendSparkData}
                />
                <StatCard
                  icon={Zap}
                  label="Today"
                  value={a.summary.todayLeads}
                  subtitle={`${a.summary.thisWeekLeads} this week`}
                  color={COLORS.amber}
                  bgColor="bg-amber-50"
                />
                <StatCard
                  icon={Target}
                  label="Conversion Rate"
                  value={a.summary.conversionRate}
                  suffix="%"
                  subtitle="Contacted + Closed"
                  trend={a.summary.conversionRate >= 50 ? "Healthy" : "Needs attention"}
                  trendUp={a.summary.conversionRate >= 50}
                  color={COLORS.emerald}
                  bgColor="bg-emerald-50"
                />
                <StatCard
                  icon={Mail}
                  label="Emails Delivered"
                  value={a.emailHealth.sent}
                  subtitle={a.emailHealth.failed > 0 ? `${a.emailHealth.failed} failed` : "All delivered"}
                  trend={a.emailHealth.failed === 0 && a.emailHealth.sent > 0 ? "100%" : a.emailHealth.sent > 0 ? `${Math.round((a.emailHealth.sent / Math.max(a.emailHealth.sent + a.emailHealth.failed, 1)) * 100)}%` : undefined}
                  trendUp={a.emailHealth.failed === 0}
                  color={COLORS.blue}
                  bgColor="bg-blue-50"
                />
              </div>

              {/* ── Row 1: Trend + Source Donut ── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* 14-Day Trend Area Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Lead Acquisition Trend</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Last 14 days</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-500">
                        This month: <strong className="text-gray-900">{a.summary.thisMonthLeads}</strong>
                      </span>
                      <span className="text-xs text-gray-500">
                        Last month: <strong className="text-gray-900">{a.summary.lastMonthLeads}</strong>
                      </span>
                    </div>
                  </div>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={COLORS.indigo} stopOpacity={0.2} />
                            <stop offset="100%" stopColor={COLORS.indigo} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip content={<ChartTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="leads"
                          stroke={COLORS.indigo}
                          strokeWidth={2.5}
                          fill="url(#trendGrad)"
                          dot={{ r: 3, fill: COLORS.indigo, strokeWidth: 0 }}
                          activeDot={{ r: 5, fill: COLORS.indigo, stroke: "#fff", strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Source Donut */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">Lead Sources</h3>
                  <p className="text-xs text-gray-400 mb-2">Inquiry vs Counselling</p>
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sourceChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={4}
                          dataKey="value"
                          strokeWidth={0}
                        >
                          {sourceChartData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [`${value} leads`]}
                          contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.12)", fontSize: 12 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-5 -mt-2">
                    {sourceChartData.map((s) => (
                      <div key={s.name} className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                        <span className="text-xs text-gray-600">{s.name} ({s.value})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Row 2: Pipeline + Email Health + Conversion Gauge ── */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Status Pipeline */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">Lead Pipeline</h3>
                  <p className="text-xs text-gray-400 mb-3">Status funnel</p>
                  <div className="space-y-3">
                    {[
                      { label: "New", value: a.byStatus.new, icon: Sparkles, color: COLORS.amber, bgColor: "bg-amber-50" },
                      { label: "Contacted", value: a.byStatus.contacted, icon: CheckCircle2, color: COLORS.blue, bgColor: "bg-blue-50" },
                      { label: "Closed", value: a.byStatus.closed, icon: XCircle, color: COLORS.slate, bgColor: "bg-gray-50" },
                    ].map((item) => {
                      const pct = a.summary.totalLeads > 0 ? Math.round((item.value / a.summary.totalLeads) * 100) : 0;
                      return (
                        <div key={item.label} className="flex items-center gap-3">
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", item.bgColor)}>
                            <item.icon className="w-4 h-4" style={{ color: item.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-gray-700">{item.label}</span>
                              <span className="text-xs font-bold text-gray-900">{item.value}</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${pct}%`, backgroundColor: item.color }}
                              />
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold text-gray-400 w-8 text-right">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                  {/* Funnel visual */}
                  <div className="mt-4 pt-3 border-t border-gray-50">
                    <div className="flex items-center justify-center gap-1">
                      {statusChartData.map((seg, i) => (
                        <div key={seg.name} className="flex items-center gap-1">
                          <div
                            className="rounded-md flex items-center justify-center text-[10px] font-bold text-white transition-all duration-700"
                            style={{
                              width: Math.max(32, (seg.value / Math.max(a.summary.totalLeads, 1)) * 120),
                              height: 26,
                              backgroundColor: seg.fill,
                            }}
                          >
                            {seg.value}
                          </div>
                          {i < statusChartData.length - 1 && <ChevronRight className="w-3 h-3 text-gray-300" />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Email Health Donut */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">Email Health</h3>
                  <p className="text-xs text-gray-400 mb-2">Delivery breakdown</p>
                  <div className="h-[140px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={emailChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={38}
                          outerRadius={58}
                          paddingAngle={3}
                          dataKey="value"
                          strokeWidth={0}
                        >
                          {emailChartData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [`${value}`]}
                          contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.12)", fontSize: 12 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-1.5 mt-1">
                    {emailChartData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-xs text-gray-600">{item.name}</span>
                        </div>
                        <span className="text-xs font-bold text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conversion Gauge + Recent Leads */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">Conversion</h3>
                  <p className="text-xs text-gray-400 mb-2">Contacted + Closed rate</p>
                  <div className="h-[120px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart
                        cx="50%"
                        cy="44%"
                        innerRadius="60%"
                        outerRadius="90%"
                        data={conversionRadialData}
                        startAngle={90}
                        endAngle={-270}
                        barSize={12}
                      >
                        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                        <RadialBar
                          dataKey="value"
                          cornerRadius={6}
                          background={{ fill: "#f1f5f9" }}
                        />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-center mt-2">
                    <span className="text-3xl font-bold text-gray-900">{a.summary.conversionRate}%</span>
                    <p className="text-[10px] text-gray-400 mt-0.5">of leads followed up</p>
                  </div>
                </div>
              </div>

              {/* ── Row 3: Top Courses Bar + Cities + Recent Feed ── */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Top Courses */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">Top Courses</h3>
                  <p className="text-xs text-gray-400 mb-3">Most requested programs</p>
                  {a.topCourses.length > 0 ? (
                    <div className="h-[180px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={a.topCourses} layout="vertical" margin={{ top: 0, right: 5, left: 0, bottom: 0 }}>
                          <XAxis type="number" hide />
                          <YAxis
                            type="category"
                            dataKey="name"
                            width={90}
                            tick={{ fontSize: 10, fill: "#64748b" }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip
                            formatter={(value) => [`${value} leads`]}
                            contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.12)", fontSize: 12 }}
                          />
                          <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={16}>
                            {a.topCourses.map((_, i) => (
                              <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-8">No course data yet</p>
                  )}
                </div>

                {/* Top Cities + States */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">Geography</h3>
                  <p className="text-xs text-gray-400 mb-3">Top cities &amp; states</p>
                  <div className="space-y-2">
                    {a.topCities.slice(0, 3).map((city) => {
                      const max = Math.max(...a.topCities.map((c) => c.count), 1);
                      return (
                        <div key={city.name}>
                          <div className="flex justify-between mb-0.5">
                            <span className="text-xs font-medium text-gray-700">{city.name}</span>
                            <span className="text-xs font-bold text-gray-900">{city.count}</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${(city.count / max) * 100}%`, backgroundColor: COLORS.blue }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t border-gray-50 mt-3 pt-3 space-y-2">
                    {a.topStates.slice(0, 3).map((state) => {
                      const max = Math.max(...a.topStates.map((s) => s.count), 1);
                      return (
                        <div key={state.name}>
                          <div className="flex justify-between mb-0.5">
                            <span className="text-xs font-medium text-gray-700">{state.name}</span>
                            <span className="text-xs font-bold text-gray-900">{state.count}</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${(state.count / max) * 100}%`, backgroundColor: COLORS.violet }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {a.topCities.length === 0 && a.topStates.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">No location data yet</p>
                  )}
                </div>

                {/* Recent Leads Feed */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Live Feed</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Latest leads</p>
                    </div>
                    <Clock className="w-4 h-4 text-gray-300" />
                  </div>
                  <div className="space-y-2.5">
                    {a.recentLeads.map((lead, i) => (
                      <Link
                        key={lead.id}
                        href={`/admin/leads/${lead.id}`}
                        className="flex items-center gap-3 group/item hover:bg-gray-50 -mx-2 px-2 py-1.5 rounded-xl transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-50 flex items-center justify-center flex-shrink-0">
                          <User className="w-3.5 h-3.5 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-900 truncate">{lead.fullName}</p>
                          <p className="text-[10px] text-gray-400 truncate">
                            {lead.courseInterested || (lead.source === "FREE_COUNSELLING" ? "Counselling" : "Inquiry")}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <StatusBadge status={lead.status} size="sm" showDot={false} />
                          <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 group-hover/item:text-indigo-500 transition-colors" />
                        </div>
                      </Link>
                    ))}
                    {a.recentLeads.length === 0 && (
                      <p className="text-xs text-gray-400 text-center py-6">No leads yet</p>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Summary Ribbon ── */}
              <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 rounded-2xl border border-indigo-100/50 px-5 py-3.5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-indigo-500" />
                      <span className="text-xs font-medium text-gray-700">
                        <strong className="text-gray-900">{a.contactInfo.withEmail}</strong> with email
                      </span>
                    </div>
                    <div className="w-px h-4 bg-indigo-200" />
                    <div className="flex items-center gap-2">
                      <Inbox className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-medium text-gray-700">
                        <strong className="text-gray-900">{a.contactInfo.withoutEmail}</strong> phone-only
                      </span>
                    </div>
                    <div className="w-px h-4 bg-indigo-200" />
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-medium text-gray-700">
                        <strong className="text-gray-900">{a.summary.thisMonthLeads}</strong> this month
                        {a.summary.monthGrowth !== 0 && (
                          <span className={cn("ml-1 font-semibold", a.summary.monthGrowth > 0 ? "text-emerald-600" : "text-red-600")}>
                            ({a.summary.monthGrowth > 0 ? "+" : ""}{a.summary.monthGrowth}%)
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-700">
              Unable to load analytics. The leads table below still works.
            </div>
          )}
        </div>
      )}

      {/* ──── Data Table ──── */}
      <AdminDataTable
        title="All Leads"
        description="Manage incoming leads from inquiry and counselling forms"
        columns={columns}
        data={crud.data}
        total={crud.total}
        page={crud.page}
        limit={crud.limit}
        loading={crud.loading}
        searchValue={crud.search}
        onSearchChange={crud.setSearch}
        onPageChange={crud.setPage}
        onSort={crud.setSort}
        sortBy={crud.sortBy}
        sortOrder={crud.sortOrder}
        viewHref={(item) => `/admin/leads/${item.id}`}
        onDelete={(item) => crud.deleteItem(item.id)}
        emptyMessage="No leads yet. Leads will appear here when students submit inquiry or counselling forms."
        filters={
          <div className="flex gap-2">
            <select
              onChange={(e) => crud.setFilter("source", e.target.value)}
              className="admin-select"
            >
              <option value="">All Sources</option>
              {LEAD_SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s === "FREE_COUNSELLING" ? "Counselling" : "Inquiry"}
                </option>
              ))}
            </select>
            <select
              onChange={(e) => crud.setFilter("status", e.target.value)}
              className="admin-select"
            >
              <option value="">All Status</option>
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button
              onClick={handleExport}
              className="h-9 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        }
      />
    </div>
  );
}
