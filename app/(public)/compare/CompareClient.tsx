"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Plus, X, CheckCircle, Search, Loader2 } from "lucide-react";
import { Breadcrumb } from "../../../components/shared/Breadcrumb";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { cn, formatCurrency, getGradientForLetter } from "../../../lib/utils";
import type { College } from "../../../types";

const compareRows = [
  { label: "Location", key: (c: College) => `${c.city}, ${c.state}` },
  { label: "Type", key: (c: College) => c.type },
  { label: "Established", key: (c: College) => c.established.toString() },
  { label: "NIRF Rank", key: (c: College) => c.nirfRank ? `#${c.nirfRank}` : "—", highlight: true, lowerBetter: true },
  { label: "Rating", key: (c: College) => c.rating.toFixed(1), highlight: true },
  { label: "Total Students", key: (c: College) => c.totalStudents?.toLocaleString() || "—" },
  { label: "Faculty", key: (c: College) => c.faculty?.toLocaleString() || "—" },
  { label: "Annual Fees (Min)", key: (c: College) => formatCurrency(c.fees.min), highlight: true, lowerBetter: true },
  { label: "Annual Fees (Max)", key: (c: College) => formatCurrency(c.fees.max) },
  { label: "Avg Package", key: (c: College) => c.avgPackage ? `${(c.avgPackage / 100000).toFixed(1)} LPA` : "—", highlight: true },
  { label: "Top Package", key: (c: College) => c.topPackage ? `${(c.topPackage / 100000).toFixed(0)} LPA` : "—", highlight: true },
  { label: "Placement Rate", key: (c: College) => c.placementRate ? `${c.placementRate}%` : "—", highlight: true },
  { label: "Streams", key: (c: College) => c.streams.join(", ") },
  { label: "Courses", key: (c: College) => c.courses.join(", ") },
  { label: "Accreditations", key: (c: College) => c.accreditation.join(", ") },
];

interface SearchResult {
  id: string;
  name: string;
  city: string;
  slug: string;
  type: string;
  nirfRank: number | null;
}

function mapApiToCollege(c: Record<string, unknown>): College {
  return {
    id: c.id as string,
    name: c.name as string,
    slug: c.slug as string,
    logo: c.logo as string,
    city: c.city as string,
    state: c.state as string,
    streams: c.streams as string[],
    nirfRank: (c.nirfRank as number | null) ?? undefined,
    rating: c.rating as number,
    reviewCount: c.reviewCount as number,
    established: c.established as number,
    type: c.type as College["type"],
    fees: { min: c.feesMin as number, max: c.feesMax as number },
    avgPackage: (c.avgPackage as number | null) ?? undefined,
    topPackage: (c.topPackage as number | null) ?? undefined,
    placementRate: (c.placementRate as number | null) ?? undefined,
    accreditation: c.accreditation as string[],
    courses: c.courses as string[],
    description: c.description as string,
    highlights: c.highlights as string[],
    address: c.address as string,
    website: (c.website as string | null) ?? undefined,
    phone: (c.phone as string | null) ?? undefined,
    totalStudents: (c.totalStudents as number | null) ?? undefined,
    faculty: (c.faculty as number | null) ?? undefined,
    isFeatured: c.isFeatured as boolean,
    latitude: (c.latitude as number | null) ?? undefined,
    longitude: (c.longitude as number | null) ?? undefined,
    countryCode: c.countryCode as string,
    countryName: c.countryName as string,
  };
}

export function CompareClient() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedColleges, setSelectedColleges] = useState<College[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [addingSlot, setAddingSlot] = useState<number | null>(null);
  const searchAbortRef = useRef<AbortController | null>(null);

  // Fetch search results with debounce
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    searchAbortRef.current?.abort();
    const controller = new AbortController();
    searchAbortRef.current = controller;

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(
          `/api/colleges?search=${encodeURIComponent(searchQuery)}&limit=6`,
          { signal: controller.signal }
        );
        const json = await res.json();
        setSearchResults(
          json.data.map((c: Record<string, unknown>) => ({
            id: c.id,
            name: c.name,
            city: c.city,
            slug: c.slug,
            type: c.type,
            nirfRank: c.nirfRank,
          }))
        );
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error(err);
        }
      } finally {
        if (!controller.signal.aborted) setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch full details for selected colleges
  useEffect(() => {
    if (selectedIds.length === 0) {
      setSelectedColleges([]);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`/api/colleges?ids=${selectedIds.join(",")}&limit=${selectedIds.length}`);
        const json = await res.json();
        // Maintain order of selectedIds
        const mapped = json.data.map(mapApiToCollege);
        const ordered = selectedIds
          .map((id) => mapped.find((c: College) => c.id === id))
          .filter(Boolean) as College[];
        setSelectedColleges(ordered);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [selectedIds]);

  const filteredSearch = searchResults.filter((c) => !selectedIds.includes(c.id));

  const addCollege = (id: string) => {
    if (selectedIds.length < 3) {
      setSelectedIds([...selectedIds, id]);
    }
    setShowSearch(false);
    setAddingSlot(null);
    setSearchQuery("");
    setSearchResults([]);
  };

  const removeCollege = (id: string) => {
    setSelectedIds(selectedIds.filter((s) => s !== id));
  };

  const getBestValue = (rowKey: (c: College) => string, lowerBetter = false) => {
    const values = selectedColleges.map((c) => rowKey(c));
    const nums = values.map((v) => parseFloat(v.replace(/[₹,LPA%#]/g, ""))).filter((n) => !isNaN(n));
    if (nums.length < 2) return null;
    return lowerBetter ? Math.min(...nums) : Math.max(...nums);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto py-8">
          <Breadcrumb items={[{ label: "Compare Colleges" }]} className="mb-4" />
          <h1 className="text-3xl font-black text-gray-900 mb-2">Compare Colleges</h1>
          <p className="text-gray-500">Compare up to 3 colleges side-by-side on key parameters</p>
        </div>
      </div>

      <div className="container mx-auto py-8">
        {selectedIds.length === 0 && (
          <div className="text-center py-16">
            <div className="h-20 w-20 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Plus className="h-10 w-10 text-primary-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Add Colleges to Compare</h2>
            <p className="text-gray-500 mb-6">Select up to 3 colleges to compare them side by side</p>
          </div>
        )}

        {/* College Selection Slots */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          {[0, 1, 2].map((slot) => {
            const college = selectedColleges[slot];
            return (
              <div key={slot}>
                {college ? (
                  <div className="bg-white rounded-2xl border border-primary-200 shadow-card p-5 relative">
                    <button suppressHydrationWarning
                      onClick={() => removeCollege(college.id)}
                      className="absolute top-3 right-3 h-7 w-7 rounded-full bg-gray-100 hover:bg-red-100 flex items-center justify-center transition-colors"
                    >
                      <X className="h-4 w-4 text-gray-500" />
                    </button>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={cn("h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-black text-xl", getGradientForLetter(college.name[0]))}>
                        {college.name[0]}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm leading-tight">{college.name}</h3>
                        <p className="text-xs text-gray-500">{college.city}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant={college.type === "Government" ? "blue" : "secondary"} className="text-xs">{college.type}</Badge>
                      {college.nirfRank && <Badge variant="orange" className="text-xs">NIRF #{college.nirfRank}</Badge>}
                    </div>
                  </div>
                ) : (
                  <div>
                    {showSearch && addingSlot === slot ? (
                      <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-4">
                        <Input
                          placeholder="Search college..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          autoFocus
                          className="mb-3"
                        />
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {searchLoading && (
                            <div className="flex justify-center py-3">
                              <Loader2 className="h-5 w-5 text-primary-500 animate-spin" />
                            </div>
                          )}
                          {!searchLoading && filteredSearch.map((c) => (
                            <button suppressHydrationWarning
                              key={c.id}
                              onClick={() => addCollege(c.id)}
                              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 text-left transition-colors"
                            >
                              <div className={cn("h-8 w-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white text-sm font-bold flex-shrink-0", getGradientForLetter(c.name[0]))}>
                                {c.name[0]}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-800">{c.name}</p>
                                <p className="text-xs text-gray-400">{c.city}</p>
                              </div>
                            </button>
                          ))}
                          {!searchLoading && searchQuery.length >= 2 && filteredSearch.length === 0 && (
                            <p className="text-sm text-gray-400 text-center py-3">No results found</p>
                          )}
                          {!searchLoading && searchQuery.length < 2 && (
                            <p className="text-sm text-gray-400 text-center py-3">Type at least 2 characters to search</p>
                          )}
                        </div>
                        <button suppressHydrationWarning onClick={() => { setShowSearch(false); setAddingSlot(null); setSearchQuery(""); }} className="mt-2 text-xs text-gray-400 hover:text-gray-600 w-full text-center">Cancel</button>
                      </div>
                    ) : (
                      <button suppressHydrationWarning
                        onClick={() => { setShowSearch(true); setAddingSlot(slot); }}
                        className="w-full h-36 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-primary-400 hover:text-primary-500 hover:bg-primary-50/50 transition-all"
                      >
                        <Plus className="h-8 w-8" />
                        <span className="text-sm font-medium">Add College {slot + 1}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Comparison Table */}
        {selectedColleges.length >= 2 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Detailed Comparison</h2>
              <p className="text-sm text-gray-500">
                <span className="text-green-600 font-semibold">Green</span> = Best value
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-5 py-3 text-left text-sm font-semibold text-gray-500 w-40">Parameter</th>
                    {selectedColleges.map((c) => (
                      <th key={c.id} className="px-5 py-3 text-center text-sm font-semibold text-gray-800">
                        {c.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {compareRows.map((row) => {
                    const values = selectedColleges.map((c) => row.key(c));
                    const bestNum = row.highlight ? getBestValue(row.key, row.lowerBetter) : null;

                    return (
                      <tr key={row.label} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3 text-sm font-semibold text-gray-700 bg-gray-50/50">
                          {row.label}
                        </td>
                        {selectedColleges.map((c, idx) => {
                          const val = values[idx];
                          const num = parseFloat(val.replace(/[₹,LPA%#]/g, ""));
                          const isBest = bestNum !== null && num === bestNum;

                          return (
                            <td
                              key={c.id}
                              className={cn(
                                "px-5 py-3 text-sm text-center",
                                isBest
                                  ? "text-green-700 font-bold bg-green-50"
                                  : "text-gray-700"
                              )}
                            >
                              <div className="flex items-center justify-center gap-1">
                                {isBest && (
                                  <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                                )}
                                {val}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-5 border-t border-gray-100 flex gap-3">
              {selectedColleges.map((c) => (
                <Link key={c.id} href={`/colleges/${c.slug}`} className="flex-1">
                  <Button variant="gradient" className="w-full text-sm">
                    Apply to {c.name.split(" ")[0]}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        )}

        {selectedColleges.length < 2 && selectedColleges.length > 0 && (
          <div className="text-center py-8 text-gray-400">
            Add at least one more college to start comparing
          </div>
        )}
      </div>
    </div>
  );
}
