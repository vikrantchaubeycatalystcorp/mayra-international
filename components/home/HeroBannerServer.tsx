import { prisma } from "../../lib/db";
import { HeroBannerClient } from "./HeroBannerClient";

export async function HeroBannerServer() {
  const banner = await prisma.heroBanner.findFirst({
    where: { isActive: true },
    include: {
      stats: { orderBy: { sortOrder: "asc" } },
      searchTabs: { orderBy: { sortOrder: "asc" } },
      quickFilters: { orderBy: { sortOrder: "asc" } },
      popularSearches: { orderBy: { sortOrder: "asc" } },
      floatingCards: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
    },
    orderBy: { sortOrder: "asc" },
  });

  if (!banner) {
    // Fallback to hardcoded defaults if no banner in DB
    return <HeroBannerClient banner={null} />;
  }

  return <HeroBannerClient banner={banner} />;
}
