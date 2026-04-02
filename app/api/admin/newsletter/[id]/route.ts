import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, success, notFound } from "@/lib/admin/middleware";
import { logActivity } from "@/lib/admin/activity-logger";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req, "newsletter", "manage");
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const existing = await prisma.newsletterSubscriber.findUnique({ where: { id } });
  if (!existing) return notFound("Subscriber not found");

  const body = await req.json();
  const subscriber = await prisma.newsletterSubscriber.update({
    where: { id },
    data: {
      isActive: body.isActive ?? existing.isActive,
      unsubscribedAt: body.isActive === false ? new Date() : null,
    },
  });

  await logActivity({ adminId: auth.admin.id, action: "UPDATE", entity: "Newsletter", entityId: id, details: `Updated subscriber: ${existing.email}` });
  return success(subscriber);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req, "newsletter", "delete");
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const existing = await prisma.newsletterSubscriber.findUnique({ where: { id } });
  if (!existing) return notFound("Subscriber not found");
  await prisma.newsletterSubscriber.delete({ where: { id } });
  await logActivity({ adminId: auth.admin.id, action: "DELETE", entity: "Newsletter", entityId: id, details: `Deleted subscriber: ${existing.email}` });
  return success({ message: "Subscriber removed" });
}
