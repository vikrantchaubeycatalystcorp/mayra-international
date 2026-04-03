import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, getSearchParams } from "@/lib/admin/middleware";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, "leads", "view");
  if (auth instanceof NextResponse) return auth;

  const { page, limit, search, url } = getSearchParams(req);
  const source = url.searchParams.get("source") || "";
  const status = url.searchParams.get("status") || "";

  try {
    const where: Prisma.LeadWhereInput = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }
    const validSources = ["INQUIRY", "FREE_COUNSELLING"] as const;
    const validStatuses = ["NEW", "CONTACTED", "CLOSED"] as const;

    if (source && validSources.includes(source as typeof validSources[number])) {
      where.source = source as "INQUIRY" | "FREE_COUNSELLING";
    }
    if (status && validStatuses.includes(status as typeof validStatuses[number])) {
      where.status = status as "NEW" | "CONTACTED" | "CLOSED";
    }

    const offset = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.lead.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Leads list error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch leads" } },
      { status: 500 }
    );
  }
}
