"use client";

import Link from "next/link";
import { Heart, ArrowLeft, X, ArrowRight } from "lucide-react";
import { useAppStore } from "../../../../lib/store";
import { colleges } from "../../../../data/colleges";
import { CollegeCard } from "../../../../components/colleges/CollegeCard";
import { Button } from "../../../../components/ui/button";

export default function SavedCollegesPage() {
  const { savedColleges, toggleSaved } = useAppStore();

  const savedCollegeData = savedColleges
    .map((id) => colleges.find((c) => c.id === id))
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto py-6">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                <Heart className="h-6 w-6 text-red-500 fill-current" />
                Saved Colleges ({savedColleges.length})
              </h1>
              <p className="text-gray-500 text-sm mt-1">Your shortlisted colleges for comparison and application</p>
            </div>
            {savedColleges.length > 0 && (
              <Link href="/compare">
                <Button variant="gradient" size="sm" className="gap-1.5">
                  Compare Selected
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8">
        {savedCollegeData.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {savedCollegeData.map((college) =>
              college ? <CollegeCard key={college.id} college={college} /> : null
            )}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="h-20 w-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Heart className="h-10 w-10 text-red-200" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Saved Colleges</h2>
            <p className="text-gray-500 mb-6">
              Save colleges while browsing to keep track of your favorites
            </p>
            <Link href="/colleges">
              <Button variant="gradient">
                Explore Colleges
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
