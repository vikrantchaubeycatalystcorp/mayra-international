"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toast: (options: Omit<Toast, "id">) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const TOAST_ICONS: Record<ToastType, React.ElementType> = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const TOAST_STYLES: Record<ToastType, { bg: string; icon: string; border: string }> = {
  success: { bg: "bg-emerald-50", icon: "text-emerald-500", border: "border-emerald-100" },
  error: { bg: "bg-red-50", icon: "text-red-500", border: "border-red-100" },
  warning: { bg: "bg-amber-50", icon: "text-amber-500", border: "border-amber-100" },
  info: { bg: "bg-blue-50", icon: "text-blue-500", border: "border-blue-100" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (options: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).slice(2, 9);
      const newToast: Toast = { id, ...options };
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => removeToast(id), options.duration || 4000);
    },
    [removeToast]
  );

  const contextValue: ToastContextType = {
    toast: addToast,
    success: (title, message) => addToast({ type: "success", title, message }),
    error: (title, message) => addToast({ type: "error", title, message }),
    warning: (title, message) => addToast({ type: "warning", title, message }),
    info: (title, message) => addToast({ type: "info", title, message }),
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 w-[380px] max-w-[calc(100vw-2rem)] pointer-events-none">
        {toasts.map((t) => {
          const Icon = TOAST_ICONS[t.type];
          const styles = TOAST_STYLES[t.type];
          return (
            <div
              key={t.id}
              className={cn(
                "pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg toast-enter",
                styles.bg,
                styles.border
              )}
              style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)" }}
            >
              <Icon className={cn("w-5 h-5 shrink-0 mt-0.5", styles.icon)} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{t.title}</p>
                {t.message && (
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{t.message}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 p-0.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-black/5 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
