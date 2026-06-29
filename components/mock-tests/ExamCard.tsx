"use client";

import Link from "next/link";
import {
  Atom, Heart, Cpu, Calculator, Landmark, Brain,
  Clock, Users, BarChart3, ChevronRight, Zap, Shield, GraduationCap,
} from "lucide-react";
import type { MockExam } from "../../lib/mock-tests/types";

const iconMap: Record<string, React.ElementType> = {
  Atom, Heart, Cpu, Calculator, Landmark, Brain, Shield, GraduationCap,
  IndianRupee: () => <span className="text-lg font-bold">\u20b9</span>,
};

export function ExamCard({ exam }: { exam: MockExam }) {
  const Icon = iconMap[exam.icon] || Atom;

  return (
    <Link href={`/mock-tests/${exam.slug}`}>
      <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-indigo-100/50 hover:-translate-y-1 hover:border-indigo-200">
        {/* Gradient accent */}
        <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${exam.gradient}`} />

        <div className="flex items-start justify-between">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${exam.gradient} text-white shadow-lg`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              exam.difficulty === "Hard"
                ? "bg-red-100 text-red-700"
                : exam.difficulty === "Medium"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-green-100 text-green-700"
            }`}>
              {exam.difficulty}
            </span>
          </div>
        </div>

        <h3 className="mt-4 text-lg font-bold text-gray-900 group-hover:text-indigo-700 transition-colors line-clamp-1">
          {exam.name}
        </h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{exam.description}</p>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock className="h-3.5 w-3.5" />
            <span>{exam.duration} min</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Zap className="h-3.5 w-3.5" />
            <span>{exam.totalQuestions} Qs</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <BarChart3 className="h-3.5 w-3.5" />
            <span>{exam.totalMarks} marks</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Users className="h-3.5 w-3.5" />
            <span>{exam.attemptCount.toLocaleString()} attempts</span>
          </div>
          <div className="flex items-center gap-1 text-sm font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
            Start Test <ChevronRight className="h-4 w-4" />
          </div>
        </div>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {exam.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
