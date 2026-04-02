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
  const item = await prisma.accreditationBody.findUnique({ where: { id } });
  if (!item) return notFound("Accreditation body not found");

  return success(item);
}

export async function PUT(req: NextRequest, { params }: Props) {
  const auth = await requireAdmin(req, "settings", "edit");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const existing = await prisma.accreditationBody.findUnique({ where: { id } });
  if (!existing) return notFound("Accreditation body not found");

  try {
    const body = await req.json();

    if (body.name && body.name !== existing.name) {
      const nameExists = await prisma.accreditationBody.findUnique({ where: { name: body.name } });
      if (nameExists) return badRequest("An accreditation body with this name already exists");
    }

    const item = await prisma.accreditationBody.update({
      where: { id },
      data: {
        name: body.name ?? existing.name,
        fullName: body.fullName !== undefined ? body.fullName : existing.fullName,
        description: body.description !== undefined ? body.description : existing.description,
        sortOrder: body.sortOrder ?? existing.sortOrder,
        isActive: body.isActive ?? existing.isActive,
      },
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "UPDATE",
      entity: "AccreditationBody",
      entityId: item.id,
      details: `Updated accreditation body: ${item.name}`,
    });

    revalidateEntity("AccreditationBody");
    return success(item);
  } catch (error) {
    console.error("Update accreditation body error:", error);
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
  const existing = await prisma.accreditationBody.findUnique({ where: { id } });
  if (!existing) return notFound("Accreditation body not found");

  await prisma.accreditationBody.delete({ where: { id } });

  await logActivity({
    adminId: auth.admin.id,
    action: "DELETE",
    entity: "AccreditationBody",
    entityId: id,
    details: `Deleted accreditation body: ${existing.name}`,
  });

  revalidateEntity("AccreditationBody");
  return success({ message: "Accreditation body deleted" });
}
