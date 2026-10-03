import type { MetadataRoute } from "next";
import { prisma } from "./db";
import { BROWSE_PAGE_SIZE, browsePath, type BrowseType } from "./browse";
import { LOCAL_SEO_HUB_PATH, LOCAL_SEO_PAGES } from "./local-seo";

export const SITE_URL = "https://www.mayrainternational.com";

/** Colleges per child sitemap. Google allows 50,000; smaller shards keep each regeneration query fast. */
export const COLLEGES_PER_SITEMAP = 5000;

/** Google's hard limit on URLs in a single sitemap file. */
const MAX_URLS_PER_SITEMAP = 50000;

/** Child sitemap 0 holds static pages, courses, exams, news and countries; ids 1..N hold colleges. */
export const PAGES_SITEMAP_ID = 0;

export function childSitemapUrl(id: number): string {
  return `${SITE_URL}/sitemaps/sitemap/${id}.xml`;
}

function parseDate(value: string | Date | null | undefined): Date | undefined {
  if (!value) return undefined;
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function latest(dates: Array<Date | null | undefined>): Date | undefined {
  let max: Date | undefined;
  for (const date of dates) {
    if (date && (!max || date > max)) max = date;
  }
  return max;
}

function normalizeSlug(slug: string | null | undefined): string | null {
  if (!slug) return null;
  const trimmed = slug.trim();
  return trimmed.length > 0 ? encodeURIComponent(trimmed) : null;
}

/** Runs a sitemap generation step, logging failures before rethrowing so the route errors instead of serving a partial sitemap. */
export async function withSitemapFailureLog<T>(label: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error(`[sitemap] generation failed (${label})`, error);
    throw error;
  }
}

export async function getSitemapIds(): Promise<number[]> {
  const collegeCount = await prisma.college.count({ where: { isActive: true } });
  const collegeShards = Math.ceil(collegeCount / COLLEGES_PER_SITEMAP);
  return [PAGES_SITEMAP_ID, ...Array.from({ length: collegeShards }, (_, i) => i + 1)];
}

export async function buildPagesSitemap(): Promise<MetadataRoute.Sitemap> {
  const [courses, exams, news, countries, collegesMax, worldStatsMax, collegeCount] = await Promise.all([
    prisma.course.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true }, orderBy: { updatedAt: "desc" } }),
    prisma.exam.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true }, orderBy: { updatedAt: "desc" } }),
    prisma.newsArticle.findMany({ where: { isActive: true, isLive: true }, select: { slug: true, publishedAt: true }, orderBy: { createdAt: "desc" } }),
    prisma.studyAbroadCountry.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true }, orderBy: { updatedAt: "desc" } }),
    prisma.college.aggregate({ where: { isActive: true }, _max: { updatedAt: true } }),
    prisma.worldCollegeStat.aggregate({ where: { isActive: true }, _max: { updatedAt: true } }),
    prisma.college.count({ where: { isActive: true } }),
  ]);

  const collegesUpdated = collegesMax._max.updatedAt ?? undefined;
  const coursesUpdated = latest(courses.map((c) => c.updatedAt));
  const examsUpdated = latest(exams.map((e) => e.updatedAt));
  const newsUpdated = latest(news.map((n) => parseDate(n.publishedAt)));
  const countriesUpdated = latest(countries.map((c) => c.updatedAt));
  const mapUpdated = latest([collegesUpdated, worldStatsMax._max.updatedAt]);

  // Listing pages take the date of their newest content. Code-only pages have no
  // content date, so lastModified is omitted rather than invented.
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: latest([collegesUpdated, coursesUpdated, examsUpdated, newsUpdated, countriesUpdated]), changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/colleges`, lastModified: collegesUpdated, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/courses`, lastModified: coursesUpdated, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/exams`, lastModified: examsUpdated, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/news`, lastModified: newsUpdated, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/study-abroad`, lastModified: countriesUpdated, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/compare`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/resume-builder`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/articles`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/map`, lastModified: mapUpdated, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/mock-tests`, changeFrequency: "weekly", priority: 0.7 },
  ];

  const coursePages = courses.flatMap((c) => {
    const slug = normalizeSlug(c.slug);
    if (!slug) return [];
    return [{ url: `${SITE_URL}/courses/${slug}`, lastModified: c.updatedAt, changeFrequency: "monthly" as const, priority: 0.7 }];
  });

  const examPages = exams.flatMap((e) => {
    const slug = normalizeSlug(e.slug);
    if (!slug) return [];
    return [{ url: `${SITE_URL}/exams/${slug}`, lastModified: e.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 }];
  });

  const newsPages = news.flatMap((n) => {
    const slug = normalizeSlug(n.slug);
    if (!slug) return [];
    return [{ url: `${SITE_URL}/news/${slug}`, lastModified: parseDate(n.publishedAt), changeFrequency: "monthly" as const, priority: 0.6 }];
  });

  const countryPages = countries.flatMap((c) => {
    const slug = normalizeSlug(c.slug);
    if (!slug) return [];
    return [{ url: `${SITE_URL}/study-abroad/${slug}`, lastModified: c.updatedAt, changeFrequency: "monthly" as const, priority: 0.7 }];
  });

  // Local service pages (lib/local-seo.ts) take the date their content was last reviewed.
  const localPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}${LOCAL_SEO_HUB_PATH}`, lastModified: latest(LOCAL_SEO_PAGES.map((p) => parseDate(p.updatedAt))), changeFrequency: "monthly", priority: 0.7 },
    ...LOCAL_SEO_PAGES.map((p) => ({
      url: `${SITE_URL}/${p.slug}`,
      lastModified: parseDate(p.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];

  // A–Z directory pages (lib/browse.ts) — the crawlable link path to every detail page.
  const browseCounts: [BrowseType, number, Date | undefined][] = [
    ["colleges", collegeCount, collegesUpdated],
    ["courses", courses.length, coursesUpdated],
    ["exams", exams.length, examsUpdated],
  ];
  const browsePages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/browse`, changeFrequency: "weekly", priority: 0.5 },
    ...browseCounts.flatMap(([type, count, lastModified]) =>
      Array.from({ length: Math.max(1, Math.ceil(count / BROWSE_PAGE_SIZE)) }, (_, i) => ({
        url: `${SITE_URL}${browsePath(type, i + 1)}`,
        lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.5,
      }))
    ),
  ];

  const entries = [...staticPages, ...localPages, ...browsePages,...coursePages, ...examPages, ...newsPages, ...countryPages];
  if (entries.length > MAX_URLS_PER_SITEMAP) {
    throw new Error(`pages sitemap has ${entries.length} URLs, over the ${MAX_URLS_PER_SITEMAP} limit`);
  }
  return entries;
}

export async function buildCollegesSitemap(shard: number): Promise<MetadataRoute.Sitemap> {
  // Oldest-first with an id tiebreak: new colleges append to the last shard instead
  // of shifting every shard, so independently cached shards stay consistent.
  const colleges = await prisma.college.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    skip: (shard - 1) * COLLEGES_PER_SITEMAP,
    take: COLLEGES_PER_SITEMAP,
  });

  return colleges.flatMap((c) => {
    const slug = normalizeSlug(c.slug);
    if (!slug) return [];
    return [{ url: `${SITE_URL}/colleges/${slug}`, lastModified: c.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 }];
  });
}

export function renderSitemapIndex(urls: string[]): string {
  const entries = urls.map((url) => `<sitemap>\n<loc>${escapeXml(url)}</loc>\n</sitemap>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</sitemapindex>\n`;
}

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
