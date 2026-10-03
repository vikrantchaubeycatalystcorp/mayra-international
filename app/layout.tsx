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
import { DEFAULT_OG_IMAGES, JsonLd, organizationJsonLd, websiteJsonLd } from "../lib/seo";
import { Suspense } from "react";
import { getFooterData, getLayoutMetadata } from "../lib/cached-queries";
import { GoogleAnalytics } from "../components/shared/GoogleAnalytics";
import { CATALOG, SITE_DESCRIPTION } from "../lib/site-stats";

// Home-page SEO rows in the CMS still carry old copy (inflated catalogue counts,
// "most trusted" claims). Ignore such values until the row is corrected.
const STALE_SEO_COPY = /25,000\+|500\+ (entrance )?exams|800\+ courses|most trusted|^Mayra —/i;
function freshSeo(value: string | null | undefined): string | undefined {
  return value && !STALE_SEO_COPY.test(value) ? value : undefined;
}

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

  const title = freshSeo(seo?.title) || `Mayra International — Colleges, Exams & Admission Counselling`;
  const description = freshSeo(seo?.description) || SITE_DESCRIPTION;
  const ogTitle = freshSeo(seo?.ogTitle) || title;
  const ogDescription = freshSeo(seo?.ogDescription) || description;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: "%s | Mayra International",
    },
    description,
    keywords: seo?.keywords || [
      "Mayra International",
      "mayrainternational",
      "education consultant Vashi",
      "education consultant Navi Mumbai",
      "college admissions india",
      "entrance exams india",
      "career counselling",
      "study abroad from india",
      `${CATALOG.colleges} colleges`,
    ],
    authors: [{ name: company?.name || "Mayra International" }],
    creator: company?.name || "Mayra International",
    publisher: company?.name || "Mayra International",
    // og:image comes from app/opengraph-image.tsx; pages that set openGraph re-add DEFAULT_OG_IMAGES.
    openGraph: {
      type: "website",
      locale: "en_IN",
      url: siteUrl,
      siteName: company?.name || "Mayra International",
      title: ogTitle,
      description: ogDescription,
    },
    twitter: {
      card: "summary_large_image",
      site: twitterHandle,
      creator: twitterHandle,
      title: ogTitle,
      description: ogDescription,
      images: DEFAULT_OG_IMAGES.map((image) => image.url),
    },
    // Google requires the favicon to be a square multiple of 48px (48, 96, 144…);
    // anything else falls back to the generic globe in search results. Serve these
    // from /public so the URLs stay stable across deploys and skip /_next/image.
    icons: {
      icon: [
        { url: "/favicon-96.png", sizes: "96x96", type: "image/png" },
        { url: "/favicon-144.png", sizes: "144x144", type: "image/png" },
        { url: "/favicon-192.png", sizes: "192x192", type: "image/png" },
      ],
      apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    },
    manifest: "/manifest.webmanifest",
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
    category: "education",
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { socialLinks } = await getFooterData();
  const profileUrls = socialLinks.map((link) => link.url).filter((url) => /^https:\/\//.test(url));
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="rjceF4dV_VTYq5WSXdlb1UxWTK8SfDSS_SRgsOjQW5E" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <JsonLd data={organizationJsonLd(profileUrls)} />
        <JsonLd data={websiteJsonLd()} />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        <Suspense fallback={<nav className="h-16 lg:h-[68px] bg-white/80 backdrop-blur-md border-b border-gray-200/50 fixed top-0 inset-x-0 z-50" />}>
          <NavbarServer />
        </Suspense>
        <main className="flex-1 pt-16 lg:pt-[68px]">{children}</main>
        <Suspense fallback={<footer className="bg-gray-900 h-64" />}>
          <FooterServer />
        </Suspense>
        <FloatingInquiryForm />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
