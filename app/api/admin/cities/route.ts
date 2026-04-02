import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, success, badRequest } from "@/lib/admin/middleware";
import { logActivity } from "@/lib/admin/activity-logger";
import { revalidateEntity } from "@/lib/revalidate";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, "settings", "view");
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const stateId = searchParams.get("stateId");

  const where = stateId ? { stateId } : {};

  const data = await prisma.city.findMany({
    where,
    orderBy: { name: "asc" },
    include: { state: { select: { name: true } } },
  });

  return success(data);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req, "settings", "edit");
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();

    if (!body.name || !body.stateId) {
      return badRequest("name and stateId are required");
    }

    const stateExists = await prisma.state.findUnique({ where: { id: body.stateId } });
    if (!stateExists) return badRequest("State not found");

    const existing = await prisma.city.findFirst({
      where: { name: body.name, stateId: body.stateId },
    });
    if (existing) return badRequest("A city with this name already exists in this state");

    const city = await prisma.city.create({
      data: {
        name: body.name,
        stateId: body.stateId,
        sortOrder: body.sortOrder ?? 0,
        isActive: body.isActive ?? true,
      },
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "CREATE",
      entity: "City",
      entityId: city.id,
      details: `Created city: ${city.name}`,
    });

    revalidateEntity("City");
    return success(city, 201);
  } catch (error) {
    console.error("Create city error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
