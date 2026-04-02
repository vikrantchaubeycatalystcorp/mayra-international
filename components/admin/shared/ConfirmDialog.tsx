"use client";

import { AlertTriangle, X, Trash2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  variant?: "danger" | "warning" | "info";
}

const VARIANTS = {
  danger: {
    iconBg: "bg-red-50",
    icon: Trash2,
    iconColor: "text-red-500",
    buttonBg: "bg-red-600 hover:bg-red-700 shadow-red-500/25",
  },
  warning: {
    iconBg: "bg-amber-50",
    icon: AlertTriangle,
    iconColor: "text-amber-500",
    buttonBg: "bg-amber-600 hover:bg-amber-700 shadow-amber-500/25",
  },
  info: {
    iconBg: "bg-blue-50",
    icon: Info,
    iconColor: "text-blue-500",
    buttonBg: "bg-blue-600 hover:bg-blue-700 shadow-blue-500/25",
  },
};

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Delete",
  loading,
  variant = "danger",
}: ConfirmDialogProps) {
  if (!open) return null;

  const v = VARIANTS[variant];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative bg-white rounded-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200"
        style={{ boxShadow: "0 25px 60px -12px rgba(0,0,0,0.25)" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", v.iconBg)}>
            <v.icon className={cn("w-5 h-5", v.iconColor)} />
          </div>
          <div className="pt-0.5">
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 mt-7">
          <button
            onClick={onClose}
            className="h-10 px-5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              "h-10 px-5 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-60 flex items-center gap-2 shadow-lg active:scale-[0.98]",
              v.buttonBg
            )}
          >
            {loading && (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
