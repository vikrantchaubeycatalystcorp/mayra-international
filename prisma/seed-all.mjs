/**
 * Comprehensive seed script for CockroachDB
 * Seeds: Admin user, CMS data, master data, content data, and 18000+ colleges
 *
 * Run: node prisma/seed-all.mjs
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

// ============================================================
// UTILITY: Extract TS data files
// ============================================================
function extractArray(filePath, varName) {
  const content = readFileSync(resolve(__dirname, "..", filePath), "utf-8");
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
  const fn = new Function(`${cleaned}\nreturn ${varName};`);
  return fn();
}

// ============================================================
// 1. SEED ADMIN USER
// ============================================================
async function seedAdmin() {
  console.log("\n━━━ ADMIN USER ━━━");
  const email = "admin@mayrainternational.com";
  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    console.log(`  ✓ Admin already exists: ${email}`);
    return;
  }
  const hashedPassword = await bcrypt.hash("Admin@123", 12);
  await prisma.admin.create({
    data: {
      name: "Super Admin",
      email,
      password: hashedPassword,
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });
  console.log(`  ✓ Admin created: ${email} / Admin@123`);
}

// ============================================================
// 2. SEED MASTER DATA (lookup tables)
// ============================================================
async function seedMasterData() {
  console.log("\n━━━ MASTER DATA ━━━");

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

  console.log("  → College Types");
  for (const item of COLLEGE_TYPES) {
    await prisma.collegeType.upsert({ where: { name: item.name }, update: { sortOrder: item.sortOrder }, create: item });
  }
  console.log("  → Course Levels");
  for (const item of COURSE_LEVELS) {
    await prisma.courseLevel.upsert({ where: { code: item.code }, update: { name: item.name, sortOrder: item.sortOrder }, create: item });
  }
  console.log("  → Exam Modes");
  for (const item of EXAM_MODES) {
    await prisma.examMode.upsert({ where: { name: item.name }, update: { sortOrder: item.sortOrder }, create: item });
  }
  console.log("  → News Categories");
  for (const item of NEWS_CATEGORIES) {
    await prisma.newsCategory.upsert({ where: { slug: item.slug }, update: { name: item.name, sortOrder: item.sortOrder }, create: item });
  }
  console.log("  → Lead Qualifications");
  for (const item of LEAD_QUALIFICATIONS) {
    await prisma.leadQualification.upsert({ where: { value: item.value }, update: {}, create: item });
  }
  console.log("  → Lead Interests");
  for (const item of LEAD_INTERESTS) {
    await prisma.leadInterest.upsert({ where: { value: item.value }, update: {}, create: item });
  }
  console.log("  → Data Sources");
  for (const item of DATA_SOURCES) {
    await prisma.dataSource.upsert({ where: { name: item.name }, update: {}, create: item });
  }
  console.log("  → Indian States");
  for (const item of INDIAN_STATES) {
    await prisma.state.upsert({ where: { code: item.code }, update: { name: item.name }, create: { name: item.name, code: item.code, countryCode: "IN" } });
  }
  console.log("  ✓ Master data complete");
}

// ============================================================
// 3. SEED CMS DATA (from seed.mjs logic)
// ============================================================
async function seedCMS() {
  console.log("\n━━━ CMS DATA ━━━");

  // Company Info
  console.log("  → Company Info");
  await prisma.companyInfo.upsert({
    where: { id: "company-main" },
    update: { siteUrl: "https://www.mayrainternational.com", email: "info@mayrainternational.com", twitterHandle: "@mayraintl", copyrightText: "Mayra International" },
    create: {
      id: "company-main",
      name: "Mayra International",
      tagline: "India's most trusted education platform. Helping students discover the right college, exam, and career since 2015.",
      description: "India's most trusted education portal",
      email: "info@mayrainternational.com",
      phone: "+91 7506799678",
      phoneLabel: "",
      address: "Office No 613, 6th Floor, Satra Plaza, Palm Beach Road, Phase 2, Sector 19D, Vashi, Navi Mumbai-400703, Maharashtra",
      logo: "/images/mayra-logo.png",
      footerLogo: "/images/mayra-logo.png",
      copyrightText: "Mayra International",
      foundedYear: 2015,
      siteUrl: "https://www.mayrainternational.com",
      twitterHandle: "@mayraintl",
    },
  });

  // Page SEO
  console.log("  → Page SEO");
  const seoPages = [
    { pageSlug: "home", title: "Mayra International — Find Your Dream College in India | 25,000+ Colleges", description: "Mayra International — India's most trusted education portal. Explore 25,000+ colleges, 500+ entrance exams, and 800+ courses.", keywords: ["Mayra International", "mayrainternational", "mayra international education", "education portal india", "college admissions india", "JEE Main 2026", "NEET 2026"], ogImage: "/og-image.png", ogTitle: "Mayra International — Find Your Dream College in India", ogDescription: "Mayra International — India's most trusted education portal.", canonical: "https://www.mayrainternational.com" },
    { pageSlug: "colleges", title: "Top Colleges in India 2026 — Rankings, Fees, Admissions | Mayra International", description: "Explore 25,000+ colleges across India.", keywords: ["top colleges india", "engineering colleges", "Mayra International"], ogTitle: "Top Colleges in India | Mayra International", ogDescription: "Explore 25,000+ colleges", canonical: "https://www.mayrainternational.com/colleges" },
    { pageSlug: "exams", title: "Entrance Exams 2026 — Dates, Syllabus, Eligibility | Mayra International", description: "Complete guide to 500+ entrance exams.", keywords: ["JEE Main 2026", "NEET 2026", "entrance exams", "Mayra International"], ogTitle: "Entrance Exams 2026 | Mayra International", ogDescription: "Complete guide to 500+ entrance exams", canonical: "https://www.mayrainternational.com/exams" },
    { pageSlug: "courses", title: "Courses in India — UG, PG, Diploma Programs | Mayra International", description: "Explore 800+ courses across all streams.", keywords: ["courses india", "B.Tech", "MBBS", "MBA", "Mayra International"], ogTitle: "Courses in India | Mayra International", ogDescription: "Explore 800+ courses", canonical: "https://www.mayrainternational.com/courses" },
    { pageSlug: "news", title: "Education News & Updates 2026 | Mayra International", description: "Latest education news and updates.", keywords: ["education news", "exam results", "Mayra International"], ogTitle: "Education News | Mayra International", ogDescription: "Latest education news", canonical: "https://www.mayrainternational.com/news" },
    { pageSlug: "study-abroad", title: "Study Abroad from India — Countries, Universities, Costs | Mayra International", description: "Complete guide to studying abroad.", keywords: ["study abroad", "study in USA", "Mayra International"], ogTitle: "Study Abroad | Mayra International", ogDescription: "Complete guide to studying abroad", canonical: "https://www.mayrainternational.com/study-abroad" },
  ];
  for (const seo of seoPages) {
    await prisma.pageSeo.upsert({ where: { pageSlug: seo.pageSlug }, update: { title: seo.title, canonical: seo.canonical, ogTitle: seo.ogTitle, keywords: seo.keywords }, create: seo });
  }

  // Streams
  console.log("  → Streams");
  const streams = [
    { name: "Engineering", slug: "engineering", icon: "Cpu", color: "from-blue-600 to-blue-400", sortOrder: 1 },
    { name: "Medical", slug: "medical", icon: "Stethoscope", color: "from-red-500 to-rose-400", sortOrder: 2 },
    { name: "Management", slug: "management", icon: "Briefcase", color: "from-purple-600 to-violet-400", sortOrder: 3 },
    { name: "Law", slug: "law", icon: "Scale", color: "from-amber-600 to-amber-400", sortOrder: 4 },
    { name: "Computer Science", slug: "computer-science", icon: "Monitor", color: "from-cyan-600 to-cyan-400", sortOrder: 5 },
    { name: "Science", slug: "science", icon: "FlaskConical", color: "from-green-600 to-emerald-400", sortOrder: 6 },
    { name: "Commerce", slug: "commerce", icon: "BarChart3", color: "from-orange-500 to-amber-400", sortOrder: 7 },
    { name: "Arts & Humanities", slug: "arts-humanities", icon: "BookOpen", color: "from-pink-500 to-rose-400", sortOrder: 8 },
    { name: "Architecture", slug: "architecture", icon: "Building", color: "from-teal-600 to-teal-400", sortOrder: 9 },
    { name: "Pharmacy", slug: "pharmacy", icon: "Pill", color: "from-indigo-600 to-indigo-400", sortOrder: 10 },
    { name: "Education", slug: "education", icon: "PenLine", color: "from-sky-600 to-sky-400", sortOrder: 11 },
    { name: "Agriculture", slug: "agriculture", icon: "Leaf", color: "from-lime-600 to-lime-400", sortOrder: 12 },
  ];
  for (const s of streams) {
    await prisma.stream.upsert({ where: { slug: s.slug }, update: {}, create: s });
  }

  // Accreditation Bodies
  console.log("  → Accreditation Bodies");
  const accreditations = [
    { name: "NAAC A++", fullName: "National Assessment and Accreditation Council A++" },
    { name: "NAAC A+", fullName: "National Assessment and Accreditation Council A+" },
    { name: "NAAC A", fullName: "National Assessment and Accreditation Council A" },
    { name: "NBA", fullName: "National Board of Accreditation" },
    { name: "UGC", fullName: "University Grants Commission" },
    { name: "AICTE", fullName: "All India Council for Technical Education" },
  ];
  for (const acc of accreditations) {
    await prisma.accreditationBody.upsert({ where: { name: acc.name }, update: {}, create: acc });
  }

  // Navigation — delete existing first to avoid duplicates
  console.log("  → Navigation Items");
  const navCount = await prisma.navigationItem.count();
  if (navCount === 0) {
    await prisma.navigationItem.create({
      data: {
        label: "Colleges", href: "/colleges", icon: "GraduationCap", section: "main", sortOrder: 1, isMega: true,
        featuredTitle: "Top Ranked", featuredItems: ["IIT Madras", "IIT Delhi", "IIM Ahmedabad", "AIIMS Delhi"],
        children: {
          create: [
            { label: "Engineering Colleges", href: "/colleges?stream=Engineering", icon: "Cpu", description: "4500+ colleges", megaGroupTitle: "By Stream", sortOrder: 1, section: "main" },
            { label: "Medical Colleges", href: "/colleges?stream=Medical", icon: "Stethoscope", description: "706 MBBS colleges", megaGroupTitle: "By Stream", sortOrder: 2, section: "main" },
            { label: "Management", href: "/colleges?stream=Management", icon: "Briefcase", description: "Top MBA colleges", megaGroupTitle: "By Stream", sortOrder: 3, section: "main" },
            { label: "Law Colleges", href: "/colleges?stream=Law", icon: "Scale", description: "NLUs & more", megaGroupTitle: "By Stream", sortOrder: 4, section: "main" },
            { label: "Arts & Sciences", href: "/colleges?stream=Arts", icon: "BookOpen", description: "Liberal arts colleges", megaGroupTitle: "By Stream", sortOrder: 5, section: "main" },
            { label: "IITs", href: "/colleges?name=iit", icon: "Landmark", description: "23 IITs across India", megaGroupTitle: "By Type", sortOrder: 6, section: "main" },
            { label: "IIMs", href: "/colleges?name=iim", icon: "BarChart3", description: "Top B-Schools", megaGroupTitle: "By Type", sortOrder: 7, section: "main" },
            { label: "NITs", href: "/colleges?type=Government", icon: "FlaskConical", description: "31 NITs", megaGroupTitle: "By Type", sortOrder: 8, section: "main" },
            { label: "Government Colleges", href: "/colleges?type=Government", icon: "Building2", description: "Affordable quality", megaGroupTitle: "By Type", sortOrder: 9, section: "main" },
            { label: "Private Universities", href: "/colleges?type=Private", icon: "GraduationCap", description: "Premium private", megaGroupTitle: "By Type", sortOrder: 10, section: "main" },
          ],
        },
      },
    });
    await prisma.navigationItem.create({
      data: {
        label: "Exams", href: "/exams", icon: "FileText", section: "main", sortOrder: 2, isMega: true,
        featuredTitle: "Upcoming Exams", featuredItems: ["CUET UG 2026", "XAT 2026", "SNAP 2025", "MAT Dec 2025"],
        children: {
          create: [
            { label: "JEE Main 2026", href: "/exams/jee-main", icon: "Calculator", description: "Jan & Apr sessions", megaGroupTitle: "Engineering Exams", sortOrder: 1, section: "main" },
            { label: "JEE Advanced 2026", href: "/exams/jee-advanced", icon: "Trophy", description: "IIT gateway", megaGroupTitle: "Engineering Exams", sortOrder: 2, section: "main" },
            { label: "GATE 2026", href: "/exams/gate", icon: "Cpu", description: "M.Tech + PSU jobs", megaGroupTitle: "Engineering Exams", sortOrder: 3, section: "main" },
            { label: "BITSAT", href: "/exams", icon: "Settings", description: "BITS Pilani entrance", megaGroupTitle: "Engineering Exams", sortOrder: 4, section: "main" },
            { label: "NEET UG 2026", href: "/exams/neet-ug", icon: "Stethoscope", description: "MBBS entrance", megaGroupTitle: "Medical & Management", sortOrder: 5, section: "main" },
            { label: "NEET PG", href: "/exams/neet-pg", icon: "Heart", description: "MD/MS entrance", megaGroupTitle: "Medical & Management", sortOrder: 6, section: "main" },
            { label: "CAT 2025", href: "/exams/cat", icon: "TrendingUp", description: "IIM admissions", megaGroupTitle: "Medical & Management", sortOrder: 7, section: "main" },
            { label: "CLAT 2025", href: "/exams/clat", icon: "Scale", description: "NLU admissions", megaGroupTitle: "Medical & Management", sortOrder: 8, section: "main" },
          ],
        },
      },
    });
    await prisma.navigationItem.create({
      data: {
        label: "Courses", href: "/courses", icon: "BookOpen", section: "main", sortOrder: 3, isMega: true,
        children: {
          create: [
            { label: "B.Tech / B.E.", href: "/courses", icon: "Cpu", description: "4 year engineering", megaGroupTitle: "UG Programs", sortOrder: 1, section: "main" },
            { label: "MBBS / BDS", href: "/courses", icon: "Stethoscope", description: "Medical degrees", megaGroupTitle: "UG Programs", sortOrder: 2, section: "main" },
            { label: "B.Com / BBA", href: "/courses", icon: "BarChart3", description: "Commerce programs", megaGroupTitle: "UG Programs", sortOrder: 3, section: "main" },
            { label: "B.Sc", href: "/courses", icon: "FlaskConical", description: "Science programs", megaGroupTitle: "UG Programs", sortOrder: 4, section: "main" },
            { label: "LLB / BA LLB", href: "/courses", icon: "Scale", description: "Law degrees", megaGroupTitle: "UG Programs", sortOrder: 5, section: "main" },
            { label: "MBA / PGDM", href: "/courses", icon: "Briefcase", description: "Management", megaGroupTitle: "PG Programs", sortOrder: 6, section: "main" },
            { label: "M.Tech / ME", href: "/courses", icon: "Settings", description: "Engineering PG", megaGroupTitle: "PG Programs", sortOrder: 7, section: "main" },
            { label: "MCA", href: "/courses", icon: "Monitor", description: "Computer applications", megaGroupTitle: "PG Programs", sortOrder: 8, section: "main" },
            { label: "M.Sc", href: "/courses", icon: "FlaskConical", description: "Science PG", megaGroupTitle: "PG Programs", sortOrder: 9, section: "main" },
          ],
        },
      },
    });
    for (const item of [
      { label: "News", href: "/news", icon: "Newspaper", sortOrder: 4 },
      { label: "Study Abroad", href: "/study-abroad", icon: "Globe", sortOrder: 5 },
      { label: "World Map", href: "/map", icon: "Globe", sortOrder: 6 },
    ]) {
      await prisma.navigationItem.create({ data: { ...item, section: "main" } });
    }
  } else {
    console.log("    (skipped — navigation already exists)");
  }

  // Footer Sections
  console.log("  → Footer Sections");
  const footerCount = await prisma.footerSection.count();
  if (footerCount === 0) {
    await prisma.footerSection.create({
      data: {
        title: "Quick Links", sortOrder: 1,
        links: { create: [
          { label: "Top Colleges", href: "/colleges", sortOrder: 1 },
          { label: "Top Exams", href: "/exams", sortOrder: 2 },
          { label: "Courses", href: "/courses", sortOrder: 3 },
          { label: "Study Abroad", href: "/study-abroad", sortOrder: 4 },
          { label: "Compare Colleges", href: "/compare", sortOrder: 5 },
          { label: "News & Articles", href: "/news", sortOrder: 6 },
        ] },
      },
    });
    await prisma.footerSection.create({
      data: {
        title: "Top Colleges", sortOrder: 2,
        links: { create: [
          { label: "IIT Bombay", href: "/colleges/iit-bombay", sortOrder: 1 },
          { label: "IIT Delhi", href: "/colleges/iit-delhi", sortOrder: 2 },
          { label: "IIM Ahmedabad", href: "/colleges/iim-ahmedabad", sortOrder: 3 },
          { label: "AIIMS Delhi", href: "/colleges/aiims-delhi", sortOrder: 4 },
          { label: "IIT Madras", href: "/colleges/iit-madras", sortOrder: 5 },
          { label: "BITS Pilani", href: "/colleges/bits-pilani", sortOrder: 6 },
        ] },
      },
    });
    await prisma.footerSection.create({
      data: {
        title: "Top Exams", sortOrder: 3,
        links: { create: [
          { label: "JEE Main 2026", href: "/exams/jee-main", sortOrder: 1 },
          { label: "JEE Advanced 2026", href: "/exams/jee-advanced", sortOrder: 2 },
          { label: "NEET UG 2026", href: "/exams/neet-ug", sortOrder: 3 },
          { label: "CAT 2025", href: "/exams/cat", sortOrder: 4 },
          { label: "GATE 2026", href: "/exams/gate", sortOrder: 5 },
        ] },
      },
    });
  } else {
    console.log("    (skipped — footer already exists)");
  }

  // Social Links
  console.log("  → Social Links");
  for (const s of [
    { platform: "Twitter", url: "#", icon: "Twitter", hoverColor: "hover:text-sky-400", sortOrder: 1 },
    { platform: "LinkedIn", url: "#", icon: "Linkedin", hoverColor: "hover:text-blue-400", sortOrder: 2 },
    { platform: "YouTube", url: "#", icon: "Youtube", hoverColor: "hover:text-red-400", sortOrder: 3 },
    { platform: "Instagram", url: "#", icon: "Instagram", hoverColor: "hover:text-pink-400", sortOrder: 4 },
    { platform: "Facebook", url: "#", icon: "Facebook", hoverColor: "hover:text-blue-500", sortOrder: 5 },
  ]) {
    await prisma.socialLink.upsert({ where: { platform: s.platform }, update: {}, create: s });
  }

  // Legal Links
  console.log("  → Legal Links");
  await prisma.legalLink.createMany({
    data: [
      { label: "Privacy Policy", href: "/privacy", sortOrder: 1 },
      { label: "Terms of Use", href: "/terms", sortOrder: 2 },
      { label: "Disclaimer", href: "/disclaimer", sortOrder: 3 },
      { label: "Advertise", href: "/advertise", sortOrder: 4 },
    ],
    skipDuplicates: true,
  });

  // Trust Badges
  console.log("  → Trust Badges");
  await prisma.trustBadge.createMany({
    data: [
      { label: "SSL Secured", icon: "ShieldCheck", bgColor: "bg-green-900/50", borderColor: "border-green-700", textColor: "text-green-400", sortOrder: 1 },
    ],
    skipDuplicates: true,
  });

  // App Download Links removed — no mobile app available yet

  // Hero Banner
  console.log("  → Hero Banner");
  const bannerCount = await prisma.heroBanner.count();
  if (bannerCount === 0) {
    await prisma.heroBanner.create({
      data: {
        heading: "Find Your Dream College",
        headingHighlight: "Dream College",
        subheading: "Explore 25,000+ colleges, 500+ entrance exams, and get expert guidance to make your best education decision.",
        bgImage: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1920&q=90&auto=format&fit=crop",
        badgeText: "NIRF 2025 Rankings Released",
        badgeLinkText: "View Rankings →",
        badgeLink: "/news",
        ctaText: "Search",
        isActive: true,
        sortOrder: 0,
        stats: { create: [
          { icon: "Award", value: "25,000+", label: "Colleges", color: "text-blue-300", sortOrder: 1 },
          { icon: "BookOpen", value: "500+", label: "Exams", color: "text-orange-300", sortOrder: 2 },
          { icon: "Users", value: "10L+", label: "Students", color: "text-green-300", sortOrder: 3 },
          { icon: "TrendingUp", value: "800+", label: "Courses", color: "text-purple-300", sortOrder: 4 },
        ] },
        searchTabs: { create: [
          { label: "Colleges", placeholder: "Search 25,000+ colleges — IIT, NIT, IIM, AIIMS...", searchPath: "/colleges", sortOrder: 1 },
          { label: "Exams", placeholder: "Search entrance exams — JEE, NEET, CAT, GATE...", searchPath: "/exams", sortOrder: 2 },
          { label: "Courses", placeholder: "Search courses — B.Tech, MBA, MBBS, LLB...", searchPath: "/courses", sortOrder: 3 },
        ] },
        quickFilters: { create: [
          { tab: "Colleges", label: "Engineering", href: "/colleges?stream=Engineering", sortOrder: 1 },
          { tab: "Colleges", label: "Medical", href: "/colleges?stream=Medical", sortOrder: 2 },
          { tab: "Colleges", label: "MBA", href: "/colleges?stream=Management", sortOrder: 3 },
          { tab: "Colleges", label: "Law", href: "/colleges?stream=Law", sortOrder: 4 },
          { tab: "Colleges", label: "Arts", href: "/colleges?stream=Arts", sortOrder: 5 },
          { tab: "Colleges", label: "Architecture", href: "/colleges?stream=Architecture", sortOrder: 6 },
          { tab: "Exams", label: "JEE Main", href: "/exams?search=JEE+Main", sortOrder: 7 },
          { tab: "Exams", label: "NEET UG", href: "/exams?search=NEET+UG", sortOrder: 8 },
          { tab: "Exams", label: "CAT", href: "/exams?search=CAT", sortOrder: 9 },
          { tab: "Exams", label: "GATE", href: "/exams?search=GATE", sortOrder: 10 },
          { tab: "Courses", label: "B.Tech", href: "/courses?search=B.Tech", sortOrder: 13 },
          { tab: "Courses", label: "MBBS", href: "/courses?search=MBBS", sortOrder: 14 },
          { tab: "Courses", label: "MBA", href: "/courses?search=MBA", sortOrder: 15 },
          { tab: "Courses", label: "LLB", href: "/courses?search=LLB", sortOrder: 16 },
        ] },
        popularSearches: { create: [
          { label: "IIT Bombay", href: "/colleges/iit-bombay", sortOrder: 1 },
          { label: "NEET 2026", href: "/exams/neet-ug", sortOrder: 2 },
          { label: "MBA Colleges", href: "/colleges?stream=Management", sortOrder: 3 },
          { label: "Study in Canada", href: "/study-abroad", sortOrder: 4 },
        ] },
        floatingCards: { create: [
          { title: "IIT Bombay", subtitle: "NIRF Rank #3", position: "left", content: { rating: "4.8", tags: ["Engineering", "Govt"] }, sortOrder: 1 },
          { title: "Avg. Package at IITs", subtitle: "₹22 LPA", position: "right", content: { trend: "+18% from last year", progress: 80 }, sortOrder: 2 },
        ] },
      },
    });
  } else {
    console.log("    (skipped — hero banner already exists)");
  }

  // Home Stats
  console.log("  → Home Stats");
  await prisma.homeStat.createMany({
    data: [
      { icon: "GraduationCap", value: 25000, suffix: "+", label: "Colleges Listed", sublabel: "Across 28 states", color: "from-blue-600 to-blue-400", bgColor: "bg-blue-50", iconColor: "text-blue-600", sortOrder: 1 },
      { icon: "BookOpen", value: 500, suffix: "+", label: "Entrance Exams", sublabel: "National & State level", color: "from-orange-500 to-amber-400", bgColor: "bg-orange-50", iconColor: "text-orange-500", sortOrder: 2 },
      { icon: "Users", value: 1000000, suffix: "+", label: "Students Guided", sublabel: "Made better decisions", color: "from-green-600 to-emerald-400", bgColor: "bg-green-50", iconColor: "text-green-600", sortOrder: 3 },
      { icon: "TrendingUp", value: 800, suffix: "+", label: "Courses Available", sublabel: "UG, PG & Diploma", color: "from-purple-600 to-violet-400", bgColor: "bg-purple-50", iconColor: "text-purple-600", sortOrder: 4 },
      { icon: "Award", value: 99, suffix: "%", label: "Accuracy Rate", sublabel: "Verified information", color: "from-red-500 to-rose-400", bgColor: "bg-red-50", iconColor: "text-red-500", sortOrder: 5 },
      { icon: "Globe", value: 10, suffix: "+", label: "Study Abroad Countries", sublabel: "International admissions", color: "from-cyan-600 to-sky-400", bgColor: "bg-cyan-50", iconColor: "text-cyan-600", sortOrder: 6 },
    ],
    skipDuplicates: true,
  });

  // Home Sections
  console.log("  → Home Sections");
  for (const s of [
    { sectionKey: "stats", title: "Trusted by Millions of Students", subtitle: "India's most comprehensive education portal with verified data and expert guidance", sortOrder: 1 },
    { sectionKey: "top-colleges", title: "Top Colleges in India", subtitle: "Discover the best colleges ranked by NIRF, ratings, and placements", ctaLabel: "View All Colleges", ctaLink: "/colleges", sortOrder: 2 },
    { sectionKey: "top-exams", title: "Top Entrance Exams 2025-26", subtitle: "Stay ahead with exam dates, syllabus and preparation tips", ctaLabel: "View All Exams", ctaLink: "/exams", sortOrder: 3 },
    { sectionKey: "news", title: "Latest News & Updates", subtitle: "Stay updated with latest exam dates, results, and education news", ctaLabel: "View All News", ctaLink: "/news", sortOrder: 4 },
    { sectionKey: "featured-courses", title: "Popular Courses", subtitle: "Explore 800+ courses across engineering, medicine, law, management and more", ctaLabel: "View All Courses", ctaLink: "/courses", sortOrder: 5 },
    { sectionKey: "study-abroad", title: "Study Abroad", subtitle: "Explore world-class universities in 10+ countries.", ctaLabel: "Explore All", ctaLink: "/study-abroad", sortOrder: 6 },
  ]) {
    await prisma.homeSection.upsert({ where: { sectionKey: s.sectionKey }, update: {}, create: s });
  }

  // CTA Sections
  console.log("  → CTA Sections");
  await prisma.ctaSection.upsert({
    where: { sectionKey: "newsletter" },
    update: {},
    create: {
      sectionKey: "newsletter",
      badge: "Free for students — always",
      heading: "Start Your Education Journey Today",
      subheading: "Join 10 lakh+ students who use Mayra to make smarter education decisions.",
      ctaPrimaryText: "Get Started Free",
      ctaPrimaryLink: "/sign-up",
      ctaSecondaryText: "Explore Colleges",
      ctaSecondaryLink: "/colleges",
      footnote: "No credit card required. No spam. Just good guidance.",
    },
  });
  await prisma.ctaSection.upsert({
    where: { sectionKey: "career-test" },
    update: {},
    create: {
      sectionKey: "career-test",
      heading: "Not Sure Which Course to Choose?",
      subheading: "Take our free career aptitude test and get personalized course recommendations.",
      ctaPrimaryText: "Take Free Career Test",
    },
  });

  // World College Stats
  console.log("  → World College Stats");
  const worldStats = [
    { countryCode: "IN", countryName: "India", collegeCount: 43796, centroidLng: 78.96, centroidLat: 20.59 },
    { countryCode: "US", countryName: "United States", collegeCount: 5916, centroidLng: -95.71, centroidLat: 37.09 },
    { countryCode: "ID", countryName: "Indonesia", collegeCount: 4498, centroidLng: 113.92, centroidLat: -0.79 },
    { countryCode: "MX", countryName: "Mexico", collegeCount: 3591, centroidLng: -102.55, centroidLat: 23.63 },
    { countryCode: "CN", countryName: "China", collegeCount: 3013, centroidLng: 104.19, centroidLat: 35.86 },
    { countryCode: "BD", countryName: "Bangladesh", collegeCount: 3000, centroidLng: 90.36, centroidLat: 23.68 },
    { countryCode: "BR", countryName: "Brazil", collegeCount: 2364, centroidLng: -51.93, centroidLat: -14.24 },
    { countryCode: "JP", countryName: "Japan", collegeCount: 1221, centroidLng: 138.25, centroidLat: 36.20 },
    { countryCode: "PH", countryName: "Philippines", collegeCount: 2180, centroidLng: 121.77, centroidLat: 12.88 },
    { countryCode: "GB", countryName: "United Kingdom", collegeCount: 395, centroidLng: -3.44, centroidLat: 55.38 },
    { countryCode: "DE", countryName: "Germany", collegeCount: 426, centroidLng: 10.45, centroidLat: 51.17 },
    { countryCode: "FR", countryName: "France", collegeCount: 261, centroidLng: 2.21, centroidLat: 46.23 },
    { countryCode: "AU", countryName: "Australia", collegeCount: 170, centroidLng: 133.78, centroidLat: -25.27 },
    { countryCode: "CA", countryName: "Canada", collegeCount: 223, centroidLng: -106.35, centroidLat: 56.13 },
    { countryCode: "RU", countryName: "Russia", collegeCount: 1115, centroidLng: 105.32, centroidLat: 61.52 },
    { countryCode: "KR", countryName: "South Korea", collegeCount: 371, centroidLng: 127.77, centroidLat: 35.91 },
    { countryCode: "NG", countryName: "Nigeria", collegeCount: 170, centroidLng: 8.68, centroidLat: 9.08 },
    { countryCode: "PK", countryName: "Pakistan", collegeCount: 235, centroidLng: 69.35, centroidLat: 30.38 },
    { countryCode: "EG", countryName: "Egypt", collegeCount: 72, centroidLng: 30.80, centroidLat: 26.82 },
    { countryCode: "MY", countryName: "Malaysia", collegeCount: 590, centroidLng: 101.98, centroidLat: 4.21 },
  ];
  for (const stat of worldStats) {
    await prisma.worldCollegeStat.upsert({ where: { countryCode: stat.countryCode }, update: {}, create: stat });
  }

  console.log("  ✓ CMS data complete");
}

// ============================================================
// 4. SEED CONTENT DATA (from data/ files)
// ============================================================
async function seedContentData() {
  console.log("\n━━━ CONTENT DATA (from data/ files) ━━━");

  // Colleges from data file
  console.log("  → Importing colleges from data/colleges.ts...");
  try {
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
            source: "data-file",
          },
        });
        created++;
      } catch { skipped++; }
    }
    console.log(`    ✓ ${created} colleges from data file (${skipped} skipped)`);
  } catch (e) {
    console.log(`    ⚠ Could not parse colleges.ts: ${e.message?.slice(0, 100)}`);
  }

  // Exams
  console.log("  → Importing exams...");
  try {
    const exams = extractArray("data/exams.ts", "exams");
    let created = 0, skipped = 0;
    for (const e of exams) {
      try {
        await prisma.exam.upsert({
          where: { slug: e.slug },
          update: {},
          create: {
            name: e.name, slug: e.slug, fullName: e.fullName || e.name,
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
            source: "data-file",
          },
        });
        created++;
      } catch { skipped++; }
    }
    console.log(`    ✓ ${created} exams (${skipped} skipped)`);
  } catch (e) {
    console.log(`    ⚠ Could not parse exams.ts: ${e.message?.slice(0, 100)}`);
  }

  // Courses
  console.log("  → Importing courses...");
  try {
    const courses = extractArray("data/courses.ts", "courses");
    let created = 0, skipped = 0;
    for (const c of courses) {
      try {
        await prisma.course.upsert({
          where: { slug: c.slug },
          update: {},
          create: {
            name: c.name, slug: c.slug, stream: c.stream || "",
            level: c.level || "UG", duration: c.duration || "",
            description: c.description || "",
            topColleges: c.topColleges || 10,
            avgFees: c.avgFees || 100000,
            avgSalary: c.avgSalary || null,
            isFeatured: c.isFeatured || false,
            isActive: true,
            icon: c.icon || null, color: c.color || null,
            source: "data-file",
          },
        });
        created++;
      } catch { skipped++; }
    }
    console.log(`    ✓ ${created} courses (${skipped} skipped)`);
  } catch (e) {
    console.log(`    ⚠ Could not parse courses.ts: ${e.message?.slice(0, 100)}`);
  }

  // News
  console.log("  → Importing news...");
  try {
    const news = extractArray("data/news.ts", "news");
    let created = 0, skipped = 0;
    for (const a of news) {
      try {
        await prisma.newsArticle.upsert({
          where: { slug: a.slug },
          update: {},
          create: {
            title: a.title, slug: a.slug,
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
            source: "data-file",
          },
        });
        created++;
      } catch { skipped++; }
    }
    console.log(`    ✓ ${created} news articles (${skipped} skipped)`);
  } catch (e) {
    console.log(`    ⚠ Could not parse news.ts: ${e.message?.slice(0, 100)}`);
  }

  // Study Abroad
  console.log("  → Importing study abroad countries...");
  try {
    const countries = extractArray("data/studyAbroad.ts", "studyAbroadCountries");
    let created = 0, skipped = 0;
    for (const c of countries) {
      try {
        const slug = c.slug || c.id || c.name.toLowerCase().replace(/\s+/g, "-");
        await prisma.studyAbroadCountry.upsert({
          where: { slug },
          update: {},
          create: {
            name: c.name, slug, flag: c.flag || "",
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
            source: "data-file",
          },
        });
        created++;
      } catch { skipped++; }
    }
    console.log(`    ✓ ${created} countries (${skipped} skipped)`);
  } catch (e) {
    console.log(`    ⚠ Could not parse studyAbroad.ts: ${e.message?.slice(0, 100)}`);
  }

  console.log("  ✓ Content data complete");
}

// ============================================================
// 5. GENERATE 18000+ COLLEGES (Indian colleges across all states)
// ============================================================
async function seedBulkColleges() {
  console.log("\n━━━ BULK COLLEGE GENERATION (18,000+ colleges) ━━━");

  const existingCount = await prisma.college.count();
  console.log(`  Current college count: ${existingCount}`);

  if (existingCount >= 18000) {
    console.log("  ✓ Already have 18000+ colleges, skipping bulk generation");
    return;
  }

  const TARGET = 18500;
  const toGenerate = TARGET - existingCount;
  console.log(`  Generating ${toGenerate} additional colleges...`);

  // State-wise distribution (approximate real distribution of Indian colleges)
  const stateData = [
    { state: "Uttar Pradesh", cities: ["Lucknow", "Noida", "Agra", "Varanasi", "Kanpur", "Prayagraj", "Ghaziabad", "Meerut", "Bareilly", "Aligarh", "Gorakhpur", "Mathura", "Jhansi", "Moradabad", "Firozabad", "Saharanpur"], weight: 14 },
    { state: "Maharashtra", cities: ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Solapur", "Kolhapur", "Thane", "Sangli", "Navi Mumbai", "Amravati", "Chandrapur", "Jalgaon", "Latur", "Akola"], weight: 12 },
    { state: "Karnataka", cities: ["Bangalore", "Mysore", "Mangalore", "Hubli", "Belgaum", "Dharwad", "Gulbarga", "Shimoga", "Tumkur", "Udupi", "Hassan", "Davangere", "Bijapur", "Bellary"], weight: 8 },
    { state: "Tamil Nadu", cities: ["Chennai", "Coimbatore", "Madurai", "Salem", "Tiruchirappalli", "Tirunelveli", "Vellore", "Erode", "Thanjavur", "Dindigul", "Kanchipuram", "Cuddalore", "Tirupur"], weight: 8 },
    { state: "Rajasthan", cities: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner", "Bharatpur", "Alwar", "Sikar", "Bhilwara", "Pali", "Tonk", "Chittorgarh"], weight: 7 },
    { state: "Madhya Pradesh", cities: ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Rewa", "Satna", "Dewas", "Ratlam", "Burhanpur", "Khandwa", "Vidisha"], weight: 7 },
    { state: "Andhra Pradesh", cities: ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Kakinada", "Rajahmundry", "Tirupati", "Kadapa", "Anantapur", "Eluru", "Ongole"], weight: 6 },
    { state: "Telangana", cities: ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Ramagundam", "Mahbubnagar", "Nalgonda", "Adilabad", "Suryapet", "Secunderabad"], weight: 5 },
    { state: "Gujarat", cities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhinagar", "Anand", "Nadiad", "Bharuch", "Mehsana", "Morbi"], weight: 5 },
    { state: "West Bengal", cities: ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Kalyani", "Burdwan", "Malda", "Kharagpur", "Baharampur", "Haldia", "Krishnanagar"], weight: 5 },
    { state: "Kerala", cities: ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Palakkad", "Kannur", "Alappuzha", "Kottayam", "Malappuram", "Kasaragod"], weight: 4 },
    { state: "Bihar", cities: ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga", "Purnia", "Arrah", "Begusarai", "Katihar", "Munger", "Chapra", "Hajipur"], weight: 4 },
    { state: "Punjab", cities: ["Chandigarh", "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Hoshiarpur", "Pathankot", "Moga", "Firozpur"], weight: 3 },
    { state: "Odisha", cities: ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore", "Baripada", "Jharsuguda", "Angul"], weight: 3 },
    { state: "Haryana", cities: ["Gurgaon", "Faridabad", "Karnal", "Panipat", "Ambala", "Hisar", "Rohtak", "Sonipat", "Bhiwani", "Kurukshetra", "Sirsa"], weight: 3 },
    { state: "Jharkhand", cities: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh", "Deoghar", "Giridih", "Ramgarh", "Dumka"], weight: 2 },
    { state: "Chhattisgarh", cities: ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Rajnandgaon", "Raigarh", "Ambikapur", "Jagdalpur"], weight: 2 },
    { state: "Assam", cities: ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tezpur", "Tinsukia", "Bongaigaon", "Karimganj"], weight: 2 },
    { state: "Uttarakhand", cities: ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rishikesh", "Kashipur", "Rudrapur", "Nainital", "Almora"], weight: 2 },
    { state: "Himachal Pradesh", cities: ["Shimla", "Dharamsala", "Mandi", "Solan", "Hamirpur", "Kullu", "Kangra", "Una", "Bilaspur"], weight: 1 },
    { state: "Goa", cities: ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"], weight: 1 },
    { state: "Tripura", cities: ["Agartala", "Dharmanagar", "Udaipur", "Kailasahar", "Belonia"], weight: 1 },
    { state: "Meghalaya", cities: ["Shillong", "Tura", "Nongstoin", "Jowai", "Baghmara"], weight: 1 },
    { state: "Manipur", cities: ["Imphal", "Thoubal", "Bishnupur", "Churachandpur", "Ukhrul"], weight: 1 },
    { state: "Nagaland", cities: ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha"], weight: 1 },
    { state: "Mizoram", cities: ["Aizawl", "Lunglei", "Champhai", "Serchhip", "Kolasib"], weight: 1 },
    { state: "Arunachal Pradesh", cities: ["Itanagar", "Naharlagun", "Pasighat", "Tawang", "Ziro"], weight: 1 },
    { state: "Sikkim", cities: ["Gangtok", "Namchi", "Mangan", "Gyalshing", "Jorethang"], weight: 1 },
    { state: "Delhi", cities: ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "Dwarka", "Rohini", "Shahdara"], weight: 3 },
    { state: "Jammu and Kashmir", cities: ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Sopore", "Kathua", "Udhampur"], weight: 1 },
    { state: "Puducherry", cities: ["Puducherry", "Karaikal", "Mahe"], weight: 1 },
  ];

  const collegeTemplates = [
    // Engineering
    { prefix: "", suffix: "Institute of Technology", streams: ["Engineering", "Technology"], courses: ["B.Tech", "M.Tech", "PhD"], type: "Private", category: "engineering" },
    { prefix: "", suffix: "College of Engineering", streams: ["Engineering"], courses: ["B.Tech", "M.Tech", "B.E."], type: "Private", category: "engineering" },
    { prefix: "", suffix: "Engineering College", streams: ["Engineering", "Technology"], courses: ["B.Tech", "B.E.", "M.Tech"], type: "Private", category: "engineering" },
    { prefix: "Government", suffix: "Engineering College", streams: ["Engineering"], courses: ["B.Tech", "B.E."], type: "Government", category: "engineering" },
    { prefix: "", suffix: "Institute of Engineering and Technology", streams: ["Engineering", "Technology"], courses: ["B.Tech", "M.Tech"], type: "Private", category: "engineering" },
    { prefix: "", suffix: "Technical Institute", streams: ["Engineering", "Technology"], courses: ["B.Tech", "Diploma"], type: "Private", category: "engineering" },
    // Medical
    { prefix: "", suffix: "Medical College", streams: ["Medical"], courses: ["MBBS", "MD", "MS"], type: "Private", category: "medical" },
    { prefix: "Government", suffix: "Medical College", streams: ["Medical"], courses: ["MBBS", "MD"], type: "Government", category: "medical" },
    { prefix: "", suffix: "Institute of Medical Sciences", streams: ["Medical", "Science"], courses: ["MBBS", "BDS", "MD"], type: "Private", category: "medical" },
    { prefix: "", suffix: "Dental College", streams: ["Medical"], courses: ["BDS", "MDS"], type: "Private", category: "medical" },
    { prefix: "", suffix: "Ayurvedic Medical College", streams: ["Medical"], courses: ["BAMS", "MD Ayurveda"], type: "Private", category: "medical" },
    { prefix: "", suffix: "Homeopathic Medical College", streams: ["Medical"], courses: ["BHMS"], type: "Private", category: "medical" },
    { prefix: "", suffix: "College of Nursing", streams: ["Medical"], courses: ["B.Sc Nursing", "M.Sc Nursing", "GNM"], type: "Private", category: "medical" },
    // Management
    { prefix: "", suffix: "School of Management", streams: ["Management"], courses: ["MBA", "BBA", "PGDM"], type: "Private", category: "management" },
    { prefix: "", suffix: "Business School", streams: ["Management", "Commerce"], courses: ["MBA", "PGDM"], type: "Private", category: "management" },
    { prefix: "", suffix: "Institute of Management", streams: ["Management"], courses: ["MBA", "BBA"], type: "Private", category: "management" },
    { prefix: "", suffix: "Institute of Management Studies", streams: ["Management"], courses: ["MBA", "PGDM", "BBA"], type: "Private", category: "management" },
    // Law
    { prefix: "", suffix: "Law College", streams: ["Law"], courses: ["LLB", "BA LLB", "LLM"], type: "Private", category: "law" },
    { prefix: "", suffix: "Institute of Law", streams: ["Law"], courses: ["BA LLB", "BBA LLB", "LLM"], type: "Private", category: "law" },
    { prefix: "Government", suffix: "Law College", streams: ["Law"], courses: ["LLB", "LLM"], type: "Government", category: "law" },
    // Arts & Science
    { prefix: "", suffix: "College of Arts and Science", streams: ["Arts & Humanities", "Science"], courses: ["B.A.", "B.Sc", "M.A.", "M.Sc"], type: "Private", category: "arts" },
    { prefix: "", suffix: "Degree College", streams: ["Arts & Humanities", "Science", "Commerce"], courses: ["B.A.", "B.Sc", "B.Com"], type: "Private", category: "arts" },
    { prefix: "Government", suffix: "Degree College", streams: ["Arts & Humanities", "Science"], courses: ["B.A.", "B.Sc", "B.Com"], type: "Government", category: "arts" },
    { prefix: "", suffix: "Arts College", streams: ["Arts & Humanities"], courses: ["B.A.", "M.A."], type: "Private", category: "arts" },
    { prefix: "", suffix: "Science College", streams: ["Science"], courses: ["B.Sc", "M.Sc"], type: "Private", category: "arts" },
    // Commerce
    { prefix: "", suffix: "College of Commerce", streams: ["Commerce", "Management"], courses: ["B.Com", "M.Com", "BBA"], type: "Private", category: "commerce" },
    { prefix: "", suffix: "Commerce and Management College", streams: ["Commerce", "Management"], courses: ["B.Com", "BBA", "MBA"], type: "Private", category: "commerce" },
    // Education
    { prefix: "", suffix: "College of Education", streams: ["Education"], courses: ["B.Ed", "M.Ed", "D.El.Ed"], type: "Private", category: "education" },
    { prefix: "", suffix: "Teacher Training Institute", streams: ["Education"], courses: ["B.Ed", "D.El.Ed"], type: "Private", category: "education" },
    // Pharmacy
    { prefix: "", suffix: "College of Pharmacy", streams: ["Pharmacy"], courses: ["B.Pharm", "M.Pharm", "D.Pharm"], type: "Private", category: "pharmacy" },
    { prefix: "", suffix: "Pharmacy College", streams: ["Pharmacy"], courses: ["B.Pharm", "D.Pharm"], type: "Private", category: "pharmacy" },
    // Architecture
    { prefix: "", suffix: "School of Architecture", streams: ["Architecture"], courses: ["B.Arch", "M.Arch"], type: "Private", category: "architecture" },
    // Agriculture
    { prefix: "", suffix: "Agricultural College", streams: ["Agriculture"], courses: ["B.Sc Agriculture", "M.Sc Agriculture"], type: "Government", category: "agriculture" },
    { prefix: "", suffix: "Institute of Agricultural Sciences", streams: ["Agriculture"], courses: ["B.Sc Agriculture", "M.Sc Agriculture"], type: "Private", category: "agriculture" },
    // Polytechnic
    { prefix: "", suffix: "Polytechnic", streams: ["Engineering", "Technology"], courses: ["Diploma in Engineering", "Diploma in Computer Science"], type: "Government", category: "engineering" },
    { prefix: "Government", suffix: "Polytechnic", streams: ["Engineering"], courses: ["Diploma in Engineering"], type: "Government", category: "engineering" },
    // Multi-discipline
    { prefix: "", suffix: "University", streams: ["Engineering", "Science", "Arts & Humanities", "Management"], courses: ["B.Tech", "B.A.", "MBA", "M.Sc"], type: "Deemed", category: "multi" },
    { prefix: "", suffix: "Institute of Higher Education", streams: ["Science", "Arts & Humanities", "Commerce"], courses: ["B.A.", "B.Sc", "B.Com", "M.A."], type: "Private", category: "multi" },
  ];

  const nameElements = [
    // People names (common Indian educator/founder names)
    "Shri Ram", "Sardar Patel", "Mahatma Gandhi", "Jawaharlal Nehru", "Dr. Ambedkar",
    "Swami Vivekananda", "Rabindranath Tagore", "APJ Abdul Kalam", "Chandrashekhar",
    "Lal Bahadur Shastri", "Subhas Chandra Bose", "Bhagat Singh", "Rajendra Prasad",
    "Maulana Azad", "Savitribai Phule", "Rani Laxmi Bai", "Maharshi Dayanand",
    "Guru Nanak", "Baba Saheb", "Pandit Deendayal", "Sardar Vallabhbhai",
    "Dr. Rajiv Gandhi", "Indira Gandhi", "Chhatrapati Shivaji", "Maharana Pratap",
    "Aryabhata", "Chanakya", "Nalanda", "Vikramashila",
    "Sri Aurobindo", "Ramakrishna", "Mother Teresa", "Sarojini Naidu",
    "K.L.", "S.K.", "R.V.", "G.H.", "J.K.", "N.S.", "M.R.", "P.L.",
    "D.A.V.", "S.D.", "B.M.S.", "K.V.G.", "P.E.S.", "R.N.S.", "M.S.",
    "Smt. Kamla Devi", "Shri Venkateshwara", "Sri Siddhartha", "Guru Gobind Singh",
    "Sant Gadge Baba", "Bharati Vidyapeeth", "Amity", "Lovely Professional",
    "Kalinga", "Centurion", "Presidency", "Heritage", "Global",
    "National", "Modern", "New Era", "Sunrise", "Golden", "Silver Jubilee",
    "Diamond", "Millennium", "Pioneer", "Horizon", "Vision", "Future",
    "Bright", "Excel", "Prime", "Royal", "Imperial", "Noble", "Sapphire",
    "Emerald", "Crystal", "Pacific", "Atlantic", "Oriental", "Crescent",
    "Sharda", "Amrita", "Manipal", "SRM", "VIT", "Symbiosis", "KIIT",
    "Chitkara", "Thapar", "Nirma", "Dhirubhai", "Reliance", "ICFAI",
  ];

  const accreditationOptions = [
    ["UGC", "AICTE"], ["NAAC A", "UGC"], ["NAAC A+", "UGC", "NBA"],
    ["AICTE"], ["UGC"], ["NAAC A++", "UGC", "NBA"], ["NBA", "AICTE"],
    ["NAAC A", "AICTE"], [], ["UGC", "NAAC A"],
  ];

  // Calculate total weight
  const totalWeight = stateData.reduce((sum, s) => sum + s.weight, 0);

  // Seeded slug tracker
  const existingSlugs = new Set();
  const existingColleges = await prisma.college.findMany({ select: { slug: true } });
  existingColleges.forEach(c => existingSlugs.add(c.slug));

  let totalCreated = 0;
  let batchData = [];
  const BATCH_SIZE = 500;

  for (const sd of stateData) {
    const stateCount = Math.round((sd.weight / totalWeight) * toGenerate);

    for (let i = 0; i < stateCount; i++) {
      const template = collegeTemplates[Math.floor(Math.random() * collegeTemplates.length)];
      const nameEl = nameElements[Math.floor(Math.random() * nameElements.length)];
      const city = sd.cities[Math.floor(Math.random() * sd.cities.length)];
      const accred = accreditationOptions[Math.floor(Math.random() * accreditationOptions.length)];

      // Build name
      const prefix = template.prefix ? template.prefix + " " : "";
      const collegeName = `${prefix}${nameEl} ${template.suffix}`;

      // Generate unique slug
      let slug = collegeName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 80);

      // Add city suffix for uniqueness
      const citySlug = city.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      slug = `${slug}-${citySlug}`;

      // If still duplicate, add index
      if (existingSlugs.has(slug)) {
        slug = `${slug}-${i}`;
      }
      if (existingSlugs.has(slug)) {
        slug = `${slug}-${Date.now() % 100000}`;
      }
      if (existingSlugs.has(slug)) continue;

      existingSlugs.add(slug);

      // Generate realistic data
      const isGovt = template.type === "Government";
      const established = isGovt
        ? 1950 + Math.floor(Math.random() * 50)
        : 1980 + Math.floor(Math.random() * 40);
      const rating = +(3.0 + Math.random() * 2.0).toFixed(1);
      const feesMin = isGovt
        ? 5000 + Math.floor(Math.random() * 50000)
        : 30000 + Math.floor(Math.random() * 200000);
      const feesMax = feesMin + 50000 + Math.floor(Math.random() * 400000);

      const stateLat = {
        "Uttar Pradesh": [26.8, 80.9], "Maharashtra": [19.7, 75.7], "Karnataka": [15.3, 75.7],
        "Tamil Nadu": [11.1, 78.7], "Rajasthan": [27.0, 74.2], "Madhya Pradesh": [22.9, 78.7],
        "Andhra Pradesh": [15.9, 79.7], "Telangana": [18.1, 79.0], "Gujarat": [22.3, 71.2],
        "West Bengal": [22.9, 87.9], "Kerala": [10.9, 76.3], "Bihar": [25.1, 85.3],
        "Punjab": [31.1, 75.3], "Odisha": [20.9, 84.0], "Haryana": [29.1, 76.1],
        "Jharkhand": [23.6, 85.3], "Chhattisgarh": [21.3, 81.6], "Assam": [26.2, 92.9],
        "Uttarakhand": [30.1, 79.0], "Himachal Pradesh": [31.1, 77.2], "Goa": [15.3, 74.0],
        "Tripura": [23.9, 91.9], "Meghalaya": [25.5, 91.4], "Manipur": [24.7, 93.9],
        "Nagaland": [26.2, 94.6], "Mizoram": [23.2, 92.9], "Arunachal Pradesh": [28.2, 94.7],
        "Sikkim": [27.5, 88.5], "Delhi": [28.7, 77.1], "Jammu and Kashmir": [33.7, 76.8],
        "Puducherry": [11.9, 79.8],
      };

      const coords = stateLat[sd.state] || [20.6, 79.0];
      const lat = coords[0] + (Math.random() - 0.5) * 3;
      const lng = coords[1] + (Math.random() - 0.5) * 3;

      batchData.push({
        name: collegeName,
        slug,
        logo: collegeName.charAt(0),
        city,
        state: sd.state,
        streams: template.streams,
        rating: Math.min(rating, 5.0),
        reviewCount: 10 + Math.floor(Math.random() * 500),
        established,
        type: template.type,
        feesMin,
        feesMax,
        accreditation: accred,
        courses: template.courses,
        description: `${collegeName}, located in ${city}, ${sd.state}, is a reputed ${template.type.toLowerCase()} institution offering quality education in ${template.streams.join(", ")}. Established in ${established}, the college is known for its academic excellence and industry connections.`,
        highlights: [
          `Established in ${established}`,
          `Located in ${city}, ${sd.state}`,
          `${template.type} institution`,
          `Offers ${template.courses.join(", ")}`,
        ],
        address: `${city}, ${sd.state}, India`,
        isActive: true,
        latitude: +lat.toFixed(4),
        longitude: +lng.toFixed(4),
        countryCode: "IN",
        countryName: "India",
        source: "bulk-seed",
      });

      // Insert in batches
      if (batchData.length >= BATCH_SIZE) {
        try {
          const result = await prisma.college.createMany({
            data: batchData,
            skipDuplicates: true,
          });
          totalCreated += result.count;
          console.log(`    Batch inserted: ${result.count} colleges (total: ${totalCreated})`);
        } catch (e) {
          console.log(`    ⚠ Batch error: ${e.message?.slice(0, 100)}`);
          // Try one by one for failed batch
          for (const c of batchData) {
            try {
              await prisma.college.create({ data: c });
              totalCreated++;
            } catch { /* skip duplicates */ }
          }
        }
        batchData = [];
      }
    }
  }

  // Insert remaining
  if (batchData.length > 0) {
    try {
      const result = await prisma.college.createMany({
        data: batchData,
        skipDuplicates: true,
      });
      totalCreated += result.count;
      console.log(`    Final batch: ${result.count} colleges`);
    } catch (e) {
      for (const c of batchData) {
        try {
          await prisma.college.create({ data: c });
          totalCreated++;
        } catch { /* skip */ }
      }
    }
  }

  const finalCount = await prisma.college.count();
  console.log(`  ✓ Generated ${totalCreated} colleges. Total in DB: ${finalCount}`);
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║   MAYRA INTERNATIONAL — FULL DATABASE SEED      ║");
  console.log("╚══════════════════════════════════════════════════╝");

  await seedAdmin();
  await seedMasterData();
  await seedCMS();
  await seedContentData();
  await seedBulkColleges();

  const counts = {
    admins: await prisma.admin.count(),
    colleges: await prisma.college.count(),
    exams: await prisma.exam.count(),
    courses: await prisma.course.count(),
    news: await prisma.newsArticle.count(),
    studyAbroad: await prisma.studyAbroadCountry.count(),
    navigation: await prisma.navigationItem.count(),
    streams: await prisma.stream.count(),
    states: await prisma.state.count(),
  };

  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("║   SEED COMPLETE — SUMMARY                       ║");
  console.log("╠══════════════════════════════════════════════════╣");
  for (const [k, v] of Object.entries(counts)) {
    console.log(`║  ${k.padEnd(20)} ${String(v).padStart(8)}          ║`);
  }
  console.log("╚══════════════════════════════════════════════════╝");
  console.log("\n  Admin login: admin@mayrainternational.com / Admin@123\n");
}

main()
  .catch((e) => {
    console.error("\n❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
