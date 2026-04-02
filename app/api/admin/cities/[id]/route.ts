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
  const city = await prisma.city.findUnique({
    where: { id },
    include: { state: { select: { name: true } } },
  });
  if (!city) return notFound("City not found");

  return success(city);
}

export async function PUT(req: NextRequest, { params }: Props) {
  const auth = await requireAdmin(req, "settings", "edit");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const existing = await prisma.city.findUnique({ where: { id } });
  if (!existing) return notFound("City not found");

  try {
    const body = await req.json();

    if (body.name && body.name !== existing.name) {
      const stateId = body.stateId ?? existing.stateId;
      const nameExists = await prisma.city.findFirst({
        where: { name: body.name, stateId, NOT: { id } },
      });
      if (nameExists) return badRequest("A city with this name already exists in this state");
    }

    const city = await prisma.city.update({
      where: { id },
      data: {
        name: body.name ?? existing.name,
        stateId: body.stateId ?? existing.stateId,
        sortOrder: body.sortOrder ?? existing.sortOrder,
        isActive: body.isActive ?? existing.isActive,
      },
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "UPDATE",
      entity: "City",
      entityId: city.id,
      details: `Updated city: ${city.name}`,
    });

    revalidateEntity("City");
    return success(city);
  } catch (error) {
    console.error("Update city error:", error);
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
  const existing = await prisma.city.findUnique({ where: { id } });
  if (!existing) return notFound("City not found");

  await prisma.city.delete({ where: { id } });

  await logActivity({
    adminId: auth.admin.id,
    action: "DELETE",
    entity: "City",
    entityId: id,
    details: `Deleted city: ${existing.name}`,
  });

  revalidateEntity("City");
  return success({ message: "City deleted" });
}
