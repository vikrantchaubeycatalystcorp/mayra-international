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
  const state = await prisma.state.findUnique({
    where: { id },
    include: { cities: { orderBy: { name: "asc" } } },
  });
  if (!state) return notFound("State not found");

  return success(state);
}

export async function PUT(req: NextRequest, { params }: Props) {
  const auth = await requireAdmin(req, "settings", "edit");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const existing = await prisma.state.findUnique({ where: { id } });
  if (!existing) return notFound("State not found");

  try {
    const body = await req.json();

    if (body.code && body.code !== existing.code) {
      const codeExists = await prisma.state.findUnique({ where: { code: body.code } });
      if (codeExists) return badRequest("A state with this code already exists");
    }

    const state = await prisma.state.update({
      where: { id },
      data: {
        name: body.name ?? existing.name,
        code: body.code ?? existing.code,
        countryCode: body.countryCode ?? existing.countryCode,
        isActive: body.isActive ?? existing.isActive,
      },
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "UPDATE",
      entity: "State",
      entityId: state.id,
      details: `Updated state: ${state.name}`,
    });

    revalidateEntity("State");
    return success(state);
  } catch (error) {
    console.error("Update state error:", error);
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
  const existing = await prisma.state.findUnique({ where: { id } });
  if (!existing) return notFound("State not found");

  await prisma.state.delete({ where: { id } });

  await logActivity({
    adminId: auth.admin.id,
    action: "DELETE",
    entity: "State",
    entityId: id,
    details: `Deleted state: ${existing.name}`,
  });

  revalidateEntity("State");
  return success({ message: "State deleted" });
}
