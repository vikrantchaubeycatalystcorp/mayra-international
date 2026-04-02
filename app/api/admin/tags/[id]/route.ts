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
  const item = await prisma.tag.findUnique({ where: { id } });
  if (!item) return notFound("Tag not found");

  return success(item);
}

export async function PUT(req: NextRequest, { params }: Props) {
  const auth = await requireAdmin(req, "settings", "edit");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const existing = await prisma.tag.findUnique({ where: { id } });
  if (!existing) return notFound("Tag not found");

  try {
    const body = await req.json();

    if (body.slug && body.slug !== existing.slug) {
      const slugExists = await prisma.tag.findUnique({ where: { slug: body.slug } });
      if (slugExists) return badRequest("A tag with this slug already exists");
    }

    const item = await prisma.tag.update({
      where: { id },
      data: {
        name: body.name ?? existing.name,
        slug: body.slug ?? existing.slug,
      },
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "UPDATE",
      entity: "Tag",
      entityId: item.id,
      details: `Updated tag: ${item.name}`,
    });

    revalidateEntity("Tag");
    return success(item);
  } catch (error) {
    console.error("Update tag error:", error);
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
  const existing = await prisma.tag.findUnique({ where: { id } });
  if (!existing) return notFound("Tag not found");

  await prisma.tag.delete({ where: { id } });

  await logActivity({
    adminId: auth.admin.id,
    action: "DELETE",
    entity: "Tag",
    entityId: id,
    details: `Deleted tag: ${existing.name}`,
  });

  revalidateEntity("Tag");
  return success({ message: "Tag deleted" });
}
