import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, badRequest } from "@/lib/admin/middleware";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, "logs", "view");
  if (auth instanceof NextResponse) return auth;

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "25")));
  const search = url.searchParams.get("search")?.trim() || "";
  const action = url.searchParams.get("action") || "";
  const entity = url.searchParams.get("entity") || "";
  const adminId = url.searchParams.get("adminId") || "";
  const dateFrom = url.searchParams.get("dateFrom") || "";
  const dateTo = url.searchParams.get("dateTo") || "";
  const sortBy = url.searchParams.get("sortBy") || "createdAt";
  const sortOrder = (url.searchParams.get("sortOrder") || "desc") as "asc" | "desc";

  const allowedSortFields = ["createdAt", "action", "entity"];
  if (!allowedSortFields.includes(sortBy)) {
    return badRequest("Invalid sort field");
  }

  const where: Prisma.AdminActivityWhereInput = {};
  const conditions: Prisma.AdminActivityWhereInput[] = [];

  if (action) conditions.push({ action });
  if (entity) conditions.push({ entity });
  if (adminId) conditions.push({ adminId });

  if (dateFrom || dateTo) {
    const dateFilter: Prisma.DateTimeFilter = {};
    if (dateFrom) dateFilter.gte = new Date(dateFrom);
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      dateFilter.lte = end;
    }
    conditions.push({ createdAt: dateFilter });
  }

  if (search) {
    conditions.push({
      OR: [
        { details: { contains: search, mode: "insensitive" } },
        { entity: { contains: search, mode: "insensitive" } },
        { action: { contains: search, mode: "insensitive" } },
        { admin: { name: { contains: search, mode: "insensitive" } } },
        { admin: { email: { contains: search, mode: "insensitive" } } },
      ],
    });
  }

  if (conditions.length > 0) where.AND = conditions;

  const [logs, total, actionCounts, entityCounts, admins] = await Promise.all([
    prisma.adminActivity.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      select: {
        id: true,
        action: true,
        entity: true,
        entityId: true,
        details: true,
        ipAddress: true,
        createdAt: true,
        admin: { select: { id: true, name: true, email: true, avatar: true } },
      },
    }),
    prisma.adminActivity.count({ where }),
    prisma.adminActivity.groupBy({
      by: ["action"],
      _count: { action: true },
      orderBy: { _count: { action: "desc" } },
    }),
    prisma.adminActivity.groupBy({
      by: ["entity"],
      _count: { entity: true },
      orderBy: { _count: { entity: "desc" } },
      take: 20,
    }),
    prisma.admin.findMany({
      select: { id: true, name: true, email: true },
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return NextResponse.json({
    success: true,
    data: logs,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
    filters: {
      actions: actionCounts.map((a) => ({ value: a.action, count: a._count.action })),
      entities: entityCounts.map((e) => ({ value: e.entity, count: e._count.entity })),
      admins: admins.map((a) => ({ id: a.id, name: a.name, email: a.email })),
    },
  });
}
