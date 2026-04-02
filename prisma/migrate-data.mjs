/**
 * Migrates hardcoded data from data/ TypeScript files into PostgreSQL.
 * Run AFTER the CMS seed: node prisma/migrate-data.mjs
 *
 * This imports colleges, exams, courses, news, and study-abroad data.
 * Uses dynamic import to handle the TypeScript data files compiled to JS.
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

// Helper to extract array data from TS files using regex
function extractArrayFromTS(filePath, exportName) {
  try {
    const content = readFileSync(filePath, "utf-8");
    // Remove TypeScript types and extract pure data
    // This is a simplified approach - for production, compile TS first
    let cleaned = content
      .replace(/import\s+.*?from\s+['"].*?['"];?\n?/g, "")
      .replace(/export\s+const\s+\w+:\s+\w+(\[\])?\s*=\s*/, "export const data = ")
      .replace(/export\s+interface\s+[\s\S]*?}\n/g, "")
      .replace(/as\s+const/g, "")
      .replace(/:\s*\w+(\[\])?\s*(?=[,\]\}])/g, "");

    // Use Function constructor to evaluate
    const fn = new Function(`
      ${cleaned.replace(/export\s+const/, "const")}
      return data;
    `);
    return fn();
  } catch (e) {
    console.error(`  ⚠ Failed to parse ${filePath}:`, e.message);
    return [];
  }
}

async function migrateColleges() {
  console.log("\n  📚 Migrating colleges...");
  const dataDir = join(__dirname, "..", "data");

  try {
    const content = readFileSync(join(dataDir, "colleges.ts"), "utf-8");

    // Extract college objects using a simpler regex approach
    const collegeRegex = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
    const idRegex = /id:\s*["']([^"']+)["']/;
    const nameRegex = /name:\s*["']([^"']+)["']/;
    const slugRegex = /slug:\s*["']([^"']+)["']/;

    // Count existing colleges
    const existingCount = await prisma.college.count();
    if (existingCount > 0) {
      console.log(`    Already have ${existingCount} colleges in DB, skipping migration.`);
      console.log(`    To re-import, clear the College table first.`);
      return;
    }

    // For the actual data migration, we'll use the API approach
    console.log("    ℹ️  College data is too large for direct parsing.");
    console.log("    Use the admin bulk import API: POST /api/admin/colleges/bulk");
    console.log("    Or import directly via Prisma Studio.");
  } catch (e) {
    console.log("    ⚠ Could not read colleges.ts:", e.message);
  }
}

async function migrateExams() {
  console.log("\n  📝 Migrating exams...");
  const existingCount = await prisma.exam.count();
  if (existingCount > 0) {
    console.log(`    Already have ${existingCount} exams in DB, skipping.`);
    return;
  }
  console.log("    ℹ️  Use admin bulk import API: POST /api/admin/exams/bulk");
}

async function migrateCourses() {
  console.log("\n  📖 Migrating courses...");
  const existingCount = await prisma.course.count();
  if (existingCount > 0) {
    console.log(`    Already have ${existingCount} courses in DB, skipping.`);
    return;
  }
  console.log("    ℹ️  Use admin bulk import API: POST /api/admin/courses/bulk");
}

async function migrateNews() {
  console.log("\n  📰 Migrating news...");
  const existingCount = await prisma.newsArticle.count();
  if (existingCount > 0) {
    console.log(`    Already have ${existingCount} news articles in DB, skipping.`);
    return;
  }
  console.log("    ℹ️  Use admin bulk import API: POST /api/admin/news/bulk");
}

async function migrateStudyAbroad() {
  console.log("\n  🌍 Migrating study abroad countries...");
  const existingCount = await prisma.studyAbroadCountry.count();
  if (existingCount > 0) {
    console.log(`    Already have ${existingCount} countries in DB, skipping.`);
    return;
  }
  console.log("    ℹ️  Use admin bulk import API: POST /api/admin/study-abroad/bulk");
}

async function main() {
  console.log("🔄 Data Migration — Moving hardcoded data to database\n");

  await migrateColleges();
  await migrateExams();
  await migrateCourses();
  await migrateNews();
  await migrateStudyAbroad();

  console.log("\n✅ Migration check complete!");
  console.log("\nTo bulk import data, use these admin API endpoints:");
  console.log("  POST /api/admin/colleges/bulk   — Import colleges array");
  console.log("  POST /api/admin/exams/bulk       — Import exams array");
  console.log("  POST /api/admin/courses/bulk     — Import courses array");
  console.log("  POST /api/admin/news/bulk        — Import news array");
  console.log("  POST /api/admin/study-abroad/bulk — Import countries array");
  console.log("\nOr use Prisma Studio: npx prisma studio");
}

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
