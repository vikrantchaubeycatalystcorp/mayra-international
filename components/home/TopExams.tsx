"use client";

import Link from "next/link";
import { ArrowRight, Calendar, Monitor, Users } from "lucide-react";
import { Badge } from "../ui/badge";
import { exams } from "../../data/exams";
import { formatDate } from "../../lib/utils";

function ExamCard({ exam }: { exam: typeof exams[0] }) {
  const today = new Date();
  const regEnd = exam.registrationEnd ? new Date(exam.registrationEnd) : null;
  const examDate = exam.examDate ? new Date(exam.examDate) : null;

  const registrationOpen =
    regEnd && regEnd >= today && exam.registrationStart
      ? new Date(exam.registrationStart) <= today
      : false;
  const registrationUpcoming =
    exam.registrationStart && new Date(exam.registrationStart) > today;

  return (
    <article className="bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-bold text-gray-900 text-base">{exam.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
            {exam.conductingBody}
          </p>
        </div>
        <div className="flex-shrink-0">
          {registrationOpen && (
            <Badge variant="success" className="text-xs">
              Registration Open
            </Badge>
          )}
          {registrationUpcoming && (
            <Badge variant="warning" className="text-xs">
              Opens Soon
            </Badge>
          )}
          {!registrationOpen && !registrationUpcoming && (
            <Badge variant="secondary" className="text-xs">
              {examDate && examDate > today ? "Upcoming" : "Completed"}
            </Badge>
          )}
        </div>
      </div>

      {/* Stream Tags */}
      <div className="flex flex-wrap gap-1">
        {exam.stream.slice(0, 2).map((s) => (
          <Badge key={s} variant="blue" className="text-xs">
            {s}
          </Badge>
        ))}
        <Badge variant="secondary" className="text-xs">{exam.level}</Badge>
      </div>

      {/* Key Dates */}
      <div className="grid grid-cols-2 gap-2">
        {exam.registrationEnd && (
          <div className="p-2 bg-orange-50 rounded-xl">
            <p className="text-xs text-orange-600 font-medium mb-0.5">Reg. Deadline</p>
            <p className="text-xs font-bold text-gray-800">
              {formatDate(exam.registrationEnd)}
            </p>
          </div>
        )}
        {exam.examDate && (
          <div className="p-2 bg-blue-50 rounded-xl">
            <p className="text-xs text-blue-600 font-medium mb-0.5">Exam Date</p>
            <p className="text-xs font-bold text-gray-800">
              {formatDate(exam.examDate)}
            </p>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Monitor className="h-3 w-3" />
          {exam.mode}
        </span>
        {exam.participatingColleges && (
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {exam.participatingColleges}+ colleges
          </span>
        )}
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {exam.frequency.split(" ")[0]}
        </span>
      </div>

      {/* CTA */}
      <Link
        href={`/exams/${exam.slug}`}
        className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl hover:from-primary-700 hover:to-primary-600 transition-all text-sm font-semibold"
      >
        <span>View Details</span>
        <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}

export function TopExams() {
  const featuredExams = exams.filter((e) => e.isFeatured);

  return (
    <section className="section-padding bg-white">
      <div className="container mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Top Entrance Exams 2025-26
            </h2>
            <p className="text-gray-500 mt-1 text-sm sm:text-base">
              Stay ahead with exam dates, syllabus and preparation tips
            </p>
          </div>
          <Link
            href="/exams"
            className="flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors whitespace-nowrap ml-4 mt-1"
          >
            View All Exams
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredExams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} />
          ))}
        </div>
      </div>
    </section>
  );
}
