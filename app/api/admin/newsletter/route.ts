import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, paginated, getSearchParams } from "@/lib/admin/middleware";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, "newsletter", "view");
  if (auth instanceof NextResponse) return auth;

  const { page, limit, search, url } = getSearchParams(req);
  const active = url.searchParams.get("active");

  const where: Record<string, unknown> = {};
  if (search) where.email = { contains: search, mode: "insensitive" };
  if (active === "true") where.isActive = true;
  if (active === "false") where.isActive = false;

  const [data, total] = await Promise.all([
    prisma.newsletterSubscriber.findMany({ where, orderBy: { subscribedAt: "desc" }, skip: (page - 1) * limit, take: limit }),
    prisma.newsletterSubscriber.count({ where }),
  ]);

  return paginated(data, total, page, limit);
}
