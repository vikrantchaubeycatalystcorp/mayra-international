import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q") || "";
  const type = searchParams.get("type") || "all";
  const limit = Math.min(20, parseInt(searchParams.get("limit") || "8", 10));

  const hasQuery = q.trim().length > 0;
  const query = q.trim();

  const mode = "insensitive" as const;
  const contains = (field: string) => ({ [field]: { contains: query, mode } });

  // ── Content searches ──────────────────────────────────────

  const collegeWhere = hasQuery
    ? {
        OR: [
          contains("name"),
          contains("city"),
          contains("state"),
          contains("type"),
          contains("description"),
          { streams: { has: query } },
          { courses: { has: query } },
          { accreditation: { has: query } },
        ],
      }
    : {};

  const courseWhere = hasQuery
    ? {
        OR: [
          contains("name"),
          contains("stream"),
          contains("level"),
          contains("description"),
        ],
      }
    : {};

  const examWhere = hasQuery
    ? {
        OR: [
          contains("name"),
          contains("fullName"),
          contains("conductingBody"),
          contains("level"),
          contains("description"),
          { streams: { has: query } },
        ],
      }
    : {};

  const newsWhere = hasQuery
    ? {
        OR: [
          contains("title"),
          contains("category"),
          contains("summary"),
          contains("author"),
          { tags: { has: query } },
        ],
      }
    : {};

  const studyAbroadWhere = hasQuery
    ? {
        OR: [
          contains("name"),
          contains("description"),
          contains("avgCost"),
          { popularCourses: { has: query } },
        ],
      }
    : {};

  // ── Leads & Users ─────────────────────────────────────────

  const leadWhere = hasQuery
    ? {
        OR: [
          contains("fullName"),
          contains("email"),
          contains("phone"),
          contains("city"),
          contains("state"),
          contains("courseInterested"),
          contains("message"),
        ],
      }
    : {};

  const enquiryWhere = hasQuery
    ? {
        OR: [
          contains("studentName"),
          contains("email"),
          contains("phone"),
          contains("collegeName"),
          contains("program"),
          contains("message"),
        ],
      }
    : {};

  const userWhere = hasQuery
    ? {
        OR: [
          contains("name"),
          contains("email"),
          contains("phone"),
          contains("goal"),
        ],
      }
    : {};

  const newsletterWhere = hasQuery
    ? {
        OR: [
          contains("email"),
          contains("name"),
          contains("source"),
        ],
      }
    : {};

  // ── Master Data ───────────────────────────────────────────

  const streamWhere = hasQuery
    ? { OR: [contains("name"), contains("slug")] }
    : {};

  const tagWhere = hasQuery
    ? { OR: [contains("name")] }
    : {};

  const newsCatWhere = hasQuery
    ? { OR: [contains("name"), contains("slug")] }
    : {};

  const collegeTypeWhere = hasQuery
    ? { OR: [contains("name")] }
    : {};

  const courseLevelWhere = hasQuery
    ? { OR: [contains("name")] }
    : {};

  const examModeWhere = hasQuery
    ? { OR: [contains("name")] }
    : {};

  const accreditationWhere = hasQuery
    ? { OR: [contains("name"), contains("fullName")] }
    : {};

  const dataSourceWhere = hasQuery
    ? { OR: [contains("name"), contains("url")] }
    : {};

  // ── Site Experience ───────────────────────────────────────

  const heroBannerWhere = hasQuery
    ? { OR: [contains("heading"), contains("subheading"), contains("badgeText")] }
    : {};

  const announcementWhere = hasQuery
    ? { OR: [contains("text"), contains("linkText")] }
    : {};

  const pageSeoWhere = hasQuery
    ? { OR: [contains("pageSlug"), contains("title"), contains("description")] }
    : {};

  // ── Platform ──────────────────────────────────────────────

  const adminWhere = hasQuery
    ? { OR: [contains("name"), contains("email")] }
    : {};

  // ── Execute all queries in parallel ───────────────────────

  const shouldFetch = (t: string) => type === "all" || type === t;

  const [
    colleges,
    courses,
    exams,
    news,
    studyAbroad,
    leads,
    enquiries,
    users,
    newsletter,
    streams,
    tags,
    newsCategories,
    collegeTypes,
    courseLevels,
    examModes,
    accreditations,
    dataSources,
    heroBanners,
    announcements,
    pageSeo,
    admins,
  ] = await Promise.all([
    // Content
    shouldFetch("colleges")
      ? prisma.college.findMany({
          where: collegeWhere,
          select: {
            id: true, name: true, slug: true, city: true, state: true,
            nirfRank: true, type: true, isActive: true, isFeatured: true,
            streams: true,
          },
          take: limit,
          orderBy: hasQuery ? { viewCount: "desc" } : { createdAt: "desc" },
        })
      : [],
    shouldFetch("courses")
      ? prisma.course.findMany({
          where: courseWhere,
          select: {
            id: true, name: true, slug: true, level: true, stream: true,
            duration: true, isActive: true, isFeatured: true,
          },
          take: limit,
          orderBy: { name: "asc" },
        })
      : [],
    shouldFetch("exams")
      ? prisma.exam.findMany({
          where: examWhere,
          select: {
            id: true, name: true, slug: true, fullName: true,
            conductingBody: true, level: true, isActive: true, isFeatured: true,
            examDate: true,
          },
          take: limit,
          orderBy: { name: "asc" },
        })
      : [],
    shouldFetch("news")
      ? prisma.newsArticle.findMany({
          where: newsWhere,
          select: {
            id: true, title: true, slug: true, category: true,
            isActive: true, author: true, publishedAt: true,
          },
          take: limit,
          orderBy: { createdAt: "desc" },
        })
      : [],
    shouldFetch("study-abroad")
      ? prisma.studyAbroadCountry.findMany({
          where: studyAbroadWhere,
          select: {
            id: true, name: true, slug: true, flag: true,
            universities: true, isActive: true, isFeatured: true,
          },
          take: limit,
          orderBy: { sortOrder: "asc" },
        })
      : [],

    // Leads & Users
    shouldFetch("leads")
      ? prisma.lead.findMany({
          where: leadWhere,
          select: {
            id: true, fullName: true, email: true, phone: true,
            city: true, state: true, courseInterested: true,
            status: true, source: true, createdAt: true,
          },
          take: limit,
          orderBy: { createdAt: "desc" },
        })
      : [],
    shouldFetch("enquiries")
      ? prisma.enquiry.findMany({
          where: enquiryWhere,
          select: {
            id: true, studentName: true, email: true, phone: true,
            collegeName: true, program: true, status: true, createdAt: true,
          },
          take: limit,
          orderBy: { createdAt: "desc" },
        })
      : [],
    shouldFetch("users")
      ? prisma.user.findMany({
          where: userWhere,
          select: {
            id: true, name: true, email: true, phone: true,
            goal: true, isActive: true, isVerified: true, createdAt: true,
          },
          take: limit,
          orderBy: { createdAt: "desc" },
        })
      : [],
    shouldFetch("newsletter")
      ? prisma.newsletterSubscriber.findMany({
          where: newsletterWhere,
          select: {
            id: true, email: true, name: true, isActive: true,
            subscribedAt: true, source: true,
          },
          take: limit,
          orderBy: { subscribedAt: "desc" },
        })
      : [],

    // Master Data
    shouldFetch("master")
      ? prisma.stream.findMany({ where: streamWhere, select: { id: true, name: true, slug: true, isActive: true }, take: limit, orderBy: { name: "asc" } })
      : [],
    shouldFetch("master")
      ? prisma.tag.findMany({ where: tagWhere, select: { id: true, name: true, slug: true }, take: limit, orderBy: { name: "asc" } })
      : [],
    shouldFetch("master")
      ? prisma.newsCategory.findMany({ where: newsCatWhere, select: { id: true, name: true, slug: true }, take: limit, orderBy: { name: "asc" } })
      : [],
    shouldFetch("master")
      ? prisma.collegeType.findMany({ where: collegeTypeWhere, select: { id: true, name: true }, take: limit, orderBy: { name: "asc" } })
      : [],
    shouldFetch("master")
      ? prisma.courseLevel.findMany({ where: courseLevelWhere, select: { id: true, name: true }, take: limit, orderBy: { name: "asc" } })
      : [],
    shouldFetch("master")
      ? prisma.examMode.findMany({ where: examModeWhere, select: { id: true, name: true }, take: limit, orderBy: { name: "asc" } })
      : [],
    shouldFetch("master")
      ? prisma.accreditationBody.findMany({ where: accreditationWhere, select: { id: true, name: true, fullName: true }, take: limit, orderBy: { name: "asc" } })
      : [],
    shouldFetch("master")
      ? prisma.dataSource.findMany({ where: dataSourceWhere, select: { id: true, name: true, url: true, isActive: true }, take: limit, orderBy: { name: "asc" } })
      : [],

    // Site Experience
    shouldFetch("site")
      ? prisma.heroBanner.findMany({ where: heroBannerWhere, select: { id: true, heading: true, subheading: true, isActive: true }, take: limit, orderBy: { sortOrder: "asc" } })
      : [],
    shouldFetch("site")
      ? prisma.announcement.findMany({ where: announcementWhere, select: { id: true, text: true, isActive: true }, take: limit, orderBy: { createdAt: "desc" } })
      : [],
    shouldFetch("seo")
      ? prisma.pageSeo.findMany({ where: pageSeoWhere, select: { id: true, pageSlug: true, title: true }, take: limit, orderBy: { pageSlug: "asc" } })
      : [],

    // Platform
    shouldFetch("admins")
      ? prisma.admin.findMany({ where: adminWhere, select: { id: true, name: true, email: true, role: true, isActive: true }, take: limit, orderBy: { name: "asc" } })
      : [],
  ]);

  const total =
    colleges.length + courses.length + exams.length + news.length +
    studyAbroad.length + leads.length + enquiries.length + users.length +
    newsletter.length + streams.length + tags.length + newsCategories.length +
    collegeTypes.length + courseLevels.length + examModes.length +
    accreditations.length + dataSources.length + heroBanners.length +
    announcements.length + pageSeo.length + admins.length;

  return NextResponse.json({
    // Content
    colleges,
    courses,
    exams,
    news,
    studyAbroad,
    // Leads & Users
    leads,
    enquiries,
    users,
    newsletter,
    // Master Data
    streams,
    tags,
    newsCategories,
    collegeTypes,
    courseLevels,
    examModes,
    accreditations,
    dataSources,
    // Site Experience
    heroBanners,
    announcements,
    // SEO
    pageSeo,
    // Platform
    admins,
    // Meta
    query,
    total,
  });
}
