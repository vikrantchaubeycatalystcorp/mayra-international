export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
  correctOptionId: string;
  explanation: string;
  subject: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  marks: number;
}

export interface MockExam {
  id: string;
  name: string;
  slug: string;
  category: ExamCategory;
  subject: string;
  description: string;
  duration: number; // minutes
  totalQuestions: number;
  totalMarks: number;
  negativeMarking: number;
  difficulty: "Easy" | "Medium" | "Hard";
  icon: string;
  color: string;
  gradient: string;
  questions: Question[];
  attemptCount: number;
  avgScore: number;
  tags: string[];
}

export type ExamCategory =
  | "JEE"
  | "NEET"
  | "GATE"
  | "CAT"
  | "UPSC"
  | "SSC"
  | "Banking"
  | "CLAT"
  | "CUET"
  | "NDA";

// --- Confidence tagging ---
export type ConfidenceLevel = "sure" | "maybe" | "guess";

// --- Enhanced UserAnswer with telemetry ---
export interface UserAnswer {
  questionId: string;
  selectedOptionId: string | null;
  isMarked: boolean;
  timeTaken: number; // seconds spent on this question
  confidence: ConfidenceLevel | null;
  answerChanges: number; // how many times the answer was changed
  revisitCount: number; // how many times user navigated back to this question
  firstViewTimestamp: number; // when user first saw this question
  answerTimestamp: number | null; // when user last answered
}

// --- Per-question telemetry for replay timeline ---
export interface QuestionTelemetry {
  questionId: string;
  events: TelemetryEvent[];
}

export interface TelemetryEvent {
  type: "view" | "answer" | "change" | "mark" | "unmark" | "clear" | "leave";
  timestamp: number;
  data?: string; // optionId for answer/change events
}

// --- Test attempt with analytics ---
export interface TestAttempt {
  id: string;
  examId: string;
  examName: string;
  examCategory: ExamCategory;
  userName: string;
  answers: UserAnswer[];
  score: number;
  totalMarks: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  percentage: number;
  timeTaken: number; // total seconds
  completedAt: string;
  rank?: number;
  percentile?: number;
  subjectWise: SubjectScore[];
  analytics?: AttemptAnalytics;
  telemetry?: QuestionTelemetry[];
}

export interface SubjectScore {
  subject: string;
  correct: number;
  incorrect: number;
  unanswered: number;
  score: number;
  total: number;
  percentage: number;
}

// --- Diagnostic Analytics ---
export interface AttemptAnalytics {
  // Speed metrics
  avgTimePerQuestion: number;
  fastestQuestion: { questionId: string; time: number } | null;
  slowestQuestion: { questionId: string; time: number } | null;
  timeDistribution: { questionId: string; time: number; subject: string; difficulty: string }[];

  // Question attempt taxonomy
  taxonomy: QuestionTaxonomy;

  // Behavior-derived scores (0-100)
  carelessErrorIndex: number;
  panicWindowIndex: number;
  consistencyIndex: number;
  effortQualityScore: number;

  // Temperament scores
  temperament: ExamTemperament;

  // Negative mark analysis
  negativeMarkLoss: number;
  negativeMarkBySubject: { subject: string; loss: number }[];

  // Pace tracking
  paceData: PacePoint[];

  // Rank prediction
  predictedPercentileBand: { low: number; high: number };

  // Speed-accuracy curve data points
  speedAccuracyCurve: { speed: number; accuracy: number }[];
}

export interface QuestionTaxonomy {
  tooFastWrong: string[]; // answered quickly and wrong
  overtimeWrong: string[]; // spent too long and still wrong
  confidentCorrect: string[]; // marked "sure" and correct
  guessedCorrect: string[]; // marked "guess" and correct
  carelessMistakes: string[]; // easy questions wrong with fast time
  overthought: string[]; // long time on easy question, wrong
  perfectExecution: string[]; // right difficulty, right time, right answer
  luckyGuesses: string[]; // hard question, fast, guess, correct
}

export interface ExamTemperament {
  focusScore: number; // 0-100: low revisits, consistent time
  consistencyScore: number; // 0-100: even time distribution
  panicScore: number; // 0-100: rush behavior in last 20%
  enduranceScore: number; // 0-100: accuracy doesn't drop over time
  confidenceCalibration: number; // 0-100: confidence matches correctness
}

export interface PacePoint {
  questionIndex: number;
  elapsedSeconds: number;
  expectedSeconds: number;
  status: "ahead" | "on-track" | "behind";
}

// --- Reattempt modes ---
export type ReattemptMode = "full" | "wrong-only" | "weak-topic" | "marked-only";

// --- Personalized recommendations ---
export interface TestRecommendation {
  examId: string;
  examSlug: string;
  examName: string;
  examCategory: ExamCategory;
  reason: string;
  priority: "high" | "medium" | "low";
  estimatedDuration: number; // minutes
  focusAreas: string[];
  icon: string;
  gradient: string;
}

// --- Smart review filter types ---
export type SmartFilterType =
  | "all"
  | "careless-mistakes"
  | "too-fast-wrong"
  | "overtime-wrong"
  | "unanswered-medium-hard"
  | "guessed-correct"
  | "confident-wrong"
  | "negative-mark-heavy";

export interface SmartFilter {
  id: SmartFilterType;
  label: string;
  description: string;
  count: number;
  icon: string;
  color: string;
}

// --- Existing types (unchanged) ---
export interface LeaderboardEntry {
  rank: number;
  userName: string;
  avatar: string;
  score: number;
  totalMarks: number;
  percentage: number;
  timeTaken: number;
  examName: string;
  examCategory: ExamCategory;
  completedAt: string;
  streak: number;
}

export interface UserStats {
  totalAttempts: number;
  avgScore: number;
  bestScore: number;
  currentStreak: number;
  longestStreak: number;
  lastAttemptDate: string;
  examsTaken: string[];
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
  category: "streak" | "score" | "mastery" | "speed" | "volume";
}

export type TestStatus = "not-started" | "in-progress" | "completed" | "reviewing";
