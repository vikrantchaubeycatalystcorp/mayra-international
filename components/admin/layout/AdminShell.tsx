"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAdminAuth, fetchAdminProfile } from "@/hooks/admin/useAdminAuth";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { ToastProvider } from "@/components/admin/shared/Toast";
import { cn } from "@/lib/utils";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { admin, isAuthenticated, setAdmin, logout } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function checkAuth() {
      try {
        const profile = await fetchAdminProfile();
        if (profile) {
          setAdmin(profile);
        } else {
          logout();
          router.push("/admin/login");
        }
      } catch {
        logout();
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        <div className="flex flex-col items-center gap-5">
          {/* Logo with glow */}
          <div className="relative">
            <div className="absolute inset-0 w-14 h-14 rounded-2xl bg-blue-500/20 blur-xl animate-pulse" />
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/25">
              <span className="text-xl font-bold text-white">M</span>
            </div>
          </div>

          {/* Loading text */}
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700">Mayra International</p>
            <p className="text-xs text-gray-400 mt-1">Loading admin portal...</p>
          </div>

          {/* Premium loading bar */}
          <div className="w-48 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-[shimmer_1.5s_ease-in-out_infinite]"
              style={{ animation: "loadingBar 1.2s ease-in-out infinite" }}
            />
          </div>
        </div>

        <style jsx>{`
          @keyframes loadingBar {
            0% { transform: translateX(-100%); width: 40%; }
            50% { width: 60%; }
            100% { transform: translateX(250%); width: 40%; }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50/50">
        <AdminSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        <div
          className={cn(
            "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
            collapsed ? "lg:ml-[72px]" : "lg:ml-[270px]"
          )}
        >
          <AdminHeader onMenuToggle={() => setMobileOpen(true)} />
          <main className="p-4 lg:p-6 page-enter" key={pathname}>
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
