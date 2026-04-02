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
  const link = await prisma.legalLink.findUnique({ where: { id } });
  if (!link) return notFound("Legal link not found");

  return success(link);
}

export async function PUT(req: NextRequest, { params }: Props) {
  const auth = await requireAdmin(req, "settings", "edit");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const existing = await prisma.legalLink.findUnique({ where: { id } });
  if (!existing) return notFound("Legal link not found");

  try {
    const body = await req.json();

    const link = await prisma.legalLink.update({
      where: { id },
      data: {
        label: body.label ?? existing.label,
        href: body.href ?? existing.href,
        sortOrder: body.sortOrder ?? existing.sortOrder,
        isActive: body.isActive ?? existing.isActive,
      },
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "UPDATE",
      entity: "LegalLink",
      entityId: link.id,
      details: `Updated legal link: ${link.label}`,
    });

    revalidateEntity("LegalLink");
    return success(link);
  } catch (error) {
    console.error("Update legal link error:", error);
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
  const existing = await prisma.legalLink.findUnique({ where: { id } });
  if (!existing) return notFound("Legal link not found");

  await prisma.legalLink.delete({ where: { id } });

  await logActivity({
    adminId: auth.admin.id,
    action: "DELETE",
    entity: "LegalLink",
    entityId: id,
    details: `Deleted legal link: ${existing.label}`,
  });

  revalidateEntity("LegalLink");
  return success({ message: "Legal link deleted" });
}
