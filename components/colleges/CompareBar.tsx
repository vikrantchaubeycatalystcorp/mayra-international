"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, ArrowRight, Scale } from "lucide-react";
import { useAppStore } from "../../lib/store";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

interface CompareCollege {
  id: string;
  name: string;
  slug: string;
}

export function CompareBar() {
  const { compareList, removeFromCompare, clearCompare } = useAppStore();
  const [visible, setVisible] = useState(false);
  const [selectedColleges, setSelectedColleges] = useState<CompareCollege[]>([]);

  useEffect(() => {
    setVisible(compareList.length >= 2);
  }, [compareList]);

  useEffect(() => {
    if (compareList.length === 0) {
      setSelectedColleges([]);
      return;
    }
    // Fetch college details for the compare list IDs
    const ids = compareList.join(",");
    fetch(`/api/colleges?ids=${encodeURIComponent(ids)}&limit=${compareList.length}`)
      .then((r) => r.json())
      .then((res) => {
        const data = res.data || res;
        setSelectedColleges(Array.isArray(data) ? data : []);
      })
      .catch(() => setSelectedColleges([]));
  }, [compareList]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl transition-transform duration-300",
        visible ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="container mx-auto py-3 px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Scale className="h-5 w-5 text-primary-600" />
            <span className="font-bold text-gray-900 text-sm hidden sm:block">
              Compare
            </span>
            <span className="text-xs text-gray-500 hidden sm:block">
              {compareList.length}/3 colleges
            </span>
          </div>

          {/* College Chips */}
          <div className="flex items-center gap-2 flex-1 min-w-0 overflow-x-auto">
            {selectedColleges.map((college) =>
              college ? (
                <div
                  key={college.id}
                  className="flex items-center gap-2 pl-3 pr-2 py-1.5 bg-primary-50 border border-primary-200 rounded-xl flex-shrink-0"
                >
                  <div className="h-6 w-6 rounded-md bg-gradient-to-br from-primary-700 to-primary-500 flex items-center justify-center text-white text-xs font-bold">
                    {college.name[0]}
                  </div>
                  <span className="text-sm font-medium text-primary-800 max-w-[120px] truncate">
                    {college.name}
                  </span>
                  <button suppressHydrationWarning
                    onClick={() => removeFromCompare(college.id)}
                    className="text-primary-400 hover:text-primary-700 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : null
            )}

            {/* Empty Slots */}
            {Array.from({ length: 3 - compareList.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-dashed border-gray-300 rounded-xl flex-shrink-0"
              >
                <span className="text-xs text-gray-400">+ Add college</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button suppressHydrationWarning
              onClick={clearCompare}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors hidden sm:block"
            >
              Clear
            </button>
            <Link href="/compare">
              <Button variant="gradient" size="sm" className="gap-1">
                Compare Now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
