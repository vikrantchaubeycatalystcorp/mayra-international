"use client";

import dynamic from "next/dynamic";
import { Globe } from "lucide-react";
import type { CountryCollegeStat } from "../../data/worldCollegeStats";

interface MapCollegePoint {
  id: string;
  name: string;
  slug: string;
  city?: string;
  state?: string;
  latitude: number;
  longitude: number;
  countryCode?: string;
  countryName?: string;
  nirfRank?: number;
  rating?: number;
  fees?: { min: number; max: number };
  streams?: string[];
  type?: string;
}

interface Props {
  countriesData: CountryCollegeStat[];
  initialColleges: MapCollegePoint[];
}

const WorldCollegeMap = dynamic(
  () => import("./WorldCollegeMap").then((m) => ({ default: m.WorldCollegeMap })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Globe
            className="h-12 w-12 text-blue-400 mx-auto mb-4 animate-spin"
            style={{ animationDuration: "3s" }}
          />
          <p className="text-white text-lg font-semibold">Loading World Map…</p>
          <p className="text-slate-400 text-sm mt-1">Fetching college coordinates…</p>
        </div>
      </div>
    ),
  }
);

export function MapClientWrapper({ countriesData, initialColleges }: Props) {
  return (
    <WorldCollegeMap
      countriesData={countriesData}
      initialColleges={initialColleges}
    />
  );
}
