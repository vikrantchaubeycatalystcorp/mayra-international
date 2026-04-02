import { prisma } from "../../lib/db";
import { TopExamsClient } from "./TopExamsClient";

export async function TopExamsServer() {
  const [exams, section] = await Promise.all([
    prisma.exam.findMany({
      where: { isActive: true, isFeatured: true },
      take: 6,
      orderBy: { name: "asc" },
    }),
    prisma.homeSection.findUnique({ where: { sectionKey: "top-exams" } }),
  ]);

  return (
    <TopExamsClient
      exams={exams}
      title={section?.title || "Top Entrance Exams 2025-26"}
      subtitle={section?.subtitle || "Stay ahead with exam dates, syllabus and preparation tips"}
      ctaLabel={section?.ctaLabel || "View All Exams"}
      ctaLink={section?.ctaLink || "/exams"}
    />
  );
}
