"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Search,
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  FileText,
  Newspaper,
  Globe,
  Users,
  MessageSquare,
  Mail,
  Shield,
  Settings,
  Activity,
  BarChart3,
  Plus,
  ArrowRight,
  Zap,
  Clock,
  ImageIcon,
  Database,
  Layout,
  Layers,
  X,
  Tag,
  BadgeCheck,
  Monitor,
  ClipboardList,
  Megaphone,
  Scale,
  MapPin,
  Building,
  FolderOpen,
  type LucideIcon,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────

interface NavItem {
  id: string;
  label: string;
  description?: string;
  href: string;
  icon: LucideIcon;
  category: string;
  keywords?: string[];
}

interface SearchResultItem {
  id: string;
  label: string;
  sublabel: string;
  href: string;
  icon: LucideIcon;
  category: string;
  badge?: string;
  badgeColor?: string;
}

interface AdminSearchResults {
  colleges: any[];
  courses: any[];
  exams: any[];
  news: any[];
  studyAbroad: any[];
  leads: any[];
  enquiries: any[];
  users: any[];
  newsletter: any[];
  streams: any[];
  tags: any[];
  newsCategories: any[];
  collegeTypes: any[];
  courseLevels: any[];
  examModes: any[];
  accreditations: any[];
  dataSources: any[];
  heroBanners: any[];
  announcements: any[];
  pageSeo: any[];
  admins: any[];
  total: number;
}

// ─── Static Navigation Commands ─────────────────────────────

const NAV_COMMANDS: NavItem[] = [
  // Quick Actions
  { id: "add-college", label: "Add New College", description: "Create a new college entry", href: "/admin/colleges/new", icon: Plus, category: "Quick Actions", keywords: ["create", "new", "college"] },
  { id: "add-course", label: "Add New Course", description: "Create a new course entry", href: "/admin/courses/new", icon: Plus, category: "Quick Actions", keywords: ["create", "new", "course"] },
  { id: "add-exam", label: "Add New Exam", description: "Create a new exam entry", href: "/admin/exams/new", icon: Plus, category: "Quick Actions", keywords: ["create", "new", "exam"] },
  { id: "add-news", label: "Write New Article", description: "Create a news article", href: "/admin/news/new", icon: Plus, category: "Quick Actions", keywords: ["create", "new", "article", "news", "write"] },
  { id: "add-country", label: "Add Study Abroad Country", description: "Add a new country", href: "/admin/study-abroad/new", icon: Plus, category: "Quick Actions", keywords: ["create", "new", "country", "abroad"] },

  // Navigation
  { id: "dashboard", label: "Dashboard", description: "Overview & statistics", href: "/admin/dashboard", icon: LayoutDashboard, category: "Navigation" },
  { id: "analytics", label: "Analytics", description: "Detailed analytics & reports", href: "/admin/analytics", icon: BarChart3, category: "Navigation" },
  { id: "colleges", label: "Colleges", description: "Manage all colleges", href: "/admin/colleges", icon: GraduationCap, category: "Navigation" },
  { id: "courses", label: "Courses", description: "Manage all courses", href: "/admin/courses", icon: BookOpen, category: "Navigation" },
  { id: "exams", label: "Exams", description: "Manage all exams", href: "/admin/exams", icon: FileText, category: "Navigation" },
  { id: "news", label: "News & Articles", description: "Manage news content", href: "/admin/news", icon: Newspaper, category: "Navigation" },
  { id: "study-abroad", label: "Study Abroad", description: "Manage countries", href: "/admin/study-abroad", icon: Globe, category: "Navigation" },
  { id: "leads-page", label: "Leads", description: "Manage leads", href: "/admin/leads", icon: ClipboardList, category: "Navigation" },
  { id: "users-page", label: "Users", description: "Registered users", href: "/admin/users", icon: Users, category: "Navigation" },
  { id: "newsletter-page", label: "Newsletter", description: "Subscriber management", href: "/admin/newsletter", icon: Mail, category: "Navigation" },

  // Master Data
  { id: "streams-page", label: "Streams", description: "Education streams", href: "/admin/streams", icon: Layers, category: "Master Data" },
  { id: "states-page", label: "States & Cities", description: "Location management", href: "/admin/states", icon: MapPin, category: "Master Data" },
  { id: "accreditations-page", label: "Accreditations", description: "Accreditation bodies", href: "/admin/accreditations", icon: BadgeCheck, category: "Master Data" },
  { id: "tags-page", label: "Tags", description: "Content tags", href: "/admin/tags", icon: Tag, category: "Master Data" },
  { id: "news-categories-page", label: "News Categories", description: "Article categories", href: "/admin/news-categories", icon: FolderOpen, category: "Master Data" },
  { id: "college-types-page", label: "College Types", description: "Types of colleges", href: "/admin/college-types", icon: Building, category: "Master Data" },
  { id: "course-levels-page", label: "Course Levels", description: "Course level management", href: "/admin/course-levels", icon: GraduationCap, category: "Master Data" },
  { id: "exam-modes-page", label: "Exam Modes", description: "Exam mode management", href: "/admin/exam-modes", icon: Monitor, category: "Master Data" },
  { id: "lead-options-page", label: "Lead Options", description: "Lead qualifications & interests", href: "/admin/lead-options", icon: ClipboardList, category: "Master Data" },
  { id: "data-sources-page", label: "Data Sources", description: "Manage data sources", href: "/admin/data-sources", icon: Database, category: "Master Data" },

  // Site Experience
  { id: "company-info-page", label: "Company Info", description: "Company information", href: "/admin/company-info", icon: Building, category: "Site Experience" },
  { id: "navigation-page", label: "Navigation", description: "Menu management", href: "/admin/navigation-items", icon: Layout, category: "Site Experience" },
  { id: "hero-banners-page", label: "Hero Banners", description: "Manage homepage hero", href: "/admin/hero-banners", icon: ImageIcon, category: "Site Experience" },
  { id: "home-stats-page", label: "Home Stats", description: "Homepage statistics", href: "/admin/home-stats", icon: BarChart3, category: "Site Experience" },
  { id: "home-sections-page", label: "Home Sections", description: "Configure homepage sections", href: "/admin/home-sections", icon: Layout, category: "Site Experience" },
  { id: "footer-page", label: "Footer", description: "Footer management", href: "/admin/footer-sections", icon: Layout, category: "Site Experience" },
  { id: "social-links-page", label: "Social Links", description: "Social media links", href: "/admin/social-links", icon: Globe, category: "Site Experience" },
  { id: "cta-sections-page", label: "CTA Sections", description: "Call-to-action sections", href: "/admin/cta-sections", icon: Zap, category: "Site Experience" },
  { id: "announcements-page", label: "Announcements", description: "Site announcements", href: "/admin/announcements", icon: Megaphone, category: "Site Experience" },
  { id: "media-page", label: "Media Library", description: "Images & documents", href: "/admin/media", icon: ImageIcon, category: "Site Experience" },

  // SEO
  { id: "page-seo-page", label: "Page SEO", description: "SEO settings per page", href: "/admin/page-seo", icon: Search, category: "SEO" },
  { id: "world-stats-page", label: "World Stats", description: "World college statistics", href: "/admin/world-college-stats", icon: Globe, category: "SEO" },
  { id: "legal-links-page", label: "Legal Links", description: "Legal & compliance", href: "/admin/legal-links", icon: Scale, category: "SEO" },
  { id: "trust-badges-page", label: "Trust Badges", description: "Trust indicators", href: "/admin/trust-badges", icon: BadgeCheck, category: "SEO" },

  // Platform
  { id: "admin-users-page", label: "Admin Users", description: "Manage admin accounts", href: "/admin/admins", icon: Shield, category: "Platform" },
  { id: "email-setup-page", label: "Email Setup", description: "Email configuration", href: "/admin/setup", icon: Mail, category: "Platform" },
  { id: "settings-page", label: "Settings", description: "Portal settings", href: "/admin/settings", icon: Settings, category: "Platform" },
  { id: "logs-page", label: "Activity Logs", description: "Audit trail", href: "/admin/logs", icon: Activity, category: "Platform" },
];

// ─── Filter Tabs ────────────────────────────────────────────

type FilterKey =
  | "all"
  | "content"
  | "leads"
  | "master"
  | "site"
  | "platform"
  | "pages";

const FILTER_TABS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "content", label: "Content" },
  { key: "leads", label: "Leads & Users" },
  { key: "master", label: "Master Data" },
  { key: "site", label: "Site & SEO" },
  { key: "platform", label: "Platform" },
  { key: "pages", label: "Pages" },
];

// ─── Helpers ────────────────────────────────────────────────

function transformResults(data: AdminSearchResults): SearchResultItem[] {
  const items: SearchResultItem[] = [];

  // Colleges
  data.colleges?.forEach((c: any) => {
    items.push({
      id: `college-${c.id}`,
      label: c.name,
      sublabel: `${c.city || ""} ${c.state ? `, ${c.state}` : ""}${c.nirfRank ? ` · NIRF #${c.nirfRank}` : ""} · ${c.type || "College"}`,
      href: `/admin/colleges/${c.id}/edit`,
      icon: GraduationCap,
      category: "Colleges",
      badge: c.isActive ? undefined : "Inactive",
      badgeColor: c.isActive ? undefined : "bg-red-50 text-red-600",
    });
  });

  // Courses
  data.courses?.forEach((c: any) => {
    items.push({
      id: `course-${c.id}`,
      label: c.name,
      sublabel: `${c.level || ""} · ${c.stream || ""} · ${c.duration || ""}`,
      href: `/admin/courses/${c.id}/edit`,
      icon: BookOpen,
      category: "Courses",
      badge: c.isActive ? undefined : "Inactive",
      badgeColor: c.isActive ? undefined : "bg-red-50 text-red-600",
    });
  });

  // Exams
  data.exams?.forEach((e: any) => {
    items.push({
      id: `exam-${e.id}`,
      label: e.name,
      sublabel: `${e.fullName || ""} · ${e.conductingBody || ""}${e.examDate ? ` · ${e.examDate}` : ""}`,
      href: `/admin/exams/${e.id}/edit`,
      icon: FileText,
      category: "Exams",
      badge: e.level || undefined,
      badgeColor: "bg-orange-50 text-orange-600",
    });
  });

  // News
  data.news?.forEach((n: any) => {
    items.push({
      id: `news-${n.id}`,
      label: n.title,
      sublabel: `${n.category || "Article"} · ${n.author || ""}`,
      href: `/admin/news/${n.id}/edit`,
      icon: Newspaper,
      category: "News & Articles",
      badge: n.isActive ? undefined : "Draft",
      badgeColor: n.isActive ? undefined : "bg-yellow-50 text-yellow-700",
    });
  });

  // Study Abroad
  data.studyAbroad?.forEach((s: any) => {
    items.push({
      id: `abroad-${s.id}`,
      label: `${s.flag || ""} ${s.name}`,
      sublabel: `${s.universities || 0} universities`,
      href: `/admin/study-abroad/${s.id}/edit`,
      icon: Globe,
      category: "Study Abroad",
    });
  });

  // Leads
  data.leads?.forEach((l: any) => {
    items.push({
      id: `lead-${l.id}`,
      label: l.fullName,
      sublabel: `${l.email || l.phone || ""} · ${l.courseInterested || ""} · ${l.city || ""}`,
      href: `/admin/leads/${l.id}`,
      icon: ClipboardList,
      category: "Leads",
      badge: l.status,
      badgeColor: l.status === "NEW" ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-600",
    });
  });

  // Enquiries
  data.enquiries?.forEach((e: any) => {
    items.push({
      id: `enquiry-${e.id}`,
      label: e.studentName,
      sublabel: `${e.collegeName || ""} · ${e.program || ""} · ${e.email || ""}`,
      href: `/admin/leads?tab=enquiries&search=${encodeURIComponent(e.studentName)}`,
      icon: MessageSquare,
      category: "Enquiries",
      badge: e.status,
      badgeColor: e.status === "PENDING" ? "bg-yellow-50 text-yellow-700" : "bg-green-50 text-green-700",
    });
  });

  // Users
  data.users?.forEach((u: any) => {
    items.push({
      id: `user-${u.id}`,
      label: u.name,
      sublabel: `${u.email || ""} · ${u.phone || ""} · ${u.goal || ""}`,
      href: `/admin/users?search=${encodeURIComponent(u.name)}`,
      icon: Users,
      category: "Users",
      badge: u.isVerified ? "Verified" : undefined,
      badgeColor: "bg-emerald-50 text-emerald-600",
    });
  });

  // Newsletter
  data.newsletter?.forEach((n: any) => {
    items.push({
      id: `newsletter-${n.id}`,
      label: n.email,
      sublabel: `${n.name || "Subscriber"} · ${n.source || "website"}`,
      href: `/admin/newsletter?search=${encodeURIComponent(n.email)}`,
      icon: Mail,
      category: "Newsletter",
      badge: n.isActive ? "Active" : "Unsubscribed",
      badgeColor: n.isActive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600",
    });
  });

  // Streams
  data.streams?.forEach((s: any) => {
    items.push({
      id: `stream-${s.id}`,
      label: s.name,
      sublabel: "Education stream",
      href: `/admin/streams`,
      icon: Layers,
      category: "Master Data",
    });
  });

  // Tags
  data.tags?.forEach((t: any) => {
    items.push({
      id: `tag-${t.id}`,
      label: t.name,
      sublabel: "Content tag",
      href: `/admin/tags`,
      icon: Tag,
      category: "Master Data",
    });
  });

  // News Categories
  data.newsCategories?.forEach((nc: any) => {
    items.push({
      id: `newscat-${nc.id}`,
      label: nc.name,
      sublabel: "News category",
      href: `/admin/news-categories`,
      icon: FolderOpen,
      category: "Master Data",
    });
  });

  // College Types
  data.collegeTypes?.forEach((ct: any) => {
    items.push({
      id: `coltype-${ct.id}`,
      label: ct.name,
      sublabel: "College type",
      href: `/admin/college-types`,
      icon: Building,
      category: "Master Data",
    });
  });

  // Course Levels
  data.courseLevels?.forEach((cl: any) => {
    items.push({
      id: `courselevel-${cl.id}`,
      label: cl.name,
      sublabel: "Course level",
      href: `/admin/course-levels`,
      icon: GraduationCap,
      category: "Master Data",
    });
  });

  // Exam Modes
  data.examModes?.forEach((em: any) => {
    items.push({
      id: `exammode-${em.id}`,
      label: em.name,
      sublabel: "Exam mode",
      href: `/admin/exam-modes`,
      icon: Monitor,
      category: "Master Data",
    });
  });

  // Accreditations
  data.accreditations?.forEach((a: any) => {
    items.push({
      id: `accred-${a.id}`,
      label: a.name,
      sublabel: a.fullName || "Accreditation body",
      href: `/admin/accreditations`,
      icon: BadgeCheck,
      category: "Master Data",
    });
  });

  // Data Sources
  data.dataSources?.forEach((ds: any) => {
    items.push({
      id: `datasrc-${ds.id}`,
      label: ds.name,
      sublabel: ds.url || "Data source",
      href: `/admin/data-sources`,
      icon: Database,
      category: "Master Data",
    });
  });

  // Hero Banners
  data.heroBanners?.forEach((hb: any) => {
    items.push({
      id: `hero-${hb.id}`,
      label: hb.heading || "Hero Banner",
      sublabel: hb.subheading || "Homepage banner",
      href: `/admin/hero-banners`,
      icon: ImageIcon,
      category: "Site Experience",
    });
  });

  // Announcements
  data.announcements?.forEach((a: any) => {
    items.push({
      id: `announce-${a.id}`,
      label: a.text,
      sublabel: "Announcement",
      href: `/admin/announcements`,
      icon: Megaphone,
      category: "Site Experience",
      badge: a.isActive ? "Active" : "Inactive",
      badgeColor: a.isActive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600",
    });
  });

  // Page SEO
  data.pageSeo?.forEach((p: any) => {
    items.push({
      id: `seo-${p.id}`,
      label: p.title || p.pageSlug,
      sublabel: `SEO · ${p.pageSlug}`,
      href: `/admin/page-seo`,
      icon: Search,
      category: "SEO",
    });
  });

  // Admins
  data.admins?.forEach((a: any) => {
    items.push({
      id: `admin-${a.id}`,
      label: a.name,
      sublabel: `${a.email} · ${a.role?.replace("_", " ")}`,
      href: `/admin/admins`,
      icon: Shield,
      category: "Admin Users",
      badge: a.isActive ? undefined : "Inactive",
      badgeColor: "bg-red-50 text-red-600",
    });
  });

  return items;
}

// Category-to-filter mapping
const CATEGORY_FILTER_MAP: Record<string, FilterKey> = {
  "Colleges": "content",
  "Courses": "content",
  "Exams": "content",
  "News & Articles": "content",
  "Study Abroad": "content",
  "Leads": "leads",
  "Enquiries": "leads",
  "Users": "leads",
  "Newsletter": "leads",
  "Master Data": "master",
  "Site Experience": "site",
  "SEO": "site",
  "Admin Users": "platform",
};

// ─── Recent Searches ────────────────────────────────────────

const RECENT_KEY = "admin-recent-searches";
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
  } catch {}
}

function clearRecentSearches() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(RECENT_KEY);
}

// ─── Component ──────────────────────────────────────────────

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [loading, setLoading] = useState(false);
  const [dbResults, setDbResults] = useState<SearchResultItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<{ query: string; href: string; label: string }[]>([]);
  const [resultCounts, setResultCounts] = useState<Record<string, number>>({});
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const hasQuery = query.trim().length > 0;

  // Filter nav commands by query
  const filteredNavCommands = useMemo(() => {
    if (!hasQuery) return NAV_COMMANDS;
    const q = query.toLowerCase();
    return NAV_COMMANDS.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(q) ||
        cmd.description?.toLowerCase().includes(q) ||
        cmd.category.toLowerCase().includes(q) ||
        cmd.keywords?.some((k) => k.includes(q))
    );
  }, [query, hasQuery]);

  // Combine and filter all results
  const allItems = useMemo(() => {
    const items: { id: string; label: string; sublabel: string; href: string; icon: LucideIcon; category: string; badge?: string; badgeColor?: string; isNav?: boolean }[] = [];

    // Add nav items when "pages" or "all"
    if (activeFilter === "all" || activeFilter === "pages") {
      filteredNavCommands.forEach((cmd) => {
        items.push({
          id: cmd.id,
          label: cmd.label,
          sublabel: cmd.description || "",
          href: cmd.href,
          icon: cmd.icon,
          category: cmd.category,
          isNav: true,
        });
      });
    }

    // Add DB results filtered by category
    if (activeFilter === "all") {
      items.push(...dbResults);
    } else if (activeFilter !== "pages") {
      items.push(
        ...dbResults.filter((r) => CATEGORY_FILTER_MAP[r.category] === activeFilter)
      );
    }

    return items;
  }, [filteredNavCommands, dbResults, activeFilter]);

  // Group items
  const groupedItems = useMemo(() => {
    const groups: Record<string, typeof allItems> = {};
    allItems.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [allItems]);

  // Fetch search results from API
  useEffect(() => {
    if (!open) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!hasQuery) {
      setDbResults([]);
      setResultCounts({});
      return;
    }

    debounceRef.current = setTimeout(() => {
      setLoading(true);
      fetch(`/api/admin/search?q=${encodeURIComponent(query.trim())}&limit=6`)
        .then((r) => r.json())
        .then((data: AdminSearchResults) => {
          const items = transformResults(data);
          setDbResults(items);

          // Count by filter category
          const counts: Record<string, number> = {};
          items.forEach((item) => {
            const filterKey = CATEGORY_FILTER_MAP[item.category] || "all";
            counts[filterKey] = (counts[filterKey] || 0) + 1;
          });
          setResultCounts(counts);
        })
        .catch(() => {
          setDbResults([]);
          setResultCounts({});
        })
        .finally(() => setLoading(false));
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, open, hasQuery]);

  // Reset state on open/close
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      setActiveFilter("all");
      setRecentSearches(getRecentSearches());
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Reset active index on query/filter change
  useEffect(() => {
    setActiveIndex(0);
  }, [query, activeFilter]);

  // Scroll active item into view
  useEffect(() => {
    const activeEl = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    activeEl?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const handleSelect = useCallback(
    (href: string, label: string) => {
      if (query.trim()) {
        addRecentSearch(query, href, label);
      }
      router.push(href);
      onClose();
    },
    [router, onClose, query]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((prev) => Math.min(prev + 1, allItems.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (allItems[activeIndex]) {
            handleSelect(allItems[activeIndex].href, allItems[activeIndex].label);
          }
          break;
        case "Escape":
          onClose();
          break;
      }
    },
    [allItems, activeIndex, handleSelect, onClose]
  );

  if (!open) return null;

  let currentIdx = 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[8vh] sm:pt-[12vh] px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />
      <div
        className="relative w-full max-w-[640px] bg-white/[0.97] backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: "0 25px 65px -5px rgba(0,0,0,0.25), 0 8px 20px -8px rgba(0,0,0,0.15)" }}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-5 border-b border-gray-100">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <Search className="h-4 w-4 text-white" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search everything — colleges, leads, users, settings..."
            className="flex-1 h-14 bg-transparent text-[15px] text-gray-800 placeholder:text-gray-400 outline-none"
          />
          {loading && (
            <div className="h-4 w-4 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
          )}
          <button
            onClick={onClose}
            className="flex items-center justify-center h-7 w-7 rounded-lg bg-gray-100/80 hover:bg-gray-200 transition-colors"
          >
            <X className="h-3.5 w-3.5 text-gray-500" />
          </button>
        </div>

        {/* Filter Tabs (shown when query exists) */}
        {hasQuery && (
          <div className="flex items-center gap-1 px-5 py-2.5 border-b border-gray-100/50 overflow-x-auto scrollbar-hide">
            {FILTER_TABS.map((tab) => {
              const count =
                tab.key === "all"
                  ? allItems.length
                  : tab.key === "pages"
                    ? filteredNavCommands.length
                    : resultCounts[tab.key] || 0;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap",
                    activeFilter === tab.key
                      ? "bg-blue-100 text-blue-700 shadow-sm"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  )}
                >
                  {tab.label}
                  {count > 0 && (
                    <span
                      className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-full",
                        activeFilter === tab.key
                          ? "bg-blue-200/60 text-blue-700"
                          : "bg-gray-100 text-gray-400"
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Results */}
        <div ref={listRef} className="max-h-[55vh] overflow-y-auto py-2 admin-sidebar-scroll">
          {/* ── No query: show recent & nav ── */}
          {!hasQuery && (
            <>
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between px-4 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      Recent Searches
                    </p>
                    <button
                      onClick={() => { clearRecentSearches(); setRecentSearches([]); }}
                      className="text-[10px] text-gray-400 hover:text-red-500 font-medium transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                  {recentSearches.map((item) => (
                    <button
                      key={item.href}
                      onClick={() => handleSelect(item.href, item.label)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 mx-1 rounded-xl hover:bg-gray-50 transition-colors text-left"
                      style={{ width: "calc(100% - 8px)" }}
                    >
                      <Clock className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
                      <span className="text-sm text-gray-600 truncate flex-1">{item.label}</span>
                      <ArrowRight className="h-3 w-3 text-gray-300" />
                    </button>
                  ))}
                  <div className="mx-4 my-2 h-px bg-gray-100" />
                </div>
              )}

              {/* Static Nav Commands */}
              {Object.entries(
                NAV_COMMANDS.reduce<Record<string, NavItem[]>>((acc, cmd) => {
                  if (!acc[cmd.category]) acc[cmd.category] = [];
                  acc[cmd.category].push(cmd);
                  return acc;
                }, {})
              ).map(([category, items]) => (
                <div key={category}>
                  <div className="px-4 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      {category}
                    </p>
                  </div>
                  {items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.href, item.label)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 mx-1 rounded-xl hover:bg-gray-50 transition-colors text-left"
                      style={{ width: "calc(100% - 8px)" }}
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-gray-100 text-gray-500">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{item.label}</p>
                        {item.description && (
                          <p className="text-xs text-gray-400 truncate mt-0.5">{item.description}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ))}
            </>
          )}

          {/* ── Query with no results ── */}
          {hasQuery && !loading && allItems.length === 0 && (
            <div className="py-12 text-center">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center mx-auto mb-3 shadow-sm">
                <Search className="h-6 w-6 text-gray-300" />
              </div>
              <p className="text-sm text-gray-600 font-semibold">No results for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-gray-400 mt-1.5 max-w-xs mx-auto">
                Try searching for colleges, leads, users, exams, courses, or admin pages
              </p>
            </div>
          )}

          {/* ── Search Results ── */}
          {hasQuery && allItems.length > 0 && (
            <>
              {Object.entries(groupedItems).map(([category, items]) => (
                <div key={category}>
                  <div className="px-4 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      {category}
                    </p>
                  </div>
                  {items.map((item) => {
                    const idx = currentIdx++;
                    return (
                      <button
                        key={item.id}
                        data-index={idx}
                        onClick={() => handleSelect(item.href, item.label)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2.5 mx-1 rounded-xl transition-colors text-left",
                          "hover:bg-gray-50",
                          idx === activeIndex && "bg-blue-50/80"
                        )}
                        style={{ width: "calc(100% - 8px)" }}
                      >
                        <div
                          className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                            idx === activeIndex
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-100 text-gray-500"
                          )}
                        >
                          <item.icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              "text-sm font-medium truncate",
                              idx === activeIndex ? "text-blue-700" : "text-gray-800"
                            )}
                          >
                            {item.label}
                          </p>
                          {item.sublabel && (
                            <p className="text-xs text-gray-400 truncate mt-0.5">
                              {item.sublabel}
                            </p>
                          )}
                        </div>
                        {item.badge && (
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0",
                              item.badgeColor || "bg-gray-100 text-gray-600"
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                        {idx === activeIndex && (
                          <ArrowRight className="w-4 h-4 text-blue-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/30">
          <div className="flex items-center gap-3 text-[10px] text-gray-400 font-medium">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded-md bg-white border border-gray-200/60 font-mono text-[10px] shadow-sm">&uarr;&darr;</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded-md bg-white border border-gray-200/60 font-mono text-[10px] shadow-sm">Enter</kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded-md bg-white border border-gray-200/60 font-mono text-[10px] shadow-sm">Esc</kbd>
              Close
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium">
            <Zap className="w-3 h-3 text-blue-400" />
            <span>Admin Search</span>
            {hasQuery && !loading && (
              <span className="text-gray-300 ml-1">&middot; {allItems.length} results</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
