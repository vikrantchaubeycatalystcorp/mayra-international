import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NavbarServer } from "../components/layout/NavbarServer";
import { FooterServer } from "../components/layout/FooterServer";
import dynamic from "next/dynamic";

const FloatingInquiryForm = dynamic(
  () => import("../components/shared/FloatingInquiryForm").then((m) => m.FloatingInquiryForm),
  { loading: () => null }
);
import { JsonLd, organizationJsonLd, websiteJsonLd } from "../lib/seo";
import { Suspense } from "react";
import { getLayoutMetadata } from "../lib/cached-queries";

export const revalidate = 300;

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
  const { seo, company } = await getLayoutMetadata();

  // Force correct domain — override any stale DB values pointing to old domain
  const rawSiteUrl = company?.siteUrl || "https://www.mayrainternational.com";
  const siteUrl = rawSiteUrl.includes("mayra.in") && !rawSiteUrl.includes("mayrainternational")
    ? "https://www.mayrainternational.com"
    : rawSiteUrl;
  const twitterHandle = company?.twitterHandle || "@mayraintl";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: seo?.title || "Mayra International — Find Your Dream College in India | 25,000+ Colleges",
      template: "%s | Mayra International",
    },
    description: seo?.description || "Mayra International — India's most trusted education portal. Explore 25,000+ colleges, 500+ entrance exams, and 800+ courses. Get expert guidance for JEE, NEET, CAT, GATE, and more.",
    keywords: seo?.keywords || [
      "Mayra International",
      "mayrainternational",
      "mayra international education",
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
    authors: [{ name: company?.name || "Mayra International" }],
    creator: company?.name || "Mayra International",
    publisher: company?.name || "Mayra International",
    openGraph: {
      type: "website",
      locale: "en_IN",
      url: siteUrl,
      siteName: company?.name || "Mayra International",
      title: seo?.ogTitle || "Mayra International — Find Your Dream College in India",
      description: seo?.ogDescription || "Mayra International — India's most trusted education portal. Explore 25,000+ colleges, 500+ entrance exams, and 800+ courses.",
      images: [
        {
          url: seo?.ogImage || "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${company?.name || "Mayra International"} — India's Most Trusted Education Portal`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: twitterHandle,
      creator: twitterHandle,
      title: seo?.ogTitle || "Mayra International — Find Your Dream College in India",
      description: seo?.ogDescription || "Mayra International — India's most trusted education portal. Explore 25,000+ colleges and get expert guidance.",
      images: [seo?.ogImage || "/og-image.png"],
    },
    verification: {
      google: "BvoI1CdDNvTp3m2ti5xMYQNDhNkz4HkQ46zDqBKiJoM",
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
      canonical: (seo?.canonical || siteUrl).replace(/https?:\/\/(www\.)?mayra\.in/g, "https://www.mayrainternational.com"),
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
        <meta name="google-site-verification" content="BvoI1CdDNvTp3m2ti5xMYQNDhNkz4HkQ46zDqBKiJoM" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
      </head>
      <body className="antialiased min-h-screen flex flex-col" suppressHydrationWarning>
        <Suspense fallback={<nav className="h-16 lg:h-[68px] bg-white/80 backdrop-blur-md border-b border-gray-200/50 fixed top-0 inset-x-0 z-50" />}>
          <NavbarServer />
        </Suspense>
        <main className="flex-1 pt-16 lg:pt-[68px]">{children}</main>
        <Suspense fallback={<footer className="bg-gray-900 h-64" />}>
          <FooterServer />
        </Suspense>
        <FloatingInquiryForm />
      </body>
    </html>
  );
}
