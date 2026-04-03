import type { TestAttempt, TestRecommendation, MockExam } from "./types";
import { allExams } from "./data";
import { getSavedAttempts } from "./leaderboard";

/**
 * Generates personalized test recommendations based on past performance.
 * Core retention driver - "what should I do next?"
 */
export function getRecommendations(limit = 3): TestRecommendation[] {
  const attempts = getSavedAttempts();
  if (attempts.length === 0) return getDefaultRecommendations(limit);

  const recommendations: TestRecommendation[] = [];

  // 1. Weak subject recovery test
  const weakSubjectRec = getWeakSubjectRecommendation(attempts);
  if (weakSubjectRec) recommendations.push(weakSubjectRec);

  // 2. Category progression (try harder difficulty in same category)
  const progressionRec = getProgressionRecommendation(attempts);
  if (progressionRec) recommendations.push(progressionRec);

  // 3. New category exploration
  const explorationRec = getExplorationRecommendation(attempts);
  if (explorationRec) recommendations.push(explorationRec);

  // 4. Improvement retry (retake a test where they scored < 60%)
  const retryRec = getRetryRecommendation(attempts);
  if (retryRec) recommendations.push(retryRec);

  // Deduplicate by examId
  const seen = new Set<string>();
  const unique = recommendations.filter((r) => {
    if (seen.has(r.examId)) return false;
    seen.add(r.examId);
    return true;
  });

  return unique.slice(0, limit);
}

function getWeakSubjectRecommendation(attempts: TestAttempt[]): TestRecommendation | null {
  // Aggregate subject-wise performance across all attempts
  const subjectStats = new Map<string, { correct: number; total: number; category: string }>();

  attempts.forEach((a) => {
    a.subjectWise.forEach((s) => {
      const existing = subjectStats.get(s.subject) || { correct: 0, total: 0, category: a.examCategory };
      existing.correct += s.correct;
      existing.total += s.correct + s.incorrect + s.unanswered;
      subjectStats.set(s.subject, existing);
    });
  });

  // Find weakest subject
  const candidates: { subject: string; accuracy: number; category: string }[] = [];
  subjectStats.forEach((stats, subject) => {
    if (stats.total < 3) return;
    candidates.push({ subject, accuracy: stats.correct / stats.total, category: stats.category });
  });
  candidates.sort((a, b) => a.accuracy - b.accuracy);
  const weakest = candidates[0];

  if (!weakest || weakest.accuracy > 0.6) return null;

  // Find an exam that covers this subject
  const weakSubject = weakest.subject;
  const targetExam = allExams.find((e) =>
    e.questions.some((q) => q.subject === weakSubject) &&
    !attempts.some((a) => a.examId === e.id && a.percentage >= 70)
  );

  if (!targetExam) return null;

  return {
    examId: targetExam.id,
    examSlug: targetExam.slug,
    examName: targetExam.name,
    examCategory: targetExam.category,
    reason: `Strengthen your ${weakest.subject} (${Math.round(weakest.accuracy * 100)}% accuracy)`,
    priority: "high",
    estimatedDuration: targetExam.duration,
    focusAreas: [weakest.subject],
    icon: targetExam.icon,
    gradient: targetExam.gradient,
  };
}

function getProgressionRecommendation(attempts: TestAttempt[]): TestRecommendation | null {
  // Find categories where user scored well, suggest harder test
  const categoryBest = new Map<string, number>();
  attempts.forEach((a) => {
    const current = categoryBest.get(a.examCategory) || 0;
    if (a.percentage > current) categoryBest.set(a.examCategory, a.percentage);
  });

  const categoryEntries: { category: string; score: number }[] = [];
  categoryBest.forEach((score, category) => {
    if (score >= 60) categoryEntries.push({ category, score });
  });
  categoryEntries.sort((a, b) => b.score - a.score);
  const bestCategory = categoryEntries[0];

  if (!bestCategory) return null;

  const takenExamIds = new Set(attempts.map((a) => a.examId));
  const bestCat = bestCategory.category;
  const nextExam = allExams.find(
    (e) => e.category === bestCat && !takenExamIds.has(e.id)
  );

  if (!nextExam) return null;

  return {
    examId: nextExam.id,
    examSlug: nextExam.slug,
    examName: nextExam.name,
    examCategory: nextExam.category,
    reason: `You scored ${bestCategory.score}% in ${bestCategory.category} - level up!`,
    priority: "medium",
    estimatedDuration: nextExam.duration,
    focusAreas: [...new Set(nextExam.questions.map((q) => q.subject))],
    icon: nextExam.icon,
    gradient: nextExam.gradient,
  };
}

function getExplorationRecommendation(attempts: TestAttempt[]): TestRecommendation | null {
  const triedCategories = new Set(attempts.map((a) => a.examCategory));
  const untried = allExams.filter((e) => !triedCategories.has(e.category));

  if (untried.length === 0) return null;

  // Pick easiest untried exam
  const sorted = [...untried].sort((a, b) => {
    const diff = { Easy: 0, Medium: 1, Hard: 2 };
    return diff[a.difficulty] - diff[b.difficulty];
  });
  const target = sorted[0];

  return {
    examId: target.id,
    examSlug: target.slug,
    examName: target.name,
    examCategory: target.category,
    reason: `Try ${target.category} - expand your exam range`,
    priority: "low",
    estimatedDuration: target.duration,
    focusAreas: [...new Set(target.questions.map((q) => q.subject))],
    icon: target.icon,
    gradient: target.gradient,
  };
}

function getRetryRecommendation(attempts: TestAttempt[]): TestRecommendation | null {
  // Find most recent low-scoring attempt
  const lowScoring = attempts
    .filter((a) => a.percentage < 60)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

  if (lowScoring.length === 0) return null;

  const target = lowScoring[0];
  const exam = allExams.find((e) => e.id === target.examId);
  if (!exam) return null;

  return {
    examId: exam.id,
    examSlug: exam.slug,
    examName: exam.name,
    examCategory: exam.category,
    reason: `Improve your ${target.percentage}% score - you can do better!`,
    priority: "high",
    estimatedDuration: exam.duration,
    focusAreas: target.subjectWise
      .filter((s) => s.percentage < 50)
      .map((s) => s.subject),
    icon: exam.icon,
    gradient: exam.gradient,
  };
}

function getDefaultRecommendations(limit: number): TestRecommendation[] {
  // For new users, recommend popular/easy exams
  const starters = allExams
    .filter((e) => e.difficulty === "Easy" || e.difficulty === "Medium")
    .sort((a, b) => b.attemptCount - a.attemptCount)
    .slice(0, limit);

  return starters.map((e) => ({
    examId: e.id,
    examSlug: e.slug,
    examName: e.name,
    examCategory: e.category,
    reason: "Popular starter test - great for your first attempt",
    priority: "medium" as const,
    estimatedDuration: e.duration,
    focusAreas: [...new Set(e.questions.map((q) => q.subject))],
    icon: e.icon,
    gradient: e.gradient,
  }));
}
