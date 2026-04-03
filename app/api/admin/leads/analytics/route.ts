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

    // Daily leads for last 14 days (for trend chart)
    const dailyTrend: { date: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const dayStart = new Date(today);
      dayStart.setDate(today.getDate() - i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayStart.getDate() + 1);
      const count = await prisma.lead.count({
        where: { createdAt: { gte: dayStart, lt: dayEnd } },
      });
      dailyTrend.push({
        date: dayStart.toISOString().split("T")[0],
        count,
      });
    }

    // Top courses
    const allLeads = await prisma.lead.findMany({
      select: { courseInterested: true, city: true, state: true },
    });

    const courseMap = new Map<string, number>();
    const cityMap = new Map<string, number>();
    const stateMap = new Map<string, number>();

    for (const l of allLeads) {
      if (l.courseInterested) {
        courseMap.set(l.courseInterested, (courseMap.get(l.courseInterested) || 0) + 1);
      }
      if (l.city) {
        cityMap.set(l.city, (cityMap.get(l.city) || 0) + 1);
      }
      if (l.state) {
        stateMap.set(l.state, (stateMap.get(l.state) || 0) + 1);
      }
    }

    const topCourses = [...courseMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));

    const topCities = [...cityMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));

    const topStates = [...stateMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));

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
