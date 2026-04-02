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
  const item = await prisma.newsCategory.findUnique({ where: { id } });
  if (!item) return notFound("News category not found");

  return success(item);
}

export async function PUT(req: NextRequest, { params }: Props) {
  const auth = await requireAdmin(req, "settings", "edit");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const existing = await prisma.newsCategory.findUnique({ where: { id } });
  if (!existing) return notFound("News category not found");

  try {
    const body = await req.json();

    if (body.slug && body.slug !== existing.slug) {
      const slugExists = await prisma.newsCategory.findUnique({ where: { slug: body.slug } });
      if (slugExists) return badRequest("A news category with this slug already exists");
    }

    const item = await prisma.newsCategory.update({
      where: { id },
      data: {
        name: body.name ?? existing.name,
        slug: body.slug ?? existing.slug,
        icon: body.icon !== undefined ? body.icon : existing.icon,
        color: body.color !== undefined ? body.color : existing.color,
        sortOrder: body.sortOrder ?? existing.sortOrder,
        isActive: body.isActive ?? existing.isActive,
      },
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "UPDATE",
      entity: "NewsCategory",
      entityId: item.id,
      details: `Updated news category: ${item.name}`,
    });

    revalidateEntity("NewsCategory");
    return success(item);
  } catch (error) {
    console.error("Update news category error:", error);
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
  const existing = await prisma.newsCategory.findUnique({ where: { id } });
  if (!existing) return notFound("News category not found");

  await prisma.newsCategory.delete({ where: { id } });

  await logActivity({
    adminId: auth.admin.id,
    action: "DELETE",
    entity: "NewsCategory",
    entityId: id,
    details: `Deleted news category: ${existing.name}`,
  });

  revalidateEntity("NewsCategory");
  return success({ message: "News category deleted" });
}
