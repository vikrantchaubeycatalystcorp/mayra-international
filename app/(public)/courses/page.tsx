import { prisma } from "../../../lib/db";
import { CoursesClient } from "./CoursesClient";

export const revalidate = 60;

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      stream: true,
      level: true,
      duration: true,
      description: true,
      topColleges: true,
      avgFees: true,
      avgSalary: true,
      color: true,
    },
  });

  // Get distinct streams and levels from the fetched data
  const streams = [...new Set(courses.map((c) => c.stream))].sort();
  const levels = [...new Set(courses.map((c) => c.level))].sort();

  return <CoursesClient courses={courses} streams={streams} levels={levels} />;
}
