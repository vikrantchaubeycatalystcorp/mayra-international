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
  Hash,
  Zap,
  Clock,
  ImageIcon,
  Database,
  Layout,
  Layers,
} from "lucide-react";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  href: string;
  icon: React.ElementType;
  category: string;
  keywords?: string[];
}

const COMMANDS: CommandItem[] = [
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
  { id: "enquiries", label: "Enquiries", description: "View & respond to enquiries", href: "/admin/enquiries", icon: MessageSquare, category: "Navigation" },
  { id: "users", label: "Users", description: "Registered users", href: "/admin/users", icon: Users, category: "Navigation" },
  { id: "newsletter", label: "Newsletter", description: "Subscriber management", href: "/admin/newsletter", icon: Mail, category: "Navigation" },

  // Site Experience
  { id: "hero-banners", label: "Hero Banners", description: "Manage homepage hero", href: "/admin/hero-banners", icon: ImageIcon, category: "Site Experience" },
  { id: "home-sections", label: "Home Sections", description: "Configure homepage sections", href: "/admin/home-sections", icon: Layout, category: "Site Experience" },
  { id: "media", label: "Media Library", description: "Images & documents", href: "/admin/media", icon: ImageIcon, category: "Site Experience" },

  // Master Data
  { id: "streams", label: "Streams", description: "Education streams", href: "/admin/streams", icon: Layers, category: "Master Data" },
  { id: "data-sources", label: "Data Sources", description: "Manage data sources", href: "/admin/data-sources", icon: Database, category: "Master Data" },

  // Platform
  { id: "admin-users", label: "Admin Users", description: "Manage admin accounts", href: "/admin/admins", icon: Shield, category: "Platform" },
  { id: "settings", label: "Settings", description: "Portal settings", href: "/admin/settings", icon: Settings, category: "Platform" },
  { id: "logs", label: "Activity Logs", description: "Audit trail", href: "/admin/logs", icon: Activity, category: "Platform" },
];

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return COMMANDS;
    const q = query.toLowerCase();
    return COMMANDS.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(q) ||
        cmd.description?.toLowerCase().includes(q) ||
        cmd.category.toLowerCase().includes(q) ||
        cmd.keywords?.some((k) => k.includes(q))
    );
  }, [query]);

  const groupedResults = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filtered.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [filtered]);

  const flatResults = useMemo(() => filtered, [filtered]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Scroll active item into view
  useEffect(() => {
    const activeEl = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    activeEl?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const handleSelect = useCallback(
    (item: CommandItem) => {
      router.push(item.href);
      onClose();
    },
    [router, onClose]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((prev) => Math.min(prev + 1, flatResults.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (flatResults[activeIndex]) handleSelect(flatResults[activeIndex]);
          break;
        case "Escape":
          onClose();
          break;
      }
    },
    [flatResults, activeIndex, handleSelect, onClose]
  );

  if (!open) return null;

  let currentIdx = 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[8vh] sm:pt-[15vh]" onClick={onClose}>
      <div className="absolute inset-0 command-backdrop" />
      <div
        className="relative w-full max-w-[580px] mx-4 bg-white rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: "0 25px 65px -5px rgba(0,0,0,0.25), 0 8px 20px -8px rgba(0,0,0,0.15)" }}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-5 border-b border-gray-100">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, actions, settings..."
            className="flex-1 h-14 bg-transparent text-[15px] text-gray-800 placeholder:text-gray-400 outline-none"
          />
          <kbd className="hidden sm:flex items-center gap-0.5 px-2 py-1 rounded-lg bg-gray-100 text-[11px] font-medium text-gray-400 border border-gray-200/50">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[400px] overflow-y-auto py-2 admin-sidebar-scroll">
          {flatResults.length === 0 ? (
            <div className="py-12 text-center">
              <Search className="w-8 h-8 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-500 font-medium">No results found</p>
              <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
            </div>
          ) : (
            Object.entries(groupedResults).map(([category, items]) => (
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
                      onClick={() => handleSelect(item)}
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
                        {item.description && (
                          <p className="text-xs text-gray-400 truncate mt-0.5">
                            {item.description}
                          </p>
                        )}
                      </div>
                      {idx === activeIndex && (
                        <ArrowRight className="w-4 h-4 text-blue-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
              <kbd className="inline-flex items-center justify-center w-5 h-5 rounded bg-gray-200/80 text-[10px] font-medium text-gray-500">
                &uarr;
              </kbd>
              <kbd className="inline-flex items-center justify-center w-5 h-5 rounded bg-gray-200/80 text-[10px] font-medium text-gray-500">
                &darr;
              </kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
              <kbd className="inline-flex items-center justify-center h-5 px-1.5 rounded bg-gray-200/80 text-[10px] font-medium text-gray-500">
                Enter
              </kbd>
              Select
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <Zap className="w-3 h-3" />
            <span>{flatResults.length} results</span>
          </div>
        </div>
      </div>
    </div>
  );
}
