"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Calendar, Monitor, Users, ArrowRight } from "lucide-react";
import { Breadcrumb } from "../../../components/shared/Breadcrumb";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import { cn, formatDate } from "../../../lib/utils";
import { useMasterData } from "../../../hooks/useMasterData";

const fallbackLevelFilters = ["All", "UG", "PG", "PhD", "Diploma"];
const fallbackStreamFilters = ["All", "Engineering", "Medical", "Management", "Law", "Defence"];

interface ExamItem {
  id: string;
  name: string;
  slug: string;
  fullName: string;
  streams: string[];
  level: string;
  registrationStart: string | null;
  registrationEnd: string | null;
  examDate: string | null;
  resultDate: string | null;
  applicationFeeGeneral: number;
  mode: string;
  frequency: string;
  participatingColleges: number | null;
  description: string;
}

function ExamCard({ exam }: { exam: ExamItem }) {
  const today = new Date();
  const regEnd = exam.registrationEnd ? new Date(exam.registrationEnd) : null;
  const regStart = exam.registrationStart ? new Date(exam.registrationStart) : null;
  const examDateObj = exam.examDate ? new Date(exam.examDate) : null;

  const isRegOpen = regStart && regEnd && regStart <= today && regEnd >= today;
  const isRegUpcoming = regStart && regStart > today;
  const isExamUpcoming = examDateObj && examDateObj > today;

  return (
    <article className="bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {exam.streams.slice(0, 2).map((s) => (
              <Badge key={s} variant="blue" className="text-xs">
                {s}
              </Badge>
            ))}
            <Badge variant="secondary" className="text-xs">{exam.level}</Badge>
          </div>
          <h3 className="font-black text-gray-900 text-lg">{exam.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{exam.fullName}</p>
        </div>
        <div className="flex-shrink-0">
          {isRegOpen && <Badge variant="success">Reg. Open</Badge>}
          {isRegUpcoming && <Badge variant="warning">Opening Soon</Badge>}
          {!isRegOpen && !isRegUpcoming && isExamUpcoming && (
            <Badge variant="blue">Upcoming</Badge>
          )}
          {!isRegOpen && !isRegUpcoming && !isExamUpcoming && (
            <Badge variant="secondary">Concluded</Badge>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-500 line-clamp-2 mb-4">
        {exam.description}
      </p>

      {/* Key Dates Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {exam.registrationEnd && (
          <div className="p-2.5 bg-orange-50 rounded-xl">
            <p className="text-xs text-orange-600 font-medium">Reg. Ends</p>
            <p className="text-xs font-bold text-gray-800 mt-0.5">
              {formatDate(exam.registrationEnd)}
            </p>
          </div>
        )}
        {exam.examDate && (
          <div className="p-2.5 bg-blue-50 rounded-xl">
            <p className="text-xs text-blue-600 font-medium">Exam Date</p>
            <p className="text-xs font-bold text-gray-800 mt-0.5">
              {formatDate(exam.examDate)}
            </p>
          </div>
        )}
        {exam.resultDate && (
          <div className="p-2.5 bg-green-50 rounded-xl">
            <p className="text-xs text-green-600 font-medium">Results</p>
            <p className="text-xs font-bold text-gray-800 mt-0.5">
              {formatDate(exam.resultDate)}
            </p>
          </div>
        )}
        <div className="p-2.5 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-500 font-medium">App. Fee</p>
          <p className="text-xs font-bold text-gray-800 mt-0.5">
            ₹{exam.applicationFeeGeneral.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
        <span className="flex items-center gap-1">
          <Monitor className="h-3.5 w-3.5" />
          {exam.mode}
        </span>
        {exam.participatingColleges && (
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {exam.participatingColleges}+ colleges
          </span>
        )}
        <span className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          {exam.frequency}
        </span>
      </div>

      <Link href={`/exams/${exam.slug}`}>
        <button suppressHydrationWarning className="w-full flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white rounded-xl text-sm font-semibold transition-all">
          View Full Details
          <ArrowRight className="h-4 w-4" />
        </button>
      </Link>
    </article>
  );
}

interface ExamsClientProps {
  exams: ExamItem[];
}

export function ExamsClient({ exams }: ExamsClientProps) {
  const { data: masterData } = useMasterData();
  const levelFilters = masterData?.courseLevels
    ? ["All", ...masterData.courseLevels.map((l) => l.name)]
    : fallbackLevelFilters;
  const streamFilters = masterData?.streams
    ? ["All", ...masterData.streams.map((s) => s.name)]
    : fallbackStreamFilters;
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("All");
  const [stream, setStream] = useState("All");

  const filtered = useMemo(() => {
    return exams.filter((exam) => {
      const matchSearch =
        !search ||
        exam.name.toLowerCase().includes(search.toLowerCase()) ||
        exam.fullName.toLowerCase().includes(search.toLowerCase());
      const matchLevel = level === "All" || exam.level === level;
      const matchStream =
        stream === "All" || exam.streams.includes(stream);
      return matchSearch && matchLevel && matchStream;
    });
  }, [search, level, stream, exams]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto py-8">
          <Breadcrumb items={[{ label: "Entrance Exams" }]} className="mb-4" />
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            Entrance Exams 2025-26
          </h1>
          <p className="text-gray-500">
            Find exam dates, eligibility, syllabus, and preparation tips for {exams.length}+ entrance exams
          </p>
        </div>
      </div>

      <div className="container mx-auto py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search exams..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {levelFilters.map((l) => (
                <button suppressHydrationWarning
                  key={l}
                  onClick={() => setLevel(l)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium border transition-all",
                    level === l
                      ? "bg-primary-600 text-white border-primary-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-primary-300"
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Stream Filters */}
          <div className="flex gap-2 flex-wrap mt-3">
            {streamFilters.map((s) => (
              <button suppressHydrationWarning
                key={s}
                onClick={() => setStream(s)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                  stream === s
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <p className="text-sm text-gray-500 mb-5">
          Showing <span className="font-semibold text-gray-900">{filtered.length}</span> exams
        </p>

        {/* Exam Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((exam) => (
            <ExamCard key={exam.id} exam={exam} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No exams found matching your search</p>
          </div>
        )}
      </div>
    </div>
  );
}
