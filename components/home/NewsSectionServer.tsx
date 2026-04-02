import { prisma } from "../../lib/db";
import { NewsSectionClient } from "./NewsSectionClient";

export async function NewsSectionServer() {
  const [articles, section] = await Promise.all([
    prisma.newsArticle.findMany({
      where: { isActive: true, isLive: true },
      take: 10,
      orderBy: { publishedAt: "desc" },
    }),
    prisma.homeSection.findUnique({ where: { sectionKey: "news" } }),
  ]);

  return (
    <NewsSectionClient
      articles={articles}
      title={section?.title || "Latest News & Updates"}
      subtitle={section?.subtitle || "Stay updated with latest exam dates, results, and education news"}
      ctaLabel={section?.ctaLabel || "View All News"}
      ctaLink={section?.ctaLink || "/news"}
    />
  );
}
