"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, TrendingUp, Award, Users, BookOpen, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

const tabs = ["Colleges", "Exams", "Courses"] as const;
type Tab = typeof tabs[number];

const quickFilters: Record<Tab, string[]> = {
  Colleges: ["Engineering", "Medical", "MBA", "Law", "Arts", "Architecture"],
  Exams: ["JEE Main", "NEET UG", "CAT", "GATE", "CLAT", "CUET"],
  Courses: ["B.Tech", "MBBS", "MBA", "LLB", "B.Com", "BCA"],
};

const placeholders: Record<Tab, string> = {
  Colleges: "Search 25,000+ colleges — IIT, NIT, IIM, AIIMS...",
  Exams: "Search entrance exams — JEE, NEET, CAT, GATE...",
  Courses: "Search courses — B.Tech, MBA, MBBS, LLB...",
};

const statsData = [
  { icon: Award, value: "25,000+", label: "Colleges", color: "text-blue-300" },
  { icon: BookOpen, value: "500+", label: "Exams", color: "text-orange-300" },
  { icon: Users, value: "10L+", label: "Students", color: "text-green-300" },
  { icon: TrendingUp, value: "800+", label: "Courses", color: "text-purple-300" },
];

export function HeroBanner() {
  const [activeTab, setActiveTab] = useState<Tab>("Colleges");
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    if (!query.trim()) return;
    const path =
      activeTab === "Colleges"
        ? `/colleges?search=${encodeURIComponent(query)}`
        : activeTab === "Exams"
        ? `/exams?search=${encodeURIComponent(query)}`
        : `/courses?search=${encodeURIComponent(query)}`;
    router.push(path);
  };

  const handleQuickFilter = (filter: string) => {
    if (activeTab === "Colleges") {
      router.push(`/colleges?stream=${encodeURIComponent(filter)}`);
    } else if (activeTab === "Exams") {
      router.push(`/exams?search=${encodeURIComponent(filter)}`);
    } else {
      router.push(`/courses?search=${encodeURIComponent(filter)}`);
    }
  };

  return (
    <section className="relative min-h-[88vh] flex items-center overflow-hidden">
      {/* Hero Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1920&q=90&auto=format&fit=crop')",
        }}
      />

      {/* Overlay — keeps image visible while ensuring text is readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

      <div className="container mx-auto relative z-10 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Announcement Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm mb-6 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-accent-400" />
            <span>NIRF 2025 Rankings Released</span>
            <span className="text-accent-400 font-semibold">View Rankings →</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-tight mb-6 tracking-tight">
            Find Your{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent-400 via-orange-300 to-yellow-300">
              Dream College
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-blue-100/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            Explore 25,000+ colleges, 500+ entrance exams, and get expert guidance to make your best education decision.
          </p>

          {/* Stats Row */}
          <div className="flex items-center justify-center gap-6 sm:gap-10 mb-10">
            {statsData.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-0.5">
                  <stat.icon className={cn("h-4 w-4", stat.color)} />
                  <span className="text-xl sm:text-2xl font-black text-white">
                    {stat.value}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-blue-200/70">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Search Card */}
          <div className="glass rounded-2xl p-5 shadow-2xl max-w-2xl mx-auto">
            {/* Tabs */}
            <div className="flex gap-1 mb-4 bg-white/10 rounded-xl p-1">
              {tabs.map((tab) => (
                <button suppressHydrationWarning
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-200",
                    activeTab === tab
                      ? "bg-white text-primary-700 shadow-sm"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder={placeholders[activeTab]}
                  className="w-full h-12 pl-12 pr-4 rounded-xl bg-white border-0 text-gray-800 placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 shadow-sm"
                />
              </div>
              <Button
                onClick={handleSearch}
                variant="gradient"
                size="lg"
                className="h-12 px-6 text-sm font-bold rounded-xl flex-shrink-0"
              >
                Search
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Quick Filters */}
            <div className="mt-4 flex flex-wrap gap-2">
              {quickFilters[activeTab].map((filter) => (
                <button suppressHydrationWarning
                  key={filter}
                  onClick={() => handleQuickFilter(filter)}
                  className="px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white/80 hover:text-white text-xs font-medium transition-all duration-200"
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Popular Searches */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="text-blue-300/70">Popular:</span>
            {["IIT Bombay", "NEET 2026", "MBA Colleges", "Study in Canada"].map(
              (item) => (
                <button suppressHydrationWarning
                  key={item}
                  className="text-blue-200/80 hover:text-white underline underline-offset-2 transition-colors"
                >
                  {item}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Floating Cards */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 hidden xl:block animate-float">
        <div className="glass rounded-2xl p-4 w-48 shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white text-sm font-bold">
              I
            </div>
            <div>
              <p className="text-white text-xs font-semibold">IIT Bombay</p>
              <p className="text-blue-200 text-xs">NIRF Rank #3</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-yellow-400 text-xs">
            {"★★★★★"} <span className="text-white/60 ml-1">4.8</span>
          </div>
          <div className="mt-2 flex gap-1">
            <span className="px-1.5 py-0.5 bg-white/10 rounded text-white/70 text-xs">Engineering</span>
            <span className="px-1.5 py-0.5 bg-white/10 rounded text-white/70 text-xs">Govt</span>
          </div>
        </div>
      </div>

      <div className="absolute right-8 top-1/3 hidden xl:block animate-float" style={{ animationDelay: "3s" }}>
        <div className="glass rounded-2xl p-4 w-52 shadow-xl">
          <p className="text-white/60 text-xs mb-1">Avg. Package at IITs</p>
          <p className="text-white text-2xl font-black mb-1">₹22 LPA</p>
          <div className="flex items-center gap-1 text-green-400 text-xs font-medium">
            <TrendingUp className="h-3 w-3" />
            <span>+18% from last year</span>
          </div>
          <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full w-4/5 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full" />
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
