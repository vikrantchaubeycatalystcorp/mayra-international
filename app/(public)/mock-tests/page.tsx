"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Trophy, Search, Flame, Target, BookOpen, ArrowRight, Sparkles,
  GraduationCap, Filter, ChevronDown, ChevronRight, TrendingUp,
  Clock, BarChart3, Zap, Star,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { ExamCard } from "../../../components/mock-tests/ExamCard";
import { allExams, examCategories, getTotalQuestionCount, getTotalExamCount } from "../../../lib/mock-tests/data";
import { getUserStats, getSavedAttempts } from "../../../lib/mock-tests/leaderboard";
import { getRecommendations } from "../../../lib/mock-tests/recommendations";
import type { ExamCategory } from "../../../lib/mock-tests/types";

export default function MockTestsPage() {
  const [selectedCategory, setSelectedCategory] = useState<ExamCategory | "all">("all");
  const [difficulty, setDifficulty] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const stats = getUserStats();
  const attempts = getSavedAttempts();
  const recommendations = useMemo(() => getRecommendations(3), []);

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

  // Recent performance for returning users
  const recentAttempts = useMemo(() => {
    return [...attempts]
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      .slice(0, 3);
  }, [attempts]);

  const isReturningUser = stats.totalAttempts > 0;

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
            <span>The Most Intelligent Exam Simulation Platform</span>
          </div>
          <h1 className="text-4xl font-black text-white sm:text-5xl lg:text-6xl">
            Practice. Compete.{" "}
            <span className="bg-gradient-to-r from-amber-300 to-yellow-200 bg-clip-text text-transparent">
              Dominate.
            </span>
          </h1>
          <p className="mt-4 text-lg text-indigo-200 max-w-2xl mx-auto">
            {getTotalQuestionCount()}+ questions across {getTotalExamCount()} mock tests.
            AI-powered diagnostics. Real exam patterns. Compete on the leaderboard.
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
            <div className="flex items-center gap-2 text-white/90">
              <BarChart3 className="h-5 w-5 text-pink-300" />
              <span className="text-sm font-medium">AI Diagnostics</span>
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
        {/* Returning User: Recent Performance + Recommendations */}
        {isReturningUser && (
          <div className="mb-10 space-y-6">
            {/* Welcome back + quick stats */}
            <div className="rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Welcome back!</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {stats.totalAttempts} tests completed | Average: {stats.avgScore}% | Best: {stats.bestScore}%
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {stats.currentStreak > 0 && (
                    <div className="flex items-center gap-2 rounded-lg bg-orange-100 px-3 py-1.5">
                      <Flame className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-bold text-orange-700">{stats.currentStreak} day streak</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 rounded-lg bg-emerald-100 px-3 py-1.5">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-bold text-emerald-700">{stats.bestScore}% best</span>
                  </div>
                </div>
              </div>

              {/* Recent attempts */}
              {recentAttempts.length > 0 && (
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {recentAttempts.map((a) => (
                    <div key={a.id} className="flex items-center gap-3 rounded-xl bg-white p-3 border border-gray-100">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-black ${
                        a.percentage >= 70 ? "bg-emerald-100 text-emerald-700"
                        : a.percentage >= 40 ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                      }`}>
                        {a.percentage}%
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{a.examName}</p>
                        <p className="text-[10px] text-gray-400">
                          {a.correct}/{a.correct + a.incorrect + a.unanswered} correct |{" "}
                          {new Date(a.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Personalized Recommendations */}
            {recommendations.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-indigo-500" />
                    Recommended For You
                  </h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {recommendations.map((rec) => (
                    <Link key={rec.examId} href={`/mock-tests/${rec.examSlug}`}>
                      <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-indigo-200 hover:-translate-y-0.5">
                        <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${rec.gradient}`} />
                        <div className="flex items-start gap-3">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${rec.gradient} text-white`}>
                            <Target className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                                rec.priority === "high" ? "bg-red-100 text-red-600"
                                : rec.priority === "medium" ? "bg-amber-100 text-amber-600"
                                : "bg-blue-100 text-blue-600"
                              }`}>
                                {rec.priority}
                              </span>
                              <span className="text-[10px] text-gray-400">{rec.estimatedDuration} min</span>
                            </div>
                            <p className="text-sm font-bold text-gray-900 truncate">{rec.examName}</p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{rec.reason}</p>
                            {rec.focusAreas.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {rec.focusAreas.slice(0, 3).map((area) => (
                                  <span key={area} className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[9px] font-medium text-indigo-600">
                                    {area}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-1 text-xs text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          Take this test <ChevronRight className="h-3 w-3" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

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

        {/* Features Highlight */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: BarChart3, label: "AI Diagnostics", desc: "Know exactly why your score happened", color: "text-indigo-600", bg: "bg-indigo-100" },
            { icon: Zap, label: "Speed Analysis", desc: "Track time per question and pace", color: "text-amber-600", bg: "bg-amber-100" },
            { icon: Star, label: "Smart Review", desc: "Filter by careless mistakes, guesses", color: "text-emerald-600", bg: "bg-emerald-100" },
            { icon: Target, label: "Personalized", desc: "AI picks your next best test", color: "text-purple-600", bg: "bg-purple-100" },
          ].map((f) => (
            <div key={f.label} className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${f.bg}`}>
                <f.icon className={`h-5 w-5 ${f.color}`} />
              </div>
              <h3 className="font-bold text-gray-900">{f.label}</h3>
              <p className="text-sm text-gray-500 mt-0.5">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="mt-12 rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white text-center">
          <h2 className="text-2xl font-black">Ready to Top the Leaderboard?</h2>
          <p className="mt-2 text-indigo-200 max-w-lg mx-auto">
            Take a mock test every day, build your streak, and compete with students from across India.
            Get AI-powered insights after every attempt.
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
