"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { X, MapPin, Star, ChevronRight, Building2, Globe } from "lucide-react";
import type { CountryCollegeStat } from "../../data/worldCollegeStats";

interface CollegePoint {
  id: string;
  name: string;
  slug: string;
  city?: string;
  state?: string;
  latitude: number;
  longitude: number;
  nirfRank?: number;
  rating?: number;
  type?: string;
  streams?: string[];
}

interface Props {
  open: boolean;
  country: CountryCollegeStat | null;
  colleges: CollegePoint[];
  selectedCollegeId?: string;
  onClose: () => void;
  onSelectCollege: (c: CollegePoint) => void;
}

export function CountryCollegePanel({ open, country, colleges, selectedCollegeId, onClose, onSelectCollege }: Props) {
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (selectedCollegeId && selectedRef.current) {
      selectedRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selectedCollegeId]);

  return (
    <div
      className={`absolute top-0 right-0 h-full w-80 bg-white shadow-2xl z-20 flex flex-col transform transition-transform duration-300 ease-out ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Panel header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 px-5 py-4 flex items-start justify-between flex-shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Globe className="h-4 w-4 text-blue-200" />
            <span className="text-blue-200 text-xs font-medium uppercase tracking-wide">Country</span>
          </div>
          <h2 className="text-white font-bold text-lg leading-tight">{country?.countryName || "Select a country"}</h2>
          {country && (
            <div className="flex items-center gap-2 mt-1">
              <Building2 className="h-3.5 w-3.5 text-blue-300" />
              <span className="text-blue-200 text-sm">{country.collegeCount.toLocaleString()} colleges</span>
            </div>
          )}
        </div>
        <button suppressHydrationWarning onClick={onClose} className="text-blue-200 hover:text-white transition-colors mt-1">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* College list */}
      <div className="flex-1 overflow-y-auto">
        {colleges.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <Building2 className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-sm">No colleges in our database yet</p>
            <p className="text-xs mt-1 text-gray-400">Data coming soon!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {colleges.map(c => (
              <button
                suppressHydrationWarning
                key={c.id}
                ref={c.id === selectedCollegeId ? selectedRef : undefined}
                onClick={() => onSelectCollege(c)}
                className={`w-full text-left px-5 py-3.5 transition-colors hover:bg-blue-50 flex items-start gap-3 ${
                  c.id === selectedCollegeId ? "bg-blue-50 border-l-4 border-blue-500" : ""
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white font-bold text-sm">{c.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{c.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-500 text-xs truncate">{[c.city, c.state].filter(Boolean).join(", ")}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {c.nirfRank && (
                      <span className="text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 font-medium">NIRF #{c.nirfRank}</span>
                    )}
                    {c.rating && (
                      <span className="flex items-center gap-0.5 text-xs text-amber-600">
                        <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                        {c.rating}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-300 flex-shrink-0 mt-1" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {country && colleges.length > 0 && (
        <div className="border-t border-gray-100 px-5 py-3 flex-shrink-0">
          <Link
            href={`/colleges?country=${country.countryCode}`}
            className="flex items-center justify-center gap-2 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            View All {country.countryName} Colleges
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
