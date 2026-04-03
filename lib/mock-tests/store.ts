"use client";

import { create } from "zustand";
import type { MockExam, UserAnswer, TestStatus, TestAttempt, SubjectScore } from "./types";

interface TestState {
  // Current test
  exam: MockExam | null;
  status: TestStatus;
  currentQuestionIndex: number;
  answers: Map<string, UserAnswer>;
  startTime: number | null;
  questionStartTime: number | null;
  timeRemaining: number; // seconds

  // Actions
  startTest: (exam: MockExam) => void;
  selectAnswer: (questionId: string, optionId: string) => void;
  toggleMark: (questionId: string) => void;
  goToQuestion: (index: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  tick: () => void;
  submitTest: (userName: string) => TestAttempt;
  resetTest: () => void;
}

export const useTestStore = create<TestState>((set, get) => ({
  exam: null,
  status: "not-started",
  currentQuestionIndex: 0,
  answers: new Map(),
  startTime: null,
  questionStartTime: null,
  timeRemaining: 0,

  startTest: (exam) => {
    const answers = new Map<string, UserAnswer>();
    exam.questions.forEach((q) => {
      answers.set(q.id, {
        questionId: q.id,
        selectedOptionId: null,
        isMarked: false,
        timeTaken: 0,
      });
    });
    set({
      exam,
      status: "in-progress",
      currentQuestionIndex: 0,
      answers,
      startTime: Date.now(),
      questionStartTime: Date.now(),
      timeRemaining: exam.duration * 60,
    });
  },

  selectAnswer: (questionId, optionId) => {
    const { answers } = get();
    const existing = answers.get(questionId);
    if (!existing) return;
    const newAnswers = new Map(answers);
    newAnswers.set(questionId, { ...existing, selectedOptionId: optionId });
    set({ answers: newAnswers });
  },

  toggleMark: (questionId) => {
    const { answers } = get();
    const existing = answers.get(questionId);
    if (!existing) return;
    const newAnswers = new Map(answers);
    newAnswers.set(questionId, { ...existing, isMarked: !existing.isMarked });
    set({ answers: newAnswers });
  },

  goToQuestion: (index) => {
    const { exam, answers, currentQuestionIndex, questionStartTime } = get();
    if (!exam) return;
    // Track time on current question
    const currentQ = exam.questions[currentQuestionIndex];
    if (currentQ && questionStartTime) {
      const elapsed = (Date.now() - questionStartTime) / 1000;
      const existing = answers.get(currentQ.id);
      if (existing) {
        const newAnswers = new Map(answers);
        newAnswers.set(currentQ.id, {
          ...existing,
          timeTaken: existing.timeTaken + elapsed,
        });
        set({ answers: newAnswers });
      }
    }
    set({ currentQuestionIndex: index, questionStartTime: Date.now() });
  },

  nextQuestion: () => {
    const { exam, currentQuestionIndex } = get();
    if (!exam || currentQuestionIndex >= exam.questions.length - 1) return;
    get().goToQuestion(currentQuestionIndex + 1);
  },

  prevQuestion: () => {
    const { currentQuestionIndex } = get();
    if (currentQuestionIndex <= 0) return;
    get().goToQuestion(currentQuestionIndex - 1);
  },

  tick: () => {
    const { timeRemaining } = get();
    if (timeRemaining <= 0) return;
    set({ timeRemaining: timeRemaining - 1 });
  },

  submitTest: (userName) => {
    const { exam, answers, startTime } = get();
    if (!exam) throw new Error("No exam in progress");

    const totalTime = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;
    let score = 0;

    const subjectMap = new Map<string, SubjectScore>();

    exam.questions.forEach((q) => {
      const answer = answers.get(q.id);
      if (!subjectMap.has(q.subject)) {
        subjectMap.set(q.subject, {
          subject: q.subject,
          correct: 0,
          incorrect: 0,
          unanswered: 0,
          score: 0,
          total: 0,
          percentage: 0,
        });
      }
      const subj = subjectMap.get(q.subject)!;
      subj.total += q.marks;

      if (!answer?.selectedOptionId) {
        unanswered++;
        subj.unanswered++;
      } else if (answer.selectedOptionId === q.correctOptionId) {
        correct++;
        score += q.marks;
        subj.correct++;
        subj.score += q.marks;
      } else {
        incorrect++;
        score -= exam.negativeMarking;
        subj.incorrect++;
        subj.score -= exam.negativeMarking;
      }
    });

    subjectMap.forEach((s) => {
      s.percentage = s.total > 0 ? Math.round((Math.max(0, s.score) / s.total) * 100) : 0;
    });

    const attempt: TestAttempt = {
      id: `attempt_${Date.now()}`,
      examId: exam.id,
      examName: exam.name,
      examCategory: exam.category,
      userName,
      answers: Array.from(answers.values()),
      score: Math.max(0, score),
      totalMarks: exam.totalMarks,
      correct,
      incorrect,
      unanswered,
      percentage: Math.round((Math.max(0, score) / exam.totalMarks) * 100),
      timeTaken: totalTime,
      completedAt: new Date().toISOString(),
      subjectWise: Array.from(subjectMap.values()),
    };

    set({ status: "completed" });
    return attempt;
  },

  resetTest: () => {
    set({
      exam: null,
      status: "not-started",
      currentQuestionIndex: 0,
      answers: new Map(),
      startTime: null,
      questionStartTime: null,
      timeRemaining: 0,
    });
  },
}));
