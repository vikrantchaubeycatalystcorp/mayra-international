import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NavbarServer } from "../components/layout/NavbarServer";
import { FooterServer } from "../components/layout/FooterServer";
import { FloatingInquiryForm } from "../components/shared/FloatingInquiryForm";
import { JsonLd, organizationJsonLd, websiteJsonLd } from "../lib/seo";
import { prisma } from "../lib/db";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1e40af",
};

export async function generateMetadata(): Promise<Metadata> {
  const [seo, company] = await Promise.all([
    prisma.pageSeo.findUnique({ where: { pageSlug: "home" } }),
    prisma.companyInfo.findFirst(),
  ]);

  const siteUrl = company?.siteUrl || "https://mayra.in";
  const twitterHandle = company?.twitterHandle || "@mayra_in";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: seo?.title || "Mayra — Find Your Dream College in India | 25,000+ Colleges",
      template: "%s | Mayra",
    },
    description: seo?.description || "India's most trusted education portal. Explore 25,000+ colleges, 500+ entrance exams, and 800+ courses. Get expert guidance for JEE, NEET, CAT, GATE, and more.",
    keywords: seo?.keywords || [
      "education portal india",
      "college admissions india",
      "JEE Main 2026",
      "NEET 2026",
      "CAT MBA",
      "GATE",
      "top colleges india",
      "NIRF rankings 2026",
      "engineering colleges",
      "medical colleges",
      "study abroad from india",
      "best colleges in india",
      "entrance exams india",
      "college fees comparison",
      "placement statistics",
    ],
    authors: [{ name: company?.name || "Mayra Team" }],
    creator: company?.name || "Mayra",
    publisher: company?.name || "Mayra International",
    openGraph: {
      type: "website",
      locale: "en_IN",
      url: siteUrl,
      siteName: company?.name || "Mayra",
      title: seo?.ogTitle || "Mayra — Find Your Dream College in India",
      description: seo?.ogDescription || "India's most trusted education portal. Explore 25,000+ colleges, 500+ entrance exams, and 800+ courses.",
      images: [
        {
          url: seo?.ogImage || "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${company?.name || "Mayra"} — India's Most Trusted Education Portal`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: twitterHandle,
      creator: twitterHandle,
      title: seo?.ogTitle || "Mayra — Find Your Dream College in India",
      description: seo?.ogDescription || "India's most trusted education portal. Explore 25,000+ colleges and get expert guidance.",
      images: [seo?.ogImage || "/og-image.png"],
    },
    robots: {
      index: !seo?.noIndex,
      follow: true,
      googleBot: {
        index: !seo?.noIndex,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: seo?.canonical || siteUrl,
    },
    category: "education",
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
      </head>
      <body className="antialiased min-h-screen flex flex-col" suppressHydrationWarning>
        <NavbarServer />
        <main className="flex-1 pt-[72px]">{children}</main>
        <FooterServer />
        <FloatingInquiryForm />
      </body>
    </html>
  );
}
