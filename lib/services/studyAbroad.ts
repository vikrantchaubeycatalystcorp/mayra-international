import { prisma } from "../db";

export async function getStudyAbroadCountries(params?: {
  featured?: boolean;
  limit?: number;
}) {
  const { featured, limit } = params || {};
  const where: any = { isActive: true };
  if (featured !== undefined) where.isFeatured = featured;

  return prisma.studyAbroadCountry.findMany({
    where,
    take: limit,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function getStudyAbroadCountryBySlug(slug: string) {
  return prisma.studyAbroadCountry.findUnique({ where: { slug } });
}

export async function getFeaturedCountries(limit = 5) {
  return prisma.studyAbroadCountry.findMany({
    where: { isActive: true, isFeatured: true },
    take: limit,
    orderBy: { sortOrder: "asc" },
  });
}
