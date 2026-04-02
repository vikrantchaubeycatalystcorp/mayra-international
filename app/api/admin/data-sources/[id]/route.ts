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
  const item = await prisma.dataSource.findUnique({ where: { id } });
  if (!item) return notFound("Data source not found");

  return success(item);
}

export async function PUT(req: NextRequest, { params }: Props) {
  const auth = await requireAdmin(req, "settings", "edit");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const existing = await prisma.dataSource.findUnique({ where: { id } });
  if (!existing) return notFound("Data source not found");

  try {
    const body = await req.json();

    if (body.name && body.name !== existing.name) {
      const nameExists = await prisma.dataSource.findUnique({ where: { name: body.name } });
      if (nameExists) return badRequest("A data source with this name already exists");
    }

    const item = await prisma.dataSource.update({
      where: { id },
      data: {
        name: body.name ?? existing.name,
        type: body.type ?? existing.type,
        url: body.url !== undefined ? body.url : existing.url,
        status: body.status ?? existing.status,
        notes: body.notes !== undefined ? body.notes : existing.notes,
        isActive: body.isActive ?? existing.isActive,
      },
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "UPDATE",
      entity: "DataSource",
      entityId: item.id,
      details: `Updated data source: ${item.name}`,
    });

    revalidateEntity("DataSource");
    return success(item);
  } catch (error) {
    console.error("Update data source error:", error);
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
  const existing = await prisma.dataSource.findUnique({ where: { id } });
  if (!existing) return notFound("Data source not found");

  await prisma.dataSource.delete({ where: { id } });

  await logActivity({
    adminId: auth.admin.id,
    action: "DELETE",
    entity: "DataSource",
    entityId: id,
    details: `Deleted data source: ${existing.name}`,
  });

  revalidateEntity("DataSource");
  return success({ message: "Data source deleted" });
}
