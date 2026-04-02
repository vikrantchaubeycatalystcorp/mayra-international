import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, success, badRequest } from "@/lib/admin/middleware";
import { logActivity } from "@/lib/admin/activity-logger";
import { revalidateEntity } from "@/lib/revalidate";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, "settings", "view");
  if (auth instanceof NextResponse) return auth;

  const data = await prisma.heroBanner.findMany({
    include: {
      stats: { orderBy: { sortOrder: "asc" } },
      searchTabs: { orderBy: { sortOrder: "asc" } },
      quickFilters: { orderBy: { sortOrder: "asc" } },
      popularSearches: { orderBy: { sortOrder: "asc" } },
      floatingCards: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { sortOrder: "asc" },
  });

  return success(data);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req, "settings", "edit");
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();

    if (!body.heading) {
      return badRequest("heading is required");
    }

    const banner = await prisma.heroBanner.create({
      data: {
        badgeText: body.badgeText ?? null,
        badgeLinkText: body.badgeLinkText ?? null,
        badgeLink: body.badgeLink ?? null,
        heading: body.heading,
        headingHighlight: body.headingHighlight ?? null,
        subheading: body.subheading ?? null,
        bgImage: body.bgImage ?? null,
        ctaText: body.ctaText ?? "Search",
        sortOrder: body.sortOrder ?? 0,
        stats: body.stats?.length
          ? { create: body.stats }
          : undefined,
        searchTabs: body.searchTabs?.length
          ? { create: body.searchTabs }
          : undefined,
        quickFilters: body.quickFilters?.length
          ? { create: body.quickFilters }
          : undefined,
        popularSearches: body.popularSearches?.length
          ? { create: body.popularSearches }
          : undefined,
        floatingCards: body.floatingCards?.length
          ? { create: body.floatingCards }
          : undefined,
      },
      include: {
        stats: true,
        searchTabs: true,
        quickFilters: true,
        popularSearches: true,
        floatingCards: true,
      },
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "CREATE",
      entity: "HeroBanner",
      entityId: banner.id,
      details: `Created hero banner: ${banner.heading}`,
    });

    revalidateEntity("HeroBanner");
    return success(banner, 201);
  } catch (error) {
    console.error("Create hero banner error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
