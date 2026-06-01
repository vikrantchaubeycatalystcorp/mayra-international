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
  // Editorial palette — pine / gold / result-teal / ink. Assigned
  // deterministically per letter so avatars vary but stay on-brand.
  const palette = [
    "from-[#256B50] to-[#164A37]", // pine
    "from-[#C8841B] to-[#A96A0F]", // marigold
    "from-[#0E6E78] to-[#0a525a]", // result teal
    "from-[#1C5A42] to-[#11392B]", // deep pine
    "from-[#574F45] to-[#1B1814]", // ink
    "from-[#9A6410] to-[#6E4309]", // amber-brown
  ];
  const code = (letter.toUpperCase().charCodeAt(0) || 65) - 65;
  return palette[((code % palette.length) + palette.length) % palette.length];
}
