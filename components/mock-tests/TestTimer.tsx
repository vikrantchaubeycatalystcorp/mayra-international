"use client";

import { useEffect } from "react";
import { Clock, AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useTestStore } from "../../lib/mock-tests/store";

export function TestTimer() {
  const { timeRemaining, tick, getPaceStatus, exam } = useTestStore();

  useEffect(() => {
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  const hours = Math.floor(timeRemaining / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);
  const seconds = timeRemaining % 60;
  const isUrgent = timeRemaining <= 300; // 5 min
  const isCritical = timeRemaining <= 60;
  const paceStatus = getPaceStatus();

  const formatNum = (n: number) => n.toString().padStart(2, "0");

  // Progress bar percentage
  const totalDuration = exam ? exam.duration * 60 : 1;
  const elapsed = totalDuration - timeRemaining;
  const progressPct = Math.min(100, (elapsed / totalDuration) * 100);

  return (
    <div className="flex items-center gap-2">
      {/* Pace Indicator */}
      <div
        className={`hidden sm:flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
          paceStatus === "ahead"
            ? "bg-emerald-50 text-emerald-600"
            : paceStatus === "behind"
              ? "bg-red-50 text-red-600"
              : "bg-blue-50 text-blue-600"
        }`}
        title={
          paceStatus === "ahead" ? "You're ahead of pace!"
          : paceStatus === "behind" ? "You're falling behind - pick up speed"
          : "You're on track"
        }
      >
        {paceStatus === "ahead" ? (
          <><TrendingUp className="h-3 w-3" /> Ahead</>
        ) : paceStatus === "behind" ? (
          <><TrendingDown className="h-3 w-3" /> Behind</>
        ) : (
          <><Minus className="h-3 w-3" /> On Track</>
        )}
      </div>

      {/* Timer */}
      <div
        className={`relative flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-lg font-bold transition-all duration-500 overflow-hidden ${
          isCritical
            ? "bg-red-100 text-red-700 animate-pulse shadow-lg shadow-red-200"
            : isUrgent
              ? "bg-amber-100 text-amber-700 shadow-md shadow-amber-100"
              : "bg-gray-100 text-gray-700"
        }`}
      >
        {/* Progress bar background */}
        <div
          className={`absolute inset-y-0 left-0 transition-all duration-1000 ease-linear opacity-10 ${
            isCritical ? "bg-red-500" : isUrgent ? "bg-amber-500" : "bg-indigo-500"
          }`}
          style={{ width: `${progressPct}%` }}
        />

        <span className="relative flex items-center gap-2">
          {isCritical ? (
            <AlertTriangle className="h-5 w-5 animate-bounce" />
          ) : (
            <Clock className="h-5 w-5" />
          )}
          {hours > 0 && <span>{formatNum(hours)}:</span>}
          <span>{formatNum(minutes)}</span>
          <span className={isCritical ? "animate-pulse" : ""}>:</span>
          <span>{formatNum(seconds)}</span>
        </span>
      </div>
    </div>
  );
}
