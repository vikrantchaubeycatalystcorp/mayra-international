"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/hooks/admin/useAdminAuth";
import { useState, useMemo } from "react";
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  FileText,
  Newspaper,
  Globe,
  Globe2,
  Users,
  MessageSquare,
  Mail,
  Shield,
  Settings,
  Activity,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Building,
  Building2,
  Navigation,
  Image,
  TrendingUp,
  Layout,
  PanelBottom,
  Share2,
  MousePointerClick,
  Search,
  Megaphone,
  ImageIcon,
  MapPin,
  Scale,
  BadgeCheck,
  Layers,
  Tag,
  FolderOpen,
  Monitor,
  ClipboardList,
  Database,
  ShieldCheck,
  Sparkles,
  LogOut,
  HelpCircle,
} from "lucide-react";

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const NAV_SECTIONS: {
  label: string;
  icon: React.ElementType;
  items: { href: string; label: string; icon: React.ElementType; roles?: string[]; badge?: string }[];
}[] = [
  {
    label: "Main",
    icon: LayoutDashboard,
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Content",
    icon: BookOpen,
    items: [
      { href: "/admin/colleges", label: "Colleges", icon: GraduationCap },
      { href: "/admin/courses", label: "Courses", icon: BookOpen },
      { href: "/admin/exams", label: "Exams", icon: FileText },
      { href: "/admin/news", label: "News & Articles", icon: Newspaper },
      { href: "/admin/study-abroad", label: "Study Abroad", icon: Globe },
    ],
  },
  {
    label: "Master Data",
    icon: Database,
    items: [
      { href: "/admin/streams", label: "Streams", icon: Layers, roles: ["SUPER_ADMIN", "ADMIN"] },
      { href: "/admin/states", label: "States & Cities", icon: MapPin, roles: ["SUPER_ADMIN", "ADMIN"] },
      { href: "/admin/accreditations", label: "Accreditations", icon: BadgeCheck, roles: ["SUPER_ADMIN", "ADMIN"] },
      { href: "/admin/tags", label: "Tags", icon: Tag, roles: ["SUPER_ADMIN", "ADMIN"] },
      { href: "/admin/news-categories", label: "News Categories", icon: FolderOpen, roles: ["SUPER_ADMIN", "ADMIN"] },
      { href: "/admin/college-types", label: "College Types", icon: Building, roles: ["SUPER_ADMIN", "ADMIN"] },
      { href: "/admin/course-levels", label: "Course Levels", icon: GraduationCap, roles: ["SUPER_ADMIN", "ADMIN"] },
      { href: "/admin/exam-modes", label: "Exam Modes", icon: Monitor, roles: ["SUPER_ADMIN", "ADMIN"] },
      { href: "/admin/lead-options", label: "Lead Options", icon: ClipboardList, roles: ["SUPER_ADMIN", "ADMIN"] },
      { href: "/admin/data-sources", label: "Data Sources", icon: Database, roles: ["SUPER_ADMIN", "ADMIN"] },
    ],
  },
  {
    label: "Site Experience",
    icon: Layout,
    items: [
      { href: "/admin/company-info", label: "Company Info", icon: Building2, roles: ["SUPER_ADMIN", "ADMIN"] },
      { href: "/admin/navigation-items", label: "Navigation", icon: Navigation, roles: ["SUPER_ADMIN", "ADMIN"] },
      { href: "/admin/hero-banners", label: "Hero Banners", icon: Image, roles: ["SUPER_ADMIN", "ADMIN"] },
      { href: "/admin/home-stats", label: "Home Stats", icon: TrendingUp, roles: ["SUPER_ADMIN", "ADMIN"] },
      { href: "/admin/home-sections", label: "Home Sections", icon: Layout, roles: ["SUPER_ADMIN", "ADMIN"] },
      { href: "/admin/footer-sections", label: "Footer", icon: PanelBottom, roles: ["SUPER_ADMIN", "ADMIN"] },
      { href: "/admin/social-links", label: "Social Links", icon: Share2, roles: ["SUPER_ADMIN", "ADMIN"] },
      { href: "/admin/cta-sections", label: "CTA Sections", icon: MousePointerClick, roles: ["SUPER_ADMIN", "ADMIN"] },
      { href: "/admin/announcements", label: "Announcements", icon: Megaphone, roles: ["SUPER_ADMIN", "ADMIN"] },
      { href: "/admin/media", label: "Media Library", icon: ImageIcon, roles: ["SUPER_ADMIN", "ADMIN"] },
    ],
  },
  {
    label: "SEO",
    icon: Search,
    items: [
      { href: "/admin/page-seo", label: "Page SEO", icon: Search, roles: ["SUPER_ADMIN", "ADMIN"] },
      { href: "/admin/world-college-stats", label: "World Stats", icon: Globe2, roles: ["SUPER_ADMIN", "ADMIN"] },
      { href: "/admin/legal-links", label: "Legal Links", icon: Scale, roles: ["SUPER_ADMIN", "ADMIN"] },
      { href: "/admin/trust-badges", label: "Trust Badges", icon: ShieldCheck, roles: ["SUPER_ADMIN", "ADMIN"] },
    ],
  },
  {
    label: "Leads",
    icon: MessageSquare,
    items: [
      { href: "/admin/leads", label: "Leads", icon: ClipboardList },
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
    ],
  },
  {
    label: "Platform",
    icon: Settings,
    items: [
      { href: "/admin/setup", label: "Email Setup", icon: Mail, roles: ["SUPER_ADMIN", "ADMIN"] },
      { href: "/admin/admins", label: "Admin Users", icon: Shield, roles: ["SUPER_ADMIN"] },
      { href: "/admin/settings", label: "Settings", icon: Settings, roles: ["SUPER_ADMIN", "ADMIN"] },
      { href: "/admin/logs", label: "Activity Logs", icon: Activity, roles: ["SUPER_ADMIN", "ADMIN"] },
    ],
  },
];

export function AdminSidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { admin } = useAdminAuth();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    NAV_SECTIONS.forEach((s) => { initial[s.label] = true; });
    return initial;
  });
  const [sidebarSearch, setSidebarSearch] = useState("");

  const toggleSection = (label: string) => {
    setExpandedSections((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const filteredSections = useMemo(() => {
    if (!sidebarSearch.trim()) return NAV_SECTIONS;
    const q = sidebarSearch.toLowerCase();
    return NAV_SECTIONS.map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        item.label.toLowerCase().includes(q) || section.label.toLowerCase().includes(q)
      ),
    })).filter((section) => section.items.length > 0);
  }, [sidebarSearch]);

  const getInitials = (name: string) =>
    name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full flex flex-col transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          "bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white",
          collapsed && !mobileOpen ? "w-[72px]" : "w-[270px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo Area */}
        <div className="flex items-center justify-between h-[65px] px-4 border-b border-white/[0.06]">
          {!collapsed ? (
            <Link href="/admin/dashboard" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-shadow">
                <span className="text-sm font-bold text-white">M</span>
              </div>
              <div>
                <p className="text-[13px] font-bold leading-none tracking-tight">Mayra International</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                  <p className="text-[10px] text-slate-400 font-medium">Admin Portal</p>
                </div>
              </div>
            </Link>
          ) : (
            <Link href="/admin/dashboard" className="mx-auto">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-shadow">
                <span className="text-sm font-bold text-white">M</span>
              </div>
            </Link>
          )}
          <button
            onClick={onMobileClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Search */}
        {!collapsed && (
          <div className="px-3 pt-4 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                placeholder="Search menu..."
                className="w-full h-8 pl-8.5 pr-3 rounded-lg bg-white/[0.06] border border-white/[0.06] text-xs text-slate-300 placeholder:text-slate-500 focus:outline-none focus:bg-white/[0.08] focus:border-white/[0.12] transition-all"
                style={{ paddingLeft: '2rem' }}
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2.5 admin-sidebar-scroll">
          <div className="space-y-1">
            {filteredSections.map((section) => {
              const filteredItems = section.items.filter((item) => {
                if (!item.roles) return true;
                return admin?.role && item.roles.includes(admin.role);
              });
              if (filteredItems.length === 0) return null;

              const isSectionActive = filteredItems.some(
                (item) =>
                  pathname === item.href ||
                  (item.href !== "/admin/dashboard" && pathname.startsWith(item.href))
              );
              const isExpanded = expandedSections[section.label] ?? true;

              return (
                <div key={section.label} className="mb-1">
                  {/* Section Header */}
                  {!collapsed ? (
                    <button
                      onClick={() => toggleSection(section.label)}
                      className={cn(
                        "w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors",
                        isSectionActive
                          ? "text-slate-300"
                          : "text-slate-500 hover:text-slate-400"
                      )}
                    >
                      <span>{section.label}</span>
                      <ChevronDown
                        className={cn(
                          "w-3 h-3 transition-transform duration-200",
                          isExpanded ? "rotate-0" : "-rotate-90"
                        )}
                      />
                    </button>
                  ) : (
                    <div className="flex justify-center py-2">
                      <div className="w-5 h-px bg-slate-700/50" />
                    </div>
                  )}

                  {/* Section Items */}
                  {(collapsed || isExpanded) && (
                    <div className={cn("space-y-0.5", !collapsed && "mt-0.5")}>
                      {filteredItems.map((item) => {
                        const isActive =
                          pathname === item.href ||
                          (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={onMobileClose}
                            className={cn(
                              "group relative flex items-center gap-2.5 rounded-xl px-2.5 py-[9px] text-[13px] font-medium transition-all duration-200",
                              isActive
                                ? "bg-white/[0.1] text-white shadow-sm"
                                : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200",
                              collapsed && "justify-center px-2",
                              collapsed && "admin-tooltip"
                            )}
                            data-tooltip={collapsed ? item.label : undefined}
                          >
                            {/* Active indicator bar */}
                            {isActive && (
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-blue-400 to-indigo-500" />
                            )}

                            <item.icon
                              className={cn(
                                "shrink-0 transition-colors duration-200",
                                collapsed ? "w-[20px] h-[20px]" : "w-[16px] h-[16px]",
                                isActive
                                  ? "text-blue-400"
                                  : "text-slate-500 group-hover:text-slate-300"
                              )}
                            />
                            {!collapsed && (
                              <>
                                <span className="flex-1 truncate">{item.label}</span>
                                {item.badge && (
                                  <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-blue-500/20 px-1.5 text-[9px] font-bold text-blue-400 uppercase">
                                    {item.badge}
                                  </span>
                                )}
                              </>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-white/[0.06]">
          {/* Help Link */}
          {!collapsed && (
            <div className="px-3 pt-3 pb-1">
              <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-gradient-to-r from-blue-500/[0.08] to-indigo-500/[0.05] border border-white/[0.04]">
                <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-slate-200 truncate">Pro Tip</p>
                  <p className="text-[10px] text-slate-500 truncate">Press Ctrl+K for quick search</p>
                </div>
              </div>
            </div>
          )}

          {/* User Profile Section */}
          <div className={cn("p-3", collapsed && "px-2")}>
            {!collapsed ? (
              <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/[0.05] transition-colors cursor-default">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[11px] font-bold text-white shadow-sm">
                  {admin ? getInitials(admin.name) : "A"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-slate-200 truncate">
                    {admin?.name || "Admin"}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {admin?.role?.replace("_", " ") || "Admin"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[11px] font-bold text-white shadow-sm admin-tooltip" data-tooltip={admin?.name || "Admin"}>
                  {admin ? getInitials(admin.name) : "A"}
                </div>
              </div>
            )}
          </div>

          {/* Collapse Toggle - Desktop only */}
          <div className="hidden lg:block px-3 pb-3">
            <button
              onClick={onToggle}
              className={cn(
                "w-full flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-500 hover:bg-white/[0.05] hover:text-slate-300 transition-all",
                collapsed && "px-2"
              )}
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4" />
                  <span>Collapse</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
