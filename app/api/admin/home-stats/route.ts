import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, success, badRequest } from "@/lib/admin/middleware";
import { logActivity } from "@/lib/admin/activity-logger";
import { revalidateEntity } from "@/lib/revalidate";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, "settings", "view");
  if (auth instanceof NextResponse) return auth;

  const data = await prisma.homeStat.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return success(data);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req, "settings", "edit");
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();

    if (!body.icon || body.value === undefined || !body.label) {
      return badRequest("icon, value, and label are required");
    }

    const stat = await prisma.homeStat.create({
      data: {
        icon: body.icon,
        value: body.value,
        suffix: body.suffix ?? "+",
        label: body.label,
        sublabel: body.sublabel ?? null,
        color: body.color ?? "from-blue-600 to-blue-400",
        bgColor: body.bgColor ?? "bg-blue-50",
        iconColor: body.iconColor ?? "text-blue-600",
        sortOrder: body.sortOrder ?? 0,
      },
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "CREATE",
      entity: "HomeStat",
      entityId: stat.id,
      details: `Created home stat: ${stat.label}`,
    });

    revalidateEntity("HomeStat");
    return success(stat, 201);
  } catch (error) {
    console.error("Create home stat error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
