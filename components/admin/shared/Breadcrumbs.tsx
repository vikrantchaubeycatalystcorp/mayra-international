"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const LABEL_MAP: Record<string, string> = {
  admin: "Admin",
  dashboard: "Dashboard",
  colleges: "Colleges",
  courses: "Courses",
  exams: "Exams",
  news: "News & Articles",
  "study-abroad": "Study Abroad",
  enquiries: "Enquiries",
  users: "Users",
  newsletter: "Newsletter",
  admins: "Admin Users",
  settings: "Settings",
  logs: "Activity Logs",
  analytics: "Analytics",
  streams: "Streams",
  states: "States & Cities",
  accreditations: "Accreditations",
  tags: "Tags",
  "news-categories": "News Categories",
  "college-types": "College Types",
  "course-levels": "Course Levels",
  "exam-modes": "Exam Modes",
  "lead-options": "Lead Options",
  "data-sources": "Data Sources",
  "company-info": "Company Info",
  "navigation-items": "Navigation",
  "hero-banners": "Hero Banners",
  "home-stats": "Home Stats",
  "home-sections": "Home Sections",
  "footer-sections": "Footer",
  "social-links": "Social Links",
  "cta-sections": "CTA Sections",
  announcements: "Announcements",
  media: "Media Library",
  "page-seo": "Page SEO",
  "world-college-stats": "World Stats",
  "legal-links": "Legal Links",
  "trust-badges": "Trust Badges",
  new: "Create New",
  edit: "Edit",
  "master-data": "Master Data",
  "site-experience": "Site Experience",
  "seo-discoverability": "SEO & Discoverability",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // Skip rendering for dashboard home
  if (segments.length <= 2 && segments[1] === "dashboard") return null;

  const crumbs = segments
    .filter((s) => s !== "(dashboard)")
    .map((segment, index, arr) => {
      const href = "/" + segments.slice(0, segments.indexOf(segment) + 1).join("/");
      const isLast = index === arr.length - 1;
      const isId = /^[a-z0-9]{20,}$/i.test(segment) || /^cm/.test(segment);
      const label = isId ? "Details" : LABEL_MAP[segment] || segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

      return { href, label, isLast, segment };
    })
    .filter((c) => c.segment !== "admin"); // Remove "admin" from breadcrumb path

  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs">
      <Link
        href="/admin/dashboard"
        className="flex items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>
      {crumbs.map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-1">
          <ChevronRight className="w-3 h-3 text-gray-300" />
          {crumb.isLast ? (
            <span className="font-medium text-gray-700 truncate max-w-[200px]">
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="text-gray-400 hover:text-gray-600 transition-colors truncate max-w-[150px]"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
