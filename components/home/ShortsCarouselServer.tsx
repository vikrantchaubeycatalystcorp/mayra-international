import { prisma } from "../../lib/db";
import { ShortsCarouselClient } from "./ShortsCarouselClient";

export async function ShortsCarouselServer() {
  const [shorts, section] = await Promise.all([
    prisma.youTubeShort.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: 16,
    }),
    prisma.homeSection.findUnique({ where: { sectionKey: "youtube-shorts" } }),
  ]);

  // Hide the section entirely when there is nothing to show.
  if (shorts.length === 0) return null;

  return (
    <ShortsCarouselClient
      shorts={shorts.map((s) => ({
        id: s.id,
        title: s.title,
        videoId: s.videoId,
        type: s.type,
        thumbnail: s.thumbnail,
        category: s.category,
      }))}
      title={section?.title || "Watch & Learn"}
      subtitle={section?.subtitle || "Quick video guides, campus tours & exam tips for students"}
      ctaLabel={section?.ctaLabel ?? null}
      ctaLink={section?.ctaLink ?? null}
    />
  );
}
