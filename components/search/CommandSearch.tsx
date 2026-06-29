"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "cmdk";
import {
  Search, GraduationCap, BookOpen, FileText, X, Sparkles, Newspaper,
  Scale, Globe, Heart, MessageSquare, LayoutDashboard, MapPin, Phone,
  Cpu, Stethoscope, Briefcase, FlaskConical, BarChart3, Trophy,
  Clock, ArrowRight, TrendingUp, Zap, Star, IndianRupee, Calendar,
  type LucideIcon,
} from "lucide-react";

// ─── Icon Map ──────────────────────────────────────────────
const iconMap: Record<string, LucideIcon> = {
  GraduationCap, BookOpen, FileText, Newspaper, Scale, Globe, Heart,
  MessageSquare, LayoutDashboard, MapPin, Phone, Cpu, Stethoscope,
  Briefcase, FlaskConical, BarChart3, Trophy, Search, TrendingUp, Star,
};

function getIcon(name?: string | null): LucideIcon {
  if (!name) return Search;
  return iconMap[name] || Search;
}

// ─── Types ─────────────────────────────────────────────────
interface SearchCollege {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  nirfRank?: number | null;
  isFeatured?: boolean;
  type?: string;
  streams?: string[];
  rating?: number;
  feesMin?: number;
  feesMax?: number;
}

interface SearchExam {
  id: string;
  name: string;
  slug: string;
  fullName: string;
  conductingBody: string;
  isFeatured?: boolean;
  examDate?: string | null;
  level?: string;
  streams?: string[];
}

interface SearchCourse {
  id: string;
  name: string;
  slug: string;
  level: string;
  duration: string;
  isFeatured?: boolean;
  stream?: string;
  avgFees?: number | null;
  avgSalary?: number | null;
}

interface SearchNewsArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  imageColor: string;
  summary?: string | null;
  publishedAt?: string | null;
}

interface QuickLink {
  id: string;
  title: string;
  description: string;
  href: string;
  category: string;
  icon: string;
}

interface SearchResults {
  colleges: SearchCollege[];
  exams: SearchExam[];
  courses: SearchCourse[];
  articles: SearchNewsArticle[];
  quickLinks: QuickLink[];
}

interface CommandSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ─── Recent Searches (localStorage) ───────────────────────
const RECENT_KEY = "mayra-recent-searches";
const MAX_RECENT = 6;

function getRecentSearches(): { query: string; href: string; label: string }[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
}

function addRecentSearch(query: string, href: string, label: string) {
  if (typeof window === "undefined" || !query.trim()) return;
  try {
    const recent = getRecentSearches().filter((r) => r.href !== href);
    recent.unshift({ query: query.trim(), href, label });
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
  } catch { /* ignore */ }
}

function clearRecentSearches() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(RECENT_KEY);
}

// ─── Quick navigation pages (shown when no query) ─────────
const defaultPages = [
  { id: "p-colleges", label: "Browse Colleges", desc: "25,000+ colleges across India", href: "/colleges", icon: GraduationCap, color: "from-indigo-600 to-purple-500" },
  { id: "p-exams", label: "Entrance Exams", desc: "Exam dates, eligibility & registration", href: "/exams", icon: FileText, color: "from-orange-500 to-amber-400" },
  { id: "p-courses", label: "Explore Courses", desc: "800+ courses across all streams", href: "/courses", icon: BookOpen, color: "from-emerald-500 to-teal-400" },
  { id: "p-news", label: "Latest News", desc: "Education news & updates", href: "/news", icon: Newspaper, color: "from-red-500 to-rose-400" },
  { id: "p-compare", label: "Compare Colleges", desc: "Side-by-side comparison", href: "/compare", icon: Scale, color: "from-blue-600 to-blue-400" },
  { id: "p-abroad", label: "Study Abroad", desc: "International options", href: "/study-abroad", icon: Globe, color: "from-cyan-500 to-sky-400" },
  { id: "p-mock", label: "Mock Tests", desc: "Free practice tests with leaderboards", href: "/mock-tests", icon: Trophy, color: "from-amber-500 to-orange-400" },
  { id: "p-resume", label: "Resume Builder", desc: "Build your resume", href: "/resume-builder", icon: FileText, color: "from-violet-500 to-purple-400" },
  { id: "p-dashboard", label: "My Dashboard", desc: "Your saved colleges & apps", href: "/dashboard", icon: LayoutDashboard, color: "from-gray-600 to-gray-400" },
  { id: "p-saved", label: "Saved Colleges", desc: "Your shortlisted colleges", href: "/dashboard/saved", icon: Heart, color: "from-pink-500 to-rose-400" },
  { id: "p-enquiries", label: "My Enquiries", desc: "Track your applications", href: "/dashboard/enquiries", icon: MessageSquare, color: "from-green-600 to-emerald-400" },
  { id: "p-map", label: "College Map", desc: "Find colleges near you", href: "/map", icon: MapPin, color: "from-teal-600 to-teal-400" },
  { id: "p-contact", label: "Contact Us", desc: "Talk to our counselors", href: "/contact", icon: Phone, color: "from-amber-600 to-yellow-400" },
];

// ─── Trending searches ────────────────────────────────────
const trendingSearches = [
  { label: "IIT Delhi", href: "/colleges/iit-delhi" },
  { label: "JEE Main 2026", href: "/exams/jee-main" },
  { label: "NEET UG", href: "/exams/neet-ug" },
  { label: "MBA Colleges", href: "/colleges?streams=Management" },
  { label: "B.Tech", href: "/courses" },
];

// ─── Format helpers ───────────────────────────────────────
function formatFees(min?: number, max?: number): string {
  if (!min && !max) return "";
  const fmt = (n: number) => n >= 100000 ? `${(n / 100000).toFixed(1)}L` : `${(n / 1000).toFixed(0)}K`;
  if (min && max && min !== max) return `${fmt(min)} - ${fmt(max)}`;
  return fmt(min || max || 0);
}

// ─── Component ────────────────────────────────────────────
export function CommandSearch({ open, onOpenChange }: CommandSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({ colleges: [], exams: [], courses: [], articles: [], quickLinks: [] });
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<{ query: string; href: string; label: string }[]>([]);
  const [activeFilter, setActiveFilter] = useState<"all" | "colleges" | "exams" | "courses" | "articles">("all");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = useCallback(
    (href: string, label: string) => {
      if (query.trim()) {
        addRecentSearch(query, href, label);
      }
      onOpenChange(false);
      setQuery("");
      setActiveFilter("all");
      router.push(href);
    },
    [router, onOpenChange, query]
  );

  // Fetch search results
  useEffect(() => {
    if (!open) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const searchQuery = query.trim() || "";
      const typeParam = activeFilter !== "all" ? `&type=${activeFilter}` : "";
      const url = `/api/search?q=${encodeURIComponent(searchQuery)}&limit=6${typeParam}`;

      setLoading(true);
      fetch(url)
        .then((r) => r.json())
        .then((data) => {
          setResults({
            colleges: data.colleges || [],
            exams: data.exams || [],
            courses: data.courses || [],
            articles: data.articles || [],
            quickLinks: data.quickLinks || [],
          });
        })
        .catch(() => setResults({ colleges: [], exams: [], courses: [], articles: [], quickLinks: [] }))
        .finally(() => setLoading(false));
    }, 200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, open, activeFilter]);

  // Load recent searches when opened
  useEffect(() => {
    if (open) {
      setRecentSearches(getRecentSearches());
      // Focus input after a tick
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setActiveFilter("all");
    }
  }, [open]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(true);
      }
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onOpenChange]);

  if (!open) return null;

  const hasQuery = query.trim().length > 0;
  const filteredColleges = results.colleges.slice(0, activeFilter === "colleges" ? 8 : 4);
  const filteredExams = results.exams.slice(0, activeFilter === "exams" ? 8 : 3);
  const filteredCourses = results.courses.slice(0, activeFilter === "courses" ? 8 : 3);
  const filteredNews = results.articles.slice(0, activeFilter === "articles" ? 8 : 3);
  const quickLinks = results.quickLinks.slice(0, 4);

  const totalResults = filteredColleges.length + filteredExams.length + filteredCourses.length + filteredNews.length + quickLinks.length;
  const hasResults = totalResults > 0;

  // Filter tabs for when there's a query
  const filterTabs: { key: typeof activeFilter; label: string; count: number }[] = [
    { key: "all", label: "All", count: results.colleges.length + results.exams.length + results.courses.length + results.articles.length },
    { key: "colleges", label: "Colleges", count: results.colleges.length },
    { key: "exams", label: "Exams", count: results.exams.length },
    { key: "courses", label: "Courses", count: results.courses.length },
    { key: "articles", label: "News", count: results.articles.length },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] sm:pt-[12vh] px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-md"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-2xl bg-white/[0.97] backdrop-blur-xl rounded-3xl shadow-[0_25px_60px_-12px_rgba(0,0,0,0.25)] overflow-hidden animate-scale-in border border-gray-200/50">
        <Command
          className="[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:text-indigo-400 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.15em]"
          shouldFilter={false}
        >
          {/* Search Input */}
          <div className="flex items-center border-b border-gray-100 px-5 py-4">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0 mr-3 shadow-sm">
              <Search className="h-4 w-4 text-white" />
            </div>
            <CommandInput
              ref={inputRef}
              value={query}
              onValueChange={setQuery}
              placeholder="Search colleges, exams, courses, news, pages..."
              className="flex-1 text-base outline-none placeholder:text-gray-400 bg-transparent font-medium"
            />
            {loading && (
              <div className="mr-3 h-4 w-4 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
            )}
            <button suppressHydrationWarning
              onClick={() => onOpenChange(false)}
              className="ml-2 flex items-center justify-center h-7 w-7 rounded-lg bg-gray-100/80 hover:bg-gray-200 transition-colors"
            >
              <X className="h-3.5 w-3.5 text-gray-500" />
            </button>
          </div>

          {/* Filter Tabs — shown when query exists */}
          {hasQuery && (
            <div className="flex items-center gap-1 px-5 py-2.5 border-b border-gray-100/50 overflow-x-auto scrollbar-hide">
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  suppressHydrationWarning
                  onClick={() => setActiveFilter(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                    activeFilter === tab.key
                      ? "bg-indigo-100 text-indigo-700 shadow-sm"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      activeFilter === tab.key ? "bg-indigo-200/60 text-indigo-700" : "bg-gray-100 text-gray-400"
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          <CommandList className="max-h-[55vh] overflow-y-auto p-2">
            {/* ── No Results State ── */}
            {hasQuery && !loading && !hasResults && (
              <CommandEmpty className="py-10 text-center">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <Search className="h-6 w-6 text-gray-300" />
                </div>
                <p className="text-gray-600 text-sm font-semibold">No results for &ldquo;{query}&rdquo;</p>
                <p className="text-gray-400 text-xs mt-1.5 max-w-xs mx-auto">
                  Try searching for college names, cities, exam names, streams, or course types
                </p>
                <div className="flex items-center justify-center gap-2 mt-4">
                  {["Engineering", "Medical", "MBA"].map((tag) => (
                    <button
                      key={tag}
                      suppressHydrationWarning
                      onClick={() => setQuery(tag)}
                      className="px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-medium hover:bg-indigo-100 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </CommandEmpty>
            )}

            {/* ── Default State (no query) ── */}
            {!hasQuery && (
              <>
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <CommandGroup heading={
                    <span className="flex items-center justify-between w-full">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        Recent Searches
                      </span>
                      <button
                        suppressHydrationWarning
                        onClick={(e) => {
                          e.stopPropagation();
                          clearRecentSearches();
                          setRecentSearches([]);
                        }}
                        className="text-[10px] text-gray-400 hover:text-red-500 font-medium normal-case tracking-normal transition-colors"
                      >
                        Clear all
                      </button>
                    </span>
                  }>
                    {recentSearches.map((item) => (
                      <CommandItem
                        key={item.href}
                        value={`recent-${item.href}`}
                        onSelect={() => handleSelect(item.href, item.label)}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer hover:bg-gray-50 data-[selected]:bg-gray-50 transition-all duration-200"
                      >
                        <Clock className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
                        <span className="text-sm text-gray-600 truncate flex-1">{item.label}</span>
                        <ArrowRight className="h-3 w-3 text-gray-300" />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {recentSearches.length > 0 && (
                  <CommandSeparator className="my-1.5 h-px bg-gray-100/50" />
                )}

                {/* Trending Searches */}
                <CommandGroup heading={
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="h-3 w-3" />
                    Trending
                  </span>
                }>
                  <div className="flex flex-wrap gap-2 px-4 py-2">
                    {trendingSearches.map((item) => (
                      <button
                        key={item.label}
                        suppressHydrationWarning
                        onClick={() => handleSelect(item.href, item.label)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 text-xs font-medium border border-indigo-100/50 hover:from-indigo-100 hover:to-purple-100 hover:shadow-sm transition-all"
                      >
                        <Zap className="h-3 w-3" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </CommandGroup>

                <CommandSeparator className="my-1.5 h-px bg-gray-100/50" />

                {/* Quick Navigation */}
                <CommandGroup heading="Quick Navigation">
                  <div className="grid grid-cols-2 gap-1 px-1">
                    {defaultPages.map((page) => (
                      <CommandItem
                        key={page.id}
                        value={page.id}
                        onSelect={() => handleSelect(page.href, page.label)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-gray-50 data-[selected]:bg-gray-50 transition-all duration-200"
                      >
                        <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${page.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                          <page.icon className="h-3.5 w-3.5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate">{page.label}</p>
                          <p className="text-[10px] text-gray-400 truncate">{page.desc}</p>
                        </div>
                      </CommandItem>
                    ))}
                  </div>
                </CommandGroup>

                {/* Featured Colleges (from API) */}
                {results.colleges.length > 0 && (
                  <>
                    <CommandSeparator className="my-1.5 h-px bg-gray-100/50" />
                    <CommandGroup heading={
                      <span className="flex items-center gap-1.5">
                        <Star className="h-3 w-3" />
                        Featured Colleges
                      </span>
                    }>
                      {results.colleges.slice(0, 3).map((college) => (
                        <CommandItem
                          key={college.id}
                          value={`featured-college-${college.id}`}
                          onSelect={() => handleSelect(`/colleges/${college.slug}`, college.name)}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-indigo-50/50 data-[selected]:bg-indigo-50/50 transition-all duration-200"
                        >
                          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
                            {college.name[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{college.name}</p>
                            <p className="text-xs text-gray-500">
                              {college.city}, {college.state}
                              {college.nirfRank ? ` · NIRF #${college.nirfRank}` : ""}
                            </p>
                          </div>
                          <Sparkles className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </>
                )}
              </>
            )}

            {/* ── Search Results ── */}
            {hasQuery && hasResults && (
              <>
                {/* Quick Links (pages/shortcuts matching query) */}
                {quickLinks.length > 0 && (activeFilter === "all") && (
                  <CommandGroup heading={
                    <span className="flex items-center gap-1.5">
                      <Zap className="h-3 w-3" />
                      Quick Links
                    </span>
                  }>
                    {quickLinks.map((link) => {
                      const LinkIcon = getIcon(link.icon);
                      return (
                        <CommandItem
                          key={link.id}
                          value={`quicklink-${link.id}`}
                          onSelect={() => handleSelect(link.href, link.title)}
                          className="flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer hover:bg-violet-50/50 data-[selected]:bg-violet-50/50 transition-all duration-200"
                        >
                          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-400 flex items-center justify-center flex-shrink-0 shadow-sm">
                            <LinkIcon className="h-3.5 w-3.5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{link.title}</p>
                            <p className="text-xs text-gray-400 truncate">{link.description}</p>
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                )}

                {quickLinks.length > 0 && filteredColleges.length > 0 && activeFilter === "all" && (
                  <CommandSeparator className="my-1.5 h-px bg-gray-100/50" />
                )}

                {/* Colleges */}
                {filteredColleges.length > 0 && (activeFilter === "all" || activeFilter === "colleges") && (
                  <CommandGroup heading="Colleges">
                    {filteredColleges.map((college) => (
                      <CommandItem
                        key={college.id}
                        value={`college-${college.id}`}
                        onSelect={() => handleSelect(`/colleges/${college.slug}`, college.name)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-indigo-50/50 data-[selected]:bg-indigo-50/50 transition-all duration-200"
                      >
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
                          {college.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {college.name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{college.city}, {college.state}</span>
                            {college.nirfRank && (
                              <span className="px-1.5 py-0.5 rounded bg-orange-50 text-orange-600 font-semibold text-[10px]">
                                NIRF #{college.nirfRank}
                              </span>
                            )}
                            {college.type && (
                              <span className="text-gray-400">{college.type}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          {college.rating && college.rating > 0 && (
                            <div className="flex items-center gap-0.5 text-xs text-amber-500">
                              <Star className="h-3 w-3 fill-amber-400" />
                              {college.rating.toFixed(1)}
                            </div>
                          )}
                          {(college.feesMin || college.feesMax) && (
                            <div className="flex items-center gap-0.5 text-[10px] text-gray-400 mt-0.5">
                              <IndianRupee className="h-2.5 w-2.5" />
                              {formatFees(college.feesMin, college.feesMax)}
                            </div>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                    {activeFilter === "all" && results.colleges.length > 4 && (
                      <button
                        suppressHydrationWarning
                        onClick={() => setActiveFilter("colleges")}
                        className="w-full text-center py-2 text-xs text-indigo-500 font-semibold hover:text-indigo-700 transition-colors"
                      >
                        View all {results.colleges.length} colleges →
                      </button>
                    )}
                  </CommandGroup>
                )}

                {filteredColleges.length > 0 && filteredExams.length > 0 && (
                  <CommandSeparator className="my-1.5 h-px bg-gray-100/50" />
                )}

                {/* Exams */}
                {filteredExams.length > 0 && (activeFilter === "all" || activeFilter === "exams") && (
                  <CommandGroup heading="Exams">
                    {filteredExams.map((exam) => (
                      <CommandItem
                        key={exam.id}
                        value={`exam-${exam.id}`}
                        onSelect={() => handleSelect(`/exams/${exam.slug}`, exam.name)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-orange-50/50 data-[selected]:bg-orange-50/50 transition-all duration-200"
                      >
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center flex-shrink-0 shadow-sm">
                          <FileText className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {exam.name}
                            {exam.fullName && exam.fullName !== exam.name && (
                              <span className="text-xs text-gray-400 font-normal ml-1.5">({exam.fullName})</span>
                            )}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{exam.conductingBody}</span>
                            {exam.examDate && (
                              <span className="flex items-center gap-0.5 text-emerald-600 font-medium">
                                <Calendar className="h-3 w-3" />
                                {exam.examDate}
                              </span>
                            )}
                          </div>
                        </div>
                        {exam.level && (
                          <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 text-[10px] font-semibold flex-shrink-0">
                            {exam.level}
                          </span>
                        )}
                      </CommandItem>
                    ))}
                    {activeFilter === "all" && results.exams.length > 3 && (
                      <button
                        suppressHydrationWarning
                        onClick={() => setActiveFilter("exams")}
                        className="w-full text-center py-2 text-xs text-orange-500 font-semibold hover:text-orange-700 transition-colors"
                      >
                        View all {results.exams.length} exams →
                      </button>
                    )}
                  </CommandGroup>
                )}

                {filteredExams.length > 0 && filteredCourses.length > 0 && (
                  <CommandSeparator className="my-1.5 h-px bg-gray-100/50" />
                )}

                {/* Courses */}
                {filteredCourses.length > 0 && (activeFilter === "all" || activeFilter === "courses") && (
                  <CommandGroup heading="Courses">
                    {filteredCourses.map((course) => (
                      <CommandItem
                        key={course.id}
                        value={`course-${course.id}`}
                        onSelect={() => handleSelect(`/courses/${course.slug}`, course.name)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-emerald-50/50 data-[selected]:bg-emerald-50/50 transition-all duration-200"
                      >
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center flex-shrink-0 shadow-sm">
                          <BookOpen className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">
                            {course.name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{course.level} · {course.duration}</span>
                            {course.stream && (
                              <span className="text-emerald-600 font-medium">{course.stream}</span>
                            )}
                          </div>
                        </div>
                        {course.avgSalary && course.avgSalary > 0 && (
                          <div className="flex items-center gap-0.5 text-[10px] text-gray-400 flex-shrink-0">
                            <IndianRupee className="h-2.5 w-2.5" />
                            {formatFees(course.avgSalary)} avg
                          </div>
                        )}
                      </CommandItem>
                    ))}
                    {activeFilter === "all" && results.courses.length > 3 && (
                      <button
                        suppressHydrationWarning
                        onClick={() => setActiveFilter("courses")}
                        className="w-full text-center py-2 text-xs text-emerald-500 font-semibold hover:text-emerald-700 transition-colors"
                      >
                        View all {results.courses.length} courses →
                      </button>
                    )}
                  </CommandGroup>
                )}

                {filteredCourses.length > 0 && filteredNews.length > 0 && (
                  <CommandSeparator className="my-1.5 h-px bg-gray-100/50" />
                )}

                {/* News */}
                {filteredNews.length > 0 && (activeFilter === "all" || activeFilter === "articles") && (
                  <CommandGroup heading="News & Articles">
                    {filteredNews.map((article) => (
                      <CommandItem
                        key={article.id}
                        value={`news-${article.id}`}
                        onSelect={() => handleSelect(`/news/${article.slug}`, article.title)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-gray-50/80 data-[selected]:bg-gray-50/80 transition-all duration-200"
                      >
                        <div
                          className={`h-9 w-9 rounded-xl bg-gradient-to-br ${article.imageColor || "from-gray-400 to-gray-300"} flex items-center justify-center flex-shrink-0 shadow-sm`}
                        >
                          <Newspaper className="h-4 w-4 text-white/80" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {article.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium text-[10px]">
                              {article.category}
                            </span>
                            {article.summary && (
                              <span className="truncate">{article.summary.slice(0, 60)}...</span>
                            )}
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                    {activeFilter === "all" && results.articles.length > 3 && (
                      <button
                        suppressHydrationWarning
                        onClick={() => setActiveFilter("articles")}
                        className="w-full text-center py-2 text-xs text-gray-500 font-semibold hover:text-gray-700 transition-colors"
                      >
                        View all {results.articles.length} articles →
                      </button>
                    )}
                  </CommandGroup>
                )}
              </>
            )}
          </CommandList>

          {/* Footer */}
          <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between bg-gray-50/30">
            <div className="flex items-center gap-3 text-[10px] text-gray-400 font-medium">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded-md bg-white border border-gray-200/60 font-mono text-[10px] shadow-sm">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded-md bg-white border border-gray-200/60 font-mono text-[10px] shadow-sm">↵</kbd>
                Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded-md bg-white border border-gray-200/60 font-mono text-[10px] shadow-sm">Esc</kbd>
                Close
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium">
              <Sparkles className="h-3 w-3 text-indigo-400" />
              Mayra Search
              {hasQuery && !loading && (
                <span className="text-gray-300 ml-1">· {totalResults} results</span>
              )}
            </div>
          </div>
        </Command>
      </div>
    </div>
  );
}
