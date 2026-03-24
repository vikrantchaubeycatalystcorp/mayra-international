"use client";

import Link from "next/link";
import { MapPin, Star, TrendingUp, CheckCircle, Heart, Plus, Minus } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { cn, formatCurrency, getGradientForLetter } from "../../lib/utils";
import { useAppStore } from "../../lib/store";
import type { College } from "../../types";

interface CollegeCardProps {
  college: College;
  className?: string;
}

export function CollegeCard({ college, className }: CollegeCardProps) {
  const { toggleSaved, isSaved, addToCompare, removeFromCompare, isInCompare, compareList } = useAppStore();
  const saved = isSaved(college.id);
  const inCompare = isInCompare(college.id);
  const gradient = getGradientForLetter(college.name[0]);

  const canAddToCompare = compareList.length < 3 || inCompare;

  return (
    <article
      className={cn(
        "bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 overflow-hidden group",
        className
      )}
    >
      {/* Card Header with gradient logo */}
      <div className="relative p-5 pb-4">
        <div className="flex items-start gap-4">
          {/* Logo */}
          <div
            className={cn(
              "h-14 w-14 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-black text-2xl flex-shrink-0 shadow-md",
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
                className="font-bold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2 text-sm leading-tight group-hover:text-primary-600"
              >
                {college.name}
              </Link>
              <button suppressHydrationWarning
                onClick={() => toggleSaved(college.id)}
                className={cn(
                  "flex-shrink-0 p-1.5 rounded-lg transition-colors",
                  saved
                    ? "text-red-500 bg-red-50"
                    : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                )}
                aria-label={saved ? "Remove from saved" : "Save college"}
              >
                <Heart className={cn("h-4 w-4", saved && "fill-current")} />
              </button>
            </div>

            <div className="flex items-center gap-1 mt-1">
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
        <div className="flex items-center gap-1.5 mt-2">
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
            ({college.reviewCount.toLocaleString()} reviews)
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mx-5 py-3 border-t border-gray-50 grid grid-cols-3 gap-3">
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-0.5">Annual Fees</p>
          <p className="text-sm font-bold text-gray-900">
            {formatCurrency(college.fees.min)}
          </p>
        </div>
        {college.avgPackage && (
          <div className="text-center border-x border-gray-100">
            <p className="text-xs text-gray-400 mb-0.5">Avg Package</p>
            <p className="text-sm font-bold text-green-600">
              {(college.avgPackage / 100000).toFixed(1)} LPA
            </p>
          </div>
        )}
        {college.placementRate && (
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-0.5">Placement</p>
            <div className="flex items-center justify-center gap-0.5">
              <TrendingUp className="h-3 w-3 text-blue-500" />
              <p className="text-sm font-bold text-blue-600">
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
              className="px-2 py-0.5 bg-gray-50 border border-gray-100 rounded-full text-xs text-gray-500"
            >
              {stream}
            </span>
          ))}
          {college.streams.length > 3 && (
            <span className="px-2 py-0.5 text-xs text-gray-400">
              +{college.streams.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="p-5 pt-3 flex items-center gap-2">
        <Link href={`/colleges/${college.slug}`} className="flex-1">
          <Button variant="gradient" size="sm" className="w-full text-xs">
            View Details
          </Button>
        </Link>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "flex-shrink-0 text-xs gap-1 px-3",
            inCompare && "border-primary-300 bg-primary-50 text-primary-600"
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
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span className="text-xs text-green-700 font-medium">
              Admissions Open for 2026
            </span>
            <Link
              href={`/colleges/${college.slug}`}
              className="ml-auto text-xs text-green-600 font-semibold hover:text-green-700 whitespace-nowrap"
            >
              Apply Now →
            </Link>
          </div>
        </div>
      )}
    </article>
  );
}
