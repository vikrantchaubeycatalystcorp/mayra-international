import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Courses in India 2026 — UG, PG, Diploma, PhD Programs",
  description:
    "Explore 800+ courses across engineering, medical, management, law, science, arts, and more. Compare duration, fees, eligibility, and career scope of top courses in India.",
  keywords: [
    "courses in india",
    "B.Tech courses",
    "MBA programs india",
    "medical courses",
    "engineering courses",
    "diploma courses",
    "top courses after 12th",
    "course fees comparison",
    "career scope courses",
  ],
  openGraph: {
    title: "Courses in India 2026 — Duration, Fees, Career Scope",
    description:
      "Explore 800+ UG, PG, Diploma, and PhD courses. Compare fees, eligibility, and career prospects.",
    url: "https://mayra.in/courses",
    type: "website",
  },
  alternates: {
    canonical: "https://mayra.in/courses",
  },
};

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
