import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Mock Tests 2026 — JEE, NEET, GATE, CAT, UPSC, SSC | Mayra International",
  description:
    "Take free mock tests for JEE Main, NEET, GATE, CAT, UPSC, SSC CGL, Banking PO, CUET, and NDA. 200+ questions with real exam patterns, instant results, detailed solutions, and competitive leaderboards.",
  keywords: [
    "free mock test",
    "JEE mock test",
    "NEET mock test",
    "GATE mock test",
    "CAT mock test",
    "UPSC prelims mock",
    "SSC CGL mock test",
    "online practice test",
    "exam preparation",
    "mock test with leaderboard",
    "competitive exam practice",
  ],
  openGraph: {
    title: "Free Mock Tests — Practice for JEE, NEET, GATE, CAT & More",
    description:
      "200+ questions across 10 exam categories. Take timed tests, compete on leaderboards, and track your progress.",
    url: "https://www.mayrainternational.com/mock-tests",
    type: "website",
  },
  alternates: {
    canonical: "https://www.mayrainternational.com/mock-tests",
  },
};

export default function MockTestsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
