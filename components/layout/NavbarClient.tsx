"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
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
  Cpu,
  Stethoscope,
  Scale,
  BarChart3,
  FlaskConical,
  Building2,
  Landmark,
  Calculator,
  Trophy,
  Wrench,
  TrendingUp,
  Monitor,
  Settings,
  Heart,
  ArrowRight,
  Phone,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { CommandSearch } from "../search/CommandSearch";
import { cn } from "../../lib/utils";

const iconMap: Record<string, LucideIcon> = {
  GraduationCap, BookOpen, FileText, Globe, Newspaper, Award, Briefcase,
  Cpu, Stethoscope, Scale, BarChart3, FlaskConical, Building2, Landmark,
  Calculator, Trophy, Wrench, TrendingUp, Monitor, Settings, Heart, Search,
  Menu, X,
};

function getIcon(name?: string | null): LucideIcon | null {
  if (!name) return null;
  return iconMap[name] || null;
}

type NavItemFromDB = {
  id: string;
  label: string;
  href: string;
  icon: string | null;
  description: string | null;
  isMega: boolean;
  megaGroupTitle: string | null;
  featuredTitle: string | null;
  featuredItems: string[];
  children: {
    id: string;
    label: string;
    href: string;
    icon: string | null;
    description: string | null;
    megaGroupTitle: string | null;
    children: {
      id: string;
      label: string;
      href: string;
      icon: string | null;
      description: string | null;
    }[];
  }[];
};

type Props = {
  navItems: NavItemFromDB[];
  logo: string;
  siteName: string;
};

export function NavbarClient({ navItems, logo, siteName }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const logoSrc = logo === "/images/mayra-logo.png" ? "/images/mayra-logo-clean.png" : logo;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMenuEnter = (label: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(label);
  };

  const handleMenuLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveMenu(null), 200);
  };

  function getMegaSections(children: NavItemFromDB["children"]) {
    const groups: Map<string, NavItemFromDB["children"]> = new Map();
    for (const child of children) {
      const group = child.megaGroupTitle || "Links";
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group)!.push(child);
    }
    return Array.from(groups.entries());
  }

  return (
    <>
      {/* Main Navbar */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-500",
          scrolled
            ? "navbar-scrolled backdrop-blur-2xl shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.06)]"
            : "navbar-top"
        )}
      >
        {/* Top accent gradient line */}
        <div className={cn(
          "h-[2px] bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-600 transition-opacity duration-500",
          scrolled ? "opacity-100" : "opacity-0"
        )} />
        <div className="container mx-auto">
          <div className="flex items-center justify-between h-[76px]">
            {/* Logo — Premium Animated */}
            <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
              {!logoError ? (
                <span className="navbar-logo-reveal relative inline-flex items-center overflow-hidden">
                  <Image
                    src={logoSrc}
                    alt={siteName}
                    width={420}
                    height={126}
                    className="h-[60px] w-auto mix-blend-multiply"
                    style={{ minHeight: "60px" }}
                    priority
                    onError={() => setLogoError(true)}
                  />
                  <span className="navbar-logo-shimmer" />
                </span>
              ) : (
                <div className="flex flex-col">
                  <span className="flex items-baseline overflow-hidden">
                    {"MAYRA".split("").map((letter, i) => (
                      <span
                        key={i}
                        className="navbar-letter inline-block text-[26px] font-black tracking-tight cursor-default"
                        style={{
                          animationDelay: `${0.3 + i * 0.08}s`,
                          background: "linear-gradient(135deg, #312e81 0%, #4f46e5 40%, #6366f1 60%, #818cf8 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }}
                      >
                        {letter}
                      </span>
                    ))}
                  </span>
                  <span className="navbar-tagline text-[9px] text-indigo-400 font-bold uppercase tracking-[0.3em] -mt-1 ml-px">
                    International
                  </span>
                </div>
              )}
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center" ref={menuRef}>
              {navItems.map((item) => {
                const hasChildren = item.children.length > 0;
                const isActive = activeMenu === item.label;
                const ItemIcon = getIcon(item.icon);

                return (
                  <div
                    key={item.id}
                    className="relative"
                    onMouseEnter={() => handleMenuEnter(item.label)}
                    onMouseLeave={handleMenuLeave}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "relative flex items-center gap-1.5 px-3.5 py-2.5 text-[13px] font-semibold rounded-xl transition-all duration-250 mx-0.5",
                        isActive
                          ? "text-indigo-700 bg-gradient-to-b from-indigo-50/90 to-indigo-100/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_1px_2px_rgba(99,102,241,0.1)]"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/60"
                      )}
                    >
                      {ItemIcon && <ItemIcon className={cn("h-3.5 w-3.5 transition-colors", isActive ? "text-indigo-500" : "text-gray-400 group-hover:text-gray-500")} />}
                      {item.label}
                      {hasChildren && (
                        <ChevronDown
                          className={cn(
                            "h-3 w-3 transition-transform duration-300 ml-0.5",
                            isActive ? "rotate-180 text-indigo-400" : "text-gray-400"
                          )}
                        />
                      )}
                      {/* Active indicator line */}
                      {isActive && (
                        <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-[3px] w-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
                      )}
                    </Link>

                    {/* Mega Menu — Premium */}
                    {hasChildren && item.isMega && isActive && (
                      <div
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[620px] bg-white rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] border border-gray-200/60 overflow-hidden animate-fade-in-down z-50"
                        onMouseEnter={() => handleMenuEnter(item.label)}
                        onMouseLeave={handleMenuLeave}
                      >
                        {/* Mega menu top accent */}
                        <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
                        <div className="p-6">
                          <div className="grid grid-cols-2 gap-6">
                            {getMegaSections(item.children).map(([title, items]) => (
                              <div key={title}>
                                <p className="text-[10px] font-bold text-indigo-500/70 uppercase tracking-[0.2em] mb-3 flex items-center gap-1.5">
                                  <span className="h-px w-3 bg-indigo-300" />
                                  {title}
                                </p>
                                <ul className="space-y-0.5">
                                  {items.map((subItem) => {
                                    const Icon = getIcon(subItem.icon);
                                    return (
                                      <li key={subItem.id}>
                                        <Link
                                          href={subItem.href}
                                          className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-indigo-50/80 hover:to-purple-50/40 group transition-all duration-200"
                                          onClick={() => setActiveMenu(null)}
                                        >
                                          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200/60 flex items-center justify-center flex-shrink-0 group-hover:from-indigo-50 group-hover:to-purple-50 group-hover:border-indigo-200/60 transition-all duration-200 shadow-sm">
                                            {Icon ? (
                                              <Icon className="h-4 w-4 text-gray-500 group-hover:text-indigo-600 transition-colors" />
                                            ) : (
                                              <BookOpen className="h-4 w-4 text-gray-500 group-hover:text-indigo-600 transition-colors" />
                                            )}
                                          </div>
                                          <div className="pt-0.5">
                                            <p className="text-sm font-semibold text-gray-800 group-hover:text-indigo-700 transition-colors">
                                              {subItem.label}
                                            </p>
                                            {subItem.description && (
                                              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                                                {subItem.description}
                                              </p>
                                            )}
                                          </div>
                                        </Link>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            ))}
                          </div>

                          {item.featuredTitle && item.featuredItems.length > 0 && (
                            <div className="mt-5 pt-5 border-t border-gray-100">
                              <div className="flex items-center justify-between mb-3">
                                <p className="text-[10px] font-bold text-indigo-500/70 uppercase tracking-[0.2em] flex items-center gap-1.5">
                                  <Sparkles className="h-3 w-3" />
                                  {item.featuredTitle}
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {item.featuredItems.map((name) => (
                                  <span
                                    key={name}
                                    className="px-3 py-1.5 rounded-lg bg-gray-50 text-gray-600 text-xs font-medium border border-gray-200/60 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-all cursor-pointer"
                                  >
                                    {name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Mega menu bottom CTA */}
                        <div className="bg-gradient-to-r from-indigo-50/80 to-purple-50/50 px-6 py-3.5 flex items-center justify-between border-t border-indigo-100/50">
                          <p className="text-xs text-gray-500">
                            Can&apos;t find what you&apos;re looking for?
                          </p>
                          <Link
                            href={item.href}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
                            onClick={() => setActiveMenu(null)}
                          >
                            View All
                            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* Simple Dropdown — Premium */}
                    {hasChildren && !item.isMega && isActive && (
                      <div
                        className="absolute top-full left-0 mt-3 w-60 bg-white rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] border border-gray-200/60 overflow-hidden z-50 animate-fade-in-down"
                        onMouseEnter={() => handleMenuEnter(item.label)}
                        onMouseLeave={handleMenuLeave}
                      >
                        <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
                        <div className="p-2">
                          {item.children.map((child) => {
                            const ChildIcon = getIcon(child.icon);
                            return (
                              <Link
                                key={child.id}
                                href={child.href}
                                className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 hover:bg-indigo-50/50 hover:text-indigo-700 rounded-xl transition-all duration-200 group"
                                onClick={() => setActiveMenu(null)}
                              >
                                {ChildIcon && (
                                  <ChildIcon className="h-3.5 w-3.5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                                )}
                                <span className="font-medium">{child.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Search Button */}
              <button
                suppressHydrationWarning
                onClick={() => setSearchOpen(true)}
                className="hidden md:flex items-center gap-2.5 px-4 py-2 rounded-full bg-gray-50/80 border border-gray-200/60 text-gray-400 text-sm transition-all duration-300 group hover:border-indigo-200 hover:bg-white hover:shadow-[0_2px_8px_rgba(99,102,241,0.08)] hover:text-indigo-600"
              >
                <Search className="h-3.5 w-3.5 transition-transform duration-200 group-hover:scale-110" />
                <span className="hidden xl:block text-[13px]">Search...</span>
                <kbd className="hidden xl:flex items-center ml-1.5 px-1.5 py-0.5 rounded-md bg-white/80 border border-gray-200/60 text-[10px] font-mono text-gray-400">
                  ⌘K
                </kbd>
              </button>

              {/* Mobile Search */}
              <button
                suppressHydrationWarning
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="md:hidden h-9 w-9 rounded-full flex items-center justify-center bg-gray-50/80 border border-gray-200/60 text-gray-500 hover:bg-white hover:border-indigo-200 hover:text-indigo-600 hover:shadow-[0_2px_8px_rgba(99,102,241,0.08)] transition-all duration-300"
              >
                <Search className="h-4 w-4" />
              </button>

              {/* Contact Us CTA — Desktop */}
              <Link
                href="/contact"
                className="hidden lg:flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 text-white text-[13px] font-semibold shadow-[0_2px_8px_rgba(99,102,241,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_4px_16px_rgba(99,102,241,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] hover:brightness-110 transition-all duration-300 active:scale-[0.97]"
              >
                <Phone className="h-3.5 w-3.5" />
                Contact Us
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                suppressHydrationWarning
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                className="lg:hidden h-9 w-9 rounded-full flex items-center justify-center bg-gray-50/80 border border-gray-200/60 text-gray-600 hover:bg-white hover:border-indigo-200 hover:text-indigo-600 transition-all duration-300"
              >
                {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu — Premium Slide Down */}
        <div
          className={cn(
            "lg:hidden overflow-hidden transition-all duration-500 ease-out-expo",
            mobileOpen ? "max-h-[85vh] opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="bg-white border-t border-gray-100">
            <div className="container mx-auto py-3">
              {/* Mobile Search */}
              <button
                suppressHydrationWarning
                onClick={() => { setSearchOpen(true); setMobileOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-gray-50 border border-gray-200/80 text-gray-400 text-sm"
              >
                <Search className="h-4 w-4" />
                Search colleges, exams, courses...
              </button>

              {/* Nav Items */}
              <div className="space-y-0.5">
                {navItems.map((item) => {
                  const Icon = getIcon(item.icon);
                  const hasChildren = item.children.length > 0;
                  const isExpanded = mobileExpanded === item.label;

                  return (
                    <div key={item.id}>
                      <div className="flex items-center">
                        <Link
                          href={item.href}
                          className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-all duration-200 group"
                          onClick={() => setMobileOpen(false)}
                        >
                          {Icon ? (
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100/50 flex items-center justify-center group-hover:from-indigo-100 group-hover:to-purple-100 transition-colors shadow-sm">
                              <Icon className="h-4 w-4 text-indigo-600" />
                            </div>
                          ) : (
                            <div className="h-9 w-9 rounded-xl bg-gray-50 border border-gray-200/60 flex items-center justify-center group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                              <BookOpen className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                            </div>
                          )}
                          <div>
                            <span className="text-sm font-semibold group-hover:text-indigo-600 transition-colors">{item.label}</span>
                            {item.description && (
                              <p className="text-[11px] text-gray-400 mt-0.5">{item.description}</p>
                            )}
                          </div>
                        </Link>
                        {hasChildren && (
                          <button
                            suppressHydrationWarning
                            onClick={() => setMobileExpanded(isExpanded ? null : item.label)}
                            aria-label={isExpanded ? `Collapse ${item.label}` : `Expand ${item.label}`}
                            className="h-9 w-9 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all mr-2"
                          >
                            <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", isExpanded && "rotate-180")} />
                          </button>
                        )}
                      </div>

                      {/* Mobile Sub-menu */}
                      {hasChildren && isExpanded && (
                        <div className="ml-16 mr-2 mb-2 pl-3 border-l-2 border-indigo-100 space-y-0.5">
                          {item.children.map((child) => (
                            <Link
                              key={child.id}
                              href={child.href}
                              className="block px-3 py-2 text-sm text-gray-600 hover:text-indigo-600 rounded-lg hover:bg-indigo-50/50 transition-colors"
                              onClick={() => setMobileOpen(false)}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Mobile CTA */}
              <div className="mt-3 pt-3 border-t border-gray-100 px-2 space-y-2">
                <Link
                  href="/contact"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20"
                  onClick={() => setMobileOpen(false)}
                >
                  <Phone className="h-4 w-4" />
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
