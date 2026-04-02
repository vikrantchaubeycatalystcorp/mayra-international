import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, success } from "@/lib/admin/middleware";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, "analytics", "view");
  if (auth instanceof NextResponse) return auth;

  const [colleges, courses, exams, news, users, enquiries, newsletter, studyAbroad, pendingEnquiries, recentActivity] =
    await Promise.all([
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
        take: 10,
        orderBy: { createdAt: "desc" },
        select: { id: true, action: true, entity: true, details: true, createdAt: true },
      }),
    ]);

  return success({
    stats: { colleges, courses, exams, news, users, enquiries, newsletter, studyAbroad, pendingEnquiries },
    recentActivity,
  });
}
