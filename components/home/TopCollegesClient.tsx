"use client";

import { useState } from "react";
import Link from "next/link";
import { CollegeCard } from "../colleges/CollegeCard";
import { cn } from "../../lib/utils";

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

export function TopCollegesClient({ colleges, totalCount, title, subtitle, ctaLink }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("All");

  const filteredColleges =
    activeTab === "All"
      ? colleges.slice(0, 6)
      : colleges.filter((c) => c.streams.includes(activeTab)).slice(0, 6);

  const mapCollege = (c: CollegeData) =>
    ({
      ...c,
      type: c.type as "Government" | "Private" | "Deemed" | "Autonomous",
      nirfRank: c.nirfRank ?? undefined,
      avgPackage: c.avgPackage ?? undefined,
      topPackage: c.topPackage ?? undefined,
      placementRate: c.placementRate ?? undefined,
      fees: { min: c.feesMin, max: c.feesMax },
    } as import("../../types").College);

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="kicker">Ranked &amp; verified</span>
            <h2 className="h-2" style={{ marginTop: 12 }}>{title}</h2>
            <p>{subtitle}</p>
          </div>
          <Link className="link-arrow" href={ctaLink}>
            All {totalCount.toLocaleString("en-IN")} colleges <span className="ar">→</span>
          </Link>
        </div>

        <div className="col-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={cn("col-tab", activeTab === tab && "active")}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="college-grid">
          {filteredColleges.length > 0 ? (
            filteredColleges.map((college) => (
              <CollegeCard key={college.id} college={mapCollege(college)} />
            ))
          ) : (
            <div
              className="card"
              style={{ gridColumn: "1/-1", padding: 30, textAlign: "center", color: "var(--ink-3)" }}
            >
              No colleges in this filter yet.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
