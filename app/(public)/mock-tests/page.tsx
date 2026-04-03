"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Trophy, Search, Flame, Target, BookOpen, ArrowRight, Sparkles,
  GraduationCap, Filter, ChevronDown,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { ExamCard } from "../../../components/mock-tests/ExamCard";
import { allExams, examCategories, getTotalQuestionCount, getTotalExamCount } from "../../../lib/mock-tests/data";
import { getUserStats } from "../../../lib/mock-tests/leaderboard";
import type { ExamCategory } from "../../../lib/mock-tests/types";

export default function MockTestsPage() {
  const [selectedCategory, setSelectedCategory] = useState<ExamCategory | "all">("all");
  const [difficulty, setDifficulty] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const stats = getUserStats();

  const filteredExams = useMemo(() => {
    let exams = allExams;
    if (selectedCategory !== "all") exams = exams.filter((e) => e.category === selectedCategory);
    if (difficulty !== "all") exams = exams.filter((e) => e.difficulty === difficulty);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      exams = exams.filter(
        (e) => e.name.toLowerCase().includes(q) || e.subject.toLowerCase().includes(q) || e.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return exams;
  }, [selectedCategory, difficulty, searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 px-4 py-16">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-6xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span>India&apos;s #1 Free Mock Test Platform</span>
          </div>
          <h1 className="text-4xl font-black text-white sm:text-5xl lg:text-6xl">
            Practice. Compete.{" "}
            <span className="bg-gradient-to-r from-amber-300 to-yellow-200 bg-clip-text text-transparent">
              Dominate.
            </span>
          </h1>
          <p className="mt-4 text-lg text-indigo-200 max-w-2xl mx-auto">
            {getTotalQuestionCount()}+ questions across {getTotalExamCount()} mock tests. Real exam patterns. Compete on the leaderboard. Track your progress.
          </p>

          {/* Stats */}
          <div className="mt-8 flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-2 text-white/90">
              <BookOpen className="h-5 w-5 text-amber-300" />
              <span className="text-sm font-medium">{getTotalExamCount()} Mock Tests</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <Target className="h-5 w-5 text-emerald-300" />
              <span className="text-sm font-medium">{getTotalQuestionCount()}+ Questions</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <GraduationCap className="h-5 w-5 text-sky-300" />
              <span className="text-sm font-medium">9 Exam Categories</span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/mock-tests/leaderboard">
              <Button variant="accent" size="lg" className="shadow-xl">
                <Trophy className="h-5 w-5 mr-2" /> View Leaderboard
              </Button>
            </Link>
            {stats.currentStreak > 0 && (
              <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-white backdrop-blur-sm">
                <Flame className="h-5 w-5 text-orange-400" />
                <span className="text-sm font-bold">{stats.currentStreak} Day Streak</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Category Pills */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Browse by Exam</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                selectedCategory === "all"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50"
              }`}
            >
              All Exams ({allExams.length})
            </button>
            {examCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  selectedCategory === cat.id
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50"
                }`}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search exams, subjects, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="all">All Difficulty</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Exam Grid */}
        {filteredExams.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredExams.map((exam) => (
              <ExamCard key={exam.id} exam={exam} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-semibold text-gray-700">No exams found</h3>
            <p className="text-sm text-gray-500 mt-1">Try a different search or filter</p>
            <Button variant="outline" className="mt-4" onClick={() => { setSelectedCategory("all"); setDifficulty("all"); setSearchQuery(""); }}>
              Clear Filters
            </Button>
          </div>
        )}

        {/* CTA Banner */}
        <div className="mt-12 rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white text-center">
          <h2 className="text-2xl font-black">Ready to Top the Leaderboard?</h2>
          <p className="mt-2 text-indigo-200 max-w-lg mx-auto">
            Take a mock test every day, build your streak, and compete with students from across India.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/mock-tests/leaderboard">
              <Button variant="accent" size="lg">
                <Trophy className="h-5 w-5 mr-2" /> Leaderboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
