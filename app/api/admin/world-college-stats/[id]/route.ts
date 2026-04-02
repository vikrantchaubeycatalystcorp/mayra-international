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
  const stat = await prisma.worldCollegeStat.findUnique({ where: { id } });
  if (!stat) return notFound("World college stat not found");

  return success(stat);
}

export async function PUT(req: NextRequest, { params }: Props) {
  const auth = await requireAdmin(req, "settings", "edit");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const existing = await prisma.worldCollegeStat.findUnique({ where: { id } });
  if (!existing) return notFound("World college stat not found");

  try {
    const body = await req.json();

    const stat = await prisma.worldCollegeStat.update({
      where: { id },
      data: {
        countryCode: body.countryCode ?? existing.countryCode,
        countryName: body.countryName ?? existing.countryName,
        collegeCount: body.collegeCount ?? existing.collegeCount,
        centroidLng: body.centroidLng ?? existing.centroidLng,
        centroidLat: body.centroidLat ?? existing.centroidLat,
        isActive: body.isActive ?? existing.isActive,
      },
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "UPDATE",
      entity: "WorldCollegeStat",
      entityId: stat.id,
      details: `Updated world college stat: ${stat.countryName}`,
    });

    revalidateEntity("WorldCollegeStat");
    return success(stat);
  } catch (error) {
    console.error("Update world college stat error:", error);
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
  const existing = await prisma.worldCollegeStat.findUnique({ where: { id } });
  if (!existing) return notFound("World college stat not found");

  await prisma.worldCollegeStat.delete({ where: { id } });

  await logActivity({
    adminId: auth.admin.id,
    action: "DELETE",
    entity: "WorldCollegeStat",
    entityId: id,
    details: `Deleted world college stat: ${existing.countryName}`,
  });

  revalidateEntity("WorldCollegeStat");
  return success({ message: "World college stat deleted" });
}
