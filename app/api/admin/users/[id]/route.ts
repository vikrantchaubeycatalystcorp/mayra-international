import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, success, notFound, badRequest } from "@/lib/admin/middleware";
import { logActivity } from "@/lib/admin/activity-logger";
import { z } from "zod";

const userUpdateSchema = z.object({
  isActive: z.boolean().optional(),
  isVerified: z.boolean().optional(),
}).strict();

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req, "users", "view");
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, phone: true, provider: true, goal: true, isActive: true, isVerified: true, savedColleges: true, compareList: true, lastLoginAt: true, createdAt: true },
  });
  if (!user) return notFound("User not found");
  return success(user);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req, "users", "manage");
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) return notFound("User not found");

  const body = await req.json();
  const parsed = userUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Invalid input", parsed.error.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    })));
  }
  const validated = parsed.data;
  const user = await prisma.user.update({
    where: { id },
    data: {
      isActive: validated.isActive ?? existing.isActive,
      isVerified: validated.isVerified ?? existing.isVerified,
    },
    select: { id: true, name: true, email: true, isActive: true, isVerified: true },
  });

  await logActivity({ adminId: auth.admin.id, action: "UPDATE", entity: "User", entityId: id, details: `Updated user: ${user.name}` });
  return success(user);
}
