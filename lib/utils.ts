import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount}`;
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return num.toString();
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + "..." : str;
}

export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getReadTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function getGradientForLetter(letter: string): string {
  const gradients: Record<string, string> = {
    A: "from-red-500 to-orange-500",
    B: "from-blue-500 to-cyan-500",
    C: "from-green-500 to-teal-500",
    D: "from-purple-500 to-pink-500",
    E: "from-yellow-500 to-orange-500",
    F: "from-pink-500 to-rose-500",
    G: "from-indigo-500 to-purple-500",
    H: "from-cyan-500 to-blue-500",
    I: "from-teal-500 to-green-500",
    J: "from-orange-500 to-red-500",
    K: "from-violet-500 to-indigo-500",
    L: "from-sky-500 to-blue-500",
    M: "from-emerald-500 to-teal-500",
    N: "from-blue-600 to-indigo-600",
    O: "from-amber-500 to-yellow-500",
    P: "from-rose-500 to-pink-500",
    Q: "from-lime-500 to-green-500",
    R: "from-red-600 to-rose-500",
    S: "from-slate-600 to-blue-600",
    T: "from-teal-600 to-cyan-500",
    U: "from-purple-600 to-violet-500",
    V: "from-fuchsia-500 to-purple-500",
    W: "from-blue-700 to-blue-500",
    X: "from-gray-600 to-slate-500",
    Y: "from-yellow-600 to-amber-500",
    Z: "from-zinc-600 to-gray-500",
  };
  return gradients[letter.toUpperCase()] || "from-blue-600 to-blue-400";
}
