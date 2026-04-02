import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, success, badRequest } from "@/lib/admin/middleware";
import { logActivity } from "@/lib/admin/activity-logger";
import { revalidateEntity } from "@/lib/revalidate";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, "settings", "view");
  if (auth instanceof NextResponse) return auth;

  const data = await prisma.courseLevel.findMany({
    orderBy: { sortOrder: "asc" },
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

    const existing = await prisma.courseLevel.findUnique({ where: { code: body.code } });
    if (existing) return badRequest("A course level with this code already exists");

    const item = await prisma.courseLevel.create({
      data: {
        name: body.name,
        code: body.code,
        sortOrder: body.sortOrder ?? 0,
      },
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "CREATE",
      entity: "CourseLevel",
      entityId: item.id,
      details: `Created course level: ${item.name}`,
    });

    revalidateEntity("CourseLevel");
    return success(item, 201);
  } catch (error) {
    console.error("Create course level error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
