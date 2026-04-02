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
  const item = await prisma.courseLevel.findUnique({ where: { id } });
  if (!item) return notFound("Course level not found");

  return success(item);
}

export async function PUT(req: NextRequest, { params }: Props) {
  const auth = await requireAdmin(req, "settings", "edit");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const existing = await prisma.courseLevel.findUnique({ where: { id } });
  if (!existing) return notFound("Course level not found");

  try {
    const body = await req.json();

    if (body.code && body.code !== existing.code) {
      const codeExists = await prisma.courseLevel.findUnique({ where: { code: body.code } });
      if (codeExists) return badRequest("A course level with this code already exists");
    }

    const item = await prisma.courseLevel.update({
      where: { id },
      data: {
        name: body.name ?? existing.name,
        code: body.code ?? existing.code,
        sortOrder: body.sortOrder ?? existing.sortOrder,
        isActive: body.isActive ?? existing.isActive,
      },
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "UPDATE",
      entity: "CourseLevel",
      entityId: item.id,
      details: `Updated course level: ${item.name}`,
    });

    revalidateEntity("CourseLevel");
    return success(item);
  } catch (error) {
    console.error("Update course level error:", error);
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
  const existing = await prisma.courseLevel.findUnique({ where: { id } });
  if (!existing) return notFound("Course level not found");

  await prisma.courseLevel.delete({ where: { id } });

  await logActivity({
    adminId: auth.admin.id,
    action: "DELETE",
    entity: "CourseLevel",
    entityId: id,
    details: `Deleted course level: ${existing.name}`,
  });

  revalidateEntity("CourseLevel");
  return success({ message: "Course level deleted" });
}
