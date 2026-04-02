import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, success, badRequest } from "@/lib/admin/middleware";
import { logActivity } from "@/lib/admin/activity-logger";
import { revalidateEntity } from "@/lib/revalidate";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, "settings", "view");
  if (auth instanceof NextResponse) return auth;

  const data = await prisma.leadInterest.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return success(data);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req, "settings", "edit");
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();

    if (!body.label || !body.value) {
      return badRequest("label and value are required");
    }

    const existing = await prisma.leadInterest.findUnique({ where: { value: body.value } });
    if (existing) return badRequest("A lead interest with this value already exists");

    const item = await prisma.leadInterest.create({
      data: {
        label: body.label,
        value: body.value,
        sortOrder: body.sortOrder ?? 0,
      },
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "CREATE",
      entity: "LeadInterest",
      entityId: item.id,
      details: `Created lead interest: ${item.label}`,
    });

    revalidateEntity("LeadInterest");
    return success(item, 201);
  } catch (error) {
    console.error("Create lead interest error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
