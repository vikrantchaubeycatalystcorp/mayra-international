import { prisma } from "../db";

export async function getNewsArticles(params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  tag?: string;
}) {
  const { page = 1, limit = 10, category, search, tag } = params || {};
  const where: any = { isActive: true, isLive: true };
  if (category) where.category = category;
  if (tag) where.tags = { has: tag };
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { summary: { contains: search, mode: "insensitive" } },
    ];
  }

  const [articles, total] = await Promise.all([
    prisma.newsArticle.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { publishedAt: "desc" },
    }),
    prisma.newsArticle.count({ where }),
  ]);

  return { articles, total, totalPages: Math.ceil(total / limit), page };
}

export async function getNewsArticleBySlug(slug: string) {
  return prisma.newsArticle.findUnique({ where: { slug } });
}

export async function getAllNewsSlugs() {
  return prisma.newsArticle.findMany({
    where: { isActive: true, isLive: true },
    select: { slug: true },
  });
}

export async function getLatestNews(limit = 4) {
  return prisma.newsArticle.findMany({
    where: { isActive: true, isLive: true },
    take: limit,
    orderBy: { publishedAt: "desc" },
  });
}

export async function getDistinctCategories() {
  const articles = await prisma.newsArticle.findMany({
    where: { isActive: true, isLive: true },
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  return articles.map((a) => a.category);
}
