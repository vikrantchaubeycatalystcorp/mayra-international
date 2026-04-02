import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Entrance Exams in India 2026 — Dates, Registration, Syllabus",
  description:
    "Complete guide to 500+ entrance exams in India including JEE Main, NEET, CAT, GATE, CLAT, and more. Get exam dates, registration deadlines, syllabus, eligibility, and preparation tips.",
  keywords: [
    "entrance exams india 2026",
    "JEE Main 2026",
    "NEET 2026",
    "CAT 2026",
    "GATE 2026",
    "CLAT 2026",
    "exam dates",
    "exam registration",
    "exam syllabus",
    "entrance exam preparation",
  ],
  openGraph: {
    title: "Entrance Exams in India 2026 — Dates, Syllabus, Registration",
    description:
      "Complete guide to 500+ entrance exams. Get dates, registration links, syllabus, and preparation tips.",
    url: "https://mayra.in/exams",
    type: "website",
  },
  alternates: {
    canonical: "https://mayra.in/exams",
  },
};

export default function ExamsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
