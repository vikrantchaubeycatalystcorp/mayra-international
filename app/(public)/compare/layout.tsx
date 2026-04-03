import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Colleges — Side-by-Side Rankings, Fees, Placements",
  description:
    "Compare top colleges in India side by side. Analyze NIRF rankings, fee structures, placement statistics, courses offered, and accreditations to make the right choice.",
  keywords: [
    "compare colleges india",
    "college comparison tool",
    "IIT vs NIT",
    "college ranking comparison",
    "fees comparison colleges",
    "placement comparison",
  ],
  openGraph: {
    title: "Compare Colleges — Side-by-Side Analysis",
    description:
      "Compare top colleges side by side on rankings, fees, placements, and more.",
    url: "https://www.mayrainternational.com/compare",
    type: "website",
  },
  alternates: {
    canonical: "https://www.mayrainternational.com/compare",
  },
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
