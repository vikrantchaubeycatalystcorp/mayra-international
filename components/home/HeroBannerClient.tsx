"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, TrendingUp, Award, Users, BookOpen, ArrowRight, Sparkles, ChevronRight, type LucideIcon } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

const iconMap: Record<string, LucideIcon> = {
  Award, BookOpen, Users, TrendingUp, Search, Sparkles,
};

type BannerData = {
  badgeText: string | null;
  badgeLinkText: string | null;
  badgeLink: string | null;
  heading: string;
  headingHighlight: string | null;
  subheading: string | null;
  bgImage: string | null;
  ctaText: string;
  stats: { id: string; icon: string; value: string; label: string; color: string }[];
  searchTabs: { id: string; label: string; placeholder: string; searchPath: string }[];
  quickFilters: { id: string; tab: string; label: string; href: string }[];
  popularSearches: { id: string; label: string; href: string }[];
  floatingCards: { id: string; title: string; subtitle: string | null; content: any; position: string }[];
} | null;

const defaultBanner = {
  badgeText: "NIRF 2025 Rankings Released",
  badgeLinkText: "View Rankings",
  badgeLink: "/news",
  heading: "Find Your Dream College",
  headingHighlight: "Dream College",
  subheading: "Explore 25,000+ colleges, 500+ entrance exams, and get expert guidance to make your best education decision.",
  bgImage: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1920&q=90&auto=format&fit=crop",
  ctaText: "Search",
  stats: [
    { id: "1", icon: "Award", value: "25,000+", label: "Colleges", color: "text-indigo-300" },
    { id: "2", icon: "BookOpen", value: "500+", label: "Exams", color: "text-amber-300" },
    { id: "3", icon: "Users", value: "10L+", label: "Students", color: "text-emerald-300" },
    { id: "4", icon: "TrendingUp", value: "800+", label: "Courses", color: "text-purple-300" },
  ],
  searchTabs: [
    { id: "1", label: "Colleges", placeholder: "Search 25,000+ colleges — IIT, NIT, IIM, AIIMS...", searchPath: "/colleges" },
    { id: "2", label: "Exams", placeholder: "Search entrance exams — JEE, NEET, CAT, GATE...", searchPath: "/exams" },
    { id: "3", label: "Courses", placeholder: "Search courses — B.Tech, MBA, MBBS, LLB...", searchPath: "/courses" },
  ],
  quickFilters: [
    { id: "1", tab: "Colleges", label: "Engineering", href: "/colleges?stream=Engineering" },
    { id: "2", tab: "Colleges", label: "Medical", href: "/colleges?stream=Medical" },
    { id: "3", tab: "Colleges", label: "MBA", href: "/colleges?stream=Management" },
    { id: "4", tab: "Colleges", label: "Law", href: "/colleges?stream=Law" },
    { id: "5", tab: "Colleges", label: "Arts", href: "/colleges?stream=Arts" },
    { id: "6", tab: "Colleges", label: "Architecture", href: "/colleges?stream=Architecture" },
    { id: "7", tab: "Exams", label: "JEE Main", href: "/exams?search=JEE+Main" },
    { id: "8", tab: "Exams", label: "NEET UG", href: "/exams?search=NEET+UG" },
    { id: "9", tab: "Exams", label: "CAT", href: "/exams?search=CAT" },
    { id: "10", tab: "Exams", label: "GATE", href: "/exams?search=GATE" },
    { id: "11", tab: "Exams", label: "CLAT", href: "/exams?search=CLAT" },
    { id: "12", tab: "Exams", label: "CUET", href: "/exams?search=CUET" },
    { id: "13", tab: "Courses", label: "B.Tech", href: "/courses?search=B.Tech" },
    { id: "14", tab: "Courses", label: "MBBS", href: "/courses?search=MBBS" },
    { id: "15", tab: "Courses", label: "MBA", href: "/courses?search=MBA" },
    { id: "16", tab: "Courses", label: "LLB", href: "/courses?search=LLB" },
    { id: "17", tab: "Courses", label: "B.Com", href: "/courses?search=B.Com" },
    { id: "18", tab: "Courses", label: "BCA", href: "/courses?search=BCA" },
  ],
  popularSearches: [
    { id: "1", label: "IIT Bombay", href: "/colleges/iit-bombay" },
    { id: "2", label: "NEET 2026", href: "/exams/neet-ug" },
    { id: "3", label: "MBA Colleges", href: "/colleges?stream=Management" },
    { id: "4", label: "Study in Canada", href: "/study-abroad" },
  ],
  floatingCards: [] as any[],
};

function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large gradient orbs */}
      <div className="absolute -top-1/4 -left-1/4 w-[300px] h-[300px] md:w-[600px] md:h-[600px] rounded-full bg-indigo-500/20 blur-[120px] animate-morph" />
      <div className="absolute -bottom-1/4 -right-1/4 w-[250px] h-[250px] md:w-[500px] md:h-[500px] rounded-full bg-purple-500/15 blur-[100px] animate-morph" style={{ animationDelay: "-4s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] md:w-[400px] md:h-[400px] rounded-full bg-indigo-400/10 blur-[80px] animate-float-slow" />
      {/* Small floating particles */}
      <div className="absolute top-[15%] left-[10%] w-2 h-2 rounded-full bg-indigo-400/40 animate-float" />
      <div className="absolute top-[25%] right-[15%] w-1.5 h-1.5 rounded-full bg-purple-400/40 animate-float-delayed" />
      <div className="absolute bottom-[30%] left-[20%] w-1 h-1 rounded-full bg-white/30 animate-float" style={{ animationDelay: "-2s" }} />
      <div className="absolute top-[40%] right-[25%] w-2 h-2 rounded-full bg-indigo-300/30 animate-float-slow" />
      <div className="absolute bottom-[20%] right-[10%] w-1.5 h-1.5 rounded-full bg-purple-300/30 animate-float" style={{ animationDelay: "-5s" }} />
    </div>
  );
}

function AnimatedCounter({ value }: { value: string }) {
  const [displayed, setDisplayed] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const numMatch = value.match(/^([\d,.]+)/);
    if (!numMatch) { setDisplayed(value); return; }
    const target = parseFloat(numMatch[1].replace(/,/g, ""));
    const suffix = value.replace(numMatch[1], "");
    const duration = 1800;
    let start: number;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(eased * target);
      setDisplayed(current.toLocaleString() + suffix);
      if (progress < 1) requestAnimationFrame(step);
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        requestAnimationFrame(step);
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return <span ref={ref}>{displayed}</span>;
}

export function HeroBannerClient({ banner }: { banner: BannerData }) {
  const data = banner || defaultBanner;
  const tabs = data.searchTabs;
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [query, setQuery] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  const activeTab = tabs[activeTabIdx] || tabs[0];
  const tabQuickFilters = data.quickFilters.filter((f) => f.tab === activeTab?.label);

  const handleSearch = () => {
    if (!query.trim() || !activeTab) return;
    router.push(`${activeTab.searchPath}?search=${encodeURIComponent(query)}`);
  };

  const handleQuickFilter = (href: string) => {
    router.push(href);
  };

  const renderHeading = () => {
    const heading = data.heading;
    const highlight = data.headingHighlight;
    if (!highlight || !heading.includes(highlight)) {
      return <span>{heading}</span>;
    }
    const parts = heading.split(highlight);
    return (
      <>
        {parts[0]}
        <span className="relative inline-block">
          <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-orange-300 to-yellow-200">
            {highlight}
          </span>
          <span className="absolute -inset-x-2 -inset-y-1 bg-white/5 rounded-lg -z-0" />
        </span>
        {parts[1]}
      </>
    );
  };

  return (
    <section className="relative min-h-[80vh] md:min-h-[92vh] flex items-center overflow-hidden">
      {/* Background Image */}
      {data.bgImage && (
        <Image
          src={data.bgImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
          quality={75}
        />
      )}
      {/* Dark overlay on top of image */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0520]/90 via-[#12103a]/85 to-[#1a1145]/90" />
      <FloatingOrbs />
      <div className="absolute inset-0 hero-grid opacity-20" />
      {/* Subtle noise texture */}
      <div className="absolute inset-0 noise-overlay" />

      <div className="container mx-auto relative z-10 py-24 lg:py-28">
        <div className="max-w-4xl mx-auto text-center">
          {/* Announcement Badge */}
          {data.badgeText && (
            <div
              className={cn(
                "inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/[0.07] border border-white/[0.12] text-white/90 text-sm mb-8 backdrop-blur-xl transition-all duration-700 hover:bg-white/[0.12] hover:border-white/20 cursor-pointer group",
                loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
              onClick={() => data.badgeLink && router.push(data.badgeLink)}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-orange-400">
                <Sparkles className="h-3 w-3 text-white" />
              </span>
              <span className="font-medium">{data.badgeText}</span>
              {data.badgeLinkText && (
                <span className="flex items-center gap-1 text-amber-300 font-semibold group-hover:gap-2 transition-all">
                  {data.badgeLinkText}
                  <ChevronRight className="h-3.5 w-3.5" />
                </span>
              )}
            </div>
          )}

          {/* Heading */}
          <h1
            className={cn(
              "text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-[1.1] mb-6 tracking-tight transition-all duration-700 delay-100",
              loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            )}
          >
            {renderHeading()}
          </h1>

          {/* Subheading */}
          {data.subheading && (
            <p
              className={cn(
                "text-lg sm:text-xl text-indigo-200/70 mb-12 max-w-2xl mx-auto leading-relaxed font-light transition-all duration-700 delay-200",
                loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              )}
            >
              {data.subheading}
            </p>
          )}

          {/* Stats Row */}
          {data.stats.length > 0 && (
            <div
              className={cn(
                "flex items-center justify-center gap-4 sm:gap-8 lg:gap-12 mb-12 transition-all duration-700 delay-300",
                loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              )}
            >
              {data.stats.map((stat, i) => {
                const Icon = iconMap[stat.icon] || Award;
                return (
                  <div key={stat.id} className="text-center group">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/[0.08]">
                        <Icon className={cn("h-3.5 w-3.5", stat.color)} />
                      </div>
                      <span className="text-lg sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                        <AnimatedCounter value={stat.value} />
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-indigo-300/60 font-medium">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Search Card — Premium Glass */}
          {tabs.length > 0 && (
            <div
              className={cn(
                "relative rounded-3xl p-1 max-w-2xl mx-auto transition-all duration-700 delay-400",
                loaded ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-[0.98]",
                inputFocused ? "shadow-[0_0_80px_rgba(99,102,241,0.25)]" : ""
              )}
            >
              {/* Animated gradient border */}
              <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-indigo-500/30 via-purple-500/20 to-indigo-500/30 animate-gradient-x opacity-60" />

              <div className="relative glass rounded-[22px] p-5 sm:p-6">
                {/* Tab Switcher */}
                <div className="flex gap-1 mb-5 bg-white/[0.06] rounded-2xl p-1">
                  {tabs.map((tab, idx) => (
                    <button
                      suppressHydrationWarning
                      key={tab.id}
                      onClick={() => setActiveTabIdx(idx)}
                      className={cn(
                        "flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-300",
                        activeTabIdx === idx
                          ? "bg-white text-gray-900 shadow-lg shadow-black/10"
                          : "text-white/60 hover:text-white hover:bg-white/[0.06]"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Search Input */}
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors group-focus-within:text-indigo-400" />
                    <input
                      suppressHydrationWarning
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      onFocus={() => setInputFocused(true)}
                      onBlur={() => setInputFocused(false)}
                      placeholder={activeTab?.placeholder || "Search..."}
                      className="w-full h-13 pl-12 pr-4 rounded-2xl bg-white border-0 text-gray-800 placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/50 shadow-lg shadow-black/5 transition-all duration-300"
                      style={{ height: "52px" }}
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    className="h-[52px] px-5 sm:px-7 w-full sm:w-auto text-sm font-bold rounded-2xl flex-shrink-0 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {data.ctaText}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>

                {/* Quick Filters */}
                {tabQuickFilters.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {tabQuickFilters.map((filter) => (
                      <button
                        suppressHydrationWarning
                        key={filter.id}
                        onClick={() => handleQuickFilter(filter.href)}
                        className="px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.16] border border-white/[0.1] hover:border-white/[0.2] text-white/70 hover:text-white text-xs font-medium transition-all duration-300"
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Popular Searches */}
          {data.popularSearches.length > 0 && (
            <div
              className={cn(
                "mt-8 flex flex-wrap items-center justify-center gap-3 text-sm transition-all duration-700 delay-500",
                loaded ? "opacity-100" : "opacity-0"
              )}
            >
              <span className="text-indigo-400/50 text-xs font-medium uppercase tracking-wider">Trending</span>
              {data.popularSearches.map((item) => (
                <button
                  suppressHydrationWarning
                  key={item.id}
                  onClick={() => router.push(item.href)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-indigo-200/60 hover:text-white text-xs font-medium border border-white/[0.06] hover:border-white/[0.15] hover:bg-white/[0.05] transition-all duration-300"
                >
                  <TrendingUp className="h-3 w-3" />
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Cards */}
      {data.floatingCards.filter((c) => c.position === "left").map((card, idx) => (
        <div key={card.id} className="absolute left-8 top-1/2 -translate-y-1/2 hidden xl:block animate-float" style={{ animationDelay: `${idx * 2}s` }}>
          <div className="glass rounded-2xl p-4 w-48 shadow-xl">
            <p className="text-white text-xs font-semibold">{card.title}</p>
            {card.subtitle && <p className="text-indigo-200 text-xs">{card.subtitle}</p>}
          </div>
        </div>
      ))}

      {data.floatingCards.filter((c) => c.position === "right").map((card, idx) => (
        <div key={card.id} className="absolute right-8 top-1/3 hidden xl:block animate-float" style={{ animationDelay: `${idx * 2 + 3}s` }}>
          <div className="glass rounded-2xl p-4 w-52 shadow-xl">
            <p className="text-white text-xs font-semibold">{card.title}</p>
            {card.subtitle && <p className="text-white/60 text-xs">{card.subtitle}</p>}
          </div>
        </div>
      ))}

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent" />
    </section>
  );
}
