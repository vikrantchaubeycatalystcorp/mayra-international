import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, paginated, getSearchParams } from "@/lib/admin/middleware";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, "admins", "view");
  if (auth instanceof NextResponse) return auth;

  const { page, limit, search } = getSearchParams(req);
  const where: Record<string, unknown> = {};
  if (search) where.OR = [
    { name: { contains: search, mode: "insensitive" } },
    { email: { contains: search, mode: "insensitive" } },
  ];

  const [data, total] = await Promise.all([
    prisma.admin.findMany({
      where,
      select: { id: true, name: true, email: true, role: true, phone: true, isActive: true, lastLoginAt: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.admin.count({ where }),
  ]);

  return paginated(data, total, page, limit);
}
