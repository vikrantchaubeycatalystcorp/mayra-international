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
  const section = await prisma.footerSection.findUnique({
    where: { id },
    include: { links: { orderBy: { sortOrder: "asc" } } },
  });
  if (!section) return notFound("Footer section not found");

  return success(section);
}

export async function PUT(req: NextRequest, { params }: Props) {
  const auth = await requireAdmin(req, "settings", "edit");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const existing = await prisma.footerSection.findUnique({ where: { id } });
  if (!existing) return notFound("Footer section not found");

  try {
    const body = await req.json();

    const section = await prisma.footerSection.update({
      where: { id },
      data: {
        title: body.title ?? existing.title,
        sortOrder: body.sortOrder ?? existing.sortOrder,
        isActive: body.isActive ?? existing.isActive,
      },
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "UPDATE",
      entity: "FooterSection",
      entityId: section.id,
      details: `Updated footer section: ${section.title}`,
    });

    revalidateEntity("FooterSection");
    return success(section);
  } catch (error) {
    console.error("Update footer section error:", error);
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
  const existing = await prisma.footerSection.findUnique({ where: { id } });
  if (!existing) return notFound("Footer section not found");

  await prisma.footerSection.delete({ where: { id } });

  await logActivity({
    adminId: auth.admin.id,
    action: "DELETE",
    entity: "FooterSection",
    entityId: id,
    details: `Deleted footer section: ${existing.title}`,
  });

  revalidateEntity("FooterSection");
  return success({ message: "Footer section deleted" });
}
