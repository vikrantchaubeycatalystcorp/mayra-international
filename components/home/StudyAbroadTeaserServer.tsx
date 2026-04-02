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
      subtitle={section?.subtitle || "Explore world-class universities in 10+ countries. Over 3 lakh Indian students study abroad annually."}
      ctaLabel={section?.ctaLabel || "Explore All"}
      ctaLink={section?.ctaLink || "/study-abroad"}
    />
  );
}
