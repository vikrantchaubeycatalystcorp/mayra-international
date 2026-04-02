import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, success, badRequest } from "@/lib/admin/middleware";
import { logActivity } from "@/lib/admin/activity-logger";
import { revalidateEntity } from "@/lib/revalidate";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, "settings", "view");
  if (auth instanceof NextResponse) return auth;

  const data = await prisma.collegeType.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return success(data);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req, "settings", "edit");
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();

    if (!body.name) {
      return badRequest("name is required");
    }

    const existing = await prisma.collegeType.findUnique({ where: { name: body.name } });
    if (existing) return badRequest("A college type with this name already exists");

    const item = await prisma.collegeType.create({
      data: {
        name: body.name,
        sortOrder: body.sortOrder ?? 0,
      },
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "CREATE",
      entity: "CollegeType",
      entityId: item.id,
      details: `Created college type: ${item.name}`,
    });

    revalidateEntity("CollegeType");
    return success(item, 201);
  } catch (error) {
    console.error("Create college type error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
