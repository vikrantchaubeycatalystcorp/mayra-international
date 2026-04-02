import { prisma } from "../db";

export async function getExams(params?: {
  page?: number;
  limit?: number;
  stream?: string;
  level?: string;
  search?: string;
  featured?: boolean;
}) {
  const { page = 1, limit = 12, stream, level, search, featured } = params || {};
  const where: any = { isActive: true };
  if (stream) where.streams = { has: stream };
  if (level) where.level = level;
  if (featured !== undefined) where.isFeatured = featured;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { fullName: { contains: search, mode: "insensitive" } },
    ];
  }

  const [exams, total] = await Promise.all([
    prisma.exam.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
    }),
    prisma.exam.count({ where }),
  ]);

  return { exams, total, totalPages: Math.ceil(total / limit), page };
}

export async function getExamBySlug(slug: string) {
  const exam = await prisma.exam.findUnique({ where: { slug } });
  if (exam) {
    await prisma.exam.update({ where: { slug }, data: { viewCount: { increment: 1 } } });
  }
  return exam;
}

export async function getAllExamSlugs() {
  return prisma.exam.findMany({
    where: { isActive: true },
    select: { slug: true },
  });
}

export async function getFeaturedExams(limit = 6) {
  return prisma.exam.findMany({
    where: { isActive: true, isFeatured: true },
    take: limit,
    orderBy: { name: "asc" },
  });
}

export async function getRelatedExams(examId: string, streams: string[], limit = 5) {
  return prisma.exam.findMany({
    where: {
      isActive: true,
      id: { not: examId },
      streams: { hasSome: streams },
    },
    take: limit,
  });
}
