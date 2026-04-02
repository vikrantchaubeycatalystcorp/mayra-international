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
  const announcement = await prisma.announcement.findUnique({ where: { id } });
  if (!announcement) return notFound("Announcement not found");

  return success(announcement);
}

export async function PUT(req: NextRequest, { params }: Props) {
  const auth = await requireAdmin(req, "settings", "edit");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const existing = await prisma.announcement.findUnique({ where: { id } });
  if (!existing) return notFound("Announcement not found");

  try {
    const body = await req.json();

    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        text: body.text ?? existing.text,
        linkText: body.linkText !== undefined ? body.linkText : existing.linkText,
        link: body.link !== undefined ? body.link : existing.link,
        bgColor: body.bgColor ?? existing.bgColor,
        textColor: body.textColor ?? existing.textColor,
        isActive: body.isActive ?? existing.isActive,
        startDate: body.startDate !== undefined ? (body.startDate ? new Date(body.startDate) : null) : existing.startDate,
        endDate: body.endDate !== undefined ? (body.endDate ? new Date(body.endDate) : null) : existing.endDate,
        sortOrder: body.sortOrder ?? existing.sortOrder,
      },
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "UPDATE",
      entity: "Announcement",
      entityId: announcement.id,
      details: `Updated announcement: ${announcement.text.substring(0, 50)}`,
    });

    revalidateEntity("Announcement");
    return success(announcement);
  } catch (error) {
    console.error("Update announcement error:", error);
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
  const existing = await prisma.announcement.findUnique({ where: { id } });
  if (!existing) return notFound("Announcement not found");

  await prisma.announcement.delete({ where: { id } });

  await logActivity({
    adminId: auth.admin.id,
    action: "DELETE",
    entity: "Announcement",
    entityId: id,
    details: `Deleted announcement: ${existing.text.substring(0, 50)}`,
  });

  revalidateEntity("Announcement");
  return success({ message: "Announcement deleted" });
}
