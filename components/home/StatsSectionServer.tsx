import { prisma } from "../../lib/db";
import { StatsSectionClient } from "./StatsSectionClient";

export async function StatsSectionServer() {
  const [stats, section] = await Promise.all([
    prisma.homeStat.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.homeSection.findUnique({ where: { sectionKey: "stats" } }),
  ]);

  // Guard against accidental duplicate seed rows by keeping first stat per label.
  const uniqueStats = Array.from(
    new Map(stats.map((stat) => [stat.label.trim().toLowerCase(), stat])).values()
  );

  return (
    <StatsSectionClient
      stats={uniqueStats}
      title={section?.title || "Trusted by Millions of Students"}
      subtitle={section?.subtitle || "India's most comprehensive education portal with verified data and expert guidance"}
    />
  );
}
