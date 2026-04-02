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
  const badge = await prisma.trustBadge.findUnique({ where: { id } });
  if (!badge) return notFound("Trust badge not found");

  return success(badge);
}

export async function PUT(req: NextRequest, { params }: Props) {
  const auth = await requireAdmin(req, "settings", "edit");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const existing = await prisma.trustBadge.findUnique({ where: { id } });
  if (!existing) return notFound("Trust badge not found");

  try {
    const body = await req.json();

    const badge = await prisma.trustBadge.update({
      where: { id },
      data: {
        label: body.label ?? existing.label,
        icon: body.icon !== undefined ? body.icon : existing.icon,
        bgColor: body.bgColor ?? existing.bgColor,
        borderColor: body.borderColor ?? existing.borderColor,
        textColor: body.textColor ?? existing.textColor,
        sortOrder: body.sortOrder ?? existing.sortOrder,
        isActive: body.isActive ?? existing.isActive,
      },
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "UPDATE",
      entity: "TrustBadge",
      entityId: badge.id,
      details: `Updated trust badge: ${badge.label}`,
    });

    revalidateEntity("TrustBadge");
    return success(badge);
  } catch (error) {
    console.error("Update trust badge error:", error);
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
  const existing = await prisma.trustBadge.findUnique({ where: { id } });
  if (!existing) return notFound("Trust badge not found");

  await prisma.trustBadge.delete({ where: { id } });

  await logActivity({
    adminId: auth.admin.id,
    action: "DELETE",
    entity: "TrustBadge",
    entityId: id,
    details: `Deleted trust badge: ${existing.label}`,
  });

  revalidateEntity("TrustBadge");
  return success({ message: "Trust badge deleted" });
}
