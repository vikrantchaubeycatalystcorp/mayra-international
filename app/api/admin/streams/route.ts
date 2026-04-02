import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, success, badRequest } from "@/lib/admin/middleware";
import { logActivity } from "@/lib/admin/activity-logger";
import { revalidateEntity } from "@/lib/revalidate";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, "settings", "view");
  if (auth instanceof NextResponse) return auth;

  const data = await prisma.stream.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return success(data);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req, "settings", "edit");
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();

    if (!body.name || !body.slug) {
      return badRequest("name and slug are required");
    }

    const existing = await prisma.stream.findUnique({ where: { slug: body.slug } });
    if (existing) return badRequest("A stream with this slug already exists");

    const stream = await prisma.stream.create({
      data: {
        name: body.name,
        slug: body.slug,
        icon: body.icon ?? null,
        color: body.color ?? null,
        sortOrder: body.sortOrder ?? 0,
      },
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "CREATE",
      entity: "Stream",
      entityId: stream.id,
      details: `Created stream: ${stream.name}`,
    });

    revalidateEntity("Stream");
    return success(stream, 201);
  } catch (error) {
    console.error("Create stream error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
