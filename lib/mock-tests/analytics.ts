import type {
  TestAttempt, MockExam, AttemptAnalytics, QuestionTaxonomy,
  ExamTemperament, PacePoint, UserAnswer, SmartFilter, SmartFilterType,
} from "./types";

/**
 * Generates comprehensive analytics from a test attempt.
 * This is the diagnostic intelligence layer - the core differentiator.
 */
export function generateAnalytics(attempt: TestAttempt, exam: MockExam): AttemptAnalytics {
  const questions = exam.questions;
  const answerMap = new Map(attempt.answers.map((a) => [a.questionId, a]));

  // --- Time metrics ---
  const times = attempt.answers
    .filter((a) => a.timeTaken > 0)
    .map((a) => ({ questionId: a.questionId, time: a.timeTaken }));

  const avgTime = times.length > 0
    ? times.reduce((sum, t) => sum + t.time, 0) / times.length
    : 0;

  const sorted = [...times].sort((a, b) => a.time - b.time);
  const fastest = sorted[0] || null;
  const slowest = sorted[sorted.length - 1] || null;

  const timeDistribution = questions.map((q) => {
    const answer = answerMap.get(q.id);
    return {
      questionId: q.id,
      time: answer?.timeTaken || 0,
      subject: q.subject,
      difficulty: q.difficulty,
    };
  });

  // --- Question Taxonomy ---
  const taxonomy = buildTaxonomy(attempt, exam, avgTime);

  // --- Behavior Scores ---
  const carelessErrorIndex = computeCarelessErrorIndex(attempt, exam);
  const panicWindowIndex = computePanicWindowIndex(attempt, exam);
  const consistencyIndex = computeConsistencyIndex(attempt, exam);
  const effortQualityScore = computeEffortQuality(attempt, exam);

  // --- Temperament ---
  const temperament = computeTemperament(attempt, exam);

  // --- Negative Mark Analysis ---
  const { negativeMarkLoss, negativeMarkBySubject } = computeNegativeMarkAnalysis(attempt, exam);

  // --- Pace Data ---
  const paceData = computePaceData(attempt, exam);

  // --- Rank Prediction ---
  const predictedPercentileBand = predictPercentile(attempt.percentage);

  // --- Speed-Accuracy Curve ---
  const speedAccuracyCurve = computeSpeedAccuracyCurve(attempt, exam);

  return {
    avgTimePerQuestion: Math.round(avgTime),
    fastestQuestion: fastest,
    slowestQuestion: slowest,
    timeDistribution,
    taxonomy,
    carelessErrorIndex,
    panicWindowIndex,
    consistencyIndex,
    effortQualityScore,
    temperament,
    negativeMarkLoss,
    negativeMarkBySubject,
    paceData,
    predictedPercentileBand,
    speedAccuracyCurve,
  };
}

function buildTaxonomy(attempt: TestAttempt, exam: MockExam, avgTime: number): QuestionTaxonomy {
  const taxonomy: QuestionTaxonomy = {
    tooFastWrong: [],
    overtimeWrong: [],
    confidentCorrect: [],
    guessedCorrect: [],
    carelessMistakes: [],
    overthought: [],
    perfectExecution: [],
    luckyGuesses: [],
  };

  const answerMap = new Map(attempt.answers.map((a) => [a.questionId, a]));
  const fastThreshold = Math.max(avgTime * 0.4, 15); // 40% of avg or 15s minimum
  const slowThreshold = avgTime * 2;

  exam.questions.forEach((q) => {
    const answer = answerMap.get(q.id);
    if (!answer) return;

    const isCorrect = answer.selectedOptionId === q.correctOptionId;
    const isAnswered = !!answer.selectedOptionId;
    const isFast = answer.timeTaken < fastThreshold;
    const isSlow = answer.timeTaken > slowThreshold;
    const isEasy = q.difficulty === "Easy";
    const isHard = q.difficulty === "Hard";

    if (!isAnswered) return;

    // Too fast + wrong
    if (isFast && !isCorrect) taxonomy.tooFastWrong.push(q.id);

    // Overtime + wrong
    if (isSlow && !isCorrect) taxonomy.overtimeWrong.push(q.id);

    // Confident + correct
    if (answer.confidence === "sure" && isCorrect) taxonomy.confidentCorrect.push(q.id);

    // Guessed + correct
    if (answer.confidence === "guess" && isCorrect) taxonomy.guessedCorrect.push(q.id);

    // Careless mistakes: easy questions, not slow, wrong
    if (isEasy && !isSlow && !isCorrect) taxonomy.carelessMistakes.push(q.id);

    // Overthought: easy question, slow, wrong
    if (isEasy && isSlow && !isCorrect) taxonomy.overthought.push(q.id);

    // Perfect execution: correct with reasonable time
    if (isCorrect && !isFast && !isSlow) taxonomy.perfectExecution.push(q.id);

    // Lucky guesses: hard, fast, guess, correct
    if (isHard && isFast && answer.confidence === "guess" && isCorrect) {
      taxonomy.luckyGuesses.push(q.id);
    }
  });

  return taxonomy;
}

function computeCarelessErrorIndex(attempt: TestAttempt, exam: MockExam): number {
  const answerMap = new Map(attempt.answers.map((a) => [a.questionId, a]));
  let easyTotal = 0;
  let easyWrong = 0;

  exam.questions.forEach((q) => {
    if (q.difficulty === "Easy") {
      easyTotal++;
      const a = answerMap.get(q.id);
      if (a?.selectedOptionId && a.selectedOptionId !== q.correctOptionId) {
        easyWrong++;
      }
    }
  });

  if (easyTotal === 0) return 0;
  return Math.round((easyWrong / easyTotal) * 100);
}

function computePanicWindowIndex(attempt: TestAttempt, exam: MockExam): number {
  // Look at behavior in the last 20% of questions answered
  const answered = attempt.answers.filter((a) => a.selectedOptionId);
  if (answered.length < 5) return 0;

  const lastChunkSize = Math.max(Math.ceil(answered.length * 0.2), 2);
  const sortedByTime = [...answered]
    .filter((a) => a.answerTimestamp)
    .sort((a, b) => (a.answerTimestamp || 0) - (b.answerTimestamp || 0));

  if (sortedByTime.length < lastChunkSize) return 0;

  const lastChunk = sortedByTime.slice(-lastChunkSize);
  const earlyChunk = sortedByTime.slice(0, lastChunkSize);

  const answerMap = new Map(attempt.answers.map((a) => [a.questionId, a]));

  // Compare accuracy in last 20% vs first 20%
  const lastCorrect = lastChunk.filter((a) => {
    const q = exam.questions.find((q) => q.id === a.questionId);
    return q && a.selectedOptionId === q.correctOptionId;
  }).length;

  const earlyCorrect = earlyChunk.filter((a) => {
    const q = exam.questions.find((q) => q.id === a.questionId);
    return q && a.selectedOptionId === q.correctOptionId;
  }).length;

  const lastAccuracy = lastCorrect / lastChunk.length;
  const earlyAccuracy = earlyCorrect / earlyChunk.length;

  // Also check if time per question drops significantly
  const lastAvgTime = lastChunk.reduce((s, a) => s + a.timeTaken, 0) / lastChunk.length;
  const earlyAvgTime = earlyChunk.reduce((s, a) => s + a.timeTaken, 0) / earlyChunk.length;

  const accuracyDrop = Math.max(0, earlyAccuracy - lastAccuracy);
  const timeDrop = earlyAvgTime > 0 ? Math.max(0, 1 - lastAvgTime / earlyAvgTime) : 0;

  // Combine: higher = more panic
  return Math.min(100, Math.round((accuracyDrop * 60 + timeDrop * 40) * 100));
}

function computeConsistencyIndex(attempt: TestAttempt, exam: MockExam): number {
  // Measure how consistent time spent per question is (lower variance = higher consistency)
  const times = attempt.answers
    .filter((a) => a.timeTaken > 0)
    .map((a) => a.timeTaken);

  if (times.length < 3) return 50;

  const mean = times.reduce((s, t) => s + t, 0) / times.length;
  const variance = times.reduce((s, t) => s + (t - mean) ** 2, 0) / times.length;
  const cv = mean > 0 ? Math.sqrt(variance) / mean : 0; // coefficient of variation

  // CV of 0 = perfect consistency (100), CV of 2+ = very inconsistent (0)
  return Math.max(0, Math.min(100, Math.round((1 - cv / 2) * 100)));
}

function computeEffortQuality(attempt: TestAttempt, exam: MockExam): number {
  // Combination of: attempted %, time used %, accuracy, and confidence usage
  const attemptedPct = (attempt.correct + attempt.incorrect) / exam.totalQuestions;
  const timeUsedPct = Math.min(1, attempt.timeTaken / (exam.duration * 60));
  const accuracy = attempt.correct / Math.max(1, attempt.correct + attempt.incorrect);
  const confidenceUsed = attempt.answers.filter((a) => a.confidence).length / exam.totalQuestions;

  return Math.round(
    (attemptedPct * 30 + timeUsedPct * 20 + accuracy * 35 + confidenceUsed * 15) * 100
  );
}

function computeTemperament(attempt: TestAttempt, exam: MockExam): ExamTemperament {
  const answerMap = new Map(attempt.answers.map((a) => [a.questionId, a]));

  // Focus Score: low revisit rate
  const totalRevisits = attempt.answers.reduce((s, a) => s + a.revisitCount, 0);
  const maxExpectedRevisits = exam.totalQuestions * 2;
  const focusScore = Math.max(0, Math.min(100,
    Math.round((1 - totalRevisits / maxExpectedRevisits) * 100)
  ));

  // Consistency Score
  const consistencyScore = computeConsistencyIndex(attempt, exam);

  // Panic Score (invert - high panic = low score here means "calm")
  const panicRaw = computePanicWindowIndex(attempt, exam);
  const panicScore = 100 - panicRaw;

  // Endurance: accuracy in first half vs second half
  const halfIdx = Math.floor(exam.questions.length / 2);
  let firstHalfCorrect = 0, firstHalfTotal = 0;
  let secondHalfCorrect = 0, secondHalfTotal = 0;

  exam.questions.forEach((q, i) => {
    const a = answerMap.get(q.id);
    if (!a?.selectedOptionId) return;
    if (i < halfIdx) {
      firstHalfTotal++;
      if (a.selectedOptionId === q.correctOptionId) firstHalfCorrect++;
    } else {
      secondHalfTotal++;
      if (a.selectedOptionId === q.correctOptionId) secondHalfCorrect++;
    }
  });

  const firstAcc = firstHalfTotal > 0 ? firstHalfCorrect / firstHalfTotal : 0;
  const secondAcc = secondHalfTotal > 0 ? secondHalfCorrect / secondHalfTotal : 0;
  const enduranceScore = Math.max(0, Math.min(100,
    Math.round((1 - Math.max(0, firstAcc - secondAcc)) * 100)
  ));

  // Confidence Calibration: how well does confidence predict correctness
  let calibrationMatches = 0;
  let calibrationTotal = 0;
  attempt.answers.forEach((a) => {
    if (!a.confidence || !a.selectedOptionId) return;
    calibrationTotal++;
    const q = exam.questions.find((q) => q.id === a.questionId);
    if (!q) return;
    const isCorrect = a.selectedOptionId === q.correctOptionId;
    if ((a.confidence === "sure" && isCorrect) || (a.confidence === "guess" && !isCorrect)) {
      calibrationMatches++;
    } else if (a.confidence === "maybe") {
      calibrationMatches += 0.5; // partial credit for "maybe"
    }
  });

  const confidenceCalibration = calibrationTotal > 0
    ? Math.round((calibrationMatches / calibrationTotal) * 100)
    : 50; // neutral if no confidence tags used

  return { focusScore, consistencyScore, panicScore, enduranceScore, confidenceCalibration };
}

function computeNegativeMarkAnalysis(attempt: TestAttempt, exam: MockExam) {
  const answerMap = new Map(attempt.answers.map((a) => [a.questionId, a]));
  let totalLoss = 0;
  const subjectLoss = new Map<string, number>();

  exam.questions.forEach((q) => {
    const a = answerMap.get(q.id);
    if (a?.selectedOptionId && a.selectedOptionId !== q.correctOptionId) {
      totalLoss += exam.negativeMarking;
      const current = subjectLoss.get(q.subject) || 0;
      subjectLoss.set(q.subject, current + exam.negativeMarking);
    }
  });

  return {
    negativeMarkLoss: Math.round(totalLoss * 100) / 100,
    negativeMarkBySubject: Array.from(subjectLoss.entries()).map(([subject, loss]) => ({
      subject,
      loss: Math.round(loss * 100) / 100,
    })),
  };
}

function computePaceData(attempt: TestAttempt, exam: MockExam): PacePoint[] {
  const totalDuration = exam.duration * 60;
  const expectedTimePerQ = totalDuration / exam.totalQuestions;
  const points: PacePoint[] = [];

  let cumulativeTime = 0;
  attempt.answers.forEach((a, i) => {
    cumulativeTime += a.timeTaken;
    const expected = expectedTimePerQ * (i + 1);
    const diff = cumulativeTime - expected;
    const tolerance = expectedTimePerQ * 0.5;

    points.push({
      questionIndex: i,
      elapsedSeconds: Math.round(cumulativeTime),
      expectedSeconds: Math.round(expected),
      status: diff < -tolerance ? "ahead" : diff > tolerance ? "behind" : "on-track",
    });
  });

  return points;
}

function predictPercentile(percentage: number): { low: number; high: number } {
  // Based on normal distribution with mean=55, stdDev=18
  const mean = 55;
  const stdDev = 18;
  const z = (percentage - mean) / stdDev;

  const basePercentile = Math.round((0.5 * (1 + erf(z / Math.sqrt(2)))) * 100);
  const clamped = Math.min(99, Math.max(1, basePercentile));

  return {
    low: Math.max(1, clamped - 5),
    high: Math.min(99, clamped + 5),
  };
}

function erf(x: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
}

function computeSpeedAccuracyCurve(attempt: TestAttempt, exam: MockExam): { speed: number; accuracy: number }[] {
  // Group questions into time buckets and calculate accuracy per bucket
  const answerMap = new Map(attempt.answers.map((a) => [a.questionId, a]));
  const pairs: { time: number; correct: boolean }[] = [];

  exam.questions.forEach((q) => {
    const a = answerMap.get(q.id);
    if (!a?.selectedOptionId) return;
    pairs.push({
      time: a.timeTaken,
      correct: a.selectedOptionId === q.correctOptionId,
    });
  });

  if (pairs.length < 3) return [];

  pairs.sort((a, b) => a.time - b.time);

  // Create 5 buckets
  const bucketSize = Math.ceil(pairs.length / 5);
  const curve: { speed: number; accuracy: number }[] = [];

  for (let i = 0; i < pairs.length; i += bucketSize) {
    const bucket = pairs.slice(i, i + bucketSize);
    const avgSpeed = bucket.reduce((s, p) => s + p.time, 0) / bucket.length;
    const accuracy = bucket.filter((p) => p.correct).length / bucket.length;
    curve.push({
      speed: Math.round(avgSpeed),
      accuracy: Math.round(accuracy * 100),
    });
  }

  return curve;
}

// --- Smart Review Filters ---
export function getSmartFilters(attempt: TestAttempt, exam: MockExam): SmartFilter[] {
  const analytics = attempt.analytics || generateAnalytics(attempt, exam);
  const answerMap = new Map(attempt.answers.map((a) => [a.questionId, a]));

  const unansweredMedHard = exam.questions.filter((q) => {
    const a = answerMap.get(q.id);
    return !a?.selectedOptionId && (q.difficulty === "Medium" || q.difficulty === "Hard");
  });

  const confidentWrong = exam.questions.filter((q) => {
    const a = answerMap.get(q.id);
    return a?.confidence === "sure" && a.selectedOptionId && a.selectedOptionId !== q.correctOptionId;
  });

  return [
    {
      id: "all",
      label: "All Questions",
      description: "View all questions",
      count: exam.totalQuestions,
      icon: "list",
      color: "text-gray-600",
    },
    {
      id: "careless-mistakes",
      label: "Careless Mistakes",
      description: "Easy questions you got wrong quickly",
      count: analytics.taxonomy.carelessMistakes.length,
      icon: "alert-triangle",
      color: "text-red-600",
    },
    {
      id: "too-fast-wrong",
      label: "Too Fast, Wrong",
      description: "Rushed answers that were incorrect",
      count: analytics.taxonomy.tooFastWrong.length,
      icon: "zap",
      color: "text-orange-600",
    },
    {
      id: "overtime-wrong",
      label: "Overtime, Still Wrong",
      description: "Spent too long but still got wrong",
      count: analytics.taxonomy.overtimeWrong.length,
      icon: "clock",
      color: "text-purple-600",
    },
    {
      id: "unanswered-medium-hard",
      label: "Skipped (Medium/Hard)",
      description: "Medium and hard questions left unanswered",
      count: unansweredMedHard.length,
      icon: "minus-circle",
      color: "text-amber-600",
    },
    {
      id: "guessed-correct",
      label: "Lucky Guesses",
      description: "Marked as guess but got correct",
      count: analytics.taxonomy.guessedCorrect.length,
      icon: "sparkles",
      color: "text-emerald-600",
    },
    {
      id: "confident-wrong",
      label: "Overconfident Errors",
      description: "Marked sure but got wrong",
      count: confidentWrong.length,
      icon: "shield-alert",
      color: "text-red-500",
    },
  ];
}

export function filterQuestionsBySmartFilter(
  filterType: SmartFilterType,
  attempt: TestAttempt,
  exam: MockExam
): string[] {
  const analytics = attempt.analytics || generateAnalytics(attempt, exam);
  const answerMap = new Map(attempt.answers.map((a) => [a.questionId, a]));

  switch (filterType) {
    case "all":
      return exam.questions.map((q) => q.id);
    case "careless-mistakes":
      return analytics.taxonomy.carelessMistakes;
    case "too-fast-wrong":
      return analytics.taxonomy.tooFastWrong;
    case "overtime-wrong":
      return analytics.taxonomy.overtimeWrong;
    case "unanswered-medium-hard":
      return exam.questions
        .filter((q) => {
          const a = answerMap.get(q.id);
          return !a?.selectedOptionId && (q.difficulty === "Medium" || q.difficulty === "Hard");
        })
        .map((q) => q.id);
    case "guessed-correct":
      return analytics.taxonomy.guessedCorrect;
    case "confident-wrong":
      return exam.questions
        .filter((q) => {
          const a = answerMap.get(q.id);
          return a?.confidence === "sure" && a.selectedOptionId && a.selectedOptionId !== q.correctOptionId;
        })
        .map((q) => q.id);
    case "negative-mark-heavy":
      return exam.questions
        .filter((q) => {
          const a = answerMap.get(q.id);
          return a?.selectedOptionId && a.selectedOptionId !== q.correctOptionId;
        })
        .map((q) => q.id);
    default:
      return exam.questions.map((q) => q.id);
  }
}

// --- Reattempt question filtering ---
export function getQuestionsForReattempt(
  mode: "full" | "wrong-only" | "weak-topic" | "marked-only",
  attempt: TestAttempt,
  exam: MockExam
): string[] {
  const answerMap = new Map(attempt.answers.map((a) => [a.questionId, a]));

  switch (mode) {
    case "full":
      return exam.questions.map((q) => q.id);

    case "wrong-only":
      return exam.questions
        .filter((q) => {
          const a = answerMap.get(q.id);
          return a?.selectedOptionId && a.selectedOptionId !== q.correctOptionId;
        })
        .map((q) => q.id);

    case "weak-topic": {
      // Find subjects where accuracy < 50%
      const weakSubjects = attempt.subjectWise
        .filter((s) => s.percentage < 50)
        .map((s) => s.subject);
      return exam.questions
        .filter((q) => weakSubjects.includes(q.subject))
        .map((q) => q.id);
    }

    case "marked-only":
      return attempt.answers
        .filter((a) => a.isMarked)
        .map((a) => a.questionId);

    default:
      return exam.questions.map((q) => q.id);
  }
}
