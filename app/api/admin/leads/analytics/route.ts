import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/middleware";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, "leads", "view");
  if (auth instanceof NextResponse) return auth;

  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Core counts
    const [
      totalLeads,
      todayLeads,
      thisWeekLeads,
      thisMonthLeads,
      lastMonthLeads,
      newLeads,
      contactedLeads,
      closedLeads,
      inquiryLeads,
      counsellingLeads,
      emailSent,
      emailFailed,
      emailSkipped,
      withEmail,
      withoutEmail,
    ] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { createdAt: { gte: today } } }),
      prisma.lead.count({ where: { createdAt: { gte: thisWeekStart } } }),
      prisma.lead.count({ where: { createdAt: { gte: thisMonthStart } } }),
      prisma.lead.count({ where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } } }),
      prisma.lead.count({ where: { status: "NEW" } }),
      prisma.lead.count({ where: { status: "CONTACTED" } }),
      prisma.lead.count({ where: { status: "CLOSED" } }),
      prisma.lead.count({ where: { source: "INQUIRY" } }),
      prisma.lead.count({ where: { source: "FREE_COUNSELLING" } }),
      prisma.lead.count({ where: { adminEmailStatus: "SENT" } }),
      prisma.lead.count({ where: { adminEmailStatus: "FAILED" } }),
      prisma.lead.count({ where: { adminEmailStatus: "SKIPPED" } }),
      prisma.lead.count({ where: { email: { not: null } } }),
      prisma.lead.count({ where: { email: null } }),
    ]);

    // Daily leads for last 14 days (for trend chart) — single query instead of 14
    const fourteenDaysAgo = new Date(today);
    fourteenDaysAgo.setDate(today.getDate() - 13);
    const trendLeads = await prisma.lead.findMany({
      where: { createdAt: { gte: fourteenDaysAgo } },
      select: { createdAt: true },
    });
    const trendMap = new Map<string, number>();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      trendMap.set(d.toISOString().split("T")[0], 0);
    }
    for (const l of trendLeads) {
      const key = new Date(l.createdAt).toISOString().split("T")[0];
      if (trendMap.has(key)) {
        trendMap.set(key, trendMap.get(key)! + 1);
      }
    }
    const dailyTrend = Array.from(trendMap.entries()).map(([date, count]) => ({ date, count }));

    // Top courses, cities, states — use groupBy instead of fetching all leads
    const [topCoursesRaw, topCitiesRaw, topStatesRaw] = await Promise.all([
      prisma.lead.groupBy({
        by: ['courseInterested'],
        _count: { id: true },
        where: { courseInterested: { not: null } },
        orderBy: { _count: { id: 'desc' } },
        take: 6,
      }),
      prisma.lead.groupBy({
        by: ['city'],
        _count: { id: true },
        where: { city: { not: null } },
        orderBy: { _count: { id: 'desc' } },
        take: 6,
      }),
      prisma.lead.groupBy({
        by: ['state'],
        _count: { id: true },
        where: { state: { not: null } },
        orderBy: { _count: { id: 'desc' } },
        take: 6,
      }),
    ]);

    const topCourses = topCoursesRaw.map((r) => ({ name: r.courseInterested!, count: r._count.id }));
    const topCities = topCitiesRaw.map((r) => ({ name: r.city!, count: r._count.id }));
    const topStates = topStatesRaw.map((r) => ({ name: r.state!, count: r._count.id }));

    // Recent 5 leads
    const recentLeads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        fullName: true,
        source: true,
        status: true,
        courseInterested: true,
        createdAt: true,
      },
    });

    // Month-over-month growth
    const monthGrowth = lastMonthLeads > 0
      ? Math.round(((thisMonthLeads - lastMonthLeads) / lastMonthLeads) * 100)
      : thisMonthLeads > 0 ? 100 : 0;

    // Conversion rate (contacted + closed out of total)
    const conversionRate = totalLeads > 0
      ? Math.round(((contactedLeads + closedLeads) / totalLeads) * 100)
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalLeads,
          todayLeads,
          thisWeekLeads,
          thisMonthLeads,
          lastMonthLeads,
          monthGrowth,
          conversionRate,
        },
        byStatus: { new: newLeads, contacted: contactedLeads, closed: closedLeads },
        bySource: { inquiry: inquiryLeads, counselling: counsellingLeads },
        emailHealth: { sent: emailSent, failed: emailFailed, skipped: emailSkipped },
        contactInfo: { withEmail, withoutEmail },
        dailyTrend,
        topCourses,
        topCities,
        topStates,
        recentLeads,
      },
    });
  } catch (error) {
    console.error("Lead analytics error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch analytics" } },
      { status: 500 }
    );
  }
}
