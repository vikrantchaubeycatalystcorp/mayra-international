import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, success } from "@/lib/admin/middleware";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, "analytics", "view");
  if (auth instanceof NextResponse) return auth;

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Combine related counts using groupBy to reduce total queries from 27 to ~14
  const [
    colleges,
    courses,
    exams,
    news,
    users,
    enquiries,
    newsletter,
    studyAbroad,
    recentActivity,
    // Time-based: 2 user counts replaced by 1 findMany + client-side split
    recentUsers,
    // Time-based: 2 enquiry counts replaced by groupBy + findMany
    recentEnquiries,
    newsLast30d,
    // Leads: groupBy by status replaces 4 separate counts
    leadsByStatus,
    // Enquiry: groupBy by status replaces 5 separate counts
    enquiryByStatus,
    // Leads by source: groupBy replaces 2 separate counts
    leadsBySource,
    // Newsletter growth
    newsletterLast30d,
    // Recent leads
    recentLeads,
  ] = await Promise.all([
    prisma.college.count({ where: { isActive: true } }),
    prisma.course.count({ where: { isActive: true } }),
    prisma.exam.count({ where: { isActive: true } }),
    prisma.newsArticle.count({ where: { isActive: true } }),
    prisma.user.count(),
    prisma.enquiry.count(),
    prisma.newsletterSubscriber.count({ where: { isActive: true } }),
    prisma.studyAbroadCountry.count({ where: { isActive: true } }),
    prisma.adminActivity.findMany({
      take: 15,
      orderBy: { createdAt: "desc" },
      select: { id: true, action: true, entity: true, details: true, createdAt: true },
    }),
    // Recent users (last 60 days) — derive last30d / prev30d counts client-side
    prisma.user.findMany({
      where: { createdAt: { gte: sixtyDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    // Recent enquiries (last 60 days) — derive counts + chart client-side
    prisma.enquiry.findMany({
      where: { createdAt: { gte: sixtyDaysAgo } },
      select: { createdAt: true, status: true },
      orderBy: { createdAt: "asc" },
    }),
    // News last 30 days
    prisma.newsArticle.count({ where: { isActive: true, createdAt: { gte: thirtyDaysAgo } } }),
    // Leads grouped by status (replaces 4 queries: total + NEW + CONTACTED + CLOSED)
    prisma.lead.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
    // Enquiry grouped by status (replaces 5 queries: PENDING + UNDER_REVIEW + RESPONDED + CLOSED + SPAM)
    prisma.enquiry.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
    // Leads grouped by source (replaces 2 queries)
    prisma.lead.groupBy({
      by: ['source'],
      _count: { id: true },
    }),
    // Newsletter last 30 days
    prisma.newsletterSubscriber.count({ where: { isActive: true, subscribedAt: { gte: thirtyDaysAgo } } }),
    // Recent leads
    prisma.lead.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, fullName: true, source: true, status: true, createdAt: true, courseInterested: true, city: true },
    }),
  ]);

  // Derive user counts from fetched data
  const usersLast30d = recentUsers.filter((u) => u.createdAt >= thirtyDaysAgo).length;
  const usersPrev30d = recentUsers.filter((u) => u.createdAt < thirtyDaysAgo).length;

  // Derive enquiry counts from fetched data
  const enquiriesLast30d = recentEnquiries.filter((e) => e.createdAt >= thirtyDaysAgo).length;
  const enquiriesPrev30d = recentEnquiries.filter((e) => e.createdAt < thirtyDaysAgo).length;

  // Extract lead counts by status
  const leadStatusMap = new Map(leadsByStatus.map((r) => [r.status, r._count.id]));
  const leadsTotal = leadsByStatus.reduce((sum, r) => sum + r._count.id, 0);
  const leadsNew = leadStatusMap.get("NEW") || 0;
  const leadsContacted = leadStatusMap.get("CONTACTED") || 0;
  const leadsClosed = leadStatusMap.get("CLOSED") || 0;

  // Extract enquiry counts by status
  const enquiryStatusMap = new Map(enquiryByStatus.map((r) => [r.status, r._count.id]));
  const pendingEnquiries = enquiryStatusMap.get("PENDING") || 0;
  const enquiriesUnderReview = enquiryStatusMap.get("UNDER_REVIEW") || 0;
  const enquiriesResponded = enquiryStatusMap.get("RESPONDED") || 0;
  const enquiriesClosed = enquiryStatusMap.get("CLOSED") || 0;
  const enquiriesSpam = enquiryStatusMap.get("SPAM") || 0;

  // Extract lead counts by source
  const leadSourceMap = new Map(leadsBySource.map((r) => [r.source, r._count.id]));
  const leadsInquiry = leadSourceMap.get("INQUIRY") || 0;
  const leadsCounselling = leadSourceMap.get("FREE_COUNSELLING") || 0;

  // Aggregate users by day for chart (filter to last 30 days only)
  const usersByDay = aggregateByDay(
    recentUsers.filter((u) => u.createdAt >= thirtyDaysAgo).map((u) => u.createdAt),
    thirtyDaysAgo, now
  );
  const enquiriesByDay = aggregateByDay(
    recentEnquiries.filter((e) => e.createdAt >= thirtyDaysAgo).map((e) => e.createdAt),
    thirtyDaysAgo, now
  );

  // Growth percentages
  const userGrowth = usersPrev30d > 0 ? Math.round(((usersLast30d - usersPrev30d) / usersPrev30d) * 100) : usersLast30d > 0 ? 100 : 0;
  const enquiryGrowth = enquiriesPrev30d > 0 ? Math.round(((enquiriesLast30d - enquiriesPrev30d) / enquiriesPrev30d) * 100) : enquiriesLast30d > 0 ? 100 : 0;

  return success({
    stats: { colleges, courses, exams, news, users, enquiries, newsletter, studyAbroad, pendingEnquiries },
    trends: {
      userGrowth,
      enquiryGrowth,
      usersLast30d,
      enquiriesLast30d,
      newsLast30d,
      newsletterLast30d,
    },
    leads: {
      total: leadsTotal,
      new: leadsNew,
      contacted: leadsContacted,
      closed: leadsClosed,
      bySource: { inquiry: leadsInquiry, counselling: leadsCounselling },
    },
    enquiryBreakdown: {
      pending: pendingEnquiries,
      underReview: enquiriesUnderReview,
      responded: enquiriesResponded,
      closed: enquiriesClosed,
      spam: enquiriesSpam,
    },
    charts: {
      usersByDay,
      enquiriesByDay,
    },
    recentActivity,
    recentLeads,
  });
}

function aggregateByDay(dates: Date[], from: Date, to: Date): { date: string; count: number }[] {
  const map = new Map<string, number>();
  const current = new Date(from);
  while (current <= to) {
    map.set(current.toISOString().split("T")[0], 0);
    current.setDate(current.getDate() + 1);
  }
  for (const d of dates) {
    const key = new Date(d).toISOString().split("T")[0];
    map.set(key, (map.get(key) || 0) + 1);
  }
  return Array.from(map.entries()).map(([date, count]) => ({ date, count }));
}
