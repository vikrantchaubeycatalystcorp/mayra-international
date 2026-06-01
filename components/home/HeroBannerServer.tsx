import Image from "next/image";
import { prisma } from "../../lib/db";
import { HeroBannerClient } from "./HeroBannerClient";

const DEFAULT_BG = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1920&q=80&auto=format&fit=crop";

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

  const bgImage = banner?.bgImage || DEFAULT_BG;

  return (
    <section className="relative min-h-[72vh] md:min-h-[82vh] flex items-center overflow-hidden border-b border-[#E8E1D4]">
      {/* Background image in server component for faster LCP — kept as-is */}
      <Image
        src={bgImage}
        alt=""
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        className="object-cover object-center"
        quality={75}
      />
      {/* Editorial scrim — keeps the left-aligned headline legible while the photo stays visible */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1B1814]/70 via-[#1B1814]/35 to-transparent" />
      <HeroBannerClient banner={banner || null} />
      {/* Fade into the paper page below */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#FBF9F4] to-transparent" />
    </section>
  );
}
