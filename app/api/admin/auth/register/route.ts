import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/admin/auth";
import { requireAdmin, badRequest } from "@/lib/admin/middleware";
import { logActivity } from "@/lib/admin/activity-logger";
import { adminRegisterSchema } from "@/types/admin";

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req, "admins", "create");
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const parsed = adminRegisterSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(
        "Validation failed",
        parsed.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }))
      );
    }

    const { name, email, password, phone, role } = parsed.data;

    const existing = await prisma.admin.findUnique({ where: { email } });
    if (existing) {
      return badRequest("An admin with this email already exists");
    }

    const hashedPassword = await hashPassword(password);

    const newAdmin = await prisma.admin.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
      },
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "CREATE",
      entity: "Admin",
      entityId: newAdmin.id,
      details: `Created admin: ${newAdmin.name} (${newAdmin.role})`,
    });

    return NextResponse.json({ success: true, data: newAdmin }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
