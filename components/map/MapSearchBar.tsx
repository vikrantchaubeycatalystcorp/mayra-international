"use client";

import { useState, useRef } from "react";
import { Search, X, Globe, Building2 } from "lucide-react";
import type { CountryCollegeStat } from "../../data/worldCollegeStats";

interface CollegePoint {
  id: string;
  name: string;
  slug: string;
  city?: string;
  state?: string;
  latitude: number;
  longitude: number;
  countryCode?: string;
}

interface Props {
  countriesData: CountryCollegeStat[];
  colleges: CollegePoint[];
  onSelectCountry: (c: CountryCollegeStat) => void;
  onSelectCollege: (c: CollegePoint) => void;
}

export function MapSearchBar({ countriesData, colleges, onSelectCountry, onSelectCollege }: Props) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const q = query.toLowerCase().trim();
  const matchedCountries = q.length > 1
    ? countriesData.filter(c => c.countryName.toLowerCase().includes(q) || c.countryCode.toLowerCase().includes(q)).slice(0, 4)
    : [];
  const matchedColleges = q.length > 1
    ? colleges.filter(c => c.name.toLowerCase().includes(q) || c.city?.toLowerCase().includes(q)).slice(0, 5)
    : [];

  const hasResults = matchedCountries.length > 0 || matchedColleges.length > 0;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-lg px-4">
      <div className="relative">
        <div className={`flex items-center bg-white rounded-2xl shadow-2xl border-2 transition-colors ${focused ? "border-blue-500" : "border-transparent"}`}>
          <Search className="h-5 w-5 text-gray-400 ml-4 flex-shrink-0" />
          <input
            suppressHydrationWarning
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            placeholder="Search countries or colleges…"
            className="flex-1 px-3 py-3 bg-transparent text-gray-900 placeholder-gray-400 outline-none text-sm font-medium"
          />
          {query && (
            <button suppressHydrationWarning onClick={() => setQuery("")} className="mr-3 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {focused && hasResults && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            {matchedCountries.length > 0 && (
              <>
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Countries</span>
                </div>
                {matchedCountries.map(c => (
                  <button
                    suppressHydrationWarning
                    key={c.countryCode}
                    onMouseDown={() => { onSelectCountry(c); setQuery(""); setFocused(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Globe className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{c.countryName}</p>
                      <p className="text-xs text-gray-500">{c.collegeCount.toLocaleString()} colleges</p>
                    </div>
                  </button>
                ))}
              </>
            )}
            {matchedColleges.length > 0 && (
              <>
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Colleges</span>
                </div>
                {matchedColleges.map(c => (
                  <button
                    suppressHydrationWarning
                    key={c.id}
                    onMouseDown={() => { onSelectCollege(c); setQuery(""); setFocused(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{c.name}</p>
                      <p className="text-xs text-gray-500">{[c.city, c.state].filter(Boolean).join(", ")}</p>
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
