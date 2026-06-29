"use client";

import { useState, useCallback, useEffect } from "react";
import {
  ChevronLeft, ChevronRight, Flag, Send, AlertTriangle,
  X, CheckCircle2, LayoutGrid, Eye, EyeOff, Search,
  Maximize2, Minimize2, ShieldCheck, CircleDot, HelpCircle,
} from "lucide-react";
import { Button } from "../ui/button";
import { useTestStore } from "../../lib/mock-tests/store";
import { saveAttempt } from "../../lib/mock-tests/leaderboard";
import { generateAnalytics } from "../../lib/mock-tests/analytics";
import { TestTimer } from "./TestTimer";
import { QuestionNav } from "./QuestionNav";
import { CommandPalette } from "./CommandPalette";
import type { MockExam, TestAttempt, ConfidenceLevel } from "../../lib/mock-tests/types";

interface Props {
  exam: MockExam;
  onComplete: (attempt: TestAttempt) => void;
}

const confidenceOptions: { level: ConfidenceLevel; label: string; icon: React.ElementType; color: string; bg: string }[] = [
  { level: "sure", label: "Sure", icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100" },
  { level: "maybe", label: "Maybe", icon: CircleDot, color: "text-amber-600", bg: "bg-amber-50 border-amber-200 hover:bg-amber-100" },
  { level: "guess", label: "Guess", icon: HelpCircle, color: "text-red-500", bg: "bg-red-50 border-red-200 hover:bg-red-100" },
];

export function TestInterface({ exam, onComplete }: Props) {
  const {
    status, currentQuestionIndex, answers, timeRemaining,
    startTest, selectAnswer, clearAnswer, setConfidence, toggleMark,
    nextQuestion, prevQuestion, goToQuestion, submitTest, resetTest,
  } = useTestStore();

  const [showNav, setShowNav] = useState(true);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [userName, setUserName] = useState("");

  // Start test on mount
  useEffect(() => {
    startTest(exam);
    const savedName = typeof window !== "undefined" ? localStorage.getItem("mock_test_username") || "" : "";
    setUserName(savedName);
    return () => resetTest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeRemaining <= 0 && status === "in-progress") {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining, status]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Command palette
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setShowCommandPalette((v) => !v);
        return;
      }
      // Slash also opens command palette
      if (e.key === "/" && !e.ctrlKey && !e.metaKey && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        setShowCommandPalette(true);
        return;
      }
      // Arrow keys for navigation (when not in input)
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "ArrowLeft" || e.key === "p") prevQuestion();
      if (e.key === "ArrowRight" || e.key === "n") nextQuestion();
      // Number keys 1-4 for options
      if (["1", "2", "3", "4"].includes(e.key)) {
        const q = exam.questions[currentQuestionIndex];
        const optIdx = parseInt(e.key) - 1;
        if (q?.options[optIdx]) selectAnswer(q.id, q.options[optIdx].id);
      }
      // M for mark
      if (e.key === "m") {
        const q = exam.questions[currentQuestionIndex];
        if (q) toggleMark(q.id);
      }
      // F for fullscreen
      if (e.key === "f" && !e.ctrlKey) toggleFullscreen();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, exam]);

  const handleSubmit = useCallback(() => {
    const name = userName || "Anonymous Student";
    if (typeof window !== "undefined") localStorage.setItem("mock_test_username", name);
    const attempt = submitTest(name);
    // Generate analytics and attach
    attempt.analytics = generateAnalytics(attempt, exam);
    saveAttempt(attempt);
    onComplete(attempt);
  }, [userName, submitTest, onComplete, exam]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  if (status !== "in-progress" || !exam) return null;

  const currentQuestion = exam.questions[currentQuestionIndex];
  const currentAnswer = answers.get(currentQuestion.id);
  const answeredCount = Array.from(answers.values()).filter((a) => a.selectedOptionId).length;
  const markedCount = Array.from(answers.values()).filter((a) => a.isMarked).length;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-50">
      {/* Command Palette */}
      <CommandPalette open={showCommandPalette} onClose={() => setShowCommandPalette(false)} />

      {/* Top Bar */}
      <div className="flex items-center justify-between border-b bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-bold text-gray-900 sm:text-base line-clamp-1">{exam.name}</h1>
          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700 font-medium">
              {answeredCount}/{exam.totalQuestions} answered
            </span>
            {markedCount > 0 && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700 font-medium">
                {markedCount} marked
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Command Palette Trigger */}
          <button
            onClick={() => setShowCommandPalette(true)}
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Jump to...</span>
            <kbd className="ml-1 rounded bg-gray-100 px-1 py-0.5 text-[10px] font-mono">Ctrl+K</kbd>
          </button>

          <TestTimer />

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="hidden sm:flex rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            title="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>

          <button
            onClick={() => setShowNav(!showNav)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 sm:hidden"
          >
            <LayoutGrid className="h-5 w-5" />
          </button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowSubmitDialog(true)}
            className="hidden sm:flex"
          >
            <Send className="h-4 w-4 mr-1" /> Submit
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Question Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="mx-auto max-w-3xl">
            {/* Question Header */}
            <div className="mb-6 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                    {currentQuestionIndex + 1}
                  </span>
                  <span className="text-sm text-gray-400">of {exam.totalQuestions}</span>
                  <span className={`ml-2 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase ${
                    currentQuestion.difficulty === "Hard"
                      ? "bg-red-100 text-red-700"
                      : currentQuestion.difficulty === "Medium"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-green-100 text-green-700"
                  }`}>
                    {currentQuestion.difficulty}
                  </span>
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-medium text-gray-500">
                    {currentQuestion.topic}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {currentQuestion.marks} mark{currentQuestion.marks > 1 ? "s" : ""}
                  {exam.negativeMarking > 0 && (
                    <> | -{exam.negativeMarking} for wrong answer</>
                  )}
                </span>
              </div>
              <button
                onClick={() => toggleMark(currentQuestion.id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  currentAnswer?.isMarked
                    ? "bg-amber-100 text-amber-700 shadow-sm"
                    : "bg-gray-100 text-gray-500 hover:bg-amber-50 hover:text-amber-600"
                }`}
              >
                <Flag className="h-3.5 w-3.5" />
                {currentAnswer?.isMarked ? "Marked" : "Mark for Review"}
              </button>
            </div>

            {/* Question Text */}
            <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
              <p className="text-base sm:text-lg font-medium text-gray-900 leading-relaxed whitespace-pre-wrap">
                {currentQuestion.text}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = currentAnswer?.selectedOptionId === option.id;
                const letter = String.fromCharCode(65 + idx);

                return (
                  <button
                    key={option.id}
                    onClick={() => selectAnswer(currentQuestion.id, option.id)}
                    className={`group w-full flex items-center gap-4 rounded-2xl border-2 p-4 sm:p-5 text-left transition-all duration-200 ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100"
                        : "border-gray-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/30 hover:shadow-sm"
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-all ${
                        isSelected
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-300"
                          : "bg-gray-100 text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-600"
                      }`}
                    >
                      {letter}
                    </span>
                    <span className={`flex-1 text-sm sm:text-base ${isSelected ? "text-indigo-900 font-medium" : "text-gray-700"}`}>
                      {option.text}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="ml-auto h-5 w-5 text-indigo-600 shrink-0" />
                    )}
                    {/* Keyboard hint */}
                    <span className="hidden sm:inline text-[10px] text-gray-300 shrink-0 font-mono">{idx + 1}</span>
                  </button>
                );
              })}
            </div>

            {/* Confidence Tags + Clear */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {currentAnswer?.selectedOptionId && (
                <>
                  {/* Confidence Tags */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-400 mr-1">Confidence:</span>
                    {confidenceOptions.map(({ level, label, icon: Icon, color, bg }) => (
                      <button
                        key={level}
                        onClick={() => setConfidence(currentQuestion.id, level)}
                        className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                          currentAnswer.confidence === level
                            ? `${bg} ${color} shadow-sm ring-1 ring-current/20`
                            : "border-gray-200 text-gray-400 hover:bg-gray-50"
                        }`}
                      >
                        <Icon className="h-3 w-3" />
                        {label}
                      </button>
                    ))}
                  </div>

                  <div className="h-4 w-px bg-gray-200" />

                  {/* Clear Selection */}
                  <button
                    onClick={() => clearAnswer(currentQuestion.id)}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Clear selection
                  </button>
                </>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="mt-8 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={prevQuestion}
                disabled={currentQuestionIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowSubmitDialog(true)}
                className="sm:hidden"
              >
                <Send className="h-4 w-4 mr-1" /> Submit
              </Button>

              {currentQuestionIndex < exam.totalQuestions - 1 ? (
                <Button onClick={nextQuestion}>
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button
                  variant="gradient"
                  onClick={() => setShowSubmitDialog(true)}
                >
                  <Send className="h-4 w-4 mr-1" /> Submit Test
                </Button>
              )}
            </div>

            {/* Keyboard Shortcuts Hint */}
            <div className="mt-4 flex flex-wrap justify-center gap-3 text-[10px] text-gray-300">
              <span><kbd className="px-1 py-0.5 rounded bg-gray-100 font-mono text-gray-400">1-4</kbd> select option</span>
              <span><kbd className="px-1 py-0.5 rounded bg-gray-100 font-mono text-gray-400">&larr;&rarr;</kbd> navigate</span>
              <span><kbd className="px-1 py-0.5 rounded bg-gray-100 font-mono text-gray-400">m</kbd> mark</span>
              <span><kbd className="px-1 py-0.5 rounded bg-gray-100 font-mono text-gray-400">/</kbd> jump to</span>
              <span><kbd className="px-1 py-0.5 rounded bg-gray-100 font-mono text-gray-400">f</kbd> fullscreen</span>
            </div>
          </div>
        </div>

        {/* Side Panel - Question Navigation */}
        {showNav && (
          <div className="hidden sm:block w-72 border-l bg-white overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-700">Questions</h3>
              <button onClick={() => setShowNav(false)} className="text-gray-400 hover:text-gray-600">
                <EyeOff className="h-4 w-4" />
              </button>
            </div>
            <QuestionNav />
          </div>
        )}

        {!showNav && (
          <button
            onClick={() => setShowNav(true)}
            className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 items-center justify-center h-10 w-6 rounded-l-lg bg-white border border-r-0 border-gray-200 text-gray-400 hover:text-gray-600 shadow-sm"
          >
            <Eye className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Mobile Nav Drawer */}
      {showNav && (
        <div className="sm:hidden fixed inset-0 z-[55] bg-black/40" onClick={() => setShowNav(false)}>
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white p-4 overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-700">Questions</h3>
              <button onClick={() => setShowNav(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <QuestionNav />
          </div>
        </div>
      )}

      {/* Submit Confirmation Dialog */}
      {showSubmitDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Submit Test?</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="mb-6 rounded-2xl bg-gray-50 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Answered</span>
                <span className="font-bold text-emerald-600">{answeredCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Unanswered</span>
                <span className="font-bold text-red-500">{exam.totalQuestions - answeredCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Marked for Review</span>
                <span className="font-bold text-amber-600">{markedCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Confidence Tagged</span>
                <span className="font-bold text-indigo-600">
                  {Array.from(answers.values()).filter((a) => a.confidence).length}
                </span>
              </div>
            </div>

            {/* Name Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Your Name (for leaderboard)
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowSubmitDialog(false)}
              >
                <X className="h-4 w-4 mr-1" /> Continue Test
              </Button>
              <Button
                variant="gradient"
                className="flex-1"
                onClick={handleSubmit}
              >
                <Send className="h-4 w-4 mr-1" /> Submit Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
