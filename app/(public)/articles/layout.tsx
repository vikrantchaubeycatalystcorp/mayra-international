import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Education Articles & Guides — Expert Advice for Students",
  description:
    "Read expert articles and guides on college admissions, career planning, study tips, entrance exam preparation, and education trends in India.",
  keywords: [
    "education articles",
    "college admission guide",
    "career guidance students",
    "study tips",
    "entrance exam preparation guide",
    "education blogs india",
  ],
  openGraph: {
    title: "Education Articles & Guides",
    description:
      "Expert articles on admissions, career planning, study tips, and entrance exam preparation.",
    url: "https://mayra.in/articles",
    type: "website",
  },
  alternates: {
    canonical: "https://mayra.in/articles",
  },
};

export default function ArticlesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
