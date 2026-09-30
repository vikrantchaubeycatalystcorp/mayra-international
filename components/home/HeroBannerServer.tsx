import Image from "next/image";
import { prisma } from "../../lib/db";
import { normalizeImageUrl } from "../../lib/utils";
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

  // Normalize the admin-supplied URL (Google Drive share links → direct thumbnail);
  // returns "" for null/empty so we fall back to the default hero photo.
  // Uploaded images are stored inline as data: URLs — never put those in the HTML
  // (they bloat <head> via the preload and hide the favicon from Google); serve
  // them from /media/hero instead, versioned by updatedAt for cache busting.
  const rawBg = normalizeImageUrl(banner?.bgImage);
  const bgImage =
    banner && rawBg.startsWith("data:")
      ? `/media/hero/${banner.id}/${banner.updatedAt.getTime()}`
      : rawBg || DEFAULT_BG;
  // The client never renders bgImage; keep the raw value out of the RSC payload.
  const clientBanner = banner ? { ...banner, bgImage: null } : null;

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
      {/* Light scrim — keeps text legible on the left while the photo stays clearly visible */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />
      <HeroBannerClient banner={clientBanner} />
    </section>
  );
}
