import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, success, badRequest } from "@/lib/admin/middleware";
import { logActivity } from "@/lib/admin/activity-logger";
import { revalidateEntity } from "@/lib/revalidate";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, "settings", "view");
  if (auth instanceof NextResponse) return auth;

  const data = await prisma.examMode.findMany({
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

    const existing = await prisma.examMode.findUnique({ where: { name: body.name } });
    if (existing) return badRequest("An exam mode with this name already exists");

    const item = await prisma.examMode.create({
      data: {
        name: body.name,
        sortOrder: body.sortOrder ?? 0,
      },
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "CREATE",
      entity: "ExamMode",
      entityId: item.id,
      details: `Created exam mode: ${item.name}`,
    });

    revalidateEntity("ExamMode");
    return success(item, 201);
  } catch (error) {
    console.error("Create exam mode error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
