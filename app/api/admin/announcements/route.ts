import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, success, badRequest } from "@/lib/admin/middleware";
import { logActivity } from "@/lib/admin/activity-logger";
import { revalidateEntity } from "@/lib/revalidate";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, "settings", "view");
  if (auth instanceof NextResponse) return auth;

  const data = await prisma.announcement.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return success(data);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req, "settings", "edit");
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();

    if (!body.text) {
      return badRequest("text is required");
    }

    const announcement = await prisma.announcement.create({
      data: {
        text: body.text,
        linkText: body.linkText ?? null,
        link: body.link ?? null,
        bgColor: body.bgColor ?? "bg-primary-600",
        textColor: body.textColor ?? "text-white",
        isActive: body.isActive ?? true,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        sortOrder: body.sortOrder ?? 0,
      },
    });

    await logActivity({
      adminId: auth.admin.id,
      action: "CREATE",
      entity: "Announcement",
      entityId: announcement.id,
      details: `Created announcement: ${announcement.text.substring(0, 50)}`,
    });

    revalidateEntity("Announcement");
    return success(announcement, 201);
  } catch (error) {
    console.error("Create announcement error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
