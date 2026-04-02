import type { MetadataRoute } from "next";
import { prisma } from "../lib/db";

const SITE_URL = "https://mayra.in";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const [colleges, courses, exams, news, countries] = await Promise.all([
    prisma.college.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
    prisma.course.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
    prisma.exam.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
    prisma.newsArticle.findMany({ where: { isActive: true, isLive: true }, select: { slug: true, publishedAt: true } }),
    prisma.studyAbroadCountry.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
  ]);

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
  ];

  const collegePages: MetadataRoute.Sitemap = colleges.map((c) => ({
    url: `${SITE_URL}/colleges/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const coursePages: MetadataRoute.Sitemap = courses.map((c) => ({
    url: `${SITE_URL}/courses/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const examPages: MetadataRoute.Sitemap = exams.map((e) => ({
    url: `${SITE_URL}/exams/${e.slug}`,
    lastModified: e.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const newsPages: MetadataRoute.Sitemap = news.map((n) => ({
    url: `${SITE_URL}/news/${n.slug}`,
    lastModified: n.publishedAt ? new Date(n.publishedAt) : now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const countryPages: MetadataRoute.Sitemap = countries.map((c) => ({
    url: `${SITE_URL}/study-abroad/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...collegePages, ...coursePages, ...examPages, ...newsPages, ...countryPages];
}
