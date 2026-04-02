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
  const stat = await prisma.homeStat.findUnique({ where: { id } });
  if (!stat) return notFound("Home stat not found");

  return success(stat);
}

export async function PUT(req: NextRequest, { params }: Props) {
  const auth = await requireAdmin(req, "settings", "edit");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const existing = await prisma.homeStat.findUnique({ where: { id } });
  if (!existing) return notFound("Home stat not found");

  try {
    const body = await req.json();

    const stat = await prisma.homeStat.update({
      where: { id },
      data: {
        icon: body.icon ?? existing.icon,
        value: body.value ?? existing.value,
        suffix: body.suffix ?? existing.suffix,
        label: body.label ?? existing.label,
        sublabel: body.sublabel !== undefined ? body.sublabel : existing.sublabel,
        color: body.color ?? existing.color,
        bgColor: body.bgColor ?? existing.bgColor,
        iconColor: body.iconColor ?? existing.iconColor,
        sortOrder: body.sortOrder ?? existing.sortOrder,
        isActive: body.isActive ?? existing.isActive,
      },
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "UPDATE",
      entity: "HomeStat",
      entityId: stat.id,
      details: `Updated home stat: ${stat.label}`,
    });

    revalidateEntity("HomeStat");
    return success(stat);
  } catch (error) {
    console.error("Update home stat error:", error);
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
  const existing = await prisma.homeStat.findUnique({ where: { id } });
  if (!existing) return notFound("Home stat not found");

  await prisma.homeStat.delete({ where: { id } });

  await logActivity({
    adminId: auth.admin.id,
    action: "DELETE",
    entity: "HomeStat",
    entityId: id,
    details: `Deleted home stat: ${existing.label}`,
  });

  revalidateEntity("HomeStat");
  return success({ message: "Home stat deleted" });
}
