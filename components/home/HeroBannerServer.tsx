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
    <section className="relative min-h-[80vh] md:min-h-[92vh] flex items-center overflow-hidden">
      {/* Background image in server component for faster LCP */}
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
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0520]/90 via-[#12103a]/85 to-[#1a1145]/90" />
      <HeroBannerClient banner={banner || null} />
    </section>
  );
}
