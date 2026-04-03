import type { MetadataRoute } from "next";
import { prisma } from "../lib/db";

const SITE_URL = "https://www.mayrainternational.com";
const SITEMAP_BATCH_SIZE = 5000;

export const dynamic = "force-dynamic";

function isValidDate(date: Date): boolean {
  return !Number.isNaN(date.getTime());
}

function parseSafeDate(value: string | Date | null | undefined, fallback: Date): Date {
  if (!value) return fallback;
  const parsed = value instanceof Date ? value : new Date(value);
  return isValidDate(parsed) ? parsed : fallback;
}

function normalizeSlug(slug: string | null | undefined): string | null {
  if (!slug) return null;
  const trimmed = slug.trim();
  return trimmed.length > 0 ? encodeURIComponent(trimmed) : null;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/colleges`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/courses`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/exams`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/news`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/study-abroad`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/compare`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/resume-builder`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/articles`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/map`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/mock-tests`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ];

  try {
    const [colleges, courses, exams, news, countries] = await Promise.all([
      prisma.college.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
        take: SITEMAP_BATCH_SIZE,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.course.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
        take: SITEMAP_BATCH_SIZE,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.exam.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
        take: SITEMAP_BATCH_SIZE,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.newsArticle.findMany({
        where: { isActive: true, isLive: true },
        select: { slug: true, publishedAt: true },
        take: SITEMAP_BATCH_SIZE,
        orderBy: { createdAt: "desc" },
      }),
      prisma.studyAbroadCountry.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
        take: SITEMAP_BATCH_SIZE,
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    const collegePages = colleges.flatMap((c) => {
      const slug = normalizeSlug(c.slug);
      if (!slug) return [];
      return [{ url: `${SITE_URL}/colleges/${slug}`, lastModified: parseSafeDate(c.updatedAt, now), changeFrequency: "weekly" as const, priority: 0.8 }];
    });

    const coursePages = courses.flatMap((c) => {
      const slug = normalizeSlug(c.slug);
      if (!slug) return [];
      return [{ url: `${SITE_URL}/courses/${slug}`, lastModified: parseSafeDate(c.updatedAt, now), changeFrequency: "monthly" as const, priority: 0.7 }];
    });

    const examPages = exams.flatMap((e) => {
      const slug = normalizeSlug(e.slug);
      if (!slug) return [];
      return [{ url: `${SITE_URL}/exams/${slug}`, lastModified: parseSafeDate(e.updatedAt, now), changeFrequency: "weekly" as const, priority: 0.8 }];
    });

    const newsPages = news.flatMap((n) => {
      const slug = normalizeSlug(n.slug);
      if (!slug) return [];
      return [{ url: `${SITE_URL}/news/${slug}`, lastModified: parseSafeDate(n.publishedAt, now), changeFrequency: "monthly" as const, priority: 0.6 }];
    });

    const countryPages = countries.flatMap((c) => {
      const slug = normalizeSlug(c.slug);
      if (!slug) return [];
      return [{ url: `${SITE_URL}/study-abroad/${slug}`, lastModified: parseSafeDate(c.updatedAt, now), changeFrequency: "monthly" as const, priority: 0.7 }];
    });

    return [
      ...staticPages,
      ...collegePages,
      ...coursePages,
      ...examPages,
      ...newsPages,
      ...countryPages,
    ];
  } catch {
    return staticPages;
  }
}
