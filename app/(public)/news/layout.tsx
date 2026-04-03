import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Education News India 2026 — Exams, Admissions, Results, Rankings",
  description:
    "Latest education news and updates on entrance exams, admissions, results, NIRF rankings, scholarships, policy changes, and career guidance for students in India.",
  keywords: [
    "education news india",
    "exam results 2026",
    "admission updates",
    "NIRF rankings 2026",
    "scholarship news",
    "JEE Main news",
    "NEET updates",
    "college admissions news",
    "education policy india",
  ],
  openGraph: {
    title: "Education News India 2026 — Latest Updates",
    description:
      "Stay updated with the latest education news on exams, admissions, results, rankings, and scholarships.",
    url: "https://www.mayrainternational.com/news",
    type: "website",
  },
  alternates: {
    canonical: "https://www.mayrainternational.com/news",
  },
};

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
