"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Scale, Bell, FileText, BookOpen, ArrowRight, GraduationCap, TrendingUp, Calendar, Sparkles } from "lucide-react";
import { useAppStore } from "../../../lib/store";
import { formatDate, getGradientForLetter } from "../../../lib/utils";
import { cn } from "../../../lib/utils";
import { Badge } from "../../../components/ui/badge";

interface DashboardCollege {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  type: string;
  nirfRank?: number | null;
}

interface DashboardNewsArticle {
  id: string;
  title: string;
  slug: string;
  imageColor: string;
  publishedAt: string;
}

export default function DashboardPage() {
  const { savedColleges, compareList } = useAppStore();
  const savedCount = savedColleges.length;
  const compareCount = compareList.length;

  const [savedCollegeData, setSavedCollegeData] = useState<DashboardCollege[]>([]);
  const [latestNews, setLatestNews] = useState<DashboardNewsArticle[]>([]);

  useEffect(() => {
    // Fetch saved college details
    if (savedColleges.length > 0) {
      const ids = savedColleges.slice(0, 3).join(",");
      fetch(`/api/colleges?ids=${encodeURIComponent(ids)}&limit=3`)
        .then((r) => r.json())
        .then((res) => setSavedCollegeData(res.data || []))
        .catch(() => setSavedCollegeData([]));
    } else {
      setSavedCollegeData([]);
    }
  }, [savedColleges]);

  useEffect(() => {
    // Fetch latest news
    fetch("/api/news?limit=3")
      .then((r) => r.json())
      .then((res) => setLatestNews(res.data || []))
      .catch(() => setLatestNews([]));
  }, []);

  const stats = [
    { label: "Saved Colleges", value: savedCount, icon: Heart, color: "from-red-500 to-rose-400", bg: "bg-red-50", iconColor: "text-red-500", href: "/dashboard/saved" },
    { label: "In Compare List", value: compareCount, icon: Scale, color: "from-blue-600 to-blue-400", bg: "bg-blue-50", iconColor: "text-blue-600", href: "/compare" },
    { label: "Exam Reminders", value: 5, icon: Bell, color: "from-amber-500 to-yellow-400", bg: "bg-amber-50", iconColor: "text-amber-500", href: "/exams" },
    { label: "Applications", value: 2, icon: FileText, color: "from-green-600 to-emerald-400", bg: "bg-green-50", iconColor: "text-green-600", href: "/dashboard/enquiries" },
  ];

  const quickActions = [
    { label: "Find Colleges", icon: GraduationCap, href: "/colleges", color: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
    { label: "View Exams", icon: BookOpen, href: "/exams", color: "bg-orange-50 text-orange-700 hover:bg-orange-100" },
    { label: "Compare Colleges", icon: Scale, href: "/compare", color: "bg-purple-50 text-purple-700 hover:bg-purple-100" },
    { label: "Build Resume", icon: FileText, href: "/resume-builder", color: "bg-green-50 text-green-700 hover:bg-green-100" },
    { label: "Study Abroad", icon: TrendingUp, href: "/study-abroad", color: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100" },
    { label: "Latest News", icon: Bell, href: "/news", color: "bg-red-50 text-red-700 hover:bg-red-100" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-primary-900 to-primary-700 text-white">
        <div className="container mx-auto py-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-5 w-5 text-accent-400" />
                <p className="text-blue-200 text-sm">Good morning</p>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">Welcome back, Student! 👋</h1>
              <p className="text-blue-200 mt-1 text-sm">
                Your education journey dashboard — track, compare, and apply
              </p>
            </div>
            <Link href="/colleges">
              <button suppressHydrationWarning className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl text-white text-sm font-semibold transition-colors">
                Explore Colleges
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>

          {/* Exam Alert */}
          <div className="mt-5 flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl p-3">
            <Calendar className="h-5 w-5 text-accent-400 flex-shrink-0" />
            <p className="text-sm text-blue-100">
              <span className="font-bold text-white">JEE Main 2026</span> registration closes on{" "}
              <span className="font-bold text-accent-400">November 22, 2025</span>. Don&apos;t miss it!
            </p>
            <Link href="/exams/jee-main" className="ml-auto flex-shrink-0 text-xs text-accent-400 font-bold hover:text-accent-300">
              Apply Now →
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Link key={stat.label} href={stat.href}>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 p-5 flex items-center gap-4">
                <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0", stat.bg)}>
                  <stat.icon className={cn("h-6 w-6", stat.iconColor)} />
                </div>
                <div>
                  <p className={cn("text-2xl font-black bg-gradient-to-r bg-clip-text text-transparent", stat.color)}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Saved Colleges */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  Saved Colleges ({savedCount})
                </h2>
                <Link href="/dashboard/saved" className="text-xs text-primary-600 font-semibold hover:text-primary-700">
                  View all →
                </Link>
              </div>

              {savedCollegeData.length > 0 ? (
                <div className="space-y-3">
                  {savedCollegeData.map((college) =>
                    college ? (
                      <Link key={college.id} href={`/colleges/${college.slug}`}>
                        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group">
                          <div className={cn("h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold flex-shrink-0", getGradientForLetter(college.name[0]))}>
                            {college.name[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm group-hover:text-primary-600 transition-colors truncate">{college.name}</p>
                            <p className="text-xs text-gray-500">{college.city} · {college.type}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            {college.nirfRank && (
                              <Badge variant="orange" className="text-xs">NIRF #{college.nirfRank}</Badge>
                            )}
                          </div>
                        </div>
                      </Link>
                    ) : null
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Heart className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm mb-3">No saved colleges yet</p>
                  <Link href="/colleges">
                    <button suppressHydrationWarning className="text-sm text-primary-600 font-semibold hover:text-primary-700">
                      Explore Colleges →
                    </button>
                  </Link>
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary-600" />
                Upcoming Exam Dates
              </h2>
              <div className="space-y-3">
                {[
                  { exam: "JEE Main 2026 Session 1", date: "Jan 22, 2026", color: "bg-blue-500", status: "Register by Nov 22" },
                  { exam: "NEET UG 2026", date: "May 5, 2026", color: "bg-red-500", status: "Opens Feb 2026" },
                  { exam: "CAT 2025", date: "Nov 24, 2025", color: "bg-purple-500", status: "Completed" },
                  { exam: "GATE 2026", date: "Feb 1–9, 2026", color: "bg-orange-500", status: "Register by Sep 26" },
                ].map((item) => (
                  <div key={item.exam} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50">
                    <div className={cn("h-2.5 w-2.5 rounded-full flex-shrink-0", item.color)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.exam}</p>
                      <p className="text-xs text-gray-400">{item.status}</p>
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0 font-medium">{item.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <h2 className="font-bold text-gray-900 mb-4 text-sm">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action) => (
                  <Link key={action.label} href={action.href}>
                    <button suppressHydrationWarning className={cn("w-full p-3 rounded-xl text-xs font-semibold text-left transition-colors flex items-center gap-2", action.color)}>
                      <action.icon className="h-4 w-4 flex-shrink-0" />
                      {action.label}
                    </button>
                  </Link>
                ))}
              </div>
            </div>

            {/* Latest News */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900 text-sm">Latest News</h2>
                <Link href="/news" className="text-xs text-primary-600 font-semibold">View all</Link>
              </div>
              <div className="space-y-3">
                {latestNews.map((article) => (
                  <Link key={article.id} href={`/news/${article.slug}`} className="flex gap-3 group">
                    <div className={cn("h-12 w-12 rounded-xl bg-gradient-to-br flex-shrink-0", article.imageColor)} />
                    <div>
                      <p className="text-xs font-medium text-gray-800 group-hover:text-primary-600 transition-colors line-clamp-2 leading-snug">
                        {article.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(article.publishedAt)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
