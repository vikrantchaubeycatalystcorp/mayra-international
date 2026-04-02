"use client";

import { useRouter } from "next/navigation";
import { useAdminAuth, adminLogout } from "@/hooks/admin/useAdminAuth";
import { getInitials } from "@/lib/utils";
import { Breadcrumbs } from "@/components/admin/shared/Breadcrumbs";
import { CommandPalette } from "@/components/admin/shared/CommandPalette";
import {
  Menu,
  Search,
  Bell,
  LogOut,
  Settings,
  ChevronDown,
  Command,
  User,
  Clock,
  CheckCircle2,
  MessageSquare,
  AlertCircle,
  ExternalLink,
  Moon,
  Sun,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface AdminHeaderProps {
  onMenuToggle: () => void;
}

interface NotifItem {
  id: string;
  type: "enquiry" | "system" | "success" | "warning";
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const SAMPLE_NOTIFICATIONS: NotifItem[] = [
  { id: "1", type: "enquiry", title: "New enquiry received", description: "A student has enquired about IIT Delhi admissions", time: "2m ago", read: false },
  { id: "2", type: "success", title: "College data imported", description: "Successfully imported 12 new college entries", time: "15m ago", read: false },
  { id: "3", type: "system", title: "System update", description: "Portal v2.4 deployed with performance improvements", time: "1h ago", read: true },
  { id: "4", type: "warning", title: "Storage usage 85%", description: "Media library storage nearing capacity", time: "3h ago", read: true },
];

const NOTIF_ICONS: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  enquiry: { icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-50" },
  success: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
  system: { icon: AlertCircle, color: "text-violet-500", bg: "bg-violet-50" },
  warning: { icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-50" },
};

export function AdminHeader({ onMenuToggle }: AdminHeaderProps) {
  const { admin, logout } = useAdminAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Ctrl+K handler
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = async () => {
    await adminLogout();
    logout();
    router.push("/admin/login");
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between h-[65px] px-4 lg:px-6 bg-white/80 border-b border-gray-200/60 backdrop-blur-xl">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumbs */}
          <div className="hidden md:block">
            <Breadcrumbs />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5">
          {/* Command Palette Trigger */}
          <button
            onClick={() => setCommandOpen(true)}
            className="hidden sm:flex items-center gap-2.5 h-9 px-3.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200/80 text-gray-500 hover:text-gray-700 transition-all group"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="text-xs text-gray-400 group-hover:text-gray-500">Search...</span>
            <div className="flex items-center gap-0.5 ml-3">
              <kbd className="inline-flex items-center justify-center h-5 px-1.5 rounded bg-white border border-gray-200 text-[10px] font-medium text-gray-400 shadow-sm">
                Ctrl
              </kbd>
              <kbd className="inline-flex items-center justify-center h-5 w-5 rounded bg-white border border-gray-200 text-[10px] font-medium text-gray-400 shadow-sm">
                K
              </kbd>
            </div>
          </button>

          {/* Mobile search button */}
          <button
            onClick={() => setCommandOpen(true)}
            className="sm:hidden p-2.5 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <Search className="w-[18px] h-[18px]" />
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className={cn(
                "relative p-2.5 rounded-xl text-gray-500 transition-all",
                notifOpen ? "bg-gray-100 text-gray-700" : "hover:bg-gray-100"
              )}
            >
              <Bell className="w-[18px] h-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex items-center justify-center w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white ring-2 ring-white notif-dot">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Panel */}
            {notifOpen && (
              <div className="absolute right-[-0.5rem] sm:right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-200/60 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                style={{ boxShadow: "0 16px 48px -8px rgba(0,0,0,0.12), 0 4px 16px -4px rgba(0,0,0,0.08)" }}>
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">{unreadCount} unread</p>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[11px] font-medium text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notification List */}
                <div className="max-h-[360px] overflow-y-auto admin-sidebar-scroll">
                  {notifications.map((notif) => {
                    const config = NOTIF_ICONS[notif.type];
                    return (
                      <div
                        key={notif.id}
                        className={cn(
                          "flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50/80 transition-colors cursor-pointer border-b border-gray-50 last:border-b-0",
                          !notif.read && "bg-blue-50/30"
                        )}
                      >
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5", config.bg)}>
                          <config.icon className={cn("w-4 h-4", config.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={cn("text-xs font-semibold truncate", notif.read ? "text-gray-700" : "text-gray-900")}>
                              {notif.title}
                            </p>
                            {!notif.read && (
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">{notif.description}</p>
                          <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {notif.time}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
                  <button
                    onClick={() => { setNotifOpen(false); router.push("/admin/logs"); }}
                    className="w-full text-center text-[11px] font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center justify-center gap-1"
                  >
                    View all activity
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-gray-200/80 mx-1" />

          {/* Profile */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={cn(
                "flex items-center gap-2.5 p-1.5 pr-3 rounded-xl transition-all",
                dropdownOpen ? "bg-gray-100" : "hover:bg-gray-50"
              )}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {admin ? getInitials(admin.name) : "A"}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-[13px] font-semibold text-gray-800 leading-none">
                  {admin?.name || "Admin"}
                </p>
                <p className="text-[10px] text-gray-500 leading-none mt-1">
                  {admin?.role?.replace("_", " ") || "Admin"}
                </p>
              </div>
              <ChevronDown className={cn("w-3.5 h-3.5 text-gray-400 hidden md:block transition-transform duration-200", dropdownOpen && "rotate-180")} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-[-0.5rem] sm:right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-64 bg-white rounded-2xl shadow-2xl border border-gray-200/60 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                style={{ boxShadow: "0 16px 48px -8px rgba(0,0,0,0.12), 0 4px 16px -4px rgba(0,0,0,0.08)" }}>
                {/* User Info */}
                <div className="px-4 py-3.5 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                      {admin ? getInitials(admin.name) : "A"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{admin?.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{admin?.email}</p>
                    </div>
                  </div>
                  <div className="mt-2.5 flex items-center gap-1.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-[10px] font-semibold text-blue-600 border border-blue-100">
                      {admin?.role?.replace("_", " ") || "Admin"}
                    </span>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-1.5 px-1.5">
                  <button
                    onClick={() => { setDropdownOpen(false); router.push("/admin/settings"); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-gray-400" />
                    Settings
                  </button>
                  <button
                    onClick={() => { setDropdownOpen(false); router.push("/admin/logs"); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Clock className="w-4 h-4 text-gray-400" />
                    Activity Logs
                  </button>
                </div>

                {/* Logout */}
                <div className="border-t border-gray-100 p-1.5">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Command Palette */}
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
    </>
  );
}
