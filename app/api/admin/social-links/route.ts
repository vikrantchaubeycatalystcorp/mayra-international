import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, success, badRequest } from "@/lib/admin/middleware";
import { logActivity } from "@/lib/admin/activity-logger";
import { revalidateEntity } from "@/lib/revalidate";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, "settings", "view");
  if (auth instanceof NextResponse) return auth;

  const data = await prisma.socialLink.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return success(data);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req, "settings", "edit");
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();

    if (!body.platform || !body.url || !body.icon) {
      return badRequest("platform, url, and icon are required");
    }

    const link = await prisma.socialLink.create({
      data: {
        platform: body.platform,
        url: body.url,
        icon: body.icon,
        hoverColor: body.hoverColor ?? "hover:text-sky-400",
        sortOrder: body.sortOrder ?? 0,
      },
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "CREATE",
      entity: "SocialLink",
      entityId: link.id,
      details: `Created social link: ${link.platform}`,
    });

    revalidateEntity("SocialLink");
    return success(link, 201);
  } catch (error) {
    console.error("Create social link error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
