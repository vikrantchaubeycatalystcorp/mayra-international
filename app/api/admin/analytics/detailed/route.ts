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

  const [
    colleges,
    courses,
    exams,
    news,
    users,
    enquiries,
    newsletter,
    studyAbroad,
    pendingEnquiries,
    recentActivity,
    // Time-based counts for trends
    usersLast30d,
    usersPrev30d,
    enquiriesLast30d,
    enquiriesPrev30d,
    newsLast30d,
    leadsTotal,
    leadsNew,
    leadsContacted,
    leadsClosed,
    // Enquiry breakdown by status
    enquiriesUnderReview,
    enquiriesResponded,
    enquiriesClosed,
    enquiriesSpam,
    // Recent users for user growth
    recentUsers,
    // Recent enquiries for chart
    recentEnquiries,
    // Leads by source
    leadsInquiry,
    leadsCounselling,
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
    prisma.enquiry.count({ where: { status: "PENDING" } }),
    prisma.adminActivity.findMany({
      take: 15,
      orderBy: { createdAt: "desc" },
      select: { id: true, action: true, entity: true, details: true, createdAt: true },
    }),
    // Users last 30 days
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    // Users prev 30 days
    prisma.user.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    // Enquiries last 30 days
    prisma.enquiry.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    // Enquiries prev 30 days
    prisma.enquiry.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    // News last 30 days
    prisma.newsArticle.count({ where: { isActive: true, createdAt: { gte: thirtyDaysAgo } } }),
    // Leads
    prisma.lead.count(),
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.lead.count({ where: { status: "CONTACTED" } }),
    prisma.lead.count({ where: { status: "CLOSED" } }),
    // Enquiry status breakdown
    prisma.enquiry.count({ where: { status: "UNDER_REVIEW" } }),
    prisma.enquiry.count({ where: { status: "RESPONDED" } }),
    prisma.enquiry.count({ where: { status: "CLOSED" } }),
    prisma.enquiry.count({ where: { status: "SPAM" } }),
    // Recent users by day (last 30 days)
    prisma.user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    // Recent enquiries by day
    prisma.enquiry.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, status: true },
      orderBy: { createdAt: "asc" },
    }),
    // Leads by source
    prisma.lead.count({ where: { source: "INQUIRY" } }),
    prisma.lead.count({ where: { source: "FREE_COUNSELLING" } }),
    // Newsletter last 30 days
    prisma.newsletterSubscriber.count({ where: { isActive: true, subscribedAt: { gte: thirtyDaysAgo } } }),
    // Recent leads
    prisma.lead.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, fullName: true, source: true, status: true, createdAt: true, courseInterested: true, city: true },
    }),
  ]);

  // Aggregate users by day for chart
  const usersByDay = aggregateByDay(recentUsers.map((u) => u.createdAt), thirtyDaysAgo, now);
  const enquiriesByDay = aggregateByDay(recentEnquiries.map((e) => e.createdAt), thirtyDaysAgo, now);

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
