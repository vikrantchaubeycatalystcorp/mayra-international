import type { Metadata } from "next";
import { DEFAULT_OG_IMAGES } from "../../../lib/seo";
import { CATALOG } from "../../../lib/site-stats";

export const metadata: Metadata = {
  title: { absolute: "Courses in India 2026 — UG, PG, Diploma & PhD Programs" },
  description:
    `Explore ${CATALOG.courses} courses across engineering, medical, management, law, science, arts, and more. Compare duration, fees, eligibility, and career scope of top courses in India.`,
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
    images: DEFAULT_OG_IMAGES,
    title: "Courses in India 2026 — Duration, Fees, Career Scope",
    description:
      `Explore ${CATALOG.courses} UG, PG, Diploma, and PhD courses. Compare fees, eligibility, and career prospects.`,
    url: "https://www.mayrainternational.com/courses",
    type: "website",
  },
  alternates: {
    canonical: "https://www.mayrainternational.com/courses",
  },
};

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
