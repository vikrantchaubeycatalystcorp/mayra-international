import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// We need to dynamically import the TS data files.
// Since they use TS imports, we'll read and parse them manually.
// Instead, let's use tsx or just inline the data import via a workaround.

async function main() {
  console.log("🌱 Seeding content data...\n");

  // ── COLLEGES ──────────────────────────────────────────────
  console.log("  → Importing colleges...");
  const { colleges } = await import("../data/colleges.ts");
  for (const c of colleges) {
    await prisma.college.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        id: c.id,
        name: c.name,
        slug: c.slug,
        logo: c.logo || "",
        city: c.city || "",
        state: c.state || "",
        streams: c.streams || [],
        nirfRank: c.nirfRank || null,
        rating: c.rating || 4.0,
        reviewCount: c.reviewCount || 50,
        established: c.established || 2000,
        type: c.type || "Private",
        feesMin: c.fees?.min || 50000,
        feesMax: c.fees?.max || 500000,
        avgPackage: c.avgPackage || null,
        topPackage: c.topPackage || null,
        placementRate: c.placementRate || null,
        accreditation: c.accreditation || [],
        courses: c.courses || [],
        description: c.description || "",
        highlights: c.highlights || [],
        address: c.address || "",
        website: c.website || null,
        totalStudents: c.totalStudents || null,
        faculty: c.faculty || null,
        isFeatured: c.isFeatured || false,
        latitude: c.latitude || null,
        longitude: c.longitude || null,
        countryCode: c.countryCode || "IN",
        countryName: c.countryName || "India",
      },
    });
  }
  console.log(`    ✓ ${colleges.length} colleges imported`);

  // ── COURSES ──────────────────────────────────────────────
  console.log("  → Importing courses...");
  const { courses } = await import("../data/courses.ts");
  for (const c of courses) {
    await prisma.course.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        id: c.id,
        name: c.name,
        slug: c.slug,
        stream: c.stream,
        level: c.level,
        duration: c.duration,
        description: c.description || "",
        topColleges: c.topColleges || 10,
        avgFees: c.avgFees || 100000,
        avgSalary: c.avgSalary || null,
        isFeatured: c.isFeatured || false,
        color: c.color || null,
      },
    });
  }
  console.log(`    ✓ ${courses.length} courses imported`);

  // ── EXAMS ──────────────────────────────────────────────
  console.log("  → Importing exams...");
  const { exams } = await import("../data/exams.ts");
  for (const e of exams) {
    await prisma.exam.upsert({
      where: { slug: e.slug },
      update: {},
      create: {
        id: e.id,
        name: e.name,
        slug: e.slug,
        fullName: e.fullName,
        conductingBody: e.conductingBody,
        streams: e.stream ? (Array.isArray(e.stream) ? e.stream : [e.stream]) : [],
        level: e.level,
        registrationStart: e.registrationStart || null,
        registrationEnd: e.registrationEnd || null,
        examDate: e.examDate || null,
        resultDate: e.resultDate || null,
        eligibility: e.eligibility || "",
        applicationFeeGeneral: e.applicationFee?.general || 0,
        applicationFeeSCST: e.applicationFee?.sc_st || null,
        mode: e.mode || "Offline",
        frequency: e.frequency || "Annual",
        totalSeats: e.totalSeats || null,
        participatingColleges: e.participatingColleges || null,
        description: e.description || "",
        syllabus: e.syllabus || [],
        isFeatured: e.isFeatured || false,
      },
    });
  }
  console.log(`    ✓ ${exams.length} exams imported`);

  // ── NEWS ──────────────────────────────────────────────
  console.log("  → Importing news...");
  const { news } = await import("../data/news.ts");
  for (const n of news) {
    await prisma.newsArticle.upsert({
      where: { slug: n.slug },
      update: {},
      create: {
        id: n.id,
        title: n.title,
        slug: n.slug,
        category: n.category,
        summary: n.summary || "",
        content: n.content || "",
        publishedAt: n.publishedAt,
        imageColor: n.imageColor || "#3B82F6",
        author: n.author || "Editorial Team",
        isLive: n.isLive !== undefined ? n.isLive : true,
        tags: n.tags || [],
        views: n.views || null,
      },
    });
  }
  console.log(`    ✓ ${news.length} news articles imported`);

  // ── STUDY ABROAD ──────────────────────────────────────
  console.log("  → Importing study abroad countries...");
  const { studyAbroadCountries } = await import("../data/studyAbroad.ts");
  for (const c of studyAbroadCountries) {
    await prisma.studyAbroadCountry.upsert({
      where: { slug: c.id },
      update: {},
      create: {
        id: c.id,
        name: c.name,
        slug: c.id,
        flag: c.flag,
        universities: c.universities || 0,
        avgCost: c.avgCost || "",
        popularCourses: c.popularCourses || [],
        description: c.description || "",
        topUniversities: c.topUniversities || [],
        isActive: true,
      },
    });
  }
  console.log(`    ✓ ${studyAbroadCountries.length} countries imported`);

  console.log("\n✅ Content seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
