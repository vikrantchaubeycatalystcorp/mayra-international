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

    // Inject Mock Tests link if not already present in DB
    const hasMockTests = navItems.some((n) => n.href === "/mock-tests");
    if (!hasMockTests) {
      const worldMapIdx = navItems.findIndex(
        (n) => n.href === "/map" || n.label === "World Map"
      );
      const mockTestsItem = {
        id: "mock-tests-nav",
        label: "Mock Tests",
        href: "/mock-tests",
        icon: "BookOpen",
        description: "Practice full-length mock exams",
        isMega: false,
        megaGroupTitle: null,
        featuredTitle: null,
        featuredItems: [],
        target: "_self",
        section: "main",
        sortOrder: worldMapIdx >= 0 ? navItems[worldMapIdx].sortOrder + 1 : 98,
        isActive: true,
        parentId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        children: [],
      } as (typeof navItems)[number];

      if (worldMapIdx >= 0) {
        navItems.splice(worldMapIdx + 1, 0, mockTestsItem);
      } else {
        navItems.push(mockTestsItem);
      }
    }

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

    const defaultAddress =
      "Office No 613, 6th Floor, Satra Plaza, Vashi, Navi Mumbai-400703";
    const defaultTagline =
      "India's most trusted education platform. Helping students discover the right college, exam, and career since 2015.";

    const company = {
      name: "Mayra International",
      tagline: defaultTagline,
      email: "info@mayrainternational.com",
      phone: "+91 7506799678",
      phoneLabel: "",
      address: defaultAddress,
      footerLogo: "/images/mayra-logo.png",
      copyrightText: "Mayra International",
      foundedYear: 2015,
      ...companyInfo,
    };

    // Guard against stale legacy content from older CMS seeds.
    if (!company.address || /bangalore,\s*india/i.test(company.address)) {
      company.address = defaultAddress;
    }
    if (!company.email || /@mayra\.in$/i.test(company.email)) {
      company.email = "info@mayrainternational.com";
    }
    if (!company.name || /\b(?:myra|mayra)\s+india\b/i.test(company.name)) {
      company.name = "Mayra International";
    }
    if (!company.copyrightText || /\b(?:myra|mayra)\s+india\b/i.test(company.copyrightText)) {
      company.copyrightText = "Mayra International";
    }
    if (!company.tagline || /since\s+2020/i.test(company.tagline)) {
      company.tagline = defaultTagline;
    }
    if (!company.foundedYear || company.foundedYear === 2020) {
      company.foundedYear = 2015;
    }

    // Ensure Mock Tests exists in a footer quick-links style section
    const hasFooterMockTests = footerSections.some((section) =>
      section.links.some((link) => link.href === "/mock-tests")
    );

    if (!hasFooterMockTests) {
      const preferredSection =
        footerSections.find((section) => /quick\s*links?/i.test(section.title)) ||
        footerSections.find((section) => /resources?|links?/i.test(section.title)) ||
        footerSections[0];

      if (preferredSection) {
        preferredSection.links.push({
          id: "footer-link-mock-tests",
          label: "Mock Tests",
          href: "/mock-tests",
          sectionId: preferredSection.id,
          sortOrder: preferredSection.links.length + 1,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else {
        footerSections.push({
          id: "footer-section-quick-links",
          title: "Quick Links",
          sortOrder: 999,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          links: [
            {
              id: "footer-link-mock-tests",
              label: "Mock Tests",
              href: "/mock-tests",
              sectionId: "footer-section-quick-links",
              sortOrder: 1,
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        });
      }
    }

    return { company, footerSections, socialLinks, legalLinks, trustBadges, appDownloads };
  },
  ["footer-data"],
  { revalidate: 300 }
);
