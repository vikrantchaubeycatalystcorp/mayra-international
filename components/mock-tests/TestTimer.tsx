"use client";

import { useEffect } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { useTestStore } from "../../lib/mock-tests/store";

export function TestTimer() {
  const { timeRemaining, tick } = useTestStore();

  useEffect(() => {
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  const hours = Math.floor(timeRemaining / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);
  const seconds = timeRemaining % 60;
  const isUrgent = timeRemaining <= 300; // 5 min
  const isCritical = timeRemaining <= 60;

  const formatNum = (n: number) => n.toString().padStart(2, "0");

  return (
    <div
      className={`flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-lg font-bold transition-all duration-500 ${
        isCritical
          ? "bg-red-100 text-red-700 animate-pulse shadow-lg shadow-red-200"
          : isUrgent
            ? "bg-amber-100 text-amber-700 shadow-md shadow-amber-100"
            : "bg-gray-100 text-gray-700"
      }`}
    >
      {isCritical ? (
        <AlertTriangle className="h-5 w-5 animate-bounce" />
      ) : (
        <Clock className="h-5 w-5" />
      )}
      {hours > 0 && <span>{formatNum(hours)}:</span>}
      <span>{formatNum(minutes)}</span>
      <span className={isCritical ? "animate-pulse" : ""}>:</span>
      <span>{formatNum(seconds)}</span>
    </div>
  );
}
