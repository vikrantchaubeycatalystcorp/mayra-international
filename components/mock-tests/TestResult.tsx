"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Trophy, Target, Clock, TrendingUp, CheckCircle2, XCircle, MinusCircle,
  ArrowRight, ChevronDown, ChevronUp, Award, Flame, RotateCcw,
  BarChart3, Zap, Crown, Star, Brain, AlertTriangle, ShieldCheck,
  CircleDot, HelpCircle, Activity, Eye, Timer, Gauge, Sparkles,
  RefreshCw, Filter, ChevronRight,
} from "lucide-react";
import { Button } from "../ui/button";
import { calculatePercentile, getUserStats } from "../../lib/mock-tests/leaderboard";
import { generateAnalytics, getSmartFilters, filterQuestionsBySmartFilter } from "../../lib/mock-tests/analytics";
import { getRecommendations } from "../../lib/mock-tests/recommendations";
import type { TestAttempt, MockExam, SmartFilterType, AttemptAnalytics, ReattemptMode } from "../../lib/mock-tests/types";

interface Props {
  attempt: TestAttempt;
  exam: MockExam;
  onReattempt?: (mode: ReattemptMode) => void;
}

export function TestResult({ attempt, exam, onReattempt }: Props) {
  const [showSolutions, setShowSolutions] = useState(false);
  const [expandedQ, setExpandedQ] = useState<string | null>(null);
  const [confetti, setConfetti] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "diagnosis" | "timeline" | "solutions">("overview");
  const [smartFilter, setSmartFilter] = useState<SmartFilterType>("all");

  const stats = getUserStats();
  const percentile = calculatePercentile(attempt.percentage, attempt.examId);
  const analytics = useMemo(() => attempt.analytics || generateAnalytics(attempt, exam), [attempt, exam]);
  const smartFilters = useMemo(() => getSmartFilters(attempt, exam), [attempt, exam]);
  const recommendations = useMemo(() => getRecommendations(3), []);
  const filteredQIds = useMemo(() => filterQuestionsBySmartFilter(smartFilter, attempt, exam), [smartFilter, attempt, exam]);

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
  const answerMap = new Map(attempt.answers.map((a) => [a.questionId, a]));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4">
      {/* Confetti */}
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

      <div className="mx-auto max-w-5xl">
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

              {/* Score Circle + Key Metrics */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-8">
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

                {/* Key insight metrics */}
                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="rounded-xl bg-white/10 px-4 py-2.5 backdrop-blur-sm">
                    <p className="text-[10px] uppercase tracking-wide text-indigo-300">Percentile</p>
                    <p className="text-xl font-black">{analytics.predictedPercentileBand.low}-{analytics.predictedPercentileBand.high}%</p>
                  </div>
                  <div className="rounded-xl bg-white/10 px-4 py-2.5 backdrop-blur-sm">
                    <p className="text-[10px] uppercase tracking-wide text-indigo-300">Avg Time/Q</p>
                    <p className="text-xl font-black">{analytics.avgTimePerQuestion}s</p>
                  </div>
                  <div className="rounded-xl bg-white/10 px-4 py-2.5 backdrop-blur-sm">
                    <p className="text-[10px] uppercase tracking-wide text-indigo-300">Neg. Mark Loss</p>
                    <p className="text-xl font-black text-red-300">-{analytics.negativeMarkLoss}</p>
                  </div>
                  <div className="rounded-xl bg-white/10 px-4 py-2.5 backdrop-blur-sm">
                    <p className="text-[10px] uppercase tracking-wide text-indigo-300">Effort Quality</p>
                    <p className="text-xl font-black">{analytics.effortQualityScore}%</p>
                  </div>
                </div>
              </div>

              {/* Percentile Badge */}
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

        {/* Tab Navigation */}
        <div className="mt-8 flex gap-1 rounded-xl bg-gray-100 p-1">
          {([
            { id: "overview", label: "Overview", icon: BarChart3 },
            { id: "diagnosis", label: "Diagnosis", icon: Brain },
            { id: "timeline", label: "Timeline", icon: Activity },
            { id: "solutions", label: "Solutions", icon: Eye },
          ] as const).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                activeTab === id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "overview" && (
            <OverviewTab
              attempt={attempt}
              exam={exam}
              analytics={analytics}
              stats={stats}
              recommendations={recommendations}
              onReattempt={onReattempt}
            />
          )}
          {activeTab === "diagnosis" && (
            <DiagnosisTab attempt={attempt} exam={exam} analytics={analytics} />
          )}
          {activeTab === "timeline" && (
            <TimelineTab attempt={attempt} exam={exam} analytics={analytics} />
          )}
          {activeTab === "solutions" && (
            <SolutionsTab
              attempt={attempt}
              exam={exam}
              smartFilters={smartFilters}
              smartFilter={smartFilter}
              setSmartFilter={setSmartFilter}
              filteredQIds={filteredQIds}
              expandedQ={expandedQ}
              setExpandedQ={setExpandedQ}
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {onReattempt ? (
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="gradient" size="lg" onClick={() => onReattempt("full")}>
                <RotateCcw className="h-4 w-4 mr-2" /> Retake Full Test
              </Button>
              {attempt.incorrect > 0 && (
                <Button variant="outline" size="lg" onClick={() => onReattempt("wrong-only")}>
                  <RefreshCw className="h-4 w-4 mr-2" /> Wrong Only ({attempt.incorrect})
                </Button>
              )}
              {attempt.subjectWise.some((s) => s.percentage < 50) && (
                <Button variant="outline" size="lg" onClick={() => onReattempt("weak-topic")}>
                  <Target className="h-4 w-4 mr-2" /> Weak Topics
                </Button>
              )}
            </div>
          ) : (
            <Link href={`/mock-tests/${exam.slug}`}>
              <Button variant="gradient" size="lg" className="w-full sm:w-auto">
                <RotateCcw className="h-4 w-4 mr-2" /> Retake Test
              </Button>
            </Link>
          )}
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

// --- Overview Tab ---
function OverviewTab({ attempt, exam, analytics, stats, recommendations, onReattempt }: {
  attempt: TestAttempt;
  exam: MockExam;
  analytics: AttemptAnalytics;
  stats: ReturnType<typeof getUserStats>;
  recommendations: ReturnType<typeof getRecommendations>;
  onReattempt?: (mode: ReattemptMode) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Exam Temperament Scores */}
      <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-1">Exam Temperament</h3>
        <p className="text-xs text-gray-400 mb-4">How you behaved during the exam</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <TemperamentGauge label="Focus" value={analytics.temperament.focusScore} icon={Eye} />
          <TemperamentGauge label="Consistency" value={analytics.temperament.consistencyScore} icon={Activity} />
          <TemperamentGauge label="Calm" value={analytics.temperament.panicScore} icon={ShieldCheck} />
          <TemperamentGauge label="Endurance" value={analytics.temperament.enduranceScore} icon={Timer} />
          <TemperamentGauge label="Calibration" value={analytics.temperament.confidenceCalibration} icon={Gauge} />
        </div>
      </div>

      {/* Streak + Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2">
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
      <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Subject-wise Analysis</h3>
        <div className="space-y-4">
          {attempt.subjectWise.map((s) => {
            const negLoss = analytics.negativeMarkBySubject.find((n) => n.subject === s.subject);
            return (
              <div key={s.subject}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-700">{s.subject}</span>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-emerald-600">{s.correct} correct</span>
                    <span className="text-red-500">{s.incorrect} wrong</span>
                    {negLoss && negLoss.loss > 0 && (
                      <span className="text-red-400">(-{negLoss.loss} neg)</span>
                    )}
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
            );
          })}
        </div>
      </div>

      {/* Badges */}
      {stats.badges.length > 0 && (
        <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
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

      {/* Personalized Recommendations */}
      {recommendations.length > 0 && (
        <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" /> Recommended Next
          </h3>
          <p className="text-xs text-gray-500 mb-4">Personalized based on your performance</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {recommendations.map((rec) => (
              <Link key={rec.examId} href={`/mock-tests/${rec.examSlug}`}>
                <div className="group rounded-xl bg-white border border-gray-200 p-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all">
                  <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${rec.gradient} text-white text-sm`}>
                    <Target className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-bold text-gray-900 line-clamp-1">{rec.examName}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{rec.reason}</p>
                  <div className="mt-2 flex items-center gap-1 text-xs text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Take Test <ChevronRight className="h-3 w-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Diagnosis Tab ---
function DiagnosisTab({ attempt, exam, analytics }: {
  attempt: TestAttempt;
  exam: MockExam;
  analytics: AttemptAnalytics;
}) {
  const { taxonomy } = analytics;

  const taxonomyItems = [
    { label: "Careless Mistakes", ids: taxonomy.carelessMistakes, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", desc: "Easy questions you got wrong quickly" },
    { label: "Too Fast, Wrong", ids: taxonomy.tooFastWrong, icon: Zap, color: "text-orange-600", bg: "bg-orange-50", desc: "Rushed and answered incorrectly" },
    { label: "Overtime, Still Wrong", ids: taxonomy.overtimeWrong, icon: Clock, color: "text-purple-600", bg: "bg-purple-50", desc: "Spent too long but still missed" },
    { label: "Overthought", ids: taxonomy.overthought, icon: Brain, color: "text-pink-600", bg: "bg-pink-50", desc: "Easy questions you spent too long on and got wrong" },
    { label: "Perfect Execution", ids: taxonomy.perfectExecution, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", desc: "Right time, right answer" },
    { label: "Confident & Correct", ids: taxonomy.confidentCorrect, icon: ShieldCheck, color: "text-green-600", bg: "bg-green-50", desc: "Marked sure and got it right" },
    { label: "Lucky Guesses", ids: taxonomy.guessedCorrect, icon: Sparkles, color: "text-amber-600", bg: "bg-amber-50", desc: "Guessed but got lucky" },
  ];

  return (
    <div className="space-y-6">
      {/* Story-first Report */}
      <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-2">What Happened</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <p>
            You scored <strong className="text-gray-900">{attempt.percentage}%</strong> ({attempt.score}/{attempt.totalMarks})
            in {formatTimeShort(attempt.timeTaken)}.
            {attempt.incorrect > 0 && analytics.negativeMarkLoss > 0 && (
              <> You lost <strong className="text-red-600">{analytics.negativeMarkLoss} marks</strong> to negative marking.</>
            )}
          </p>
          {taxonomy.carelessMistakes.length > 0 && (
            <p className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
              <span><strong>{taxonomy.carelessMistakes.length} careless mistake{taxonomy.carelessMistakes.length > 1 ? "s" : ""}</strong> on easy questions cost you marks you should have earned.</span>
            </p>
          )}
          {taxonomy.overtimeWrong.length > 0 && (
            <p className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
              <span>You spent excessive time on <strong>{taxonomy.overtimeWrong.length} question{taxonomy.overtimeWrong.length > 1 ? "s" : ""}</strong> and still got them wrong. Consider moving on faster.</span>
            </p>
          )}
          {analytics.temperament.panicScore < 40 && (
            <p className="flex items-start gap-2">
              <Activity className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
              <span>Your accuracy dropped significantly in the last portion. Practice maintaining composure under time pressure.</span>
            </p>
          )}
        </div>

        {/* What to do today */}
        <div className="mt-4 rounded-xl bg-indigo-50 border border-indigo-100 p-4">
          <h4 className="text-sm font-bold text-indigo-900 mb-2">What to do today</h4>
          <ul className="space-y-1.5 text-sm text-indigo-700">
            {taxonomy.carelessMistakes.length > 2 && (
              <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 shrink-0" /> Review your {taxonomy.carelessMistakes.length} careless mistakes - these are free marks</li>
            )}
            {attempt.subjectWise.filter((s) => s.percentage < 40).map((s) => (
              <li key={s.subject} className="flex items-center gap-2"><ChevronRight className="h-3 w-3 shrink-0" /> Practice {s.subject} ({s.percentage}%) - your weakest area</li>
            ))}
            {analytics.temperament.confidenceCalibration < 50 && (
              <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 shrink-0" /> Your confidence doesn&apos;t match your accuracy - practice self-assessment</li>
            )}
            <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 shrink-0" /> Take another test tomorrow to build your streak</li>
          </ul>
        </div>
      </div>

      {/* Question Taxonomy Grid */}
      <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-1">Question Behavior Analysis</h3>
        <p className="text-xs text-gray-400 mb-4">How you approached each type of question</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {taxonomyItems.filter((t) => t.ids.length > 0).map((t) => {
            const Icon = t.icon;
            return (
              <div key={t.label} className={`rounded-xl ${t.bg} border p-4`}>
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`h-4 w-4 ${t.color}`} />
                  <span className="text-sm font-bold text-gray-900">{t.label}</span>
                  <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-bold ${t.color} bg-white`}>
                    {t.ids.length}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{t.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Speed-Accuracy Curve */}
      {analytics.speedAccuracyCurve.length > 0 && (
        <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Speed vs Accuracy</h3>
          <p className="text-xs text-gray-400 mb-4">How your accuracy changes with speed</p>
          <div className="flex items-end gap-2 h-40">
            {analytics.speedAccuracyCurve.map((point, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-gray-600">{point.accuracy}%</span>
                <div
                  className={`w-full rounded-t-lg transition-all ${
                    point.accuracy >= 70 ? "bg-emerald-400" : point.accuracy >= 40 ? "bg-amber-400" : "bg-red-400"
                  }`}
                  style={{ height: `${Math.max(4, point.accuracy * 1.2)}px` }}
                />
                <span className="text-[10px] text-gray-400">{point.speed}s</span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-gray-400">
            <span>Faster</span>
            <span>Slower</span>
          </div>
        </div>
      )}

      {/* Behavior Scores */}
      <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Behavioral Indices</h3>
        <div className="space-y-3">
          <BehaviorBar label="Careless Error Index" value={analytics.carelessErrorIndex} inverted description="Lower is better - easy questions you missed" />
          <BehaviorBar label="Panic Window Index" value={analytics.panicWindowIndex} inverted description="Lower is better - accuracy drop in last 20%" />
          <BehaviorBar label="Consistency Index" value={analytics.consistencyIndex} description="Higher is better - even time distribution" />
          <BehaviorBar label="Effort Quality" value={analytics.effortQualityScore} description="Higher is better - how well you used your time" />
        </div>
      </div>
    </div>
  );
}

// --- Timeline Tab ---
function TimelineTab({ attempt, exam, analytics }: {
  attempt: TestAttempt;
  exam: MockExam;
  analytics: AttemptAnalytics;
}) {
  const answerMap = new Map(attempt.answers.map((a) => [a.questionId, a]));

  return (
    <div className="space-y-6">
      {/* Time Distribution */}
      <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-1">Time Per Question</h3>
        <p className="text-xs text-gray-400 mb-4">
          Average: {analytics.avgTimePerQuestion}s per question
        </p>
        <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
          {analytics.timeDistribution.map((td, i) => {
            const q = exam.questions.find((q) => q.id === td.questionId);
            const answer = answerMap.get(td.questionId);
            const isCorrect = q && answer?.selectedOptionId === q.correctOptionId;
            const isSkipped = !answer?.selectedOptionId;
            const maxTime = Math.max(...analytics.timeDistribution.map((t) => t.time), 1);
            const pct = (td.time / maxTime) * 100;

            return (
              <div key={td.questionId} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-6 text-right shrink-0">Q{i + 1}</span>
                <div className="flex-1 h-5 bg-gray-50 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isSkipped ? "bg-gray-300"
                      : isCorrect ? "bg-emerald-400"
                      : "bg-red-400"
                    }`}
                    style={{ width: `${Math.max(2, pct)}%` }}
                  />
                  {/* Average line */}
                  <div
                    className="absolute top-0 bottom-0 w-px bg-indigo-400 opacity-50"
                    style={{ left: `${(analytics.avgTimePerQuestion / maxTime) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-10 text-right shrink-0">{Math.round(td.time)}s</span>
                <span className="w-4 shrink-0">
                  {isSkipped ? <MinusCircle className="h-3.5 w-3.5 text-gray-300" />
                    : isCorrect ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    : <XCircle className="h-3.5 w-3.5 text-red-400" />
                  }
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-4 text-[10px] text-gray-400">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Correct</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-400" /> Wrong</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-gray-300" /> Skipped</span>
          <span className="flex items-center gap-1"><span className="h-2 w-px bg-indigo-400" /> Avg time</span>
        </div>
      </div>

      {/* Pace Chart */}
      {analytics.paceData.length > 0 && (
        <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Pace Analysis</h3>
          <p className="text-xs text-gray-400 mb-4">Were you ahead or behind the ideal pace?</p>
          <div className="flex items-end gap-0.5 h-32">
            {analytics.paceData.map((p, i) => {
              const diff = p.expectedSeconds - p.elapsedSeconds;
              const maxDiff = Math.max(...analytics.paceData.map((p) => Math.abs(p.expectedSeconds - p.elapsedSeconds)), 1);
              const height = Math.abs(diff) / maxDiff * 50;
              const isAhead = diff > 0;

              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full relative">
                  {/* Center line */}
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-200" />
                  <div
                    className={`w-full rounded-sm transition-all ${
                      isAhead ? "bg-emerald-400" : "bg-red-400"
                    }`}
                    style={{
                      height: `${Math.max(2, height)}%`,
                      marginTop: isAhead ? 'auto' : undefined,
                      marginBottom: isAhead ? undefined : 'auto',
                      position: 'absolute',
                      top: isAhead ? undefined : '50%',
                      bottom: isAhead ? '50%' : undefined,
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-gray-400">
            <span>Q1</span>
            <span>Q{analytics.paceData.length}</span>
          </div>
          <div className="mt-1 flex items-center justify-center gap-4 text-[10px] text-gray-400">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-emerald-400" /> Ahead</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-red-400" /> Behind</span>
          </div>
        </div>
      )}

      {/* Confidence vs Accuracy */}
      <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-1">Confidence Calibration</h3>
        <p className="text-xs text-gray-400 mb-4">How well your confidence matched your accuracy</p>
        <div className="grid grid-cols-3 gap-4">
          {(["sure", "maybe", "guess"] as const).map((level) => {
            const tagged = attempt.answers.filter((a) => a.confidence === level && a.selectedOptionId);
            const correct = tagged.filter((a) => {
              const q = exam.questions.find((q) => q.id === a.questionId);
              return q && a.selectedOptionId === q.correctOptionId;
            });
            const accuracy = tagged.length > 0 ? Math.round((correct.length / tagged.length) * 100) : 0;
            const Icon = level === "sure" ? ShieldCheck : level === "maybe" ? CircleDot : HelpCircle;
            const color = level === "sure" ? "text-emerald-600" : level === "maybe" ? "text-amber-600" : "text-red-500";

            return (
              <div key={level} className="text-center">
                <Icon className={`h-6 w-6 mx-auto mb-1 ${color}`} />
                <p className="text-2xl font-black text-gray-900">{accuracy}%</p>
                <p className="text-[10px] text-gray-400 capitalize">{level} ({tagged.length})</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// --- Solutions Tab ---
function SolutionsTab({ attempt, exam, smartFilters, smartFilter, setSmartFilter, filteredQIds, expandedQ, setExpandedQ }: {
  attempt: TestAttempt;
  exam: MockExam;
  smartFilters: ReturnType<typeof getSmartFilters>;
  smartFilter: SmartFilterType;
  setSmartFilter: (f: SmartFilterType) => void;
  filteredQIds: string[];
  expandedQ: string | null;
  setExpandedQ: (q: string | null) => void;
}) {
  const answerMap = new Map(attempt.answers.map((a) => [a.questionId, a]));

  return (
    <div className="space-y-4">
      {/* Smart Filters */}
      <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-gray-400" />
          <h3 className="text-sm font-bold text-gray-700">Smart Filters</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {smartFilters.map((f) => (
            <button
              key={f.id}
              onClick={() => setSmartFilter(f.id)}
              disabled={f.count === 0 && f.id !== "all"}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                smartFilter === f.id
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                  : f.count === 0 && f.id !== "all"
                    ? "border-gray-100 text-gray-300 cursor-not-allowed"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              {f.label} {f.count > 0 && <span className="ml-1 text-[10px] opacity-60">({f.count})</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Filtered Questions */}
      <div className="space-y-3">
        {exam.questions
          .filter((q) => filteredQIds.includes(q.id))
          .map((q, _) => {
            const globalIdx = exam.questions.indexOf(q);
            const answer = answerMap.get(q.id);
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
                    Q{globalIdx + 1}. {q.text}
                  </span>
                  {answer?.confidence && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      answer.confidence === "sure" ? "bg-emerald-100 text-emerald-600"
                      : answer.confidence === "maybe" ? "bg-amber-100 text-amber-600"
                      : "bg-red-100 text-red-500"
                    }`}>
                      {answer.confidence}
                    </span>
                  )}
                  {answer && answer.timeTaken > 0 && (
                    <span className="text-[10px] text-gray-400">{Math.round(answer.timeTaken)}s</span>
                  )}
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
                    {/* Question metadata */}
                    <div className="mb-3 flex flex-wrap gap-2 text-[10px]">
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-500">{q.difficulty}</span>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-500">{q.topic}</span>
                      {answer && answer.timeTaken > 0 && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-500">{Math.round(answer.timeTaken)}s spent</span>
                      )}
                      {answer?.answerChanges && answer.answerChanges > 0 && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-600">Changed {answer.answerChanges}x</span>
                      )}
                      {answer?.revisitCount && answer.revisitCount > 0 && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-600">Revisited {answer.revisitCount}x</span>
                      )}
                    </div>
                    <div className="rounded-xl bg-blue-50 p-3 text-sm text-blue-800">
                      <strong>Explanation:</strong> {q.explanation}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

        {filteredQIds.length === 0 && (
          <div className="py-12 text-center text-gray-400">
            <CheckCircle2 className="mx-auto h-8 w-8 mb-2" />
            <p className="text-sm font-medium">No questions match this filter</p>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Shared Components ---
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

function TemperamentGauge({ label, value, icon: Icon }: {
  label: string; value: number; icon: React.ElementType;
}) {
  const color = value >= 70 ? "text-emerald-600" : value >= 40 ? "text-amber-600" : "text-red-500";
  const ringColor = value >= 70 ? "stroke-emerald-500" : value >= 40 ? "stroke-amber-500" : "stroke-red-500";

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative mb-1">
        <svg className="h-16 w-16" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="25" fill="none" stroke="#f3f4f6" strokeWidth="4" />
          <circle
            cx="30" cy="30" r="25" fill="none" className={ringColor} strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${value * 1.57} 157`}
            transform="rotate(-90 30 30)"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
      </div>
      <span className={`text-lg font-black ${color}`}>{value}</span>
      <span className="text-[10px] text-gray-400">{label}</span>
    </div>
  );
}

function BehaviorBar({ label, value, inverted, description }: {
  label: string; value: number; inverted?: boolean; description: string;
}) {
  const effectiveValue = inverted ? 100 - value : value;
  const color = effectiveValue >= 70 ? "bg-emerald-400" : effectiveValue >= 40 ? "bg-amber-400" : "bg-red-400";
  const textColor = inverted
    ? (value <= 30 ? "text-emerald-600" : value <= 60 ? "text-amber-600" : "text-red-600")
    : (value >= 70 ? "text-emerald-600" : value >= 40 ? "text-amber-600" : "text-red-600");

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div>
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="ml-2 text-[10px] text-gray-400">{description}</span>
        </div>
        <span className={`text-sm font-bold ${textColor}`}>{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function formatTimeShort(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}
