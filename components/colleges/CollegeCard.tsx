"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { cn, formatCurrency } from "../../lib/utils";
import { useAppStore } from "../../lib/store";
import type { College } from "../../types";

interface CollegeCardProps {
  college: College;
  className?: string;
  titleMinHeight?: number;
  /** Hide the compare control (e.g. on dense home rows). */
  compare?: boolean;
}

function tierForCollege(college: College): 1 | 2 | 3 {
  if (college.nirfRank) {
    if (college.nirfRank <= 25) return 1;
    if (college.nirfRank <= 150) return 2;
    return 3;
  }
  if (college.rating >= 4.5) return 1;
  if (college.rating >= 4) return 2;
  return 3;
}

function lpa(n?: number) {
  if (!n) return null;
  return `₹${(n / 100000).toFixed(1)} LPA`;
}

export function CollegeCard({ college, className, titleMinHeight, compare = true }: CollegeCardProps) {
  const { toggleSaved, isSaved, addToCompare, removeFromCompare, isInCompare, compareList } = useAppStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const saved = mounted && isSaved(college.id);
  const inCompare = mounted && isInCompare(college.id);
  const canAddToCompare = !mounted || compareList.length < 3 || inCompare;

  const tier = tierForCollege(college);
  const approval = college.accreditation?.[0];
  const avg = lpa(college.avgPackage);
  const highest = lpa(college.topPackage);
  const streams = college.streams.slice(0, 3);

  return (
    <article className={cn("card card-hover college-card", className)}>
      <div className={`cc-rail tier-rail t${tier}`} />
      <div className="cc-body">
        <div className="cc-head">
          <span className="crest" style={{ width: 48, height: 48, fontSize: 18 }}>
            {college.name[0]}
          </span>
          <div className="cc-id">
            <div className="cc-rankrow">
              {college.nirfRank && <span className="badge badge-tier">NIRF #{college.nirfRank}</span>}
              <span className={college.type === "Government" ? "badge badge-govt" : "badge badge-line"}>
                {college.type}
              </span>
              {approval && <span className="approval">{approval}</span>}
            </div>
            <Link
              href={`/colleges/${college.slug}`}
              className="cc-name"
              style={titleMinHeight ? { display: "block", minHeight: `${Math.ceil(titleMinHeight)}px` } : undefined}
            >
              {college.name}
            </Link>
            <div className="cc-loc">
              {college.city}, {college.state} <span className="divider-dot">·</span> Estd {college.established}
            </div>
          </div>
          <div className="cc-rating">
            <span className="rating">
              <span className="star">★</span>
              {college.rating.toFixed(1)}
              {college.reviewCount ? (
                <span className="count">({college.reviewCount.toLocaleString("en-IN")})</span>
              ) : null}
            </span>
            <button
              suppressHydrationWarning
              onClick={() => toggleSaved(college.id)}
              aria-label={saved ? "Remove from saved" : "Save college"}
              style={{
                display: "block",
                marginTop: 8,
                marginLeft: "auto",
                color: saved ? "var(--danger)" : "var(--ink-4)",
                background: "none",
                border: "none",
              }}
            >
              <Heart className={cn("h-4 w-4", saved && "fill-current")} />
            </button>
          </div>
        </div>

        <div className="cc-stats">
          <div className="kv">
            <span className="k">Annual fees</span>
            <span className="v">
              {formatCurrency(college.fees.min)}
              <small style={{ fontWeight: 500, color: "var(--ink-3)", fontSize: 12 }}>/yr</small>
            </span>
          </div>
          <div className="kv">
            <span className="k">Avg package</span>
            <span className={cn("v", !avg && "tbd")}>{avg || "Not disclosed"}</span>
          </div>
          <div className="kv">
            <span className="k">Highest</span>
            <span className={cn("v", !highest && "tbd")}>{highest || "Not disclosed"}</span>
          </div>
        </div>

        <div className="cc-streams">
          {streams.map((s) => (
            <span key={s} className="chip" style={{ fontSize: 12, padding: "3px 9px" }}>
              {s}
            </span>
          ))}
          {college.streams.length > 3 && (
            <span className="chip" style={{ fontSize: 12, padding: "3px 9px" }}>
              +{college.streams.length - 3}
            </span>
          )}
        </div>

        <div className="cc-foot">
          <Link href={`/colleges/${college.slug}`} className="link-arrow">
            View details <span className="ar">→</span>
          </Link>
          {compare && (
            <button
              suppressHydrationWarning
              className={cn("cc-compare", inCompare && "on")}
              onClick={() => (inCompare ? removeFromCompare(college.id) : addToCompare(college.id))}
              disabled={!canAddToCompare}
              title={!canAddToCompare ? "Max 3 colleges can be compared" : inCompare ? "Remove from compare" : "Add to compare"}
            >
              <span className="box" />
              Compare
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
