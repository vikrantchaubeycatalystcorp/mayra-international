import { prisma } from "../db";

export async function getCourses(params?: {
  page?: number;
  limit?: number;
  stream?: string;
  level?: string;
  search?: string;
  featured?: boolean;
}) {
  const { page = 1, limit = 12, stream, level, search, featured } = params || {};
  const where: any = { isActive: true };
  if (stream) where.stream = stream;
  if (level) where.level = level;
  if (featured !== undefined) where.isFeatured = featured;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { stream: { contains: search, mode: "insensitive" } },
    ];
  }

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
    }),
    prisma.course.count({ where }),
  ]);

  return { courses, total, totalPages: Math.ceil(total / limit), page };
}

export async function getCourseBySlug(slug: string) {
  const course = await prisma.course.findUnique({ where: { slug } });
  if (course) {
    await prisma.course.update({ where: { slug }, data: { viewCount: { increment: 1 } } });
  }
  return course;
}

export async function getAllCourseSlugs() {
  return prisma.course.findMany({
    where: { isActive: true },
    select: { slug: true },
  });
}

export async function getFeaturedCourses(limit = 6) {
  return prisma.course.findMany({
    where: { isActive: true, isFeatured: true },
    take: limit,
    orderBy: { name: "asc" },
  });
}

export async function getDistinctStreams() {
  const courses = await prisma.course.findMany({
    where: { isActive: true },
    select: { stream: true },
    distinct: ["stream"],
    orderBy: { stream: "asc" },
  });
  return courses.map((c) => c.stream);
}

export async function getDistinctLevels() {
  const courses = await prisma.course.findMany({
    where: { isActive: true },
    select: { level: true },
    distinct: ["level"],
    orderBy: { level: "asc" },
  });
  return courses.map((c) => c.level);
}
