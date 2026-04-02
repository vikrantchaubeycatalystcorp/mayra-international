/**
 * Import static data files directly into the database using Prisma.
 * Run: node prisma/import-data.mjs
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

function extractArray(filePath, varName) {
  const content = readFileSync(resolve(__dirname, "..", filePath), "utf-8");
  // Remove TypeScript type imports and annotations
  let cleaned = content
    .replace(/import\s+type\s+\{[^}]+\}\s+from\s+["'][^"']+["'];?\n?/g, "")
    .replace(/import\s+\{[^}]+\}\s+from\s+["'][^"']+["'];?\n?/g, "")
    .replace(/export\s+const\s+\w+:\s*\w+(\[\])?\s*=/, `const ${varName} =`)
    .replace(/:\s*College\[\]/g, "")
    .replace(/:\s*Exam\[\]/g, "")
    .replace(/:\s*Course\[\]/g, "")
    .replace(/:\s*NewsArticle\[\]/g, "")
    .replace(/:\s*StudyAbroadCountry\[\]/g, "")
    .replace(/as\s+const/g, "");

  // Evaluate and extract the data
  const fn = new Function(`${cleaned}\nreturn ${varName};`);
  return fn();
}

async function importColleges() {
  console.log("  → Importing colleges...");
  const colleges = extractArray("data/colleges.ts", "colleges");
  let created = 0, skipped = 0;

  for (const c of colleges) {
    try {
      await prisma.college.upsert({
        where: { slug: c.slug },
        update: {},
        create: {
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
          phone: c.phone || null,
          totalStudents: c.totalStudents || null,
          faculty: c.faculty || null,
          isFeatured: c.isFeatured || false,
          isActive: true,
          latitude: c.latitude || null,
          longitude: c.longitude || null,
          countryCode: c.countryCode || "IN",
          countryName: c.countryName || "India",
          source: "data-import",
        },
      });
      created++;
    } catch (e) {
      skipped++;
      console.log(`    ⚠ Skipped college: ${c.name} — ${e.message?.slice(0, 80)}`);
    }
  }
  console.log(`    ✓ ${created} created, ${skipped} skipped (of ${colleges.length})`);
}

async function importExams() {
  console.log("  → Importing exams...");
  const exams = extractArray("data/exams.ts", "exams");
  let created = 0, skipped = 0;

  for (const e of exams) {
    try {
      await prisma.exam.upsert({
        where: { slug: e.slug },
        update: {},
        create: {
          name: e.name,
          slug: e.slug,
          fullName: e.fullName || e.name,
          conductingBody: e.conductingBody || "",
          streams: Array.isArray(e.stream) ? e.stream : (e.stream ? [e.stream] : []),
          level: e.level || "UG",
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
          isActive: true,
          source: "data-import",
        },
      });
      created++;
    } catch (err) {
      skipped++;
      console.log(`    ⚠ Skipped exam: ${e.name} — ${err.message?.slice(0, 80)}`);
    }
  }
  console.log(`    ✓ ${created} created, ${skipped} skipped (of ${exams.length})`);
}

async function importCourses() {
  console.log("  → Importing courses...");
  const courses = extractArray("data/courses.ts", "courses");
  let created = 0, skipped = 0;

  for (const c of courses) {
    try {
      await prisma.course.upsert({
        where: { slug: c.slug },
        update: {},
        create: {
          name: c.name,
          slug: c.slug,
          stream: c.stream || "",
          level: c.level || "UG",
          duration: c.duration || "",
          description: c.description || "",
          topColleges: c.topColleges || 10,
          avgFees: c.avgFees || 100000,
          avgSalary: c.avgSalary || null,
          isFeatured: c.isFeatured || false,
          isActive: true,
          icon: c.icon || null,
          color: c.color || null,
          source: "data-import",
        },
      });
      created++;
    } catch (err) {
      skipped++;
      console.log(`    ⚠ Skipped course: ${c.name} — ${err.message?.slice(0, 80)}`);
    }
  }
  console.log(`    ✓ ${created} created, ${skipped} skipped (of ${courses.length})`);
}

async function importNews() {
  console.log("  → Importing news...");
  const news = extractArray("data/news.ts", "news");
  let created = 0, skipped = 0;

  for (const a of news) {
    try {
      await prisma.newsArticle.upsert({
        where: { slug: a.slug },
        update: {},
        create: {
          title: a.title,
          slug: a.slug,
          category: a.category || "General",
          summary: a.summary || "",
          content: a.content || "",
          publishedAt: a.publishedAt || new Date().toISOString(),
          imageColor: a.imageColor || "#3B82F6",
          author: a.author || "Editorial Team",
          isLive: a.isLive !== undefined ? a.isLive : true,
          isActive: true,
          tags: a.tags || [],
          views: a.views || 0,
          source: "data-import",
        },
      });
      created++;
    } catch (err) {
      skipped++;
      console.log(`    ⚠ Skipped article: ${a.title} — ${err.message?.slice(0, 80)}`);
    }
  }
  console.log(`    ✓ ${created} created, ${skipped} skipped (of ${news.length})`);
}

async function importStudyAbroad() {
  console.log("  → Importing study abroad countries...");
  let countries;
  try {
    countries = extractArray("data/studyAbroad.ts", "studyAbroadCountries");
  } catch {
    console.log("    ⚠ Could not parse studyAbroad.ts, skipping");
    return;
  }
  let created = 0, skipped = 0;

  for (const c of countries) {
    try {
      const slug = c.slug || c.name.toLowerCase().replace(/\s+/g, "-");
      await prisma.studyAbroadCountry.upsert({
        where: { slug },
        update: {},
        create: {
          name: c.name,
          slug,
          flag: c.flag || "",
          universities: c.universities || 0,
          avgCost: c.avgCost || "",
          popularCourses: c.popularCourses || [],
          description: c.description || "",
          topUniversities: c.topUniversities || [],
          whyStudyHere: c.whyStudyHere || "",
          visaInfo: c.visaInfo || "",
          scholarships: c.scholarships || "",
          livingCost: c.livingCost || "",
          isFeatured: c.isFeatured || false,
          isActive: true,
          sortOrder: c.sortOrder || 0,
          source: "data-import",
        },
      });
      created++;
    } catch (err) {
      skipped++;
      console.log(`    ⚠ Skipped country: ${c.name} — ${err.message?.slice(0, 80)}`);
    }
  }
  console.log(`    ✓ ${created} created, ${skipped} skipped (of ${countries.length})`);
}

async function main() {
  console.log("📦 Importing content data into database...\n");

  await importColleges();
  await importExams();
  await importCourses();
  await importNews();
  await importStudyAbroad();

  console.log("\n✅ Data import complete!");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Import failed:", e);
  prisma.$disconnect();
  process.exit(1);
});
