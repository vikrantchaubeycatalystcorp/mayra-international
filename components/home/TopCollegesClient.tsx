"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CollegeCard } from "../colleges/CollegeCard";
import { cn } from "../../lib/utils";
import { usePretextHeights } from "../../hooks/usePretext";
import { FONT_CARD_TITLE, LH_TIGHT } from "../../lib/pretext";

type CollegeData = {
  id: string;
  name: string;
  slug: string;
  logo: string;
  city: string;
  state: string;
  streams: string[];
  nirfRank: number | null;
  rating: number;
  reviewCount: number;
  established: number;
  type: string;
  feesMin: number;
  feesMax: number;
  avgPackage: number | null;
  topPackage: number | null;
  placementRate: number | null;
  accreditation: string[];
  courses: string[];
  description: string;
  highlights: string[];
  address: string;
  website: string | null;
  phone: string | null;
  totalStudents: number | null;
  faculty: number | null;
  isFeatured: boolean;
};

const tabs = ["All", "Engineering", "Management", "Medical", "Law"] as const;
type Tab = (typeof tabs)[number];

type Props = {
  colleges: CollegeData[];
  totalCount: number;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaLink: string;
};

export function TopCollegesClient({ colleges, totalCount, title, subtitle, ctaLabel, ctaLink }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [revealed, setRevealed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setRevealed(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const filteredColleges =
    activeTab === "All"
      ? colleges.slice(0, 8)
      : colleges.filter((c) => c.streams.includes(activeTab)).slice(0, 8);

  // Pre-measure college name heights with Pretext for consistent card sizing.
  const collegeNames = useMemo(
    () => filteredColleges.map((c) => c.name),
    [filteredColleges],
  );

  // lineHeightPx = 14px (font-size) × 1.25 (leading-tight) = 17.5
  const lineHeightPx = 14 * LH_TIGHT;

  const { heights: titleHeights, ready: pretextReady, containerRef: gridRef } =
    usePretextHeights({
      texts: collegeNames,
      font: FONT_CARD_TITLE,
      lineHeightPx,
      fallbackWidth: 200,
    });

  // Per-row: find the max title height so all cards in a row align.
  // Grid columns: 1 / sm:2 / lg:3 / xl:4 — we use the measured heights
  // directly and let CSS line-clamp-2 cap at 2 lines, but pass the max
  // height so cards stay uniform.
  const maxTitleHeight = pretextReady
    ? Math.max(...titleHeights, 0)
    : undefined;

  const mapCollege = (c: CollegeData) => ({
    ...c,
    type: c.type as "Government" | "Private" | "Deemed" | "Autonomous",
    nirfRank: c.nirfRank ?? undefined,
    avgPackage: c.avgPackage ?? undefined,
    topPackage: c.topPackage ?? undefined,
    placementRate: c.placementRate ?? undefined,
    fees: { min: c.feesMin, max: c.feesMax },
  } as import("../../types").College);

  return (
    <section className="section-padding bg-gradient-to-b from-gray-50/80 via-white to-white relative" ref={ref}>
      <div className="absolute inset-0 mesh-bg pointer-events-none" />
      <div className="container mx-auto relative">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">{title}</h2>
            <p className="text-gray-500 mt-2 text-sm sm:text-base max-w-lg">{subtitle}</p>
          </div>
          <Link
            href={ctaLink}
            className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100/50 transition-all duration-300 whitespace-nowrap group flex-shrink-0"
          >
            {ctaLabel}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Premium Tab Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-10 scrollbar-none">
          {tabs.map((tab) => (
            <button
              suppressHydrationWarning
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-shrink-0 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border",
                activeTab === tab
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-lg shadow-indigo-500/20"
                  : "bg-white text-gray-600 border-gray-200 hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50/30"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div ref={gridRef} className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 stagger-children", revealed && "revealed")}>
          {filteredColleges.map((college) => (
            <CollegeCard key={college.id} college={mapCollege(college)} titleMinHeight={maxTitleHeight} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href={ctaLink}>
            <button
              suppressHydrationWarning
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl border-2 border-indigo-200 text-indigo-700 font-semibold hover:bg-indigo-50 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 group"
            >
              Explore All {totalCount.toLocaleString()}+ Colleges
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
