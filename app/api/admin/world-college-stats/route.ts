import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, success, badRequest } from "@/lib/admin/middleware";
import { logActivity } from "@/lib/admin/activity-logger";
import { revalidateEntity } from "@/lib/revalidate";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, "settings", "view");
  if (auth instanceof NextResponse) return auth;

  const data = await prisma.worldCollegeStat.findMany({
    orderBy: { countryName: "asc" },
  });

  return success(data);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req, "settings", "edit");
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();

    if (!body.countryCode || !body.countryName || body.centroidLng === undefined || body.centroidLat === undefined) {
      return badRequest("countryCode, countryName, centroidLng, and centroidLat are required");
    }

    const stat = await prisma.worldCollegeStat.create({
      data: {
        countryCode: body.countryCode,
        countryName: body.countryName,
        collegeCount: body.collegeCount ?? 0,
        centroidLng: body.centroidLng,
        centroidLat: body.centroidLat,
      },
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "CREATE",
      entity: "WorldCollegeStat",
      entityId: stat.id,
      details: `Created world college stat: ${stat.countryName}`,
    });

    revalidateEntity("WorldCollegeStat");
    return success(stat, 201);
  } catch (error) {
    console.error("Create world college stat error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
