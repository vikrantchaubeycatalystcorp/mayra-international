import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, success, notFound, badRequest } from "@/lib/admin/middleware";
import { logActivity } from "@/lib/admin/activity-logger";
import { leadStatusUpdateSchema } from "@/types/admin";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req, "leads", "view");
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;

  try {
    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) return notFound("Lead not found");
    return success(lead);
  } catch (error) {
    console.error("Lead detail error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch lead" } },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req, "leads", "edit");
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;

  try {
    const existing = await prisma.lead.findUnique({
      where: { id },
      select: { id: true, fullName: true },
    });
    if (!existing) return notFound("Lead not found");

    const body = await req.json();
    const parsed = leadStatusUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(
        "Validation failed",
        parsed.error.errors.map((e) => ({ field: e.path.join("."), message: e.message }))
      );
    }

    const data = parsed.data;
    const updateData: Record<string, unknown> = {};
    if (data.status) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const updated = await prisma.lead.update({
      where: { id },
      data: updateData,
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "UPDATE",
      entity: "Lead",
      entityId: id,
      details: `Updated lead${data.status ? ` status to ${data.status}` : ""}`,
    });

    return success(updated);
  } catch (error) {
    console.error("Update lead error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req, "leads", "delete");
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;

  try {
    const existing = await prisma.lead.findUnique({
      where: { id },
      select: { id: true, fullName: true },
    });
    if (!existing) return notFound("Lead not found");

    await prisma.lead.delete({ where: { id } });

    await logActivity({
      adminId: auth.admin.id,
      action: "DELETE",
      entity: "Lead",
      entityId: id,
      details: `Deleted lead: ${existing.fullName}`,
    });

    return success({ deleted: true });
  } catch (error) {
    console.error("Delete lead error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
