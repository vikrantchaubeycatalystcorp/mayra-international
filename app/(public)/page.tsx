import { Suspense } from "react";
import { HeroBannerServer } from "../../components/home/HeroBannerServer";
import { StatsSectionServer } from "../../components/home/StatsSectionServer";
import { TopCollegesServer } from "../../components/home/TopCollegesServer";
import { TopExamsServer } from "../../components/home/TopExamsServer";
import { ShortsCarouselServer } from "../../components/home/ShortsCarouselServer";
import { NewsSectionServer } from "../../components/home/NewsSectionServer";
import { FeaturedCoursesServer } from "../../components/home/FeaturedCoursesServer";
import { StudyAbroadTeaserServer } from "../../components/home/StudyAbroadTeaserServer";
import { CompareBar } from "../../components/colleges/CompareBar";
import { NewsletterCtaServer } from "./NewsletterCtaServer";
import type { Metadata } from "next";
import { SITE_URL } from "../../lib/sitemap";

export const revalidate = 300;

// Set here rather than in the root layout, where every page would inherit it.
export const metadata: Metadata = {
  alternates: { canonical: SITE_URL },
};

function SectionSkeleton({ height = "h-64" }: { height?: string }) {
  return <div className={`${height} bg-gray-100 animate-pulse`} />;
}

export default async function HomePage() {
  return (
    <>
      <Suspense fallback={<SectionSkeleton height="h-[420px]" />}>
        <HeroBannerServer />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height="h-24" />}>
        <StatsSectionServer />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height="h-96" />}>
        <TopCollegesServer />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <TopExamsServer />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <ShortsCarouselServer />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <NewsSectionServer />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <FeaturedCoursesServer />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <StudyAbroadTeaserServer />
      </Suspense>
      <NewsletterCtaServer />
      <CompareBar />
    </>
  );
}
