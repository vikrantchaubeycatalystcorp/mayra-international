import { HeroBannerServer } from "../../components/home/HeroBannerServer";
import { StatsSectionServer } from "../../components/home/StatsSectionServer";
import { TopCollegesServer } from "../../components/home/TopCollegesServer";
import { TopExamsServer } from "../../components/home/TopExamsServer";
import { NewsSectionServer } from "../../components/home/NewsSectionServer";
import { FeaturedCoursesServer } from "../../components/home/FeaturedCoursesServer";
import { StudyAbroadTeaserServer } from "../../components/home/StudyAbroadTeaserServer";
import { CompareBar } from "../../components/colleges/CompareBar";
import { NewsletterCtaServer } from "./NewsletterCtaServer";

export const revalidate = 60;

export default async function HomePage() {
  return (
    <>
      <HeroBannerServer />
      <StatsSectionServer />
      <TopCollegesServer />
      <TopExamsServer />
      <NewsSectionServer />
      <FeaturedCoursesServer />
      <StudyAbroadTeaserServer />
      <NewsletterCtaServer />
      <CompareBar />
    </>
  );
}
