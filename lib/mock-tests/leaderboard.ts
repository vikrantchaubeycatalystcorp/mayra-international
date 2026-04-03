import type { LeaderboardEntry, TestAttempt, UserStats, Badge } from "./types";

const STORAGE_KEY = "mock_test_attempts";
const STATS_KEY = "mock_test_stats";

// Realistic Indian student names for simulated leaderboard
const SIMULATED_NAMES = [
  "Aarav Sharma", "Priya Patel", "Rohan Gupta", "Ananya Singh", "Vikram Reddy",
  "Sneha Iyer", "Arjun Nair", "Kavya Menon", "Rahul Verma", "Ishita Das",
  "Aditya Kumar", "Meera Joshi", "Karthik Rajan", "Pooja Mishra", "Harsh Agarwal",
  "Divya Rao", "Siddharth Chopra", "Neha Bhatt", "Varun Malhotra", "Tanvi Kapoor",
  "Akash Saxena", "Riya Choudhary", "Manish Tiwari", "Shreya Deshmukh", "Nikhil Pandey",
  "Swati Kulkarni", "Rajesh Yadav", "Anushka Sinha", "Deepak Jain", "Sakshi Thakur",
  "Amit Banerjee", "Pallavi Ghosh", "Suresh Nanda", "Kriti Bose", "Gaurav Mehta",
  "Simran Kaur", "Vivek Dubey", "Anjali Pillai", "Kunal Shah", "Bhavna Srivastava",
];

const AVATARS = [
  "bg-gradient-to-br from-blue-500 to-purple-600",
  "bg-gradient-to-br from-green-500 to-teal-600",
  "bg-gradient-to-br from-orange-500 to-red-600",
  "bg-gradient-to-br from-pink-500 to-rose-600",
  "bg-gradient-to-br from-indigo-500 to-blue-600",
  "bg-gradient-to-br from-yellow-500 to-amber-600",
  "bg-gradient-to-br from-cyan-500 to-blue-600",
  "bg-gradient-to-br from-violet-500 to-purple-600",
];

function generateSimulatedEntries(
  examId: string,
  examName: string,
  examCategory: string,
  totalMarks: number,
  count: number
): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = [];
  const shuffled = [...SIMULATED_NAMES].sort(() => Math.random() - 0.5);

  for (let i = 0; i < Math.min(count, shuffled.length); i++) {
    // Generate scores with a realistic bell curve distribution
    const baseScore = 0.3 + Math.random() * 0.6; // 30% to 90%
    const score = Math.round(baseScore * totalMarks);
    const percentage = Math.round((score / totalMarks) * 100);
    const timeTaken = Math.round(1200 + Math.random() * 3600); // 20 min to 80 min

    entries.push({
      rank: 0,
      userName: shuffled[i],
      avatar: AVATARS[i % AVATARS.length],
      score,
      totalMarks,
      percentage,
      timeTaken,
      examName,
      examCategory: examCategory as LeaderboardEntry["examCategory"],
      completedAt: new Date(
        Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
      streak: Math.floor(Math.random() * 15) + 1,
    });
  }

  return entries;
}

export function getLeaderboard(
  examId: string,
  examName: string,
  examCategory: string,
  totalMarks: number
): LeaderboardEntry[] {
  const saved = getSavedAttempts().filter((a) => a.examId === examId);
  const simulated = generateSimulatedEntries(
    examId,
    examName,
    examCategory,
    totalMarks,
    25
  );

  const userEntries: LeaderboardEntry[] = saved.map((a) => ({
    rank: 0,
    userName: a.userName || "You",
    avatar: "bg-gradient-to-br from-emerald-500 to-green-600",
    score: a.score,
    totalMarks: a.totalMarks,
    percentage: a.percentage,
    timeTaken: a.timeTaken,
    examName: a.examName,
    examCategory: a.examCategory,
    completedAt: a.completedAt,
    streak: getUserStats().currentStreak,
  }));

  const all = [...userEntries, ...simulated];
  all.sort((a, b) => {
    if (b.percentage !== a.percentage) return b.percentage - a.percentage;
    return a.timeTaken - b.timeTaken; // faster time wins tie
  });
  all.forEach((e, i) => (e.rank = i + 1));

  return all;
}

export function getGlobalLeaderboard(): LeaderboardEntry[] {
  const saved = getSavedAttempts();
  const allEntries: LeaderboardEntry[] = [];

  // Add user entries
  saved.forEach((a) => {
    allEntries.push({
      rank: 0,
      userName: a.userName || "You",
      avatar: "bg-gradient-to-br from-emerald-500 to-green-600",
      score: a.score,
      totalMarks: a.totalMarks,
      percentage: a.percentage,
      timeTaken: a.timeTaken,
      examName: a.examName,
      examCategory: a.examCategory,
      completedAt: a.completedAt,
      streak: getUserStats().currentStreak,
    });
  });

  // Add simulated global entries
  const simulated = generateSimulatedEntries("global", "Various", "JEE", 100, 30);
  simulated.forEach((s) => {
    const cats = ["JEE", "NEET", "GATE", "CAT", "UPSC"] as const;
    s.examCategory = cats[Math.floor(Math.random() * cats.length)];
    s.examName = `${s.examCategory} Mock Test`;
  });

  allEntries.push(...simulated);
  allEntries.sort((a, b) => b.percentage - a.percentage || a.timeTaken - b.timeTaken);
  allEntries.forEach((e, i) => (e.rank = i + 1));

  return allEntries;
}

export function saveAttempt(attempt: TestAttempt): void {
  if (typeof window === "undefined") return;
  const existing = getSavedAttempts();
  existing.push(attempt);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  updateStats(attempt);
}

export function getSavedAttempts(): TestAttempt[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function getUserStats(): UserStats {
  if (typeof window === "undefined") {
    return {
      totalAttempts: 0, avgScore: 0, bestScore: 0,
      currentStreak: 0, longestStreak: 0, lastAttemptDate: "",
      examsTaken: [], badges: [],
    };
  }
  try {
    const stored = localStorage.getItem(STATS_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return {
    totalAttempts: 0, avgScore: 0, bestScore: 0,
    currentStreak: 0, longestStreak: 0, lastAttemptDate: "",
    examsTaken: [], badges: [],
  };
}

function updateStats(attempt: TestAttempt): void {
  if (typeof window === "undefined") return;
  const stats = getUserStats();
  const attempts = getSavedAttempts();

  stats.totalAttempts = attempts.length;
  stats.avgScore = Math.round(
    attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length
  );
  stats.bestScore = Math.max(stats.bestScore, attempt.percentage);

  // Streak calculation
  const today = new Date().toDateString();
  const lastDate = stats.lastAttemptDate ? new Date(stats.lastAttemptDate).toDateString() : "";
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (lastDate === today) {
    // Same day, streak unchanged
  } else if (lastDate === yesterday) {
    stats.currentStreak++;
  } else {
    stats.currentStreak = 1;
  }
  stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak);
  stats.lastAttemptDate = new Date().toISOString();

  if (!stats.examsTaken.includes(attempt.examId)) {
    stats.examsTaken.push(attempt.examId);
  }

  // Award badges
  stats.badges = calculateBadges(stats, attempt);

  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

function calculateBadges(stats: UserStats, latest: TestAttempt): Badge[] {
  const badges = [...(stats.badges || [])];
  const has = (id: string) => badges.some((b) => b.id === id);
  const now = new Date().toISOString();

  if (stats.currentStreak >= 3 && !has("streak_3"))
    badges.push({ id: "streak_3", name: "On Fire", description: "3-day streak", icon: "flame", earnedAt: now, category: "streak" });
  if (stats.currentStreak >= 7 && !has("streak_7"))
    badges.push({ id: "streak_7", name: "Week Warrior", description: "7-day streak", icon: "zap", earnedAt: now, category: "streak" });
  if (latest.percentage >= 90 && !has("score_90"))
    badges.push({ id: "score_90", name: "Genius", description: "Score 90%+", icon: "brain", earnedAt: now, category: "score" });
  if (latest.percentage >= 100 && !has("perfect"))
    badges.push({ id: "perfect", name: "Perfect Score", description: "100% in a test", icon: "crown", earnedAt: now, category: "score" });
  if (stats.totalAttempts >= 10 && !has("vol_10"))
    badges.push({ id: "vol_10", name: "Dedicated", description: "10 tests completed", icon: "target", earnedAt: now, category: "volume" });
  if (stats.totalAttempts >= 50 && !has("vol_50"))
    badges.push({ id: "vol_50", name: "Test Machine", description: "50 tests completed", icon: "rocket", earnedAt: now, category: "volume" });
  if (stats.examsTaken.length >= 5 && !has("diverse"))
    badges.push({ id: "diverse", name: "Explorer", description: "5 different exams", icon: "compass", earnedAt: now, category: "mastery" });

  return badges;
}

export function calculatePercentile(score: number, examId: string): number {
  // Simulated percentile based on normal distribution
  const mean = 55;
  const stdDev = 18;
  const z = (score - mean) / stdDev;
  const percentile = Math.round(
    (0.5 * (1 + erf(z / Math.sqrt(2)))) * 100
  );
  return Math.min(99, Math.max(1, percentile));
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
