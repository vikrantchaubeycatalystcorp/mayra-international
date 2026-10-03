import { prisma } from "../../lib/db";
import { StudyAbroadTeaserClient } from "./StudyAbroadTeaserClient";

export async function StudyAbroadTeaserServer() {
  const [countries, section] = await Promise.all([
    prisma.studyAbroadCountry.findMany({
      where: { isActive: true },
      take: 6,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.homeSection.findUnique({ where: { sectionKey: "study-abroad" } }),
  ]);

  return (
    <StudyAbroadTeaserClient
      countries={countries}
      title={section?.title || "Study Abroad"}
      subtitle={
        section?.subtitle && !/lakh|million/i.test(section.subtitle)
          ? section.subtitle
          : "Compare universities, costs and courses across popular study abroad destinations."
      }
      ctaLabel={section?.ctaLabel || "Explore All"}
      ctaLink={section?.ctaLink || "/study-abroad"}
    />
  );
}
