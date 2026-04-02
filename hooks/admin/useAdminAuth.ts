"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AdminRole } from "@/types/admin";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatar?: string | null;
}

interface AdminAuthStore {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  setAdmin: (admin: AdminUser) => void;
  logout: () => void;
}

export const useAdminAuth = create<AdminAuthStore>()(
  persist(
    (set) => ({
      admin: null,
      isAuthenticated: false,
      setAdmin: (admin) => set({ admin, isAuthenticated: true }),
      logout: () => set({ admin: null, isAuthenticated: false }),
    }),
    {
      name: "admin-auth-store",
    }
  )
);

export async function adminLogin(email: string, password: string) {
  const res = await fetch("/api/admin/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Login failed");
  return data.data;
}

export async function adminLogout() {
  await fetch("/api/admin/auth/logout", { method: "POST" });
}

export async function fetchAdminProfile() {
  const res = await fetch("/api/admin/auth/me");
  if (!res.ok) return null;
  const data = await res.json();
  return data.data;
}
