"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Trophy, Medal, Crown, ArrowLeft, Clock, Flame, TrendingUp,
  ChevronDown, Search, Filter,
} from "lucide-react";
import { Button } from "../ui/button";
import { getGlobalLeaderboard } from "../../lib/mock-tests/leaderboard";
import { examCategories } from "../../lib/mock-tests/data";
import type { ExamCategory, LeaderboardEntry } from "../../lib/mock-tests/types";

export function LeaderboardView() {
  const [filter, setFilter] = useState<ExamCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const allEntries = useMemo(() => getGlobalLeaderboard(), []);

  const filtered = useMemo(() => {
    let entries = allEntries;
    if (filter !== "all") entries = entries.filter((e) => e.examCategory === filter);
    if (searchQuery) entries = entries.filter((e) => e.userName.toLowerCase().includes(searchQuery.toLowerCase()));
    // Re-rank
    entries.forEach((e, i) => (e.rank = i + 1));
    return entries;
  }, [allEntries, filter, searchQuery]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 px-4 py-12 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-sm">
            <Trophy className="h-8 w-8 text-amber-300" />
          </div>
          <h1 className="text-3xl font-black sm:text-4xl">Leaderboard</h1>
          <p className="mt-2 text-indigo-200">Compete with thousands of students across India</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Back */}
        <Link href="/mock-tests" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Mock Tests
        </Link>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as ExamCategory | "all")}
              className="appearance-none rounded-xl border border-gray-200 py-2.5 pl-10 pr-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
            >
              <option value="all">All Exams</option>
              {examCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Top 3 Podium */}
        {filtered.length >= 3 && (
          <div className="mb-8 flex items-end justify-center gap-3 sm:gap-6">
            {/* 2nd Place */}
            <PodiumCard entry={filtered[1]} position={2} />
            {/* 1st Place */}
            <PodiumCard entry={filtered[0]} position={1} />
            {/* 3rd Place */}
            <PodiumCard entry={filtered[2]} position={3} />
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50/80">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Exam</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Score</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Time</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Streak</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 50).map((entry) => {
                  const isUser = entry.userName === "You" || entry.avatar.includes("emerald");
                  return (
                    <tr
                      key={`${entry.rank}-${entry.userName}`}
                      className={`border-b last:border-0 transition-colors ${
                        isUser ? "bg-indigo-50/50 font-medium" : "hover:bg-gray-50/50"
                      }`}
                    >
                      <td className="px-4 py-3">
                        <RankBadge rank={entry.rank} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white ${entry.avatar}`}>
                            {entry.userName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {entry.userName}
                              {isUser && <span className="ml-1.5 text-[10px] bg-indigo-100 text-indigo-600 rounded-full px-1.5 py-0.5">You</span>}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-xs text-gray-500 rounded-full bg-gray-100 px-2 py-0.5">
                          {entry.examCategory}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-sm font-bold ${
                          entry.percentage >= 70 ? "text-emerald-600"
                          : entry.percentage >= 40 ? "text-amber-600"
                          : "text-red-500"
                        }`}>
                          {entry.percentage}%
                        </span>
                        <span className="ml-1 text-xs text-gray-400">{entry.score}/{entry.totalMarks}</span>
                      </td>
                      <td className="px-4 py-3 text-right hidden sm:table-cell">
                        <span className="flex items-center justify-end gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {formatTime(entry.timeTaken)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right hidden md:table-cell">
                        <span className="flex items-center justify-end gap-1 text-xs text-orange-500">
                          <Flame className="h-3 w-3" />
                          {entry.streak}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="py-12 text-center text-gray-400">
              No entries found. Be the first!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PodiumCard({ entry, position }: { entry: LeaderboardEntry; position: 1 | 2 | 3 }) {
  const config = {
    1: { height: "h-32", icon: Crown, color: "from-amber-400 to-yellow-500", ring: "ring-amber-300", label: "1st" },
    2: { height: "h-24", icon: Medal, color: "from-gray-300 to-gray-400", ring: "ring-gray-300", label: "2nd" },
    3: { height: "h-20", icon: Medal, color: "from-amber-600 to-orange-700", ring: "ring-amber-600", label: "3rd" },
  }[position];

  const Icon = config.icon;

  return (
    <div className={`flex flex-col items-center ${position === 1 ? "order-2 sm:mx-4" : position === 2 ? "order-1" : "order-3"}`}>
      <div className="relative mb-2">
        <div className={`flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white ring-4 ${config.ring} ${entry.avatar}`}>
          {entry.userName.charAt(0)}
        </div>
        <div className={`absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${config.color} text-[10px] font-bold text-white`}>
          <Icon className="h-3 w-3" />
        </div>
      </div>
      <p className="text-sm font-bold text-gray-900 text-center max-w-[80px] truncate">{entry.userName}</p>
      <p className="text-xs font-bold text-indigo-600">{entry.percentage}%</p>
      <div className={`mt-2 w-20 sm:w-24 ${config.height} rounded-t-xl bg-gradient-to-b ${config.color} flex items-start justify-center pt-2`}>
        <span className="text-lg font-black text-white/80">{config.label}</span>
      </div>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="h-5 w-5 text-amber-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-700" />;
  return <span className="text-sm font-bold text-gray-400">#{rank}</span>;
}
