import type { Metadata } from "next";
import { DEFAULT_OG_IMAGES } from "../../../lib/seo";
import { CATALOG } from "../../../lib/site-stats";

export const metadata: Metadata = {
  title: { absolute: "Top Colleges in India 2026 — Rankings, Fees & Placements" },
  description:
    `Explore ${CATALOG.colleges} colleges in India. Compare NIRF rankings, fees, placements, cutoffs, and reviews for engineering, medical, management, law, and more. Find your perfect college.`,
  keywords: [
    "top colleges in india",
    "best engineering colleges",
    "medical colleges india",
    "NIRF ranking 2026",
    "college admissions 2026",
    "IIT admissions",
    "NIT colleges",
    "college fees comparison",
    "placement statistics india",
  ],
  openGraph: {
    images: DEFAULT_OG_IMAGES,
    title: "Top Colleges in India 2026 — Rankings, Fees, Placements",
    description:
      `Explore ${CATALOG.colleges} colleges with NIRF rankings, fees, placements, and reviews. Find your dream college.`,
    url: "https://www.mayrainternational.com/colleges",
    type: "website",
  },
  alternates: {
    canonical: "https://www.mayrainternational.com/colleges",
  },
};

export default function CollegesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
