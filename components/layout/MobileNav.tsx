"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, GraduationCap, FileText, BookOpen, Globe, Newspaper } from "lucide-react";
import { cn } from "../../lib/utils";

const mobileNavSections = [
  {
    label: "Colleges",
    icon: GraduationCap,
    color: "text-primary-600",
    links: [
      { label: "Engineering Colleges", href: "/colleges?stream=Engineering" },
      { label: "Medical Colleges", href: "/colleges?stream=Medical" },
      { label: "Management Colleges", href: "/colleges?stream=Management" },
      { label: "Law Colleges", href: "/colleges?stream=Law" },
      { label: "All Colleges", href: "/colleges" },
    ],
  },
  {
    label: "Exams",
    icon: FileText,
    color: "text-orange-500",
    links: [
      { label: "JEE Main 2026", href: "/exams/jee-main" },
      { label: "NEET UG 2026", href: "/exams/neet-ug" },
      { label: "CAT 2025", href: "/exams/cat" },
      { label: "GATE 2026", href: "/exams/gate" },
      { label: "CLAT 2025", href: "/exams/clat" },
      { label: "All Exams", href: "/exams" },
    ],
  },
  {
    label: "Courses",
    icon: BookOpen,
    color: "text-green-600",
    links: [
      { label: "B.Tech", href: "/courses" },
      { label: "MBA", href: "/courses" },
      { label: "MBBS", href: "/courses" },
      { label: "LLB", href: "/courses" },
      { label: "All Courses", href: "/courses" },
    ],
  },
  {
    label: "Study Abroad",
    icon: Globe,
    color: "text-purple-600",
    links: [
      { label: "Study in USA", href: "/study-abroad" },
      { label: "Study in UK", href: "/study-abroad" },
      { label: "Study in Canada", href: "/study-abroad" },
      { label: "All Countries", href: "/study-abroad" },
    ],
  },
  {
    label: "News",
    icon: Newspaper,
    color: "text-blue-600",
    links: [
      { label: "Exam News", href: "/news?category=Exams" },
      { label: "Admissions", href: "/news?category=Admissions" },
      { label: "Rankings", href: "/news?category=Rankings" },
      { label: "All News", href: "/news" },
    ],
  },
];

interface MobileNavSectionProps {
  section: typeof mobileNavSections[0];
  onClose: () => void;
}

function MobileNavSection({ section, onClose }: MobileNavSectionProps) {
  const [open, setOpen] = useState(false);
  const Icon = section.icon;

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button suppressHydrationWarning
        className="flex items-center justify-between w-full px-4 py-3 text-left"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          <Icon className={cn("h-4 w-4", section.color)} />
          <span className="font-medium text-gray-800">{section.label}</span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-gray-400 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <div className="pb-2 pl-11 pr-4 space-y-0.5">
          {section.links.map((link) => (
            <Link
              key={link.href + link.label}
              href={link.href}
              className="block py-2 text-sm text-gray-600 hover:text-primary-600 transition-colors"
              onClick={onClose}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

interface MobileNavProps {
  onClose: () => void;
}

export function MobileNav({ onClose }: MobileNavProps) {
  return (
    <div className="bg-white">
      {mobileNavSections.map((section) => (
        <MobileNavSection key={section.label} section={section} onClose={onClose} />
      ))}
    </div>
  );
}
