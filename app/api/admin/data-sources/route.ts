import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, success, badRequest } from "@/lib/admin/middleware";
import { logActivity } from "@/lib/admin/activity-logger";
import { revalidateEntity } from "@/lib/revalidate";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, "settings", "view");
  if (auth instanceof NextResponse) return auth;

  const data = await prisma.dataSource.findMany({
    orderBy: { createdAt: "desc" },
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

    const existing = await prisma.dataSource.findUnique({ where: { name: body.name } });
    if (existing) return badRequest("A data source with this name already exists");

    const item = await prisma.dataSource.create({
      data: {
        name: body.name,
        type: body.type ?? "manual",
        url: body.url ?? null,
        status: body.status ?? "active",
        notes: body.notes ?? null,
        isActive: body.isActive ?? true,
      },
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "CREATE",
      entity: "DataSource",
      entityId: item.id,
      details: `Created data source: ${item.name}`,
    });

    revalidateEntity("DataSource");
    return success(item, 201);
  } catch (error) {
    console.error("Create data source error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
