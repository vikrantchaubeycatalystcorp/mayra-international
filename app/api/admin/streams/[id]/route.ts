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
  const stream = await prisma.stream.findUnique({ where: { id } });
  if (!stream) return notFound("Stream not found");

  return success(stream);
}

export async function PUT(req: NextRequest, { params }: Props) {
  const auth = await requireAdmin(req, "settings", "edit");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const existing = await prisma.stream.findUnique({ where: { id } });
  if (!existing) return notFound("Stream not found");

  try {
    const body = await req.json();

    if (body.slug && body.slug !== existing.slug) {
      const slugExists = await prisma.stream.findUnique({ where: { slug: body.slug } });
      if (slugExists) return badRequest("A stream with this slug already exists");
    }

    const stream = await prisma.stream.update({
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
      entity: "Stream",
      entityId: stream.id,
      details: `Updated stream: ${stream.name}`,
    });

    revalidateEntity("Stream");
    return success(stream);
  } catch (error) {
    console.error("Update stream error:", error);
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
  const existing = await prisma.stream.findUnique({ where: { id } });
  if (!existing) return notFound("Stream not found");

  await prisma.stream.delete({ where: { id } });

  await logActivity({
    adminId: auth.admin.id,
    action: "DELETE",
    entity: "Stream",
    entityId: id,
    details: `Deleted stream: ${existing.name}`,
  });

  revalidateEntity("Stream");
  return success({ message: "Stream deleted" });
}
