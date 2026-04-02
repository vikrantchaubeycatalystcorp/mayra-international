"use client";

import { useState } from "react";
import { ChevronDown, X, SlidersHorizontal } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useMasterData } from "../../hooks/useMasterData";

const fallbackStates = [
  "Delhi", "Maharashtra", "Tamil Nadu", "Karnataka", "West Bengal",
  "Uttar Pradesh", "Rajasthan", "Gujarat", "Telangana", "Kerala",
  "Bihar", "Madhya Pradesh", "Andhra Pradesh", "Punjab", "Haryana",
];

const fallbackStreams = [
  "Engineering", "Medical", "Management", "Law", "Arts",
  "Science", "Commerce", "Architecture", "Pharmacy", "Nursing",
];

const fallbackCollegeTypes = ["Government", "Private", "Deemed", "Autonomous"];

interface CollegeFiltersProps {
  onFiltersChange?: (filters: FilterValues) => void;
}

interface FilterValues {
  search: string;
  states: string[];
  streams: string[];
  types: string[];
  feesMax: number;
  nirfMax: number;
  ratingMin: number;
}

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  count?: number;
}

function CollapsibleSection({ title, children, defaultOpen = true, count }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <button suppressHydrationWarning
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full mb-3 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-800">{title}</span>
          {count !== undefined && count > 0 && (
            <span className="text-xs bg-primary-100 text-primary-700 rounded-full px-2 py-0.5 font-semibold">
              {count}
            </span>
          )}
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-gray-400 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && children}
    </div>
  );
}

export function CollegeFilters({ onFiltersChange }: CollegeFiltersProps) {
  const { data: masterData, loading: masterLoading } = useMasterData();
  const indianStates = masterData?.states.map((s) => s.name) ?? fallbackStates;
  const streams = masterData?.streams.map((s) => s.name) ?? fallbackStreams;
  const collegeTypes = masterData?.collegeTypes.map((t) => t.name) ?? fallbackCollegeTypes;
  const [filters, setFilters] = useState<FilterValues>({
    search: "",
    states: [],
    streams: [],
    types: [],
    feesMax: 2000000,
    nirfMax: 100,
    ratingMin: 0,
  });

  const updateFilters = (updates: Partial<FilterValues>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const toggleArrayFilter = (key: "states" | "streams" | "types", value: string) => {
    const current = filters[key];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateFilters({ [key]: updated });
  };

  const activeCount =
    filters.states.length +
    filters.streams.length +
    filters.types.length +
    (filters.feesMax < 2000000 ? 1 : 0) +
    (filters.ratingMin > 0 ? 1 : 0);

  const clearAll = () => {
    updateFilters({
      search: "",
      states: [],
      streams: [],
      types: [],
      feesMax: 2000000,
      nirfMax: 100,
      ratingMin: 0,
    });
  };

  return (
    <aside className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary-600" />
          <span className="font-bold text-gray-900 text-sm">Filters</span>
          {activeCount > 0 && (
            <span className="text-xs bg-primary-600 text-white rounded-full h-5 w-5 flex items-center justify-center font-bold">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button suppressHydrationWarning
            onClick={clearAll}
            className="text-xs text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Search within results */}
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search colleges..."
          value={filters.search}
          onChange={(e) => updateFilters({ search: e.target.value })}
          className="text-sm"
        />
      </div>

      {/* State Filter */}
      <CollapsibleSection title="State" count={filters.states.length}>
        <div className="grid grid-cols-1 gap-1 max-h-48 overflow-y-auto pr-1">
          {indianStates.map((state) => (
            <label
              key={state}
              className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-gray-50 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={filters.states.includes(state)}
                onChange={() => toggleArrayFilter("states", state)}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">
                {state}
              </span>
            </label>
          ))}
        </div>
      </CollapsibleSection>

      {/* Stream Filter */}
      <CollapsibleSection title="Stream" count={filters.streams.length}>
        <div className="flex flex-wrap gap-1.5">
          {streams.map((stream) => (
            <button suppressHydrationWarning
              key={stream}
              onClick={() => toggleArrayFilter("streams", stream)}
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-medium border transition-all",
                filters.streams.includes(stream)
                  ? "bg-primary-600 text-white border-primary-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-600"
              )}
            >
              {stream}
            </button>
          ))}
        </div>
      </CollapsibleSection>

      {/* College Type */}
      <CollapsibleSection title="College Type" count={filters.types.length}>
        <div className="grid grid-cols-1 gap-1">
          {collegeTypes.map((type) => (
            <label
              key={type}
              className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-gray-50 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={filters.types.includes(type)}
                onChange={() => toggleArrayFilter("types", type)}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">
                {type}
              </span>
            </label>
          ))}
        </div>
      </CollapsibleSection>

      {/* Annual Fees */}
      <CollapsibleSection title="Annual Fees" defaultOpen={false}>
        <div className="space-y-3">
          <div className="flex justify-between text-xs text-gray-500">
            <span>₹0</span>
            <span className="font-semibold text-gray-800">
              Up to ₹{(filters.feesMax / 100000).toFixed(0)}L/year
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={2000000}
            step={50000}
            value={filters.feesMax}
            onChange={(e) => updateFilters({ feesMax: Number(e.target.value) })}
            className="w-full accent-primary-600"
          />
          <div className="grid grid-cols-3 gap-1">
            {[500000, 1000000, 2000000].map((fee) => (
              <button suppressHydrationWarning
                key={fee}
                onClick={() => updateFilters({ feesMax: fee })}
                className={cn(
                  "py-1 rounded-lg text-xs font-medium border transition-all",
                  filters.feesMax === fee
                    ? "bg-primary-50 text-primary-700 border-primary-200"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                )}
              >
                ₹{fee / 100000}L
              </button>
            ))}
          </div>
        </div>
      </CollapsibleSection>

      {/* Minimum Rating */}
      <CollapsibleSection title="Minimum Rating" defaultOpen={false}>
        <div className="flex gap-2">
          {[0, 3, 3.5, 4, 4.5].map((rating) => (
            <button suppressHydrationWarning
              key={rating}
              onClick={() => updateFilters({ ratingMin: rating })}
              className={cn(
                "flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all",
                filters.ratingMin === rating
                  ? "bg-amber-50 text-amber-700 border-amber-300"
                  : "border-gray-200 text-gray-600 hover:border-amber-200"
              )}
            >
              {rating === 0 ? "Any" : `${rating}★`}
            </button>
          ))}
        </div>
      </CollapsibleSection>

      {/* Apply Button */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <Button variant="gradient" className="w-full text-sm" size="sm">
          Apply Filters
          {activeCount > 0 && ` (${activeCount})`}
        </Button>
      </div>
    </aside>
  );
}
