"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpDown, ArrowUp, ArrowDown, Star, ExternalLink } from "lucide-react";
import { cn, formatCurrency, getGradientForLetter } from "../../lib/utils";
import { Badge } from "../ui/badge";
import type { College } from "../../types";

type SortKey = "nirfRank" | "name" | "fees" | "avgPackage" | "rating" | "placementRate";
type SortDir = "asc" | "desc";

interface CollegeTableProps {
  colleges: College[];
}

export function CollegeTable({ colleges }: CollegeTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("nirfRank");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sorted = [...colleges].sort((a, b) => {
    let aVal: number | string = 0;
    let bVal: number | string = 0;

    switch (sortKey) {
      case "nirfRank":
        aVal = a.nirfRank ?? 9999;
        bVal = b.nirfRank ?? 9999;
        break;
      case "name":
        aVal = a.name;
        bVal = b.name;
        break;
      case "fees":
        aVal = a.fees.min;
        bVal = b.fees.min;
        break;
      case "avgPackage":
        aVal = a.avgPackage ?? 0;
        bVal = b.avgPackage ?? 0;
        break;
      case "rating":
        aVal = a.rating;
        bVal = b.rating;
        break;
      case "placementRate":
        aVal = a.placementRate ?? 0;
        bVal = b.placementRate ?? 0;
        break;
    }

    if (typeof aVal === "string") {
      return sortDir === "asc"
        ? aVal.localeCompare(bVal as string)
        : (bVal as string).localeCompare(aVal);
    }
    return sortDir === "asc" ? aVal - (bVal as number) : (bVal as number) - aVal;
  });

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col)
      return <ArrowUpDown className="h-3.5 w-3.5 text-gray-300" />;
    return sortDir === "asc" ? (
      <ArrowUp className="h-3.5 w-3.5 text-primary-600" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-primary-600" />
    );
  };

  const cols: { key: SortKey; label: string; align?: "right" }[] = [
    { key: "nirfRank", label: "Rank" },
    { key: "name", label: "College" },
    { key: "fees", label: "Fees/yr", align: "right" },
    { key: "avgPackage", label: "Avg Package", align: "right" },
    { key: "placementRate", label: "Placement", align: "right" },
    { key: "rating", label: "Rating", align: "right" },
  ];

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-card touch-pan-x">
      <table className="w-full text-sm min-w-[800px]">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            {cols.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap",
                  col.align === "right" ? "text-right" : "text-left"
                )}
              >
                <button suppressHydrationWarning
                  onClick={() => handleSort(col.key)}
                  className="flex items-center gap-1.5 hover:text-gray-800 transition-colors group"
                  style={{ marginLeft: col.align === "right" ? "auto" : undefined }}
                >
                  {col.label}
                  <SortIcon col={col.key} />
                </button>
              </th>
            ))}
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
              Type
            </th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {sorted.map((college, idx) => {
            const gradient = getGradientForLetter(college.name[0]);
            return (
              <tr
                key={college.id}
                className={cn(
                  "hover:bg-blue-50/30 transition-colors group",
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                )}
              >
                {/* Rank */}
                <td className="px-4 py-3.5 w-16">
                  {college.nirfRank ? (
                    <span
                      className={cn(
                        "inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                        college.nirfRank <= 5
                          ? "bg-amber-100 text-amber-700"
                          : college.nirfRank <= 10
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                      )}
                    >
                      #{college.nirfRank}
                    </span>
                  ) : (
                    <span className="text-gray-300 text-xs">—</span>
                  )}
                </td>

                {/* Name */}
                <td className="px-4 py-3.5 min-w-[200px]">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "h-9 w-9 rounded-lg bg-gradient-to-br flex items-center justify-center text-white font-bold text-sm flex-shrink-0",
                        gradient
                      )}
                    >
                      {college.name[0]}
                    </div>
                    <div>
                      <Link
                        href={`/colleges/${college.slug}`}
                        className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1"
                      >
                        {college.name}
                      </Link>
                      <p className="text-xs text-gray-400">
                        {college.city}, Est. {college.established}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Fees */}
                <td className="px-4 py-3.5 text-right">
                  <span className="font-semibold text-gray-800">
                    {formatCurrency(college.fees.min)}
                  </span>
                  <span className="text-xs text-gray-400">/yr</span>
                </td>

                {/* Avg Package */}
                <td className="px-4 py-3.5 text-right">
                  {college.avgPackage ? (
                    <span className="font-semibold text-green-600">
                      {(college.avgPackage / 100000).toFixed(1)} LPA
                    </span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>

                {/* Placement Rate */}
                <td className="px-4 py-3.5 text-right">
                  {college.placementRate ? (
                    <div className="flex items-center justify-end gap-1">
                      <div className="h-1.5 w-12 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${college.placementRate}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-700">
                        {college.placementRate}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>

                {/* Rating */}
                <td className="px-4 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-gray-800">
                      {college.rating.toFixed(1)}
                    </span>
                  </div>
                </td>

                {/* Type */}
                <td className="px-4 py-3.5 text-center">
                  <Badge
                    variant={
                      college.type === "Government"
                        ? "blue"
                        : college.type === "Private"
                        ? "secondary"
                        : "purple"
                    }
                    className="text-xs"
                  >
                    {college.type}
                  </Badge>
                </td>

                {/* Actions */}
                <td className="px-4 py-3.5 text-right">
                  <Link
                    href={`/colleges/${college.slug}`}
                    className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    View
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
