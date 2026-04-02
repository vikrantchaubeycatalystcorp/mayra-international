import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, success, notFound, badRequest } from "@/lib/admin/middleware";
import { logActivity } from "@/lib/admin/activity-logger";
import { enquiryResponseSchema } from "@/types/admin";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req, "enquiries", "view");
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const enquiry = await prisma.enquiry.findUnique({ where: { id }, include: { user: { select: { name: true, email: true } } } });
  if (!enquiry) return notFound("Enquiry not found");
  return success(enquiry);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req, "enquiries", "edit");
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const existing = await prisma.enquiry.findUnique({ where: { id } });
  if (!existing) return notFound("Enquiry not found");

  try {
    const body = await req.json();
    const parsed = enquiryResponseSchema.safeParse(body);
    if (!parsed.success) return badRequest("Validation failed", parsed.error.errors.map((e) => ({ field: e.path.join("."), message: e.message })));

    const data = parsed.data;
    const enquiry = await prisma.enquiry.update({
      where: { id },
      data: {
        status: data.status,
        priority: data.priority || existing.priority,
        response: data.response,
        notes: data.notes,
        respondedAt: data.status === "RESPONDED" ? new Date() : existing.respondedAt,
        assignedTo: auth.admin.id,
      },
    });

    await logActivity({ adminId: auth.admin.id, action: "UPDATE", entity: "Enquiry", entityId: enquiry.id, details: `Updated enquiry status to ${data.status}` });
    return success(enquiry);
  } catch (error) {
    console.error("Update enquiry error:", error);
    return NextResponse.json({ success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } }, { status: 500 });
  }
}
