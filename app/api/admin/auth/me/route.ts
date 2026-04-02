import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, success } from "@/lib/admin/middleware";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const admin = await prisma.admin.findUnique({
    where: { id: auth.admin.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      phone: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });

  if (!admin) {
    return NextResponse.json(
      { success: false, error: { code: "NOT_FOUND", message: "Admin not found" } },
      { status: 404 }
    );
  }

  return success(admin);
}
