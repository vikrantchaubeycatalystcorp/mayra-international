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
  const link = await prisma.footerLink.findUnique({ where: { id } });
  if (!link) return notFound("Footer link not found");

  return success(link);
}

export async function PUT(req: NextRequest, { params }: Props) {
  const auth = await requireAdmin(req, "settings", "edit");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const existing = await prisma.footerLink.findUnique({ where: { id } });
  if (!existing) return notFound("Footer link not found");

  try {
    const body = await req.json();

    const link = await prisma.footerLink.update({
      where: { id },
      data: {
        sectionId: body.sectionId ?? existing.sectionId,
        label: body.label ?? existing.label,
        href: body.href ?? existing.href,
        sortOrder: body.sortOrder ?? existing.sortOrder,
        isActive: body.isActive ?? existing.isActive,
      },
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "UPDATE",
      entity: "FooterLink",
      entityId: link.id,
      details: `Updated footer link: ${link.label}`,
    });

    revalidateEntity("FooterLink");
    return success(link);
  } catch (error) {
    console.error("Update footer link error:", error);
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
  const existing = await prisma.footerLink.findUnique({ where: { id } });
  if (!existing) return notFound("Footer link not found");

  await prisma.footerLink.delete({ where: { id } });

  await logActivity({
    adminId: auth.admin.id,
    action: "DELETE",
    entity: "FooterLink",
    entityId: id,
    details: `Deleted footer link: ${existing.label}`,
  });

  revalidateEntity("FooterLink");
  return success({ message: "Footer link deleted" });
}
