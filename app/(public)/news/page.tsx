import { prisma } from "../../../lib/db";
import { NewsClient } from "./NewsClient";

export const revalidate = 60;

export default async function NewsPage() {
  const news = await prisma.newsArticle.findMany({
    where: { isActive: true },
    orderBy: { publishedAt: "desc" },
  });

  // Pre-compute category counts for the sidebar
  const categoryCounts: Record<string, number> = {};
  for (const article of news) {
    categoryCounts[article.category] = (categoryCounts[article.category] || 0) + 1;
  }

  return <NewsClient news={news} categoryCounts={categoryCounts} />;
}
