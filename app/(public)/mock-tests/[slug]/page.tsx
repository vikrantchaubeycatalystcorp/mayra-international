"use client";

import { useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft, Clock, Zap, BarChart3, Users, AlertTriangle, Trophy,
  BookOpen, Target, Minus, ChevronRight, Shield,
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { TestInterface } from "../../../../components/mock-tests/TestInterface";
import { TestResult } from "../../../../components/mock-tests/TestResult";
import { getExamBySlug } from "../../../../lib/mock-tests/data";
import type { TestAttempt } from "../../../../lib/mock-tests/types";

export default function ExamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const exam = getExamBySlug(slug);
  const [testStarted, setTestStarted] = useState(false);
  const [attempt, setAttempt] = useState<TestAttempt | null>(null);

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="mx-auto h-12 w-12 text-gray-300" />
          <h2 className="mt-4 text-xl font-bold text-gray-700">Exam not found</h2>
          <Link href="/mock-tests">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Mock Tests
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Show result page
  if (attempt) {
    return <TestResult attempt={attempt} exam={exam} />;
  }

  // Show test interface
  if (testStarted) {
    return <TestInterface exam={exam} onComplete={(a) => setAttempt(a)} />;
  }

  // Show exam detail / start page
  const subjects = [...new Set(exam.questions.map((q) => q.subject))];
  const difficultyBreakdown = {
    Easy: exam.questions.filter((q) => q.difficulty === "Easy").length,
    Medium: exam.questions.filter((q) => q.difficulty === "Medium").length,
    Hard: exam.questions.filter((q) => q.difficulty === "Hard").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <div className={`bg-gradient-to-br ${exam.gradient} to-indigo-900 px-4 py-12 text-white`}>
        <div className="mx-auto max-w-4xl">
          <Link href="/mock-tests" className="inline-flex items-center gap-1 text-sm text-white/70 hover:text-white mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Mock Tests
          </Link>

          <div className="flex items-start gap-4">
            <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm`}>
              <Target className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium">{exam.category}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  exam.difficulty === "Hard" ? "bg-red-500/30" : exam.difficulty === "Medium" ? "bg-amber-500/30" : "bg-green-500/30"
                }`}>
                  {exam.difficulty}
                </span>
              </div>
              <h1 className="text-2xl font-black sm:text-3xl">{exam.name}</h1>
              <p className="mt-2 text-white/70 max-w-2xl">{exam.description}</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-4">
              <Clock className="h-5 w-5 text-white/60 mb-2" />
              <p className="text-2xl font-black">{exam.duration}</p>
              <p className="text-xs text-white/60">Minutes</p>
            </div>
            <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-4">
              <Zap className="h-5 w-5 text-white/60 mb-2" />
              <p className="text-2xl font-black">{exam.totalQuestions}</p>
              <p className="text-xs text-white/60">Questions</p>
            </div>
            <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-4">
              <BarChart3 className="h-5 w-5 text-white/60 mb-2" />
              <p className="text-2xl font-black">{exam.totalMarks}</p>
              <p className="text-xs text-white/60">Total Marks</p>
            </div>
            <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-4">
              <Users className="h-5 w-5 text-white/60 mb-2" />
              <p className="text-2xl font-black">{(exam.attemptCount / 1000).toFixed(1)}K</p>
              <p className="text-xs text-white/60">Attempts</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Exam Details */}
          <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Exam Pattern</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Subjects</span>
                <span className="font-medium text-gray-900">{subjects.join(", ")}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Negative Marking</span>
                <span className="font-medium text-red-500">
                  {exam.negativeMarking > 0 ? `-${exam.negativeMarking} per wrong answer` : "No"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Average Score</span>
                <span className="font-medium text-gray-900">{exam.avgScore}%</span>
              </div>
            </div>
          </div>

          {/* Difficulty Breakdown */}
          <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Difficulty Breakdown</h3>
            <div className="space-y-3">
              {(["Easy", "Medium", "Hard"] as const).map((d) => (
                <div key={d} className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    d === "Hard" ? "bg-red-100 text-red-700" : d === "Medium" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                  }`}>
                    {d}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        d === "Hard" ? "bg-red-500" : d === "Medium" ? "bg-amber-500" : "bg-green-500"
                      }`}
                      style={{ width: `${(difficultyBreakdown[d] / exam.totalQuestions) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-700 w-8 text-right">{difficultyBreakdown[d]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 rounded-2xl bg-amber-50 border border-amber-200 p-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <h3 className="font-bold text-amber-800">Instructions</h3>
          </div>
          <ul className="space-y-2 text-sm text-amber-700">
            <li className="flex items-start gap-2"><Minus className="h-4 w-4 mt-0.5 shrink-0" /> You have <strong>{exam.duration} minutes</strong> to complete this test.</li>
            <li className="flex items-start gap-2"><Minus className="h-4 w-4 mt-0.5 shrink-0" /> Each correct answer carries <strong>{exam.questions[0]?.marks || 4} marks</strong>.</li>
            {exam.negativeMarking > 0 && (
              <li className="flex items-start gap-2"><Minus className="h-4 w-4 mt-0.5 shrink-0" /> <strong>{exam.negativeMarking} mark(s)</strong> will be deducted for each wrong answer.</li>
            )}
            <li className="flex items-start gap-2"><Minus className="h-4 w-4 mt-0.5 shrink-0" /> You can mark questions for review and return to them later.</li>
            <li className="flex items-start gap-2"><Minus className="h-4 w-4 mt-0.5 shrink-0" /> The test will auto-submit when time runs out.</li>
            <li className="flex items-start gap-2"><Minus className="h-4 w-4 mt-0.5 shrink-0" /> Detailed solutions will be shown after submission.</li>
          </ul>
        </div>

        {/* Start Button */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <Button
            variant="gradient"
            size="xl"
            className="text-lg px-12 shadow-xl shadow-indigo-200"
            onClick={() => setTestStarted(true)}
          >
            <Shield className="h-5 w-5 mr-2" /> Start Test Now
            <ChevronRight className="h-5 w-5 ml-2" />
          </Button>
          <p className="text-xs text-gray-400">Your score will appear on the leaderboard</p>
        </div>

        {/* Leaderboard Teaser */}
        <div className="mt-8 rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" /> Top Performers
            </h3>
            <Link href="/mock-tests/leaderboard" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
              View Full Leaderboard <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="text-center py-4 text-gray-400 text-sm">
            Complete this test to see your rank among {exam.attemptCount.toLocaleString()}+ students
          </div>
        </div>
      </div>
    </div>
  );
}
