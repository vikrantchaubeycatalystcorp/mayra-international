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
  const item = await prisma.leadInterest.findUnique({ where: { id } });
  if (!item) return notFound("Lead interest not found");

  return success(item);
}

export async function PUT(req: NextRequest, { params }: Props) {
  const auth = await requireAdmin(req, "settings", "edit");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const existing = await prisma.leadInterest.findUnique({ where: { id } });
  if (!existing) return notFound("Lead interest not found");

  try {
    const body = await req.json();

    if (body.value && body.value !== existing.value) {
      const valueExists = await prisma.leadInterest.findUnique({ where: { value: body.value } });
      if (valueExists) return badRequest("A lead interest with this value already exists");
    }

    const item = await prisma.leadInterest.update({
      where: { id },
      data: {
        label: body.label ?? existing.label,
        value: body.value ?? existing.value,
        sortOrder: body.sortOrder ?? existing.sortOrder,
        isActive: body.isActive ?? existing.isActive,
      },
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "UPDATE",
      entity: "LeadInterest",
      entityId: item.id,
      details: `Updated lead interest: ${item.label}`,
    });

    revalidateEntity("LeadInterest");
    return success(item);
  } catch (error) {
    console.error("Update lead interest error:", error);
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
  const existing = await prisma.leadInterest.findUnique({ where: { id } });
  if (!existing) return notFound("Lead interest not found");

  await prisma.leadInterest.delete({ where: { id } });

  await logActivity({
    adminId: auth.admin.id,
    action: "DELETE",
    entity: "LeadInterest",
    entityId: id,
    details: `Deleted lead interest: ${existing.label}`,
  });

  revalidateEntity("LeadInterest");
  return success({ message: "Lead interest deleted" });
}
