import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, success, badRequest } from "@/lib/admin/middleware";
import { logActivity } from "@/lib/admin/activity-logger";
import { revalidateEntity } from "@/lib/revalidate";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, "settings", "view");
  if (auth instanceof NextResponse) return auth;

  const data = await prisma.appDownloadLink.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return success(data);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req, "settings", "edit");
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();

    if (!body.platform || !body.icon || !body.storeLabel || !body.storeName) {
      return badRequest("platform, icon, storeLabel, and storeName are required");
    }

    const link = await prisma.appDownloadLink.create({
      data: {
        platform: body.platform,
        icon: body.icon,
        storeLabel: body.storeLabel,
        storeName: body.storeName,
        url: body.url ?? "#",
        sortOrder: body.sortOrder ?? 0,
      },
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "CREATE",
      entity: "AppDownloadLink",
      entityId: link.id,
      details: `Created app download link: ${link.platform}`,
    });

    revalidateEntity("AppDownloadLink");
    return success(link, 201);
  } catch (error) {
    console.error("Create app download link error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
