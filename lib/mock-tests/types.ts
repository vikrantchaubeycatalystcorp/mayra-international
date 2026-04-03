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

export interface UserAnswer {
  questionId: string;
  selectedOptionId: string | null;
  isMarked: boolean;
  timeTaken: number; // seconds spent on this question
}

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
