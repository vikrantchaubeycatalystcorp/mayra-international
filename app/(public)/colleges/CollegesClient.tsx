"use client";

import { useState, useMemo } from "react";
import { LayoutGrid, List, SortAsc, Filter, X } from "lucide-react";
import { CollegeCard } from "../../../components/colleges/CollegeCard";
import { CollegeFilters } from "../../../components/colleges/CollegeFilters";
import { CollegeTable } from "../../../components/colleges/CollegeTable";
import { CompareBar } from "../../../components/colleges/CompareBar";
import { Breadcrumb } from "../../../components/shared/Breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Button } from "../../../components/ui/button";
import { cn } from "../../../lib/utils";
import type { College } from "../../../types";
import type { FilterState } from "../../../types";

type ViewMode = "grid" | "table";
type SortOption = "nirf" | "name" | "fees-asc" | "fees-desc" | "rating" | "placement";

interface CollegesClientProps {
  colleges: College[];
}

export function CollegesClient({ colleges: allColleges }: CollegesClientProps) {
  const [view, setView] = useState<ViewMode>("grid");
  const [sort, setSort] = useState<SortOption>("nirf");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Partial<FilterState>>({});

  const PAGE_SIZE = 9;

  const filtered = useMemo(() => {
    let result = [...allColleges];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.state.toLowerCase().includes(q)
      );
    }

    if (filters.states && filters.states.length > 0) {
      result = result.filter((c) => filters.states!.includes(c.state));
    }

    if (filters.streams && filters.streams.length > 0) {
      result = result.filter((c) =>
        filters.streams!.some((s) => c.streams.includes(s))
      );
    }

    if (filters.types && filters.types.length > 0) {
      result = result.filter((c) => filters.types!.includes(c.type));
    }

    if (filters.feesMax && filters.feesMax < 2000000) {
      result = result.filter((c) => c.fees.min <= filters.feesMax!);
    }

    if (filters.ratingMin && filters.ratingMin > 0) {
      result = result.filter((c) => c.rating >= filters.ratingMin!);
    }

    // Sort
    switch (sort) {
      case "nirf":
        result.sort((a, b) => (a.nirfRank ?? 9999) - (b.nirfRank ?? 9999));
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "fees-asc":
        result.sort((a, b) => a.fees.min - b.fees.min);
        break;
      case "fees-desc":
        result.sort((a, b) => b.fees.min - a.fees.min);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "placement":
        result.sort(
          (a, b) => (b.placementRate ?? 0) - (a.placementRate ?? 0)
        );
        break;
    }

    return result;
  }, [allColleges, filters, sort]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Page Header */}
        <div className="bg-white border-b border-gray-100">
          <div className="container mx-auto py-6">
            <Breadcrumb items={[{ label: "Colleges" }]} />
            <div className="flex flex-col sm:flex-row sm:items-start justify-between mt-3 gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
                  Colleges in India
                </h1>
                <p className="text-gray-500 mt-1 text-sm">
                  Showing{" "}
                  <span className="font-semibold text-gray-900">
                    {filtered.length}
                  </span>{" "}
                  colleges based on your preferences
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Sort */}
                <Select
                  value={sort}
                  onValueChange={(v) => {
                    setSort(v as SortOption);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-44 text-sm hidden sm:flex">
                    <SortAsc className="h-4 w-4 mr-1 text-gray-400" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nirf">NIRF Rank</SelectItem>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="fees-asc">Fees: Low to High</SelectItem>
                    <SelectItem value="fees-desc">Fees: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="placement">Best Placement</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Toggle */}
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button suppressHydrationWarning
                    onClick={() => setView("grid")}
                    className={cn(
                      "p-2 transition-colors",
                      view === "grid"
                        ? "bg-primary-600 text-white"
                        : "bg-white text-gray-500 hover:bg-gray-50"
                    )}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button suppressHydrationWarning
                    onClick={() => setView("table")}
                    className={cn(
                      "p-2 transition-colors",
                      view === "table"
                        ? "bg-primary-600 text-white"
                        : "bg-white text-gray-500 hover:bg-gray-50"
                    )}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>

                {/* Mobile Filter Toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden gap-1.5"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto py-8">
          <div className="flex gap-6">
            {/* Sidebar Filters */}
            <div
              className={cn(
                "w-72 flex-shrink-0 transition-all",
                "hidden lg:block"
              )}
            >
              <div className="lg:sticky lg:top-20">
                <CollegeFilters onFiltersChange={setFilters} />
              </div>
            </div>

            {/* Mobile Filter Overlay */}
            {showFilters && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div
                  className="absolute inset-0 bg-black/50"
                  onClick={() => setShowFilters(false)}
                />
                <div className="absolute left-0 top-0 bottom-0 w-80 bg-white overflow-y-auto p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-gray-900">Filters</span>
                    <button suppressHydrationWarning onClick={() => setShowFilters(false)}>
                      <X className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>
                  <CollegeFilters
                    onFiltersChange={(f) => {
                      setFilters(f);
                      setPage(1);
                    }}
                  />
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {view === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {paginated.map((college) => (
                    <CollegeCard key={college.id} college={college} />
                  ))}
                </div>
              ) : (
                <CollegeTable colleges={paginated} />
              )}

              {filtered.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-gray-400 text-lg mb-2">
                    No colleges match your filters
                  </p>
                  <p className="text-gray-400 text-sm">
                    Try adjusting your search criteria
                  </p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <button suppressHydrationWarning
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    const p =
                      totalPages <= 7
                        ? i + 1
                        : page <= 4
                        ? i + 1
                        : page >= totalPages - 3
                        ? totalPages - 6 + i
                        : page - 3 + i;
                    return (
                      <button suppressHydrationWarning
                        key={p}
                        onClick={() => setPage(p)}
                        className={cn(
                          "h-9 w-9 rounded-lg text-sm font-medium transition-colors",
                          page === p
                            ? "bg-primary-600 text-white"
                            : "border border-gray-200 hover:bg-gray-50 text-gray-700"
                        )}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <button suppressHydrationWarning
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <CompareBar />
    </>
  );
}
