"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Trophy, Target, Clock, TrendingUp, CheckCircle2, XCircle, MinusCircle,
  ArrowRight, ChevronDown, ChevronUp, Award, Flame, Share2, RotateCcw,
  BarChart3, Zap, Crown, Star,
} from "lucide-react";
import { Button } from "../ui/button";
import { calculatePercentile, getUserStats } from "../../lib/mock-tests/leaderboard";
import type { TestAttempt, MockExam } from "../../lib/mock-tests/types";

interface Props {
  attempt: TestAttempt;
  exam: MockExam;
}

export function TestResult({ attempt, exam }: Props) {
  const [showSolutions, setShowSolutions] = useState(false);
  const [expandedQ, setExpandedQ] = useState<string | null>(null);
  const [confetti, setConfetti] = useState(false);
  const stats = getUserStats();
  const percentile = calculatePercentile(attempt.percentage, attempt.examId);

  useEffect(() => {
    if (attempt.percentage >= 70) {
      setConfetti(true);
      const t = setTimeout(() => setConfetti(false), 5000);
      return () => clearTimeout(t);
    }
  }, [attempt.percentage]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const grade =
    attempt.percentage >= 90 ? { label: "Outstanding", color: "text-emerald-600", bg: "bg-emerald-100", icon: Crown }
    : attempt.percentage >= 70 ? { label: "Excellent", color: "text-blue-600", bg: "bg-blue-100", icon: Star }
    : attempt.percentage >= 50 ? { label: "Good", color: "text-amber-600", bg: "bg-amber-100", icon: Target }
    : attempt.percentage >= 30 ? { label: "Average", color: "text-orange-600", bg: "bg-orange-100", icon: TrendingUp }
    : { label: "Needs Work", color: "text-red-600", bg: "bg-red-100", icon: Zap };

  const GradeIcon = grade.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4">
      {/* Confetti Effect */}
      {confetti && (
        <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            >
              <div
                className="h-3 w-3 rounded-sm"
                style={{
                  backgroundColor: ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'][i % 6],
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            </div>
          ))}
        </div>
      )}

      <div className="mx-auto max-w-4xl">
        {/* Score Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="relative">
            <div className="flex flex-col items-center text-center">
              <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${grade.bg}`}>
                <GradeIcon className={`h-8 w-8 ${grade.color}`} />
              </div>
              <h1 className="text-3xl font-black sm:text-4xl">{grade.label}!</h1>
              <p className="mt-1 text-indigo-200">{exam.name}</p>

              {/* Score Circle */}
              <div className="mt-6 flex items-center gap-8">
                <div className="relative">
                  <svg className="h-32 w-32" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
                    <circle
                      cx="60" cy="60" r="52" fill="none" stroke="white" strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${attempt.percentage * 3.27} 327`}
                      transform="rotate(-90 60 60)"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black">{attempt.percentage}%</span>
                    <span className="text-xs text-indigo-200">{attempt.score}/{attempt.totalMarks}</span>
                  </div>
                </div>
              </div>

              {/* Percentile */}
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                <Trophy className="h-4 w-4 text-amber-300" />
                <span className="text-sm font-medium">
                  Better than {percentile}% of test takers
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard icon={CheckCircle2} label="Correct" value={attempt.correct} color="text-emerald-600" bg="bg-emerald-100" />
          <StatCard icon={XCircle} label="Incorrect" value={attempt.incorrect} color="text-red-500" bg="bg-red-100" />
          <StatCard icon={MinusCircle} label="Unanswered" value={attempt.unanswered} color="text-gray-500" bg="bg-gray-100" />
          <StatCard icon={Clock} label="Time" value={formatTime(attempt.timeTaken)} color="text-blue-600" bg="bg-blue-100" />
        </div>

        {/* Badges & Streak */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {/* Streak */}
          <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
                <Flame className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{stats.currentStreak} Day Streak</h3>
                <p className="text-xs text-gray-500">Best: {stats.longestStreak} days</p>
              </div>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full ${i < stats.currentStreak ? "bg-orange-500" : "bg-gray-200"}`}
                />
              ))}
            </div>
          </div>

          {/* Overall Stats */}
          <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Your Stats</h3>
                <p className="text-xs text-gray-500">{stats.totalAttempts} tests taken</p>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Average Score</span>
              <span className="font-bold text-gray-900">{stats.avgScore}%</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-500">Best Score</span>
              <span className="font-bold text-emerald-600">{stats.bestScore}%</span>
            </div>
          </div>
        </div>

        {/* Subject-wise Performance */}
        <div className="mt-6 rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Subject-wise Analysis</h3>
          <div className="space-y-4">
            {attempt.subjectWise.map((s) => (
              <div key={s.subject}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-700">{s.subject}</span>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-emerald-600">{s.correct} correct</span>
                    <span className="text-red-500">{s.incorrect} wrong</span>
                    <span className="font-bold text-gray-900">{s.percentage}%</span>
                  </div>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${
                      s.percentage >= 70 ? "bg-gradient-to-r from-emerald-500 to-green-400"
                      : s.percentage >= 40 ? "bg-gradient-to-r from-amber-500 to-yellow-400"
                      : "bg-gradient-to-r from-red-500 to-orange-400"
                    }`}
                    style={{ width: `${s.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Badges */}
        {stats.badges.length > 0 && (
          <div className="mt-6 rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" /> Badges Earned
            </h3>
            <div className="flex flex-wrap gap-3">
              {stats.badges.map((b) => (
                <div key={b.id} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 px-3 py-2">
                  <span className="text-lg">{b.icon === "flame" ? "\ud83d\udd25" : b.icon === "zap" ? "\u26a1" : b.icon === "brain" ? "\ud83e\udde0" : b.icon === "crown" ? "\ud83d\udc51" : b.icon === "target" ? "\ud83c\udfaf" : b.icon === "rocket" ? "\ud83d\ude80" : b.icon === "compass" ? "\ud83e\udded" : "\ud83c\udfc6"}</span>
                  <div>
                    <p className="text-xs font-bold text-gray-900">{b.name}</p>
                    <p className="text-[10px] text-gray-500">{b.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Solutions Toggle */}
        <div className="mt-6">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowSolutions(!showSolutions)}
          >
            {showSolutions ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
            {showSolutions ? "Hide Solutions" : "View All Solutions"}
          </Button>

          {showSolutions && (
            <div className="mt-4 space-y-3">
              {exam.questions.map((q, i) => {
                const answer = attempt.answers.find((a) => a.questionId === q.id);
                const isCorrect = answer?.selectedOptionId === q.correctOptionId;
                const isSkipped = !answer?.selectedOptionId;
                const isExpanded = expandedQ === q.id;

                return (
                  <div
                    key={q.id}
                    className={`rounded-2xl border overflow-hidden transition-all ${
                      isCorrect ? "border-emerald-200 bg-emerald-50/50"
                      : isSkipped ? "border-gray-200 bg-gray-50/50"
                      : "border-red-200 bg-red-50/50"
                    }`}
                  >
                    <button
                      onClick={() => setExpandedQ(isExpanded ? null : q.id)}
                      className="flex w-full items-center gap-3 p-4 text-left"
                    >
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                        isCorrect ? "bg-emerald-200 text-emerald-700"
                        : isSkipped ? "bg-gray-200 text-gray-500"
                        : "bg-red-200 text-red-700"
                      }`}>
                        {isCorrect ? <CheckCircle2 className="h-4 w-4" /> : isSkipped ? <MinusCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                      </span>
                      <span className="flex-1 text-sm font-medium text-gray-900 line-clamp-1">
                        Q{i + 1}. {q.text}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </button>

                    {isExpanded && (
                      <div className="border-t px-4 pb-4 pt-3">
                        <div className="space-y-2 mb-3">
                          {q.options.map((opt) => {
                            const isAnswer = opt.id === q.correctOptionId;
                            const isUserChoice = opt.id === answer?.selectedOptionId;
                            return (
                              <div
                                key={opt.id}
                                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                                  isAnswer ? "bg-emerald-100 font-medium text-emerald-800"
                                  : isUserChoice ? "bg-red-100 text-red-700 line-through"
                                  : "bg-white text-gray-600"
                                }`}
                              >
                                {isAnswer && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
                                {isUserChoice && !isAnswer && <XCircle className="h-4 w-4 text-red-500 shrink-0" />}
                                {!isAnswer && !isUserChoice && <span className="h-4 w-4" />}
                                {opt.text}
                              </div>
                            );
                          })}
                        </div>
                        <div className="rounded-xl bg-blue-50 p-3 text-sm text-blue-800">
                          <strong>Explanation:</strong> {q.explanation}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href={`/mock-tests/${exam.slug}`}>
            <Button variant="gradient" size="lg" className="w-full sm:w-auto">
              <RotateCcw className="h-4 w-4 mr-2" /> Retake Test
            </Button>
          </Link>
          <Link href="/mock-tests/leaderboard">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <Trophy className="h-4 w-4 mr-2" /> View Leaderboard
            </Button>
          </Link>
          <Link href="/mock-tests">
            <Button variant="ghost" size="lg" className="w-full sm:w-auto">
              <ArrowRight className="h-4 w-4 mr-2" /> More Tests
            </Button>
          </Link>
        </div>
      </div>

      {/* Confetti CSS */}
      <style jsx global>{`
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bg }: {
  icon: React.ElementType; label: string; value: string | number; color: string; bg: string;
}) {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
      <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <p className="text-2xl font-black text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
