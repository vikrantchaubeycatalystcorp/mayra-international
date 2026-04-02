import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, paginated, getSearchParams } from "@/lib/admin/middleware";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, "users", "view");
  if (auth instanceof NextResponse) return auth;

  const { page, limit, search, url } = getSearchParams(req);
  const provider = url.searchParams.get("provider") || "";
  const active = url.searchParams.get("active");

  const where: Record<string, unknown> = {};
  if (search) where.OR = [
    { name: { contains: search, mode: "insensitive" } },
    { email: { contains: search, mode: "insensitive" } },
  ];
  if (provider) where.provider = provider;
  if (active === "true") where.isActive = true;
  if (active === "false") where.isActive = false;

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, phone: true, provider: true, goal: true, isActive: true, isVerified: true, savedColleges: true, lastLoginAt: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return paginated(data, total, page, limit);
}
