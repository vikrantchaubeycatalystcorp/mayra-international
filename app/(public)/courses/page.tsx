"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Clock, Building2, TrendingUp, ArrowRight } from "lucide-react";
import { courses } from "../../../data/courses";
import { Breadcrumb } from "../../../components/shared/Breadcrumb";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import { cn, formatCurrency } from "../../../lib/utils";

const streams = ["All", "Engineering", "Medical", "Management", "Law", "Computer Science", "Science", "Commerce", "Arts & Humanities", "Architecture", "Pharmacy", "Hospitality", "Media & Communication", "Research"];
const levels = ["All", "UG", "PG", "Diploma", "Certificate", "PhD"];

export default function CoursesPage() {
  const [search, setSearch] = useState("");
  const [stream, setStream] = useState("All");
  const [level, setLevel] = useState("All");

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.stream.toLowerCase().includes(search.toLowerCase());
      const matchStream = stream === "All" || c.stream === stream;
      const matchLevel = level === "All" || c.level === level;
      return matchSearch && matchStream && matchLevel;
    });
  }, [search, stream, level]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto py-8">
          <Breadcrumb items={[{ label: "Courses" }]} className="mb-4" />
          <h1 className="text-3xl font-black text-gray-900 mb-2">Courses in India</h1>
          <p className="text-gray-500">Explore 800+ courses across UG, PG, Diploma and certificate programs</p>
        </div>
      </div>

      <div className="container mx-auto py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="text-xs text-gray-500 font-medium self-center mr-1">Level:</span>
            {levels.map((l) => (
              <button suppressHydrationWarning
                key={l}
                onClick={() => setLevel(l)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                  level === l
                    ? "bg-primary-600 text-white border-primary-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-primary-200"
                )}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-gray-500 font-medium self-center mr-1">Stream:</span>
            {streams.slice(0, 8).map((s) => (
              <button suppressHydrationWarning
                key={s}
                onClick={() => setStream(s)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                  stream === s
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-white text-gray-600 border-gray-200 hover:border-orange-200"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-5">
          Showing <span className="font-semibold text-gray-900">{filtered.length}</span> courses
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((course) => (
            <article
              key={course.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 p-5 group cursor-pointer"
            >
              <div className={cn(
                "h-12 w-12 rounded-2xl bg-gradient-to-br flex items-center justify-center text-2xl mb-4 transition-transform group-hover:scale-110 duration-300",
                course.color || "from-blue-600 to-blue-400"
              )}>
                {course.icon || "📚"}
              </div>

              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-xs">{course.level}</Badge>
                <Badge variant="blue" className="text-xs">{course.stream}</Badge>
              </div>

              <h3 className="font-bold text-gray-900 text-base mb-1 group-hover:text-primary-600 transition-colors">
                {course.name}
              </h3>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{course.description.slice(0, 80)}...</p>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock className="h-3.5 w-3.5 text-blue-500" />
                  {course.duration}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Building2 className="h-3.5 w-3.5 text-green-500" />
                  {course.topColleges.toLocaleString()}+ colleges
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 col-span-2">
                  <TrendingUp className="h-3.5 w-3.5 text-purple-500" />
                  Avg Fees: {formatCurrency(course.avgFees)}/yr
                </div>
              </div>

              {course.avgSalary && (
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400">Avg Salary</span>
                  <span className="text-sm font-bold text-green-600">
                    {(course.avgSalary / 100000).toFixed(1)} LPA
                  </span>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
