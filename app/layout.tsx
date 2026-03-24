import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Mayra — Find Your Dream College in India",
    template: "%s | Mayra",
  },
  description:
    "India's most trusted education portal. Explore 25,000+ colleges, 500+ entrance exams, and 800+ courses. Get expert guidance for JEE, NEET, CAT, and more.",
  keywords: [
    "education portal india",
    "college admissions india",
    "JEE Main",
    "NEET",
    "CAT MBA",
    "GATE",
    "top colleges india",
    "NIRF rankings",
    "engineering colleges",
    "medical colleges",
    "study abroad",
  ],
  authors: [{ name: "Mayra Team" }],
  creator: "Mayra",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://mayra.in",
    siteName: "Mayra",
    title: "Mayra — Find Your Dream College in India",
    description:
      "India's most trusted education portal. Explore 25,000+ colleges, 500+ entrance exams, and 800+ courses.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mayra — Find Your Dream College",
    description:
      "India's most trusted education portal. Explore 25,000+ colleges and get expert guidance.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col" suppressHydrationWarning>
        <Navbar />
        <main className="flex-1 pt-[68px]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
