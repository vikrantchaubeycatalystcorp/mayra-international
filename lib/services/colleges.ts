import { prisma } from "../db";

export async function getColleges(params?: {
  page?: number;
  limit?: number;
  stream?: string;
  type?: string;
  state?: string;
  search?: string;
  featured?: boolean;
  countryCode?: string;
}) {
  const { page = 1, limit = 12, stream, type, state, search, featured, countryCode } = params || {};
  const where: any = { isActive: true };
  if (stream) where.streams = { has: stream };
  if (type) where.type = type;
  if (state) where.state = state;
  if (countryCode) where.countryCode = countryCode;
  if (featured !== undefined) where.isFeatured = featured;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { city: { contains: search, mode: "insensitive" } },
      { state: { contains: search, mode: "insensitive" } },
    ];
  }

  const [colleges, total] = await Promise.all([
    prisma.college.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ isFeatured: "desc" }, { nirfRank: "asc" }, { rating: "desc" }],
    }),
    prisma.college.count({ where }),
  ]);

  return { colleges, total, totalPages: Math.ceil(total / limit), page };
}

export async function getCollegeBySlug(slug: string) {
  const college = await prisma.college.findUnique({
    where: { slug },
    include: {
      gallery: { orderBy: { sortOrder: "asc" } },
      recruiters: { orderBy: { sortOrder: "asc" } },
      feeStructures: { orderBy: { sortOrder: "asc" } },
      admissionInfo: true,
    },
  });
  if (college) {
    await prisma.college.update({ where: { slug }, data: { viewCount: { increment: 1 } } });
  }
  return college;
}

export async function getAllCollegeSlugs() {
  return prisma.college.findMany({
    where: { isActive: true },
    select: { slug: true },
  });
}

export async function getFeaturedColleges(limit = 8) {
  return prisma.college.findMany({
    where: { isActive: true, isFeatured: true },
    take: limit,
    orderBy: [{ nirfRank: "asc" }, { rating: "desc" }],
  });
}

export async function getRelatedColleges(collegeId: string, streams: string[], limit = 4) {
  return prisma.college.findMany({
    where: {
      isActive: true,
      id: { not: collegeId },
      streams: { hasSome: streams },
    },
    take: limit,
    orderBy: { rating: "desc" },
  });
}

export async function getCollegeCount() {
  return prisma.college.count({ where: { isActive: true } });
}
