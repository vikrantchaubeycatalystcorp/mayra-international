import { unstable_cache } from "next/cache";
import { prisma } from "./db";

export const getLayoutMetadata = unstable_cache(
  async () => {
    const [seo, company] = await Promise.all([
      prisma.pageSeo.findUnique({ where: { pageSlug: "home" } }),
      prisma.companyInfo.findFirst(),
    ]);
    return { seo, company };
  },
  ["layout-metadata"],
  { revalidate: 300 }
);

export const getNavbarData = unstable_cache(
  async () => {
    const [navItems, companyInfo] = await Promise.all([
      prisma.navigationItem.findMany({
        where: { isActive: true, section: "main", parentId: null },
        include: {
          children: {
            where: { isActive: true },
            include: {
              children: {
                where: { isActive: true },
                orderBy: { sortOrder: "asc" },
              },
            },
            orderBy: { sortOrder: "asc" },
          },
        },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.companyInfo.findFirst(),
    ]);

    // Inject Resume Builder link if not already present in DB
    const hasResumeBuilder = navItems.some(
      (n) => n.href === "/resume-builder"
    );
    if (!hasResumeBuilder) {
      // Find World Map index to insert right after it
      const worldMapIdx = navItems.findIndex(
        (n) => n.href === "/map" || n.label === "World Map"
      );
      const resumeBuilderItem = {
        id: "resume-builder-nav",
        label: "Resume Builder",
        href: "/resume-builder",
        icon: "Briefcase",
        description: "Build ATS-ready resumes",
        isMega: false,
        megaGroupTitle: null,
        featuredTitle: null,
        featuredItems: [],
        target: "_self",
        section: "main",
        sortOrder: worldMapIdx >= 0 ? navItems[worldMapIdx].sortOrder + 1 : 99,
        isActive: true,
        parentId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        children: [],
      } as (typeof navItems)[number];

      if (worldMapIdx >= 0) {
        navItems.splice(worldMapIdx + 1, 0, resumeBuilderItem);
      } else {
        navItems.push(resumeBuilderItem);
      }
    }

    return {
      navItems,
      logo: companyInfo?.logo || "/images/mayra-logo.png",
      siteName: companyInfo?.name || "Mayra International",
    };
  },
  ["navbar-data"],
  { revalidate: 300 }
);

export const getFooterData = unstable_cache(
  async () => {
    const [
      companyInfo,
      footerSections,
      socialLinks,
      legalLinks,
      trustBadges,
      appDownloads,
    ] = await Promise.all([
      prisma.companyInfo.findFirst(),
      prisma.footerSection.findMany({
        where: { isActive: true },
        include: {
          links: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
        },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.socialLink.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      prisma.legalLink.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      prisma.trustBadge.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      prisma.appDownloadLink.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    ]);

    const company = companyInfo || {
      name: "Mayra International",
      tagline: "India's most trusted education platform. Helping students discover the right college, exam, and career since 2020.",
      email: "support@mayra.in",
      phone: "1800-123-4567",
      phoneLabel: "(Free)",
      address: "Bangalore, India",
      footerLogo: "/images/mayra-logo.png",
      copyrightText: "Mayra India",
      foundedYear: 2020,
    };

    return { company, footerSections, socialLinks, legalLinks, trustBadges, appDownloads };
  },
  ["footer-data"],
  { revalidate: 300 }
);
