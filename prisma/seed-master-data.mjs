import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ============================================================
// SEED DATA
// ============================================================

const COLLEGE_TYPES = [
  { name: "Government", sortOrder: 0 },
  { name: "Private", sortOrder: 1 },
  { name: "Deemed", sortOrder: 2 },
  { name: "Autonomous", sortOrder: 3 },
];

const COURSE_LEVELS = [
  { name: "Undergraduate", code: "UG", sortOrder: 0 },
  { name: "Postgraduate", code: "PG", sortOrder: 1 },
  { name: "Diploma", code: "Diploma", sortOrder: 2 },
  { name: "Certificate", code: "Certificate", sortOrder: 3 },
  { name: "Doctorate", code: "PhD", sortOrder: 4 },
];

const EXAM_MODES = [
  { name: "Online", sortOrder: 0 },
  { name: "Offline", sortOrder: 1 },
  { name: "Both", sortOrder: 2 },
];

const NEWS_CATEGORIES = [
  { name: "Exams", slug: "exams", sortOrder: 0 },
  { name: "Rankings", slug: "rankings", sortOrder: 1 },
  { name: "Admissions", slug: "admissions", sortOrder: 2 },
  { name: "Scholarships", slug: "scholarships", sortOrder: 3 },
  { name: "Careers", slug: "careers", sortOrder: 4 },
  { name: "Technology", slug: "technology", sortOrder: 5 },
  { name: "International", slug: "international", sortOrder: 6 },
  { name: "Policies", slug: "policies", sortOrder: 7 },
];

const LEAD_QUALIFICATIONS = [
  { label: "10th", value: "10th", sortOrder: 0 },
  { label: "12th", value: "12th", sortOrder: 1 },
  { label: "Graduation", value: "graduation", sortOrder: 2 },
  { label: "Post-Graduation", value: "post-graduation", sortOrder: 3 },
  { label: "Working Professional", value: "working-professional", sortOrder: 4 },
];

const LEAD_INTERESTS = [
  { label: "Engineering", value: "engineering", sortOrder: 0 },
  { label: "Medical", value: "medical", sortOrder: 1 },
  { label: "Management", value: "management", sortOrder: 2 },
  { label: "Law", value: "law", sortOrder: 3 },
  { label: "Design", value: "design", sortOrder: 4 },
  { label: "Arts", value: "arts", sortOrder: 5 },
  { label: "Science", value: "science", sortOrder: 6 },
  { label: "Commerce", value: "commerce", sortOrder: 7 },
  { label: "Agriculture", value: "agriculture", sortOrder: 8 },
];

const DATA_SOURCES = [
  { name: "Manual Entry", type: "manual", status: "active" },
  { name: "Bulk Import", type: "bulk-import", status: "active" },
  { name: "External API", type: "api", status: "active" },
];

const INDIAN_STATES = [
  { name: "Andhra Pradesh", code: "AP" },
  { name: "Arunachal Pradesh", code: "AR" },
  { name: "Assam", code: "AS" },
  { name: "Bihar", code: "BR" },
  { name: "Chhattisgarh", code: "CG" },
  { name: "Goa", code: "GA" },
  { name: "Gujarat", code: "GJ" },
  { name: "Haryana", code: "HR" },
  { name: "Himachal Pradesh", code: "HP" },
  { name: "Jharkhand", code: "JH" },
  { name: "Karnataka", code: "KA" },
  { name: "Kerala", code: "KL" },
  { name: "Madhya Pradesh", code: "MP" },
  { name: "Maharashtra", code: "MH" },
  { name: "Manipur", code: "MN" },
  { name: "Meghalaya", code: "ML" },
  { name: "Mizoram", code: "MZ" },
  { name: "Nagaland", code: "NL" },
  { name: "Odisha", code: "OD" },
  { name: "Punjab", code: "PB" },
  { name: "Rajasthan", code: "RJ" },
  { name: "Sikkim", code: "SK" },
  { name: "Tamil Nadu", code: "TN" },
  { name: "Telangana", code: "TS" },
  { name: "Tripura", code: "TR" },
  { name: "Uttar Pradesh", code: "UP" },
  { name: "Uttarakhand", code: "UK" },
  { name: "West Bengal", code: "WB" },
  { name: "Delhi", code: "DL" },
  { name: "Chandigarh", code: "CH" },
  { name: "Puducherry", code: "PY" },
  { name: "Jammu and Kashmir", code: "JK" },
  { name: "Ladakh", code: "LA" },
];

// ============================================================
// SEED FUNCTIONS
// ============================================================

async function seedCollegeTypes() {
  console.log("Seeding college types...");
  for (const item of COLLEGE_TYPES) {
    await prisma.collegeType.upsert({
      where: { name: item.name },
      update: { sortOrder: item.sortOrder },
      create: item,
    });
  }
}

async function seedCourseLevels() {
  console.log("Seeding course levels...");
  for (const item of COURSE_LEVELS) {
    await prisma.courseLevel.upsert({
      where: { code: item.code },
      update: { name: item.name, sortOrder: item.sortOrder },
      create: item,
    });
  }
}

async function seedExamModes() {
  console.log("Seeding exam modes...");
  for (const item of EXAM_MODES) {
    await prisma.examMode.upsert({
      where: { name: item.name },
      update: { sortOrder: item.sortOrder },
      create: item,
    });
  }
}

async function seedNewsCategories() {
  console.log("Seeding news categories...");
  for (const item of NEWS_CATEGORIES) {
    await prisma.newsCategory.upsert({
      where: { slug: item.slug },
      update: { name: item.name, sortOrder: item.sortOrder },
      create: item,
    });
  }
}

async function seedLeadQualifications() {
  console.log("Seeding lead qualifications...");
  for (const item of LEAD_QUALIFICATIONS) {
    await prisma.leadQualification.upsert({
      where: { value: item.value },
      update: { label: item.label, sortOrder: item.sortOrder },
      create: item,
    });
  }
}

async function seedLeadInterests() {
  console.log("Seeding lead interests...");
  for (const item of LEAD_INTERESTS) {
    await prisma.leadInterest.upsert({
      where: { value: item.value },
      update: { label: item.label, sortOrder: item.sortOrder },
      create: item,
    });
  }
}

async function seedDataSources() {
  console.log("Seeding data sources...");
  for (const item of DATA_SOURCES) {
    await prisma.dataSource.upsert({
      where: { name: item.name },
      update: { type: item.type, status: item.status },
      create: item,
    });
  }
}

async function seedStates() {
  console.log("Seeding Indian states...");
  for (const item of INDIAN_STATES) {
    await prisma.state.upsert({
      where: { code: item.code },
      update: { name: item.name },
      create: {
        name: item.name,
        code: item.code,
        countryCode: "IN",
      },
    });
  }
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log("Starting master data seed...\n");

  await seedCollegeTypes();
  await seedCourseLevels();
  await seedExamModes();
  await seedNewsCategories();
  await seedLeadQualifications();
  await seedLeadInterests();
  await seedDataSources();
  await seedStates();

  console.log("\nMaster data seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
