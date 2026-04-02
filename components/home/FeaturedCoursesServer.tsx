import { prisma } from "../../lib/db";
import { FeaturedCoursesClient } from "./FeaturedCoursesClient";

export async function FeaturedCoursesServer() {
  const [courses, section, ctaSection] = await Promise.all([
    prisma.course.findMany({
      where: { isActive: true, isFeatured: true },
      take: 8,
      orderBy: { name: "asc" },
    }),
    prisma.homeSection.findUnique({ where: { sectionKey: "featured-courses" } }),
    prisma.ctaSection.findUnique({ where: { sectionKey: "career-test" } }),
  ]);

  return (
    <FeaturedCoursesClient
      courses={courses}
      title={section?.title || "Popular Courses"}
      subtitle={section?.subtitle || "Explore 800+ courses across engineering, medicine, law, management and more"}
      ctaLabel={section?.ctaLabel || "View All Courses"}
      ctaLink={section?.ctaLink || "/courses"}
      careerCtaHeading={ctaSection?.heading || "Not Sure Which Course to Choose?"}
      careerCtaSubheading={ctaSection?.subheading || "Take our free career aptitude test and get personalized course recommendations based on your interests and strengths."}
      careerCtaButtonText={ctaSection?.ctaPrimaryText || "Take Free Career Test"}
    />
  );
}
