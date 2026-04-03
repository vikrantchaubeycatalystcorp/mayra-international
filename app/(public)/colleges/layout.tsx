import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Top Colleges in India 2026 — Rankings, Fees, Admissions, Placements",
  description:
    "Explore 25,000+ colleges in India. Compare NIRF rankings, fees, placements, cutoffs, and reviews for engineering, medical, management, law, and more. Find your perfect college.",
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
    title: "Top Colleges in India 2026 — Rankings, Fees, Placements",
    description:
      "Explore 25,000+ colleges with NIRF rankings, fees, placements, and reviews. Find your dream college.",
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
