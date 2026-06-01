"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
  floatingCards: { id: string; title: string; subtitle: string | null; content: unknown; position: string }[];
} | null;

const defaultBanner = {
  badgeText: "NIRF 2025 rankings are live — see who moved",
  badgeLinkText: "View Rankings",
  badgeLink: "/news",
  heading: "Choose where to study with conviction, not guesswork.",
  headingHighlight: "conviction",
  subheading:
    "Verified data on every recognised college and entrance exam in India — rankings, real fees, placements and cut-offs in one place. No noise, no inflated numbers.",
  bgImage: null,
  ctaText: "Search",
  stats: [],
  searchTabs: [
    { id: "1", label: "Colleges", placeholder: "Search colleges by name, city or stream…", searchPath: "/colleges" },
    { id: "2", label: "Exams", placeholder: "Search entrance exams — JEE, NEET, CAT…", searchPath: "/exams" },
    { id: "3", label: "Courses", placeholder: "Search courses — B.Tech, MBBS, MBA, BA LLB…", searchPath: "/courses" },
  ],
  quickFilters: [],
  popularSearches: [
    { id: "1", label: "IIT Bombay", href: "/colleges/iit-bombay" },
    { id: "2", label: "NEET 2026", href: "/exams/neet-ug" },
    { id: "3", label: "MBA colleges", href: "/colleges?streams=Management" },
    { id: "4", label: "JEE Main", href: "/exams/jee-main" },
    { id: "5", label: "Study in Canada", href: "/study-abroad" },
  ],
  floatingCards: [] as BannerData extends null ? never : [],
};

export function HeroBannerClient({ banner }: { banner: BannerData }) {
  const data = banner || defaultBanner;
  const tabs = data.searchTabs;
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const activeTab = tabs[activeTabIdx] || tabs[0];

  const handleSearch = () => {
    if (!activeTab) return;
    const q = query.trim();
    router.push(q ? `${activeTab.searchPath}?search=${encodeURIComponent(q)}` : activeTab.searchPath);
  };

  // Heading with an emphasised highlight word (gold, for legibility over the photo).
  const renderHeading = () => {
    const { heading, headingHighlight } = data;
    if (!headingHighlight || !heading.includes(headingHighlight)) return heading;
    const [before, after] = heading.split(headingHighlight);
    return (
      <>
        {before}
        <em style={{ color: "#EAD3A3", fontStyle: "italic" }}>{headingHighlight}</em>
        {after}
      </>
    );
  };

  return (
    <div className="container relative z-10" style={{ paddingBlock: "clamp(56px,11vh,112px)" }}>
      <div style={{ maxWidth: 720 }}>
        {data.badgeText && (
          <button
            className="hero-ribbon"
            onClick={() => data.badgeLink && router.push(data.badgeLink)}
            style={{ cursor: "pointer" }}
          >
            <span className="go">New</span>
            <span className="txt">{data.badgeText}</span>
            <span style={{ color: "var(--ink-4)" }}>→</span>
          </button>
        )}

        <h1
          className="h-xl"
          style={{
            color: "#fff",
            maxWidth: "18ch",
            marginTop: 24,
            textShadow: "0 2px 16px rgba(0,0,0,0.45)",
          }}
        >
          {renderHeading()}
        </h1>

        {data.subheading && (
          <p
            className="lead"
            style={{
              color: "rgba(255,255,255,0.94)",
              maxWidth: "54ch",
              marginTop: 22,
              textShadow: "0 1px 10px rgba(0,0,0,0.5)",
            }}
          >
            {data.subheading}
          </p>
        )}

        {tabs.length > 0 && (
          <div className="search-wrap" style={{ marginTop: 34 }}>
            <div className="search-tabs">
              {tabs.map((tab, idx) => (
                <button
                  key={tab.id}
                  className={`search-tab${activeTabIdx === idx ? " active" : ""}`}
                  onClick={() => setActiveTabIdx(idx)}
                  style={activeTabIdx === idx ? undefined : { color: "rgba(255,255,255,0.85)" }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="search-box">
              <div className="si">
                <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                  <circle cx="7" cy="7" r="5" stroke="var(--ink-3)" strokeWidth="1.6" />
                  <path d="M11 11l3.5 3.5" stroke="var(--ink-3)" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder={activeTab?.placeholder || "Search…"}
                />
              </div>
              <button className="btn btn-primary" onClick={handleSearch}>
                {data.ctaText || "Search"}
              </button>
            </div>
          </div>
        )}

        {data.popularSearches.length > 0 && (
          <div className="trending" style={{ marginTop: 16 }}>
            <span className="lbl" style={{ color: "rgba(255,255,255,0.8)" }}>Trending</span>
            {data.popularSearches.map((item) => (
              <button
                key={item.id}
                className="chip"
                onClick={() => router.push(item.href)}
                style={{ background: "rgba(255,255,255,0.92)" }}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
