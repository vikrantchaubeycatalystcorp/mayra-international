"use client";

import Link from "next/link";
import { X, MapPin, Star, ExternalLink } from "lucide-react";

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
  fees?: { min: number; max: number };
  streams?: string[];
  type?: string;
}

interface Props {
  college: CollegePoint;
  onClose: () => void;
}

function formatFee(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${(n / 1000).toFixed(0)}K`;
}

export function CollegePopupCard({ college, onClose }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-2xl w-72 overflow-hidden" style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-4 py-3 flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold text-sm leading-tight truncate">{college.name}</h3>
          <div className="flex items-center gap-1 mt-1">
            <MapPin className="h-3 w-3 text-blue-200 flex-shrink-0" />
            <span className="text-blue-100 text-xs truncate">{[college.city, college.state].filter(Boolean).join(", ")}</span>
          </div>
        </div>
        <button suppressHydrationWarning onClick={onClose} className="ml-2 text-blue-200 hover:text-white transition-colors flex-shrink-0">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-2 mb-3">
          {college.nirfRank && (
            <div className="bg-blue-50 rounded-lg p-2 text-center">
              <div className="text-blue-700 font-bold text-sm">#{college.nirfRank}</div>
              <div className="text-gray-500 text-xs">NIRF</div>
            </div>
          )}
          {college.rating && (
            <div className="bg-amber-50 rounded-lg p-2 text-center">
              <div className="flex items-center justify-center gap-0.5">
                <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                <span className="text-amber-700 font-bold text-sm">{college.rating}</span>
              </div>
              <div className="text-gray-500 text-xs">Rating</div>
            </div>
          )}
          {college.fees && (
            <div className="bg-green-50 rounded-lg p-2 text-center">
              <div className="text-green-700 font-bold text-xs">{formatFee(college.fees.min)}</div>
              <div className="text-gray-500 text-xs">Min Fee</div>
            </div>
          )}
        </div>

        {college.streams && college.streams.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {college.streams.slice(0, 3).map(s => (
              <span key={s} className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">{s}</span>
            ))}
            {college.streams.length > 3 && (
              <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">+{college.streams.length - 3}</span>
            )}
          </div>
        )}

        <Link
          href={`/colleges/${college.slug}`}
          className="flex items-center justify-center gap-2 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          View College <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
