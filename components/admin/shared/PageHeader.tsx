"use client";

import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  createHref?: string;
  createLabel?: string;
  actions?: React.ReactNode;
  badge?: string;
  icon?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  backHref,
  backLabel = "Back",
  createHref,
  createLabel = "Add New",
  actions,
  badge,
  icon,
}: PageHeaderProps) {
  return (
    <div className="mb-6">
      {/* Back Link */}
      {backHref && (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-[13px] text-gray-400 hover:text-gray-600 mb-4 transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          {backLabel}
        </Link>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50 flex items-center justify-center text-blue-600">
              {icon}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h1>
              {badge && (
                <span className="inline-flex items-center h-5 px-2 rounded-md bg-blue-50 text-[10px] font-bold text-blue-600 border border-blue-100">
                  {badge}
                </span>
              )}
            </div>
            {description && (
              <p className="text-sm text-gray-500 mt-0.5">{description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {actions}
          {createHref && (
            <Link
              href={createHref}
              className="inline-flex items-center gap-2 h-10 px-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              {createLabel}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
