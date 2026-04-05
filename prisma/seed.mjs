import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // ── Company Info ────────────────────────────────────────
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

  // ── Page SEO ────────────────────────────────────────────
  console.log("  → Page SEO");
  const seoPages = [
    {
      pageSlug: "home",
      title: "Mayra International — Find Your Dream College in India | 25,000+ Colleges",
      description: "Mayra International — India's most trusted education portal. Explore 25,000+ colleges, 500+ entrance exams, and 800+ courses.",
      keywords: ["Mayra International", "mayrainternational", "mayra international education", "education portal india", "college admissions india", "JEE Main 2026", "NEET 2026", "CAT MBA", "GATE", "top colleges india", "NIRF rankings 2026"],
      ogImage: "/og-image.png",
      ogTitle: "Mayra International — Find Your Dream College in India",
      ogDescription: "Mayra International — India's most trusted education portal. Explore 25,000+ colleges, 500+ entrance exams, and 800+ courses.",
      canonical: "https://www.mayrainternational.com",
    },
    { pageSlug: "colleges", title: "Top Colleges in India 2026 — Rankings, Fees, Admissions | Mayra International", description: "Explore 25,000+ colleges across India.", keywords: ["top colleges india", "engineering colleges", "Mayra International"], ogTitle: "Top Colleges in India | Mayra International", ogDescription: "Explore 25,000+ colleges", canonical: "https://www.mayrainternational.com/colleges" },
    { pageSlug: "exams", title: "Entrance Exams 2026 — Dates, Syllabus, Eligibility | Mayra International", description: "Complete guide to 500+ entrance exams.", keywords: ["JEE Main 2026", "NEET 2026", "entrance exams", "Mayra International"], ogTitle: "Entrance Exams 2026 | Mayra International", ogDescription: "Complete guide to 500+ entrance exams", canonical: "https://www.mayrainternational.com/exams" },
    { pageSlug: "courses", title: "Courses in India — UG, PG, Diploma Programs | Mayra International", description: "Explore 800+ courses across all streams.", keywords: ["courses india", "B.Tech", "MBBS", "MBA", "Mayra International"], ogTitle: "Courses in India | Mayra International", ogDescription: "Explore 800+ courses", canonical: "https://www.mayrainternational.com/courses" },
    { pageSlug: "news", title: "Education News & Updates 2026 | Mayra International", description: "Latest education news and updates.", keywords: ["education news", "exam results", "Mayra International"], ogTitle: "Education News | Mayra International", ogDescription: "Latest education news", canonical: "https://www.mayrainternational.com/news" },
    { pageSlug: "study-abroad", title: "Study Abroad from India — Countries, Universities, Costs | Mayra International", description: "Complete guide to studying abroad.", keywords: ["study abroad", "study in USA", "Mayra International"], ogTitle: "Study Abroad | Mayra International", ogDescription: "Complete guide to studying abroad", canonical: "https://www.mayrainternational.com/study-abroad" },
  ];
  for (const seo of seoPages) {
    await prisma.pageSeo.upsert({ where: { pageSlug: seo.pageSlug }, update: { title: seo.title, canonical: seo.canonical, ogTitle: seo.ogTitle, keywords: seo.keywords }, create: seo });
  }

  // ── Streams ─────────────────────────────────────────────
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

  // ── Accreditation Bodies ────────────────────────────────
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

  // ── Navigation Items ────────────────────────────────────
  console.log("  → Navigation Items");
  // Clear existing nav items to prevent duplicates on re-seed
  await prisma.navigationItem.deleteMany({ where: { parentId: { not: null } } });
  await prisma.navigationItem.deleteMany({});
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

  // ── Footer Sections ─────────────────────────────────────
  console.log("  → Footer Sections");
  await prisma.footerLink.deleteMany({});
  await prisma.footerSection.deleteMany({});
  await prisma.footerSection.create({
    data: {
      title: "Quick Links", sortOrder: 1,
      links: {
        create: [
          { label: "Top Colleges", href: "/colleges", sortOrder: 1 },
          { label: "Top Exams", href: "/exams", sortOrder: 2 },
          { label: "Courses", href: "/courses", sortOrder: 3 },
          { label: "Study Abroad", href: "/study-abroad", sortOrder: 4 },
          { label: "Compare Colleges", href: "/compare", sortOrder: 5 },
          { label: "News & Articles", href: "/news", sortOrder: 6 },
          { label: "Resume Builder", href: "/resume-builder", sortOrder: 7 },
          { label: "Career Guide", href: "/news?category=Careers", sortOrder: 8 },
        ],
      },
    },
  });

  await prisma.footerSection.create({
    data: {
      title: "Top Colleges", sortOrder: 2,
      links: {
        create: [
          { label: "IIT Bombay", href: "/colleges/iit-bombay", sortOrder: 1 },
          { label: "IIT Delhi", href: "/colleges/iit-delhi", sortOrder: 2 },
          { label: "IIM Ahmedabad", href: "/colleges/iim-ahmedabad", sortOrder: 3 },
          { label: "AIIMS Delhi", href: "/colleges/aiims-delhi", sortOrder: 4 },
          { label: "IIT Madras", href: "/colleges/iit-madras", sortOrder: 5 },
          { label: "BITS Pilani", href: "/colleges/bits-pilani", sortOrder: 6 },
          { label: "NIT Trichy", href: "/colleges/nit-trichy", sortOrder: 7 },
          { label: "Jadavpur University", href: "/colleges/jadavpur-university", sortOrder: 8 },
        ],
      },
    },
  });

  await prisma.footerSection.create({
    data: {
      title: "Top Exams", sortOrder: 3,
      links: {
        create: [
          { label: "JEE Main 2026", href: "/exams/jee-main", sortOrder: 1 },
          { label: "JEE Advanced 2026", href: "/exams/jee-advanced", sortOrder: 2 },
          { label: "NEET UG 2026", href: "/exams/neet-ug", sortOrder: 3 },
          { label: "CAT 2025", href: "/exams/cat", sortOrder: 4 },
          { label: "GATE 2026", href: "/exams/gate", sortOrder: 5 },
          { label: "CLAT 2025", href: "/exams/clat", sortOrder: 6 },
          { label: "CUET UG 2026", href: "/exams/cuet-ug", sortOrder: 7 },
          { label: "XAT 2026", href: "/exams/xat", sortOrder: 8 },
        ],
      },
    },
  });

  // ── Social Links ────────────────────────────────────────
  console.log("  → Social Links");
  const socials = [
    { platform: "Twitter", url: "#", icon: "Twitter", hoverColor: "hover:text-sky-400", sortOrder: 1 },
    { platform: "LinkedIn", url: "#", icon: "Linkedin", hoverColor: "hover:text-blue-400", sortOrder: 2 },
    { platform: "YouTube", url: "#", icon: "Youtube", hoverColor: "hover:text-red-400", sortOrder: 3 },
    { platform: "Instagram", url: "#", icon: "Instagram", hoverColor: "hover:text-pink-400", sortOrder: 4 },
    { platform: "Facebook", url: "#", icon: "Facebook", hoverColor: "hover:text-blue-500", sortOrder: 5 },
  ];
  for (const s of socials) {
    await prisma.socialLink.upsert({ where: { platform: s.platform }, update: {}, create: s });
  }

  // ── Legal Links ─────────────────────────────────────────
  console.log("  → Legal Links");
  await prisma.legalLink.deleteMany({});
  await prisma.legalLink.createMany({
    data: [
      { label: "Privacy Policy", href: "/privacy", sortOrder: 1 },
      { label: "Terms of Use", href: "/terms", sortOrder: 2 },
      { label: "Disclaimer", href: "/disclaimer", sortOrder: 3 },
      { label: "Advertise", href: "/advertise", sortOrder: 4 },
    ],
    skipDuplicates: true,
  });

  // ── Trust Badges ────────────────────────────────────────
  console.log("  → Trust Badges");
  await prisma.trustBadge.deleteMany({});
  await prisma.trustBadge.createMany({
    data: [
      { label: "SSL Secured", icon: "ShieldCheck", bgColor: "bg-green-900/50", borderColor: "border-green-700", textColor: "text-green-400", sortOrder: 1 },
    ],
    skipDuplicates: true,
  });

  // ── App Downloads ───────────────────────────────────────
  // App Download Links removed — no mobile app available yet

  // ── Hero Banner ─────────────────────────────────────────
  console.log("  → Hero Banner");
  await prisma.heroFloatingCard.deleteMany({});
  await prisma.heroPopularSearch.deleteMany({});
  await prisma.heroQuickFilter.deleteMany({});
  await prisma.heroSearchTab.deleteMany({});
  await prisma.heroStat.deleteMany({});
  await prisma.heroBanner.deleteMany({});
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
      stats: {
        create: [
          { icon: "Award", value: "25,000+", label: "Colleges", color: "text-blue-300", sortOrder: 1 },
          { icon: "BookOpen", value: "500+", label: "Exams", color: "text-orange-300", sortOrder: 2 },
          { icon: "Users", value: "10L+", label: "Students", color: "text-green-300", sortOrder: 3 },
          { icon: "TrendingUp", value: "800+", label: "Courses", color: "text-purple-300", sortOrder: 4 },
        ],
      },
      searchTabs: {
        create: [
          { label: "Colleges", placeholder: "Search 25,000+ colleges — IIT, NIT, IIM, AIIMS...", searchPath: "/colleges", sortOrder: 1 },
          { label: "Exams", placeholder: "Search entrance exams — JEE, NEET, CAT, GATE...", searchPath: "/exams", sortOrder: 2 },
          { label: "Courses", placeholder: "Search courses — B.Tech, MBA, MBBS, LLB...", searchPath: "/courses", sortOrder: 3 },
        ],
      },
      quickFilters: {
        create: [
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
          { tab: "Exams", label: "CLAT", href: "/exams?search=CLAT", sortOrder: 11 },
          { tab: "Exams", label: "CUET", href: "/exams?search=CUET", sortOrder: 12 },
          { tab: "Courses", label: "B.Tech", href: "/courses?search=B.Tech", sortOrder: 13 },
          { tab: "Courses", label: "MBBS", href: "/courses?search=MBBS", sortOrder: 14 },
          { tab: "Courses", label: "MBA", href: "/courses?search=MBA", sortOrder: 15 },
          { tab: "Courses", label: "LLB", href: "/courses?search=LLB", sortOrder: 16 },
          { tab: "Courses", label: "B.Com", href: "/courses?search=B.Com", sortOrder: 17 },
          { tab: "Courses", label: "BCA", href: "/courses?search=BCA", sortOrder: 18 },
        ],
      },
      popularSearches: {
        create: [
          { label: "IIT Bombay", href: "/colleges/iit-bombay", sortOrder: 1 },
          { label: "NEET 2026", href: "/exams/neet-ug", sortOrder: 2 },
          { label: "MBA Colleges", href: "/colleges?stream=Management", sortOrder: 3 },
          { label: "Study in Canada", href: "/study-abroad", sortOrder: 4 },
        ],
      },
      floatingCards: {
        create: [
          { title: "IIT Bombay", subtitle: "NIRF Rank #3", position: "left", content: { rating: "4.8", tags: ["Engineering", "Govt"] }, sortOrder: 1 },
          { title: "Avg. Package at IITs", subtitle: "₹22 LPA", position: "right", content: { trend: "+18% from last year", progress: 80 }, sortOrder: 2 },
        ],
      },
    },
  });

  // ── Home Stats ──────────────────────────────────────────
  console.log("  → Home Stats");
  await prisma.homeStat.deleteMany({});
  await prisma.homeStat.createMany({
    data: [
      { icon: "GraduationCap", value: 25000, suffix: "+", label: "Colleges Listed", sublabel: "Across 28 states", color: "from-blue-600 to-blue-400", bgColor: "bg-blue-50", iconColor: "text-blue-600", sortOrder: 1 },
      { icon: "BookOpen", value: 500, suffix: "+", label: "Entrance Exams", sublabel: "National & State level", color: "from-orange-500 to-amber-400", bgColor: "bg-orange-50", iconColor: "text-orange-500", sortOrder: 2 },
      { icon: "Users", value: 1000000, suffix: "+", label: "Students Guided", sublabel: "Made better decisions", color: "from-green-600 to-emerald-400", bgColor: "bg-green-50", iconColor: "text-green-600", sortOrder: 3 },
      { icon: "TrendingUp", value: 800, suffix: "+", label: "Courses Available", sublabel: "UG, PG & Diploma", color: "from-purple-600 to-violet-400", bgColor: "bg-purple-50", iconColor: "text-purple-600", sortOrder: 4 },
      { icon: "Award", value: 99, suffix: "%", label: "Accuracy Rate", sublabel: "Verified information", color: "from-red-500 to-rose-400", bgColor: "bg-red-50", iconColor: "text-red-500", sortOrder: 5 },
      { icon: "Globe", value: 10, suffix: "+", label: "Study Abroad Countries", sublabel: "International admissions", color: "from-cyan-600 to-sky-400", bgColor: "bg-cyan-50", iconColor: "text-cyan-600", sortOrder: 6 },
    ],
  });

  // ── Home Sections ───────────────────────────────────────
  console.log("  → Home Sections");
  const homeSections = [
    { sectionKey: "stats", title: "Trusted by Millions of Students", subtitle: "India's most comprehensive education portal with verified data and expert guidance", sortOrder: 1 },
    { sectionKey: "top-colleges", title: "Top Colleges in India", subtitle: "Discover the best colleges ranked by NIRF, ratings, and placements", ctaLabel: "View All Colleges", ctaLink: "/colleges", sortOrder: 2 },
    { sectionKey: "top-exams", title: "Top Entrance Exams 2025-26", subtitle: "Stay ahead with exam dates, syllabus and preparation tips", ctaLabel: "View All Exams", ctaLink: "/exams", sortOrder: 3 },
    { sectionKey: "news", title: "Latest News & Updates", subtitle: "Stay updated with latest exam dates, results, and education news", ctaLabel: "View All News", ctaLink: "/news", sortOrder: 4 },
    { sectionKey: "featured-courses", title: "Popular Courses", subtitle: "Explore 800+ courses across engineering, medicine, law, management and more", ctaLabel: "View All Courses", ctaLink: "/courses", sortOrder: 5 },
    { sectionKey: "study-abroad", title: "Study Abroad", subtitle: "Explore world-class universities in 10+ countries. Over 3 lakh Indian students study abroad annually.", ctaLabel: "Explore All", ctaLink: "/study-abroad", sortOrder: 6 },
  ];
  for (const s of homeSections) {
    await prisma.homeSection.upsert({ where: { sectionKey: s.sectionKey }, update: {}, create: s });
  }

  // ── CTA Sections ────────────────────────────────────────
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

  // ── World College Stats ─────────────────────────────────
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

  console.log("\n✅ CMS seed complete!\n");
  console.log("ℹ️  Content data (colleges, exams, courses, news, study-abroad)");
  console.log("   should be imported via the admin API or a separate migration script.");
  console.log("   The existing data/ files can be used as import sources.\n");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
