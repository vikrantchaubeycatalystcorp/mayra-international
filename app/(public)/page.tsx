import { Suspense } from "react";
import { HeroBannerServer } from "../../components/home/HeroBannerServer";
import { StatsSectionServer } from "../../components/home/StatsSectionServer";
import { TopCollegesServer } from "../../components/home/TopCollegesServer";
import { TopExamsServer } from "../../components/home/TopExamsServer";
import { NewsSectionServer } from "../../components/home/NewsSectionServer";
import { FeaturedCoursesServer } from "../../components/home/FeaturedCoursesServer";
import { StudyAbroadTeaserServer } from "../../components/home/StudyAbroadTeaserServer";
import { CompareBar } from "../../components/colleges/CompareBar";
import { NewsletterCtaServer } from "./NewsletterCtaServer";

export const revalidate = 300;

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
