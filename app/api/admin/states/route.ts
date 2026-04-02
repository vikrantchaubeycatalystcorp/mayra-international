import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, success, badRequest } from "@/lib/admin/middleware";
import { logActivity } from "@/lib/admin/activity-logger";
import { revalidateEntity } from "@/lib/revalidate";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, "settings", "view");
  if (auth instanceof NextResponse) return auth;

  const data = await prisma.state.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { cities: true } } },
  });

  return success(data);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req, "settings", "edit");
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();

    if (!body.name || !body.code) {
      return badRequest("name and code are required");
    }

    const existing = await prisma.state.findUnique({ where: { code: body.code } });
    if (existing) return badRequest("A state with this code already exists");

    const state = await prisma.state.create({
      data: {
        name: body.name,
        code: body.code,
        countryCode: body.countryCode ?? "IN",
        isActive: body.isActive ?? true,
      },
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "CREATE",
      entity: "State",
      entityId: state.id,
      details: `Created state: ${state.name}`,
    });

    revalidateEntity("State");
    return success(state, 201);
  } catch (error) {
    console.error("Create state error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
