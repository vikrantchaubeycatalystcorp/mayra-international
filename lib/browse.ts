import { prisma } from "./db";

// Crawlable A–Z directory of every college, course and exam. The main listing
// pages paginate client-side (and colleges load from /api, which robots.txt
// blocks), so without this crawlers can only reach detail pages via the sitemap.

export const BROWSE_TYPES = ["colleges", "courses", "exams"] as const;
export type BrowseType = (typeof BROWSE_TYPES)[number];

export const BROWSE_PAGE_SIZE = 500;

export type BrowseItem = { slug: string; name: string; detail: string };

export const BROWSE_LABELS: Record<BrowseType, { singular: string; plural: string }> = {
  colleges: { singular: "College", plural: "Colleges" },
  courses: { singular: "Course", plural: "Courses" },
  exams: { singular: "Exam", plural: "Exams" },
};

export function isBrowseType(value: string): value is BrowseType {
  return (BROWSE_TYPES as readonly string[]).includes(value);
}

export function browsePath(type: BrowseType, page: number): string {
  return page <= 1 ? `/browse/${type}` : `/browse/${type}/${page}`;
}

export async function countBrowseItems(type: BrowseType): Promise<number> {
  const where = { isActive: true };
  if (type === "colleges") return prisma.college.count({ where });
  if (type === "courses") return prisma.course.count({ where });
  return prisma.exam.count({ where });
}

export async function getBrowsePageCount(type: BrowseType): Promise<number> {
  return Math.max(1, Math.ceil((await countBrowseItems(type)) / BROWSE_PAGE_SIZE));
}

export async function getBrowseItems(type: BrowseType, page: number): Promise<BrowseItem[]> {
  const args = {
    where: { isActive: true },
    orderBy: [{ name: "asc" as const }, { id: "asc" as const }],
    skip: (page - 1) * BROWSE_PAGE_SIZE,
    take: BROWSE_PAGE_SIZE,
  };

  if (type === "colleges") {
    const rows = await prisma.college.findMany({ ...args, select: { slug: true, name: true, city: true, state: true } });
    return rows.map((r) => {
      // Most names already end in the city ("…, Ahmedabad"); don't repeat it.
      const city = r.city && !r.name.toLowerCase().includes(r.city.toLowerCase()) ? r.city : "";
      return { slug: r.slug, name: r.name, detail: [city, r.state].filter(Boolean).join(", ") };
    });
  }
  if (type === "courses") {
    const rows = await prisma.course.findMany({ ...args, select: { slug: true, name: true, level: true, stream: true } });
    return rows.map((r) => ({ slug: r.slug, name: r.name, detail: [r.level, r.stream].filter(Boolean).join(" · ") }));
  }
  const rows = await prisma.exam.findMany({ ...args, select: { slug: true, name: true, fullName: true } });
  return rows.map((r) => ({ slug: r.slug, name: r.name, detail: r.fullName !== r.name ? r.fullName : "" }));
}
