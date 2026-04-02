import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, success, notFound } from "@/lib/admin/middleware";
import { logActivity } from "@/lib/admin/activity-logger";
import { revalidateEntity } from "@/lib/revalidate";

type Props = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Props) {
  const auth = await requireAdmin(req, "settings", "view");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const banner = await prisma.heroBanner.findUnique({
    where: { id },
    include: {
      stats: { orderBy: { sortOrder: "asc" } },
      searchTabs: { orderBy: { sortOrder: "asc" } },
      quickFilters: { orderBy: { sortOrder: "asc" } },
      popularSearches: { orderBy: { sortOrder: "asc" } },
      floatingCards: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!banner) return notFound("Hero banner not found");

  return success(banner);
}

export async function PUT(req: NextRequest, { params }: Props) {
  const auth = await requireAdmin(req, "settings", "edit");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const existing = await prisma.heroBanner.findUnique({ where: { id } });
  if (!existing) return notFound("Hero banner not found");

  try {
    const body = await req.json();

    // Delete and recreate nested relations if provided
    if (body.stats) await prisma.heroStat.deleteMany({ where: { bannerId: id } });
    if (body.searchTabs) await prisma.heroSearchTab.deleteMany({ where: { bannerId: id } });
    if (body.quickFilters) await prisma.heroQuickFilter.deleteMany({ where: { bannerId: id } });
    if (body.popularSearches) await prisma.heroPopularSearch.deleteMany({ where: { bannerId: id } });
    if (body.floatingCards) await prisma.heroFloatingCard.deleteMany({ where: { bannerId: id } });

    const banner = await prisma.heroBanner.update({
      where: { id },
      data: {
        badgeText: body.badgeText !== undefined ? body.badgeText : existing.badgeText,
        badgeLinkText: body.badgeLinkText !== undefined ? body.badgeLinkText : existing.badgeLinkText,
        badgeLink: body.badgeLink !== undefined ? body.badgeLink : existing.badgeLink,
        heading: body.heading ?? existing.heading,
        headingHighlight: body.headingHighlight !== undefined ? body.headingHighlight : existing.headingHighlight,
        subheading: body.subheading !== undefined ? body.subheading : existing.subheading,
        bgImage: body.bgImage !== undefined ? body.bgImage : existing.bgImage,
        ctaText: body.ctaText ?? existing.ctaText,
        isActive: body.isActive ?? existing.isActive,
        sortOrder: body.sortOrder ?? existing.sortOrder,
        stats: body.stats?.length ? { create: body.stats } : undefined,
        searchTabs: body.searchTabs?.length ? { create: body.searchTabs } : undefined,
        quickFilters: body.quickFilters?.length ? { create: body.quickFilters } : undefined,
        popularSearches: body.popularSearches?.length ? { create: body.popularSearches } : undefined,
        floatingCards: body.floatingCards?.length ? { create: body.floatingCards } : undefined,
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
      action: "UPDATE",
      entity: "HeroBanner",
      entityId: banner.id,
      details: `Updated hero banner: ${banner.heading}`,
    });

    revalidateEntity("HeroBanner");
    return success(banner);
  } catch (error) {
    console.error("Update hero banner error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Props) {
  const auth = await requireAdmin(req, "settings", "manage");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const existing = await prisma.heroBanner.findUnique({ where: { id } });
  if (!existing) return notFound("Hero banner not found");

  await prisma.heroBanner.delete({ where: { id } });

  await logActivity({
    adminId: auth.admin.id,
    action: "DELETE",
    entity: "HeroBanner",
    entityId: id,
    details: `Deleted hero banner: ${existing.heading}`,
  });

  revalidateEntity("HeroBanner");
  return success({ message: "Hero banner deleted" });
}
