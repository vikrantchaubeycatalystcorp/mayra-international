"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronDown } from "lucide-react";
import { CommandSearch } from "../search/CommandSearch";
import { cn } from "../../lib/utils";

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

/** Open the floating enquiry form (listened to in FloatingInquiryForm). */
function openEnquiry() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("mayra:open-enquiry"));
  }
}

export function NavbarClient({ navItems, logo, siteName }: Props) {
  // Prefer the transparent/clean logo when the default is configured.
  const logoSrc = !logo || logo === "/images/mayra-logo.png" ? "/images/mayra-logo-clean.png" : logo;
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ⌘K / Esc handling
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // lock scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <div className="ed-scope">
      <header ref={headerRef} className={cn("site-header", scrolled && "scrolled")}>
        <div className="container">
          <nav className={cn("nav", scrolled && "scrolled")}>
            <Link className="brand" href="/" aria-label={`${siteName || "Mayra International"} home`}>
              <Image
                src={logoSrc}
                alt={siteName || "Mayra International"}
                width={1024}
                height={558}
                priority
                className="h-[58px] w-auto"
              />
            </Link>

            <div className="nav-links">
              {navItems.map((item) => (
                <Link key={item.id} href={item.href}>
                  {item.label}
                </Link>
              ))}
              <Link href="/contact">Contact</Link>
            </div>

            <span className="nav-spacer" />

            <button className="cmdk" onClick={() => setSearchOpen(true)} aria-label="Search">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.6" />
                <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <span className="cmdk-text">Search colleges, exams…</span>
              <kbd>⌘K</kbd>
            </button>

            <button className="btn btn-primary btn-sm" onClick={openEnquiry}>
              Free counselling
            </button>

            <button
              className="hamburger"
              onClick={() => setDrawerOpen(true)}
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile drawer — drops down from the top */}
      <div
        className={cn("drawer-overlay", drawerOpen && "open")}
        onClick={() => setDrawerOpen(false)}
      />
      <aside className={cn("drawer", drawerOpen && "open")} aria-label="Mobile navigation">
        <div className="drawer-top">
          <span className="brand">
            <Image
              src={logoSrc}
              alt={siteName || "Mayra International"}
              width={1024}
              height={558}
              className="h-12 w-auto"
            />
          </span>
          <button className="modal-close" onClick={() => setDrawerOpen(false)} aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        {navItems.map((item) => {
          const hasChildren = item.children.length > 0;
          const isOpen = expanded === item.label;
          return (
            <div key={item.id}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <Link
                  href={item.href}
                  style={{ flex: 1 }}
                  onClick={() => setDrawerOpen(false)}
                >
                  {item.label}
                  {item.description && <span className="sub">{item.description}</span>}
                </Link>
                {hasChildren && (
                  <button
                    onClick={() => setExpanded(isOpen ? null : item.label)}
                    aria-label={isOpen ? `Collapse ${item.label}` : `Expand ${item.label}`}
                    style={{
                      background: "none",
                      border: "none",
                      padding: "12px",
                      color: "var(--ink-3)",
                    }}
                  >
                    <ChevronDown
                      className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")}
                    />
                  </button>
                )}
              </div>
              {hasChildren && isOpen && (
                <div style={{ paddingLeft: 14 }}>
                  {item.children.map((child) => (
                    <Link
                      key={child.id}
                      href={child.href}
                      style={{ fontSize: 14, fontWeight: 500 }}
                      onClick={() => setDrawerOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <Link href="/contact" onClick={() => setDrawerOpen(false)}>
          Contact
        </Link>

        <button
          onClick={() => {
            setDrawerOpen(false);
            openEnquiry();
          }}
          style={{
            marginTop: 14,
            background: "var(--pine)",
            color: "#fff",
            textAlign: "center",
            borderRadius: "var(--r-sm)",
            padding: "13px 12px",
            fontWeight: 600,
            fontSize: 16,
            border: "none",
          }}
        >
          Get free counselling
        </button>
      </aside>

      <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
