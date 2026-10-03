import type { Metadata } from "next";
import { DEFAULT_OG_IMAGES } from "../../../lib/seo";
import { CATALOG } from "../../../lib/site-stats";

export const metadata: Metadata = {
  title: { absolute: "Entrance Exams in India 2026 — Dates, Syllabus & Registration" },
  description:
    `Complete guide to ${CATALOG.exams} entrance exams in India including JEE Main, NEET, CAT, GATE, CLAT, and more. Get exam dates, registration deadlines, syllabus, eligibility, and preparation tips.`,
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
    images: DEFAULT_OG_IMAGES,
    title: "Entrance Exams in India 2026 — Dates, Syllabus, Registration",
    description:
      `Complete guide to ${CATALOG.exams} entrance exams. Get dates, registration links, syllabus, and preparation tips.`,
    url: "https://www.mayrainternational.com/exams",
    type: "website",
  },
  alternates: {
    canonical: "https://www.mayrainternational.com/exams",
  },
};

export default function ExamsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
