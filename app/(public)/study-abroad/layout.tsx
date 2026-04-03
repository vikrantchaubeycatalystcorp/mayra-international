import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Study Abroad from India 2026 — Countries, Universities, Costs, Scholarships",
  description:
    "Complete guide to studying abroad for Indian students. Explore top destinations — USA, UK, Canada, Australia, Germany. Compare universities, costs, scholarships, visa requirements, and MBBS abroad options.",
  keywords: [
    "study abroad from india",
    "study in usa",
    "study in uk",
    "study in canada",
    "study in germany",
    "study in australia",
    "MBBS abroad",
    "study abroad scholarships",
    "study abroad cost",
    "international universities for indian students",
  ],
  openGraph: {
    title: "Study Abroad from India 2026 — Complete Guide",
    description:
      "Explore top study abroad destinations. Compare universities, costs, scholarships, and visa requirements.",
    url: "https://www.mayrainternational.com/study-abroad",
    type: "website",
  },
  alternates: {
    canonical: "https://www.mayrainternational.com/study-abroad",
  },
};

export default function StudyAbroadLayout({ children }: { children: React.ReactNode }) {
  return children;
}
