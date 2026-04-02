import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, success, paginated, getSearchParams } from "@/lib/admin/middleware";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, "enquiries", "view");
  if (auth instanceof NextResponse) return auth;

  const { page, limit, search, url } = getSearchParams(req);
  const status = url.searchParams.get("status") || "";
  const priority = url.searchParams.get("priority") || "";

  const where: Record<string, unknown> = {};
  if (search) where.OR = [
    { studentName: { contains: search, mode: "insensitive" } },
    { email: { contains: search, mode: "insensitive" } },
    { collegeName: { contains: search, mode: "insensitive" } },
  ];
  if (status) where.status = status;
  if (priority) where.priority = priority;

  const [data, total] = await Promise.all([
    prisma.enquiry.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit }),
    prisma.enquiry.count({ where }),
  ]);

  return paginated(data, total, page, limit);
}
