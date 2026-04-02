import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  requireAdmin,
  success,
  badRequest,
  getSearchParams,
} from "@/lib/admin/middleware";
import { logActivity } from "@/lib/admin/activity-logger";
import { revalidateEntity } from "@/lib/revalidate";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, "settings", "view");
  if (auth instanceof NextResponse) return auth;

  const { url } = getSearchParams(req);
  const section = url.searchParams.get("section") || "";

  const where: Record<string, unknown> = {};
  if (section) where.section = section;

  const data = await prisma.navigationItem.findMany({
    where,
    include: { children: { orderBy: { sortOrder: "asc" } } },
    orderBy: { sortOrder: "asc" },
  });

  return success(data);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req, "settings", "edit");
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();

    if (!body.label || !body.href) {
      return badRequest("label and href are required");
    }

    const item = await prisma.navigationItem.create({
      data: {
        label: body.label,
        href: body.href,
        icon: body.icon ?? null,
        description: body.description ?? null,
        target: body.target ?? "_self",
        parentId: body.parentId ?? null,
        section: body.section ?? "main",
        sortOrder: body.sortOrder ?? 0,
        isMega: body.isMega ?? false,
        megaGroupTitle: body.megaGroupTitle ?? null,
        featuredTitle: body.featuredTitle ?? null,
        featuredItems: body.featuredItems ?? [],
      },
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "CREATE",
      entity: "NavigationItem",
      entityId: item.id,
      details: `Created navigation item: ${item.label}`,
    });

    revalidateEntity("NavigationItem");
    return success(item, 201);
  } catch (error) {
    console.error("Create navigation item error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
