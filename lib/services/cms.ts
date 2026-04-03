import { prisma } from "../db";

// ── Navigation ──────────────────────────────────────────────
export async function getNavigationItems(section = "main") {
  const items = await prisma.navigationItem.findMany({
    where: { isActive: true, section, parentId: null },
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
  });
  return items;
}

// ── Footer ──────────────────────────────────────────────────
export async function getFooterSections() {
  return prisma.footerSection.findMany({
    where: { isActive: true },
    include: {
      links: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getSocialLinks() {
  return prisma.socialLink.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getLegalLinks() {
  return prisma.legalLink.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getTrustBadges() {
  return prisma.trustBadge.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getAppDownloadLinks() {
  return prisma.appDownloadLink.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

// ── Company Info ────────────────────────────────────────────
export async function getCompanyInfo() {
  const info = await prisma.companyInfo.findFirst();
  return info || {
    name: "Mayra International",
    tagline: "India's most trusted education platform",
    description: "",
    email: "support@mayrainternational.com",
    phone: "1800-123-4567",
    phoneLabel: "(Free)",
    address: "Bangalore, India",
    logo: "/images/mayra-logo.png",
    footerLogo: "/images/mayra-logo.png",
    copyrightText: "Mayra International",
    foundedYear: 2020,
    siteUrl: "https://www.mayrainternational.com",
    twitterHandle: "@mayraintl",
  };
}

// ── Hero Banner ─────────────────────────────────────────────
export async function getActiveHeroBanner() {
  return prisma.heroBanner.findFirst({
    where: { isActive: true },
    include: {
      stats: { orderBy: { sortOrder: "asc" } },
      searchTabs: { orderBy: { sortOrder: "asc" } },
      quickFilters: { orderBy: { sortOrder: "asc" } },
      popularSearches: { orderBy: { sortOrder: "asc" } },
      floatingCards: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
    },
    orderBy: { sortOrder: "asc" },
  });
}

// ── Home Stats ──────────────────────────────────────────────
export async function getHomeStats() {
  return prisma.homeStat.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

// ── Home Sections ───────────────────────────────────────────
export async function getHomeSections() {
  return prisma.homeSection.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getHomeSection(sectionKey: string) {
  return prisma.homeSection.findUnique({ where: { sectionKey } });
}

// ── CTA Sections ────────────────────────────────────────────
export async function getCtaSection(sectionKey: string) {
  return prisma.ctaSection.findUnique({ where: { sectionKey } });
}

// ── Announcements ───────────────────────────────────────────
export async function getActiveAnnouncements() {
  const now = new Date();
  return prisma.announcement.findMany({
    where: {
      isActive: true,
      OR: [
        { startDate: null, endDate: null },
        { startDate: { lte: now }, endDate: { gte: now } },
        { startDate: { lte: now }, endDate: null },
        { startDate: null, endDate: { gte: now } },
      ],
    },
    orderBy: { sortOrder: "asc" },
  });
}

// ── SEO ─────────────────────────────────────────────────────
export async function getPageSeo(pageSlug: string) {
  return prisma.pageSeo.findUnique({ where: { pageSlug } });
}

// ── World Map ───────────────────────────────────────────────
export async function getWorldCollegeStats() {
  return prisma.worldCollegeStat.findMany({
    where: { isActive: true },
    orderBy: { collegeCount: "desc" },
  });
}

// ── Streams ─────────────────────────────────────────────────
export async function getStreams() {
  return prisma.stream.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

// ── Site Settings ───────────────────────────────────────────
export async function getSiteSetting(key: string) {
  const setting = await prisma.siteSetting.findUnique({ where: { key } });
  return setting?.value;
}

export async function getSiteSettingsByGroup(group: string) {
  return prisma.siteSetting.findMany({ where: { group } });
}
