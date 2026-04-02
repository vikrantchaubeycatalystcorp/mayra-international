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
  const item = await prisma.examMode.findUnique({ where: { id } });
  if (!item) return notFound("Exam mode not found");

  return success(item);
}

export async function PUT(req: NextRequest, { params }: Props) {
  const auth = await requireAdmin(req, "settings", "edit");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const existing = await prisma.examMode.findUnique({ where: { id } });
  if (!existing) return notFound("Exam mode not found");

  try {
    const body = await req.json();

    if (body.name && body.name !== existing.name) {
      const nameExists = await prisma.examMode.findUnique({ where: { name: body.name } });
      if (nameExists) return badRequest("An exam mode with this name already exists");
    }

    const item = await prisma.examMode.update({
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
      entity: "ExamMode",
      entityId: item.id,
      details: `Updated exam mode: ${item.name}`,
    });

    revalidateEntity("ExamMode");
    return success(item);
  } catch (error) {
    console.error("Update exam mode error:", error);
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
  const existing = await prisma.examMode.findUnique({ where: { id } });
  if (!existing) return notFound("Exam mode not found");

  await prisma.examMode.delete({ where: { id } });

  await logActivity({
    adminId: auth.admin.id,
    action: "DELETE",
    entity: "ExamMode",
    entityId: id,
    details: `Deleted exam mode: ${existing.name}`,
  });

  revalidateEntity("ExamMode");
  return success({ message: "Exam mode deleted" });
}
