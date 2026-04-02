import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, success, notFound, badRequest } from "@/lib/admin/middleware";
import { logActivity } from "@/lib/admin/activity-logger";
import { revalidateEntity } from "@/lib/revalidate";

type Props = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Props) {
  const auth = await requireAdmin(req, "settings", "view");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const item = await prisma.navigationItem.findUnique({
    where: { id },
    include: { children: { orderBy: { sortOrder: "asc" } } },
  });
  if (!item) return notFound("Navigation item not found");

  return success(item);
}

export async function PUT(req: NextRequest, { params }: Props) {
  const auth = await requireAdmin(req, "settings", "edit");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const existing = await prisma.navigationItem.findUnique({ where: { id } });
  if (!existing) return notFound("Navigation item not found");

  try {
    const body = await req.json();

    const item = await prisma.navigationItem.update({
      where: { id },
      data: {
        label: body.label ?? existing.label,
        href: body.href ?? existing.href,
        icon: body.icon !== undefined ? body.icon : existing.icon,
        description: body.description !== undefined ? body.description : existing.description,
        target: body.target ?? existing.target,
        parentId: body.parentId !== undefined ? body.parentId : existing.parentId,
        section: body.section ?? existing.section,
        sortOrder: body.sortOrder ?? existing.sortOrder,
        isActive: body.isActive ?? existing.isActive,
        isMega: body.isMega ?? existing.isMega,
        megaGroupTitle: body.megaGroupTitle !== undefined ? body.megaGroupTitle : existing.megaGroupTitle,
        featuredTitle: body.featuredTitle !== undefined ? body.featuredTitle : existing.featuredTitle,
        featuredItems: body.featuredItems ?? existing.featuredItems,
      },
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "UPDATE",
      entity: "NavigationItem",
      entityId: item.id,
      details: `Updated navigation item: ${item.label}`,
    });

    revalidateEntity("NavigationItem");
    return success(item);
  } catch (error) {
    console.error("Update navigation item error:", error);
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
  const existing = await prisma.navigationItem.findUnique({ where: { id } });
  if (!existing) return notFound("Navigation item not found");

  await prisma.navigationItem.deleteMany({ where: { parentId: id } });
  await prisma.navigationItem.delete({ where: { id } });

  await logActivity({
    adminId: auth.admin.id,
    action: "DELETE",
    entity: "NavigationItem",
    entityId: id,
    details: `Deleted navigation item: ${existing.label}`,
  });

  revalidateEntity("NavigationItem");
  return success({ message: "Navigation item deleted" });
}
