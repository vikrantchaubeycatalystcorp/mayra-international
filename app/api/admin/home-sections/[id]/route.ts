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
  const section = await prisma.homeSection.findUnique({ where: { id } });
  if (!section) return notFound("Home section not found");

  return success(section);
}

export async function PUT(req: NextRequest, { params }: Props) {
  const auth = await requireAdmin(req, "settings", "edit");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const existing = await prisma.homeSection.findUnique({ where: { id } });
  if (!existing) return notFound("Home section not found");

  try {
    const body = await req.json();

    const section = await prisma.homeSection.update({
      where: { id },
      data: {
        sectionKey: body.sectionKey ?? existing.sectionKey,
        title: body.title ?? existing.title,
        subtitle: body.subtitle !== undefined ? body.subtitle : existing.subtitle,
        ctaLabel: body.ctaLabel !== undefined ? body.ctaLabel : existing.ctaLabel,
        ctaLink: body.ctaLink !== undefined ? body.ctaLink : existing.ctaLink,
        sortOrder: body.sortOrder ?? existing.sortOrder,
        isActive: body.isActive ?? existing.isActive,
      },
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "UPDATE",
      entity: "HomeSection",
      entityId: section.id,
      details: `Updated home section: ${section.title}`,
    });

    revalidateEntity("HomeSection");
    return success(section);
  } catch (error) {
    console.error("Update home section error:", error);
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
  const existing = await prisma.homeSection.findUnique({ where: { id } });
  if (!existing) return notFound("Home section not found");

  await prisma.homeSection.delete({ where: { id } });

  await logActivity({
    adminId: auth.admin.id,
    action: "DELETE",
    entity: "HomeSection",
    entityId: id,
    details: `Deleted home section: ${existing.title}`,
  });

  revalidateEntity("HomeSection");
  return success({ message: "Home section deleted" });
}
