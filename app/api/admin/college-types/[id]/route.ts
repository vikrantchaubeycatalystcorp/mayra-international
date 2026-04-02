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
  const item = await prisma.collegeType.findUnique({ where: { id } });
  if (!item) return notFound("College type not found");

  return success(item);
}

export async function PUT(req: NextRequest, { params }: Props) {
  const auth = await requireAdmin(req, "settings", "edit");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const existing = await prisma.collegeType.findUnique({ where: { id } });
  if (!existing) return notFound("College type not found");

  try {
    const body = await req.json();

    if (body.name && body.name !== existing.name) {
      const nameExists = await prisma.collegeType.findUnique({ where: { name: body.name } });
      if (nameExists) return badRequest("A college type with this name already exists");
    }

    const item = await prisma.collegeType.update({
      where: { id },
      data: {
        name: body.name ?? existing.name,
        sortOrder: body.sortOrder ?? existing.sortOrder,
        isActive: body.isActive ?? existing.isActive,
      },
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "UPDATE",
      entity: "CollegeType",
      entityId: item.id,
      details: `Updated college type: ${item.name}`,
    });

    revalidateEntity("CollegeType");
    return success(item);
  } catch (error) {
    console.error("Update college type error:", error);
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
  const existing = await prisma.collegeType.findUnique({ where: { id } });
  if (!existing) return notFound("College type not found");

  await prisma.collegeType.delete({ where: { id } });

  await logActivity({
    adminId: auth.admin.id,
    action: "DELETE",
    entity: "CollegeType",
    entityId: id,
    details: `Deleted college type: ${existing.name}`,
  });

  revalidateEntity("CollegeType");
  return success({ message: "College type deleted" });
}
