"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MapPin, Star, TrendingUp, CheckCircle, Heart, Plus, Minus } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { cn, formatCurrency, getGradientForLetter } from "../../lib/utils";
import { useAppStore } from "../../lib/store";
import type { College } from "../../types";

interface CollegeCardProps {
  college: College;
  className?: string;
  /** Minimum height (px) for the title area — set by Pretext batch measurement for row alignment. */
  titleMinHeight?: number;
}

export function CollegeCard({ college, className, titleMinHeight }: CollegeCardProps) {
  const { toggleSaved, isSaved, addToCompare, removeFromCompare, isInCompare, compareList } = useAppStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const saved = mounted && isSaved(college.id);
  const inCompare = mounted && isInCompare(college.id);
  const gradient = getGradientForLetter(college.name[0]);

  const canAddToCompare = !mounted || compareList.length < 3 || inCompare;

  return (
    <article
      className={cn(
        "card-premium overflow-hidden group",
        className
      )}
    >
      {/* Card Header */}
      <div className="relative p-5 pb-4">
        <div className="flex items-start gap-4">
          {/* Logo */}
          <div
            className={cn(
              "h-14 w-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white font-black text-xl flex-shrink-0 shadow-md transition-transform duration-500 group-hover:scale-105 group-hover:shadow-lg",
              gradient
            )}
          >
            {college.name[0]}
          </div>

          {/* College Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <Link
                href={`/colleges/${college.slug}`}
                className="font-bold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-2 text-sm leading-tight group-hover:text-indigo-600"
                style={titleMinHeight ? { minHeight: `${Math.ceil(titleMinHeight)}px` } : undefined}
              >
                {college.name}
              </Link>
              <button suppressHydrationWarning
                onClick={() => toggleSaved(college.id)}
                className={cn(
                  "flex-shrink-0 p-1.5 rounded-xl transition-all duration-300",
                  saved
                    ? "text-red-500 bg-red-50 scale-110"
                    : "text-gray-300 hover:text-red-500 hover:bg-red-50"
                )}
                aria-label={saved ? "Remove from saved" : "Save college"}
              >
                <Heart className={cn("h-4 w-4 transition-transform", saved && "fill-current")} />
              </button>
            </div>

            <div className="flex items-center gap-1 mt-1.5">
              <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
              <span className="text-xs text-gray-500 truncate">
                {college.city}, {college.state}
              </span>
            </div>
          </div>
        </div>

        {/* Badges Row */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3">
          <Badge variant={college.type === "Government" ? "blue" : "secondary"} className="text-xs">
            {college.type}
          </Badge>
          {college.nirfRank && college.nirfRank <= 10 && (
            <Badge variant="orange" className="text-xs">
              NIRF #{college.nirfRank}
            </Badge>
          )}
          {college.nirfRank && college.nirfRank > 10 && (
            <Badge variant="secondary" className="text-xs">
              NIRF #{college.nirfRank}
            </Badge>
          )}
          {college.accreditation.slice(0, 1).map((acc) => (
            <Badge key={acc} variant="success" className="text-xs">
              {acc.split(" ")[0]} {acc.split(" ")[1]}
            </Badge>
          ))}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mt-2.5">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "h-3.5 w-3.5",
                  star <= Math.floor(college.rating)
                    ? "fill-amber-400 text-amber-400"
                    : star - 0.5 <= college.rating
                    ? "fill-amber-200 text-amber-400"
                    : "text-gray-200"
                )}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-gray-700">
            {college.rating.toFixed(1)}
          </span>
          <span className="text-xs text-gray-400">
            ({college.reviewCount.toLocaleString()})
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mx-5 py-3 border-t border-gray-100/50 grid grid-cols-3 gap-3">
        <div className="text-center">
          <p className="text-[10px] text-gray-400 mb-0.5 uppercase tracking-wider font-medium">Fees</p>
          <p className="text-sm font-bold text-gray-900">
            {formatCurrency(college.fees.min)}
          </p>
        </div>
        {college.avgPackage && (
          <div className="text-center border-x border-gray-100/50">
            <p className="text-[10px] text-gray-400 mb-0.5 uppercase tracking-wider font-medium">Avg CTC</p>
            <p className="text-sm font-bold text-emerald-600">
              {(college.avgPackage / 100000).toFixed(1)} LPA
            </p>
          </div>
        )}
        {college.placementRate && (
          <div className="text-center">
            <p className="text-[10px] text-gray-400 mb-0.5 uppercase tracking-wider font-medium">Placed</p>
            <div className="flex items-center justify-center gap-0.5">
              <TrendingUp className="h-3 w-3 text-indigo-500" />
              <p className="text-sm font-bold text-indigo-600">
                {college.placementRate}%
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Stream Tags */}
      <div className="px-5 py-2">
        <div className="flex flex-wrap gap-1">
          {college.streams.slice(0, 3).map((stream) => (
            <span
              key={stream}
              className="px-2 py-0.5 bg-gray-50 border border-gray-100/80 rounded-lg text-[10px] text-gray-500 font-medium"
            >
              {stream}
            </span>
          ))}
          {college.streams.length > 3 && (
            <span className="px-2 py-0.5 text-[10px] text-gray-400 font-medium">
              +{college.streams.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="p-5 pt-3 flex items-center gap-2">
        <Link href={`/colleges/${college.slug}`} className="flex-1">
          <Button variant="gradient" size="sm" className="w-full text-xs rounded-xl">
            View Details
          </Button>
        </Link>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "flex-shrink-0 text-xs gap-1 px-3 rounded-xl",
            inCompare && "border-indigo-300 bg-indigo-50 text-indigo-600"
          )}
          onClick={() =>
            inCompare ? removeFromCompare(college.id) : addToCompare(college.id)
          }
          disabled={!canAddToCompare}
          title={
            !canAddToCompare
              ? "Max 3 colleges can be compared"
              : inCompare
              ? "Remove from compare"
              : "Add to compare"
          }
        >
          {inCompare ? (
            <>
              <Minus className="h-3 w-3" />
              Remove
            </>
          ) : (
            <>
              <Plus className="h-3 w-3" />
              Compare
            </>
          )}
        </Button>
      </div>

      {/* Apply CTA */}
      {college.isFeatured && (
        <div className="px-5 pb-5">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100/80">
            <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
            <span className="text-xs text-emerald-700 font-medium">
              Admissions Open for 2026
            </span>
            <Link
              href={`/colleges/${college.slug}`}
              className="ml-auto text-xs text-emerald-600 font-semibold hover:text-emerald-700 whitespace-nowrap"
            >
              Apply Now →
            </Link>
          </div>
        </div>
      )}
    </article>
  );
}
