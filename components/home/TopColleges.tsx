"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CollegeCard } from "../colleges/CollegeCard";
import { colleges } from "../../data/colleges";
import { cn } from "../../lib/utils";

const tabs = ["All", "Engineering", "Management", "Medical", "Law"] as const;
type Tab = typeof tabs[number];

function SectionHeader({
  title,
  subtitle,
  href,
  hrefLabel,
}: {
  title: string;
  subtitle?: string;
  href: string;
  hrefLabel: string;
}) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-gray-500 mt-1 text-sm sm:text-base">{subtitle}</p>
        )}
      </div>
      <Link
        href={href}
        className="flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors whitespace-nowrap ml-4 mt-1"
      >
        {hrefLabel}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export function TopColleges() {
  const [activeTab, setActiveTab] = useState<Tab>("All");

  const filteredColleges =
    activeTab === "All"
      ? colleges.slice(0, 8)
      : colleges
          .filter((c) => c.streams.includes(activeTab))
          .slice(0, 8);

  return (
    <section className="section-padding bg-gray-50/50">
      <div className="container mx-auto">
        <SectionHeader
          title="Top Colleges in India"
          subtitle="Discover the best colleges ranked by NIRF, ratings, and placements"
          href="/colleges"
          hrefLabel="View All Colleges"
        />

        {/* Stream Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-8 scrollbar-none">
          {tabs.map((tab) => (
            <button suppressHydrationWarning
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 border",
                activeTab === tab
                  ? "bg-primary-600 text-white border-primary-600 shadow-md"
                  : "bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-600"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* College Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredColleges.map((college) => (
            <CollegeCard key={college.id} college={college} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 text-center">
          <Link href="/colleges">
            <button suppressHydrationWarning className="inline-flex items-center gap-2 px-8 py-3 rounded-xl border-2 border-primary-200 text-primary-700 font-semibold hover:bg-primary-50 hover:border-primary-300 transition-all">
              Explore All {colleges.length}+ Colleges
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
