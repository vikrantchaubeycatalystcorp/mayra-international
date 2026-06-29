import type { Metadata } from "next";
import { Globe, Map as MapIcon, Building2 } from "lucide-react";
import { prisma } from "../../../lib/db";
import { MapClientWrapper } from "../../../components/map/MapClientWrapper";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "World College Map | Mayra",
  description: "Explore colleges worldwide on an interactive map. Zoom in to see exact college locations.",
};

export default async function MapPage() {
  const [worldStats, collegesWithCoords] = await Promise.all([
    prisma.worldCollegeStat.findMany({ where: { isActive: true } }),
    prisma.college.findMany({
      where: {
        isActive: true,
        latitude: { not: null },
        longitude: { not: null },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        city: true,
        state: true,
        latitude: true,
        longitude: true,
        countryCode: true,
        countryName: true,
        nirfRank: true,
        rating: true,
        feesMin: true,
        feesMax: true,
        streams: true,
        type: true,
      },
    }),
  ]);

  // Map DB WorldCollegeStat (centroidLng/centroidLat) to the interface expected
  // by MapClientWrapper (centroid: [lng, lat])
  const countriesData = worldStats.map((s) => ({
    countryCode: s.countryCode,
    countryName: s.countryName,
    collegeCount: s.collegeCount,
    centroid: [s.centroidLng, s.centroidLat] as [number, number],
  }));

  const mapColleges = collegesWithCoords.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    city: c.city,
    state: c.state,
    latitude: c.latitude!,
    longitude: c.longitude!,
    countryCode: c.countryCode,
    countryName: c.countryName,
    nirfRank: c.nirfRank ?? undefined,
    rating: c.rating,
    fees: { min: c.feesMin, max: c.feesMax },
    streams: c.streams,
    type: c.type,
  }));

  const totalCountries = countriesData.length;
  const totalColleges = countriesData.reduce((sum, c) => sum + c.collegeCount, 0);

  return (
    <div className="flex flex-col min-h-0" style={{ height: "calc(100vh - 64px)" }}>
      {/* Top stats bar */}
      <div className="bg-slate-900 border-b border-slate-700 px-3 sm:px-6 py-2 sm:py-2.5 flex items-center gap-3 sm:gap-6 flex-shrink-0 flex-wrap">
        <div className="flex items-center gap-2">
          <MapIcon className="h-4 w-4 text-blue-400" />
          <span className="text-white font-bold text-sm">World College Map</span>
        </div>
        <div className="h-4 w-px bg-slate-600" />
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-slate-300">{totalCountries} Countries</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-orange-400" />
            <span className="text-slate-300">{totalColleges.toLocaleString()}+ Colleges</span>
          </div>
        </div>
        <div className="ml-auto text-xs text-slate-500 hidden md:block">
          Click a country to explore · Zoom in for college locations
        </div>
      </div>

      {/* Map container — fills remaining viewport */}
      <div className="flex-1 relative overflow-hidden">
        <MapClientWrapper
          countriesData={countriesData}
          initialColleges={mapColleges}
        />
      </div>
    </div>
  );
}
