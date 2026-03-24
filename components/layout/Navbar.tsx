"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Bell,
  ChevronDown,
  GraduationCap,
  BookOpen,
  FileText,
  Globe,
  Newspaper,
  Menu,
  X,
  Award,
  Briefcase,
} from "lucide-react";
import { Button } from "../ui/button";
import { CommandSearch } from "../search/CommandSearch";

const navItems = [
  {
    label: "Colleges",
    href: "/colleges",
    mega: {
      sections: [
        {
          title: "By Stream",
          items: [
            { label: "Engineering Colleges", href: "/colleges?stream=Engineering", icon: "⚙️", desc: "4500+ colleges" },
            { label: "Medical Colleges", href: "/colleges?stream=Medical", icon: "🏥", desc: "706 MBBS colleges" },
            { label: "Management", href: "/colleges?stream=Management", icon: "💼", desc: "Top MBA colleges" },
            { label: "Law Colleges", href: "/colleges?stream=Law", icon: "⚖️", desc: "NLUs & more" },
            { label: "Arts & Sciences", href: "/colleges?stream=Arts", icon: "📚", desc: "Liberal arts colleges" },
          ],
        },
        {
          title: "By Type",
          items: [
            { label: "IITs", href: "/colleges?name=iit", icon: "🏛️", desc: "23 IITs across India" },
            { label: "IIMs", href: "/colleges?name=iim", icon: "📊", desc: "Top B-Schools" },
            { label: "NITs", href: "/colleges?type=Government", icon: "🔬", desc: "31 NITs" },
            { label: "Government Colleges", href: "/colleges?type=Government", icon: "🏛️", desc: "Affordable quality" },
            { label: "Private Universities", href: "/colleges?type=Private", icon: "🎓", desc: "Premium private" },
          ],
        },
      ],
      featured: {
        title: "Top Ranked",
        items: ["IIT Madras", "IIT Delhi", "IIM Ahmedabad", "AIIMS Delhi"],
      },
    },
  },
  {
    label: "Exams",
    href: "/exams",
    mega: {
      sections: [
        {
          title: "Engineering Exams",
          items: [
            { label: "JEE Main 2026", href: "/exams/jee-main", icon: "📐", desc: "Jan & Apr sessions" },
            { label: "JEE Advanced 2026", href: "/exams/jee-advanced", icon: "🏆", desc: "IIT gateway" },
            { label: "GATE 2026", href: "/exams/gate", icon: "⚙️", desc: "M.Tech + PSU jobs" },
            { label: "BITSAT", href: "/exams", icon: "🔧", desc: "BITS Pilani entrance" },
          ],
        },
        {
          title: "Medical & Management",
          items: [
            { label: "NEET UG 2026", href: "/exams/neet-ug", icon: "🩺", desc: "MBBS entrance" },
            { label: "NEET PG", href: "/exams/neet-pg", icon: "🏥", desc: "MD/MS entrance" },
            { label: "CAT 2025", href: "/exams/cat", icon: "📈", desc: "IIM admissions" },
            { label: "CLAT 2025", href: "/exams/clat", icon: "⚖️", desc: "NLU admissions" },
          ],
        },
      ],
      featured: {
        title: "Upcoming Exams",
        items: ["CUET UG 2026", "XAT 2026", "SNAP 2025", "MAT Dec 2025"],
      },
    },
  },
  {
    label: "Courses",
    href: "/courses",
    mega: {
      sections: [
        {
          title: "UG Programs",
          items: [
            { label: "B.Tech / B.E.", href: "/courses", icon: "⚙️", desc: "4 year engineering" },
            { label: "MBBS / BDS", href: "/courses", icon: "🏥", desc: "Medical degrees" },
            { label: "B.Com / BBA", href: "/courses", icon: "📊", desc: "Commerce programs" },
            { label: "B.Sc", href: "/courses", icon: "🔬", desc: "Science programs" },
            { label: "LLB / BA LLB", href: "/courses", icon: "⚖️", desc: "Law degrees" },
          ],
        },
        {
          title: "PG Programs",
          items: [
            { label: "MBA / PGDM", href: "/courses", icon: "💼", desc: "Management" },
            { label: "M.Tech / ME", href: "/courses", icon: "🔧", desc: "Engineering PG" },
            { label: "MCA", href: "/courses", icon: "💻", desc: "Computer applications" },
            { label: "M.Sc", href: "/courses", icon: "⚗️", desc: "Science PG" },
          ],
        },
      ],
    },
  },
  {
    label: "News",
    href: "/news",
    simple: true,
  },
  {
    label: "Study Abroad",
    href: "/study-abroad",
    simple: true,
  },
  {
    label: "World Map",
    href: "/map",
    simple: true,
  },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMenuEnter = (label: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(label);
  };

  const handleMenuLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveMenu(null), 150);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
            : "bg-white"
        }`}
      >
        <div className="container mx-auto">
          <div className="flex items-center justify-between h-16 lg:h-[68px]">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <Image
                src="/images/mayra-logo.png"
                alt="Mayra logo"
                width={260}
                height={78}
                className="h-16 w-auto"
                priority
              />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1" ref={menuRef}>
              {navItems.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => handleMenuEnter(item.label)}
                  onMouseLeave={handleMenuLeave}
                >
                  <Link
                    href={item.href}
                    className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeMenu === item.label
                        ? "text-primary-600 bg-primary-50"
                        : "text-gray-600 hover:text-primary-600 hover:bg-gray-50"
                    }`}
                  >
                    {item.label}
                    {!item.simple && (
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform ${
                          activeMenu === item.label ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </Link>

                  {/* Mega Menu */}
                  {!item.simple && item.mega && activeMenu === item.label && (
                    <div
                      className="absolute top-full left-0 mt-1 w-[560px] bg-white rounded-2xl shadow-xl border border-gray-100 p-5 animate-slide-down z-50"
                      onMouseEnter={() => handleMenuEnter(item.label)}
                      onMouseLeave={handleMenuLeave}
                    >
                      <div className="grid grid-cols-2 gap-5">
                        {item.mega.sections.map((section) => (
                          <div key={section.title}>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                              {section.title}
                            </p>
                            <ul className="space-y-1">
                              {section.items.map((subItem) => (
                                <li key={subItem.label}>
                                  <Link
                                    href={subItem.href}
                                    className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-blue-50 group transition-colors"
                                    onClick={() => setActiveMenu(null)}
                                  >
                                    <span className="text-lg leading-none mt-0.5">
                                      {subItem.icon}
                                    </span>
                                    <div>
                                      <p className="text-sm font-medium text-gray-800 group-hover:text-primary-600 transition-colors">
                                        {subItem.label}
                                      </p>
                                      <p className="text-xs text-gray-400">
                                        {subItem.desc}
                                      </p>
                                    </div>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>

                      {item.mega.featured && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            {item.mega.featured.title}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {item.mega.featured.items.map((name) => (
                              <span
                                key={name}
                                className="px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium border border-primary-100"
                              >
                                {name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Extra Links */}
              <Link
                href="/compare"
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Award className="h-3.5 w-3.5" />
                Compare
              </Link>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <button suppressHydrationWarning
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-400 hover:border-primary-300 hover:text-primary-600 transition-colors hidden md:flex"
              >
                <Search className="h-4 w-4" />
                <span className="hidden xl:block">Search...</span>
                <kbd className="hidden xl:block ml-2 px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono text-gray-500">
                  ⌘K
                </kbd>
              </button>

              <button suppressHydrationWarning
                onClick={() => setSearchOpen(true)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Notification */}
              <button suppressHydrationWarning className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-accent-500 rounded-full" />
              </button>

              {/* Auth Buttons */}
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button variant="gradient" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>

              {/* Mobile Menu Toggle */}
              <button suppressHydrationWarning
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
              >
                {mobileOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white">
            <div className="container mx-auto py-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label === "Colleges" && <GraduationCap className="h-4 w-4 text-primary-600" />}
                  {item.label === "Exams" && <FileText className="h-4 w-4 text-orange-500" />}
                  {item.label === "Courses" && <BookOpen className="h-4 w-4 text-green-600" />}
                  {item.label === "News" && <Newspaper className="h-4 w-4 text-blue-500" />}
                  {item.label === "Study Abroad" && <Globe className="h-4 w-4 text-purple-500" />}
                  {item.label === "World Map" && <Globe className="h-4 w-4 text-blue-500" />}
                  {item.label}
                </Link>
              ))}
              <Link
                href="/compare"
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                <Award className="h-4 w-4 text-amber-500" />
                Compare Colleges
              </Link>
              <Link
                href="/resume-builder"
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                <Briefcase className="h-4 w-4 text-red-500" />
                Resume Builder
              </Link>
              <div className="pt-3 flex gap-2 px-4">
                <Link href="/sign-in" className="flex-1">
                  <Button variant="outline" className="w-full">Sign In</Button>
                </Link>
                <Link href="/sign-up" className="flex-1">
                  <Button variant="gradient" className="w-full">Sign Up</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Command Search */}
      <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
