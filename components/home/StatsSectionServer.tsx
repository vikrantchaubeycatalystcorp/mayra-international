import { prisma } from "../../lib/db";
import { StatsSectionClient } from "./StatsSectionClient";

// Catalogue stats are replaced with live counts so the homepage never overstates
// them; stats we cannot substantiate (e.g. "Students Guided", "Accuracy Rate") are hidden.
const UNVERIFIED_STAT = /students guided|accuracy|satisfaction|students helped/i;

/** Rounds down to a "nice" figure (18,089 → 18,000) so the "+" suffix stays true. */
function floorNice(n: number): number {
  if (n < 100) return n;
  const step = n >= 10000 ? 1000 : n >= 1000 ? 100 : 10;
  return Math.floor(n / step) * step;
}

export async function StatsSectionServer() {
  const active = { isActive: true };
  const [stats, section, colleges, exams, courses, countries] = await Promise.all([
    prisma.homeStat.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.homeSection.findUnique({ where: { sectionKey: "stats" } }),
    prisma.college.count({ where: active }),
    prisma.exam.count({ where: active }),
    prisma.course.count({ where: active }),
    prisma.studyAbroadCountry.count({ where: active }),
  ]);

  // Guard against accidental duplicate seed rows by keeping first stat per label.
  const uniqueStats = Array.from(
    new Map(stats.map((stat) => [stat.label.trim().toLowerCase(), stat])).values()
  );

  const liveStats = uniqueStats
    .filter((stat) => !UNVERIFIED_STAT.test(stat.label))
    .map((stat) => {
      const label = stat.label.toLowerCase();
      if (label.includes("college")) return { ...stat, value: floorNice(colleges), suffix: "+" };
      if (label.includes("exam")) return { ...stat, value: floorNice(exams), suffix: "+" };
      if (label.includes("course")) return { ...stat, value: floorNice(courses), suffix: "+" };
      if (label.includes("countr")) return { ...stat, value: countries, suffix: "" };
      return stat;
    });

  const title = section?.title && !/millions|most trusted/i.test(section.title) ? section.title : "Explore Colleges, Exams and Courses";
  const subtitle =
    section?.subtitle && !/most (comprehensive|trusted)/i.test(section.subtitle)
      ? section.subtitle
      : "Data on colleges, entrance exams, courses and study abroad destinations, with counselling from our Vashi office";

  return <StatsSectionClient stats={liveStats} title={title} subtitle={subtitle} />;
}
