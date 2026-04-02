import { prisma } from "../../lib/db";
import { TopCollegesClient } from "./TopCollegesClient";

export async function TopCollegesServer() {
  const [colleges, section, totalCount] = await Promise.all([
    prisma.college.findMany({
      where: { isActive: true },
      take: 40,
      orderBy: [{ isFeatured: "desc" }, { nirfRank: "asc" }, { rating: "desc" }],
    }),
    prisma.homeSection.findUnique({ where: { sectionKey: "top-colleges" } }),
    prisma.college.count({ where: { isActive: true } }),
  ]);

  return (
    <TopCollegesClient
      colleges={colleges}
      totalCount={totalCount}
      title={section?.title || "Top Colleges in India"}
      subtitle={section?.subtitle || "Discover the best colleges ranked by NIRF, ratings, and placements"}
      ctaLabel={section?.ctaLabel || "View All Colleges"}
      ctaLink={section?.ctaLink || "/colleges"}
    />
  );
}
