import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, success, badRequest } from "@/lib/admin/middleware";
import { logActivity } from "@/lib/admin/activity-logger";
import { revalidateEntity } from "@/lib/revalidate";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, "settings", "view");
  if (auth instanceof NextResponse) return auth;

  const data = await prisma.trustBadge.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return success(data);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req, "settings", "edit");
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();

    if (!body.label) {
      return badRequest("label is required");
    }

    const badge = await prisma.trustBadge.create({
      data: {
        label: body.label,
        icon: body.icon ?? null,
        bgColor: body.bgColor ?? "bg-green-900/50",
        borderColor: body.borderColor ?? "border-green-700",
        textColor: body.textColor ?? "text-green-400",
        sortOrder: body.sortOrder ?? 0,
      },
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "CREATE",
      entity: "TrustBadge",
      entityId: badge.id,
      details: `Created trust badge: ${badge.label}`,
    });

    revalidateEntity("TrustBadge");
    return success(badge, 201);
  } catch (error) {
    console.error("Create trust badge error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
