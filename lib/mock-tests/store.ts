"use client";

import { create } from "zustand";
import type {
  MockExam, UserAnswer, TestStatus, TestAttempt, SubjectScore,
  ConfidenceLevel, QuestionTelemetry, TelemetryEvent,
} from "./types";

interface TestState {
  // Current test
  exam: MockExam | null;
  status: TestStatus;
  currentQuestionIndex: number;
  answers: Map<string, UserAnswer>;
  telemetry: Map<string, QuestionTelemetry>;
  startTime: number | null;
  questionStartTime: number | null;
  timeRemaining: number; // seconds
  visitedQuestions: Set<number>; // track which questions have been visited

  // Actions
  startTest: (exam: MockExam) => void;
  selectAnswer: (questionId: string, optionId: string) => void;
  clearAnswer: (questionId: string) => void;
  setConfidence: (questionId: string, level: ConfidenceLevel) => void;
  toggleMark: (questionId: string) => void;
  goToQuestion: (index: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  tick: () => void;
  submitTest: (userName: string) => TestAttempt;
  resetTest: () => void;

  // Derived getters
  getAnsweredCount: () => number;
  getMarkedCount: () => number;
  getPaceStatus: () => "ahead" | "on-track" | "behind";
  getElapsedSeconds: () => number;
}

function addTelemetryEvent(
  telemetry: Map<string, QuestionTelemetry>,
  questionId: string,
  event: Omit<TelemetryEvent, "timestamp">
): Map<string, QuestionTelemetry> {
  const newTelemetry = new Map(telemetry);
  const existing = newTelemetry.get(questionId) || { questionId, events: [] };
  newTelemetry.set(questionId, {
    ...existing,
    events: [...existing.events, { ...event, timestamp: Date.now() }],
  });
  return newTelemetry;
}

export const useTestStore = create<TestState>((set, get) => ({
  exam: null,
  status: "not-started",
  currentQuestionIndex: 0,
  answers: new Map(),
  telemetry: new Map(),
  startTime: null,
  questionStartTime: null,
  timeRemaining: 0,
  visitedQuestions: new Set(),

  startTest: (exam) => {
    const now = Date.now();
    const answers = new Map<string, UserAnswer>();
    const telemetry = new Map<string, QuestionTelemetry>();

    exam.questions.forEach((q) => {
      answers.set(q.id, {
        questionId: q.id,
        selectedOptionId: null,
        isMarked: false,
        timeTaken: 0,
        confidence: null,
        answerChanges: 0,
        revisitCount: 0,
        firstViewTimestamp: 0,
        answerTimestamp: null,
      });
      telemetry.set(q.id, { questionId: q.id, events: [] });
    });

    // Mark first question as viewed
    const firstQ = exam.questions[0];
    if (firstQ) {
      const firstAnswer = answers.get(firstQ.id)!;
      firstAnswer.firstViewTimestamp = now;
      const firstTelemetry = telemetry.get(firstQ.id)!;
      firstTelemetry.events.push({ type: "view", timestamp: now });
    }

    set({
      exam,
      status: "in-progress",
      currentQuestionIndex: 0,
      answers,
      telemetry,
      startTime: now,
      questionStartTime: now,
      timeRemaining: exam.duration * 60,
      visitedQuestions: new Set([0]),
    });
  },

  selectAnswer: (questionId, optionId) => {
    const { answers, telemetry } = get();
    const existing = answers.get(questionId);
    if (!existing) return;

    const isChange = existing.selectedOptionId !== null && existing.selectedOptionId !== optionId;
    const newAnswers = new Map(answers);
    newAnswers.set(questionId, {
      ...existing,
      selectedOptionId: optionId,
      answerChanges: existing.answerChanges + (isChange ? 1 : 0),
      answerTimestamp: Date.now(),
    });

    const newTelemetry = addTelemetryEvent(telemetry, questionId, {
      type: isChange ? "change" : "answer",
      data: optionId,
    });

    set({ answers: newAnswers, telemetry: newTelemetry });
  },

  clearAnswer: (questionId) => {
    const { answers, telemetry } = get();
    const existing = answers.get(questionId);
    if (!existing) return;

    const newAnswers = new Map(answers);
    newAnswers.set(questionId, {
      ...existing,
      selectedOptionId: null,
      answerTimestamp: null,
      confidence: null,
    });

    const newTelemetry = addTelemetryEvent(telemetry, questionId, { type: "clear" });
    set({ answers: newAnswers, telemetry: newTelemetry });
  },

  setConfidence: (questionId, level) => {
    const { answers } = get();
    const existing = answers.get(questionId);
    if (!existing) return;
    const newAnswers = new Map(answers);
    newAnswers.set(questionId, { ...existing, confidence: level });
    set({ answers: newAnswers });
  },

  toggleMark: (questionId) => {
    const { answers, telemetry } = get();
    const existing = answers.get(questionId);
    if (!existing) return;
    const newAnswers = new Map(answers);
    const newMarked = !existing.isMarked;
    newAnswers.set(questionId, { ...existing, isMarked: newMarked });

    const newTelemetry = addTelemetryEvent(telemetry, questionId, {
      type: newMarked ? "mark" : "unmark",
    });
    set({ answers: newAnswers, telemetry: newTelemetry });
  },

  goToQuestion: (index) => {
    const { exam, answers, telemetry, currentQuestionIndex, questionStartTime, visitedQuestions } = get();
    if (!exam) return;

    const now = Date.now();

    // Track time on current question + emit leave event
    const currentQ = exam.questions[currentQuestionIndex];
    let newAnswers = new Map(answers);
    let newTelemetry = new Map(telemetry);

    if (currentQ && questionStartTime) {
      const elapsed = (now - questionStartTime) / 1000;
      const existing = newAnswers.get(currentQ.id);
      if (existing) {
        newAnswers.set(currentQ.id, {
          ...existing,
          timeTaken: existing.timeTaken + elapsed,
        });
      }
      newTelemetry = addTelemetryEvent(newTelemetry, currentQ.id, { type: "leave" });
    }

    // Track revisit on target question + emit view event
    const targetQ = exam.questions[index];
    if (targetQ) {
      const targetAnswer = newAnswers.get(targetQ.id);
      if (targetAnswer) {
        const isRevisit = visitedQuestions.has(index);
        newAnswers.set(targetQ.id, {
          ...targetAnswer,
          revisitCount: targetAnswer.revisitCount + (isRevisit ? 1 : 0),
          firstViewTimestamp: targetAnswer.firstViewTimestamp || now,
        });
      }
      newTelemetry = addTelemetryEvent(newTelemetry, targetQ.id, { type: "view" });
    }

    const newVisited = new Set(visitedQuestions);
    newVisited.add(index);

    set({
      currentQuestionIndex: index,
      questionStartTime: now,
      answers: newAnswers,
      telemetry: newTelemetry,
      visitedQuestions: newVisited,
    });
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
    const { exam, answers, telemetry, startTime, currentQuestionIndex, questionStartTime } = get();
    if (!exam) throw new Error("No exam in progress");

    // Finalize time on current question
    const now = Date.now();
    const finalAnswers = new Map(answers);
    const currentQ = exam.questions[currentQuestionIndex];
    if (currentQ && questionStartTime) {
      const elapsed = (now - questionStartTime) / 1000;
      const existing = finalAnswers.get(currentQ.id);
      if (existing) {
        finalAnswers.set(currentQ.id, {
          ...existing,
          timeTaken: existing.timeTaken + elapsed,
        });
      }
    }

    const totalTime = startTime ? Math.floor((now - startTime) / 1000) : 0;
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;
    let score = 0;

    const subjectMap = new Map<string, SubjectScore>();

    exam.questions.forEach((q) => {
      const answer = finalAnswers.get(q.id);
      if (!subjectMap.has(q.subject)) {
        subjectMap.set(q.subject, {
          subject: q.subject,
          correct: 0, incorrect: 0, unanswered: 0,
          score: 0, total: 0, percentage: 0,
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
      answers: Array.from(finalAnswers.values()),
      score: Math.max(0, score),
      totalMarks: exam.totalMarks,
      correct,
      incorrect,
      unanswered,
      percentage: Math.round((Math.max(0, score) / exam.totalMarks) * 100),
      timeTaken: totalTime,
      completedAt: new Date().toISOString(),
      subjectWise: Array.from(subjectMap.values()),
      telemetry: Array.from(telemetry.values()),
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
      telemetry: new Map(),
      startTime: null,
      questionStartTime: null,
      timeRemaining: 0,
      visitedQuestions: new Set(),
    });
  },

  // --- Derived getters ---
  getAnsweredCount: () => {
    const { answers } = get();
    return Array.from(answers.values()).filter((a) => a.selectedOptionId).length;
  },

  getMarkedCount: () => {
    const { answers } = get();
    return Array.from(answers.values()).filter((a) => a.isMarked).length;
  },

  getPaceStatus: () => {
    const { exam, startTime, answers } = get();
    if (!exam || !startTime) return "on-track";

    const elapsed = (Date.now() - startTime) / 1000;
    const totalDuration = exam.duration * 60;
    const timeProgress = elapsed / totalDuration;
    const answeredCount = Array.from(answers.values()).filter((a) => a.selectedOptionId).length;
    const questionProgress = answeredCount / exam.totalQuestions;

    const diff = questionProgress - timeProgress;
    if (diff > 0.05) return "ahead";
    if (diff < -0.1) return "behind";
    return "on-track";
  },

  getElapsedSeconds: () => {
    const { startTime } = get();
    if (!startTime) return 0;
    return Math.floor((Date.now() - startTime) / 1000);
  },
}));
