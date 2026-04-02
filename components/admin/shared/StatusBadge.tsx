"use client";

import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  PENDING: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400", border: "border-amber-200/60" },
  UNDER_REVIEW: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400", border: "border-blue-200/60" },
  RESPONDED: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400", border: "border-emerald-200/60" },
  CLOSED: { bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400", border: "border-gray-200/60" },
  SPAM: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-400", border: "border-red-200/60" },
  LOW: { bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400", border: "border-gray-200/60" },
  NORMAL: { bg: "bg-blue-50", text: "text-blue-600", dot: "bg-blue-400", border: "border-blue-200/60" },
  HIGH: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-400", border: "border-orange-200/60" },
  URGENT: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500", border: "border-red-200/60" },
  true: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400", border: "border-emerald-200/60" },
  false: { bg: "bg-gray-50", text: "text-gray-500", dot: "bg-gray-400", border: "border-gray-200/60" },
  active: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400", border: "border-emerald-200/60" },
  inactive: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-400", border: "border-red-200/60" },
  featured: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400", border: "border-amber-200/60" },
  live: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400", border: "border-emerald-200/60" },
  draft: { bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400", border: "border-gray-200/60" },
  published: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400", border: "border-blue-200/60" },
  archived: { bg: "bg-slate-50", text: "text-slate-600", dot: "bg-slate-400", border: "border-slate-200/60" },
};

const DEFAULT_CONFIG = { bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400", border: "border-gray-200/60" };

interface StatusBadgeProps {
  status: string;
  label?: string;
  size?: "sm" | "md";
  showDot?: boolean;
  pulse?: boolean;
}

export function StatusBadge({ status, label, size = "sm", showDot = true, pulse = false }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || DEFAULT_CONFIG;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold",
        config.bg,
        config.text,
        config.border,
        size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-xs"
      )}
    >
      {showDot && (
        <span className="relative flex h-1.5 w-1.5">
          {pulse && (
            <span className={cn("absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping", config.dot)} />
          )}
          <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", config.dot)} />
        </span>
      )}
      {label || status.replace(/_/g, " ")}
    </span>
  );
}
