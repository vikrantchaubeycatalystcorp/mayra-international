"use client";

import Link from "next/link";
import { Plus, Search } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  createHref?: string;
  createLabel?: string;
}

export function EmptyState({
  icon,
  title,
  description = "Get started by creating your first entry",
  createHref,
  createLabel = "Create New",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
        {icon || <Search className="w-7 h-7 text-gray-300" />}
      </div>
      <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      <p className="text-xs text-gray-400 mt-1 text-center max-w-xs">{description}</p>
      {createHref && (
        <Link
          href={createHref}
          className="mt-5 inline-flex items-center gap-2 h-9 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5" />
          {createLabel}
        </Link>
      )}
    </div>
  );
}
